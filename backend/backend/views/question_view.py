
from ..models import InputOutput, QuestionFile, Section, Question
from ..serializers import QuestionSerializer, QuestionFileSerializer
from ..serializers.input_output_serializer import InputOutputSerializer
from rest_framework.decorators import action
from rest_framework import permissions, viewsets
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from accounts.permissions import IsTeacher, ReadOnly

class QuestionViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [IsTeacher | ReadOnly]
    authentication_classes = [SessionAuthentication, TokenAuthentication]

    @action(detail=True, methods=['get'])
    def inputs_outputs(self, request, pk=None):
        user = request.user
        question = self.get_object()
        inputs_outputs = question.inputoutput_set.all()

        # se o usuario nao for um professor exibir apenas aqueles visiveis
        if not user.groups.filter(name='teacher').exists():
            inputs_outputs = inputs_outputs.filter(visible=True)

        serializer = InputOutputSerializer(inputs_outputs, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def files(self, request, pk=None):
        """
        Retrieve all files associated with a specific question.
        """
        question = self.get_object()
        files = question.questionfile_set.all()
        serializer = QuestionFileSerializer(files, many=True, context={'request': request})
        return Response(serializer.data)

    # Retorna apenas as questões que o usuário está relacionado por meio dos cursos
    def get_queryset(self):
        user = self.request.user
        return (Question.objects.filter(section__course__teachers=user) | Question.objects.filter(section__course__students=user)).distinct()


class QuestionReportAPIView(APIView):
    permission_classes = [IsTeacher]
    authentication_classes = [SessionAuthentication, TokenAuthentication]

    def get(self, request, question_id=None):
        question = Question.objects.get(pk=question_id)
        students = question.section.course.students.all()

        data = []
        for student in students:
            status = 'Não respondida'
            submission = question.submission_set.filter(student=student).first()
            submission_file = submission.file if submission else None

            if submission:
                if submission.status == 'SC':
                    status = 'Resposta correta'
                elif submission.status == 'FL':
                    status = 'Resposta incorreta'
                else:
                    status = 'Aguardando avaliação'

            data.append({
                'student': student.username,
                'status': status,
                'file': submission_file.url if submission_file else None,
                'file_name': submission.file_name if submission else None
            })

        return Response(data)
    
  
import os
import zipfile
import tempfile
from rest_framework import status
from django.core.files import File


class QuestionImportAPIView(APIView):
    permission_classes = [IsTeacher]
    authentication_classes = [SessionAuthentication, TokenAuthentication]

    def pair_input_output_files(self, base_dir, visible):
        """
        Função auxiliar para percorrer os diretórios 'input' e 'output' em 'base_dir', formando objetos 'input_output'
        para arquivos com o mesmo nome em ambas as pastas.
        
        :param base_dir: Diretório raiz onde estão localizadas as pastas 'input' e 'output'
        :param visible: Valor a ser incluído como atributo 'visible' em cada objeto 'input_output'
        :return: Lista de dicionários 'input_output' com pares de arquivos correspondentes
        """
        input_dir = os.path.join(base_dir, 'input')
        output_dir = os.path.join(base_dir, 'output')
        
        # Dicionário para armazenar os pares de arquivos com o mesmo nome
        input_output_pairs = []

        # Lista de arquivos na pasta 'input'
        input_files = {os.path.splitext(f)[0]: os.path.join(input_dir, f) for f in os.listdir(input_dir) if os.path.isfile(os.path.join(input_dir, f))}
        
        # Lista de arquivos na pasta 'output'
        output_files = {os.path.splitext(f)[0]: os.path.join(output_dir, f) for f in os.listdir(output_dir) if os.path.isfile(os.path.join(output_dir, f))}
        
        # Encontrar arquivos com o mesmo nome nas duas pastas
        for file_name, input_path in input_files.items():
            output_path = output_files.get(file_name)
            
            # Somente cria o par se houver um arquivo correspondente em 'output'
            if output_path:
                with open(input_path, 'r') as input_file, open(output_path, 'r') as output_file:
                    input_content = input_file.read()
                    output_content = output_file.read()

                input_output_pairs.append({
                    'input': input_content,
                    'output': output_content,
                    'visible': visible
                })

        return input_output_pairs

    def post(self, request, *args, **kwargs):
        """
        Importa questões no formato BOCA, organizadas em pastas com arquivos de entrada/saída.
        """

        # Verifica se o arquivo foi enviado
        file = request.FILES.get('file')
        file_name = request.data.get('file_name')
        course_id = request.data.get('course_id')
        section_name = request.data.get('section_name')

        if not file or not file_name or not course_id or not section_name:
            return Response(
                {"error": "Arquivo, nome do arquivo, ID do curso e nome da seção são obrigatórios."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Cria um diretório temporário para extrair o conteúdo do arquivo zip
        with tempfile.TemporaryDirectory() as tmpdirname:
            zip_path = os.path.join(tmpdirname, file_name)

            # Salva o arquivo zipado no diretório temporário
            with open(zip_path, 'wb+') as destination:
                for chunk in file.chunks():
                    destination.write(chunk)

            # Extrai o conteúdo do zip
            try:
                with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                    zip_ref.extractall(tmpdirname)
            except zipfile.BadZipFile:
                return Response(
                    {"error": "O arquivo enviado não é um zip válido."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Aqui, você pode iterar sobre os arquivos extraídos
            extracted_files = os.listdir(tmpdirname)
            
            # Cria uma nova seção para armazenar as questões importadas
            new_section, created = Section.objects.get_or_create(course_id=course_id, name=section_name)
            
            file_name_without_extension = os.path.splitext(file_name)[0]

            # Cria uma nova questão para cada arquivo extraído
            new_question = Question.objects.create(
                section=new_section,
                name=file_name_without_extension,
            )

            # Par de arquivos input/output usando a função auxiliar
            input_output_pairs = self.pair_input_output_files(tmpdirname, visible=False)
            print("Pares de arquivos: ", input_output_pairs)

            # Cria objetos InputOutput para cada par de arquivos
            for pair in input_output_pairs:
                input_output = InputOutput.objects.create(
                    question=new_question,
                    visible=pair['visible'],
                    input=pair['input'],
                    output=pair['output']
                )
                
            
            # Acessa o diretorio description e extrai o conteúdo do arquivo .zip dentro dessa pasta
            description_dir = os.path.join(tmpdirname, 'description')
            # Verifica se o diretório existe
            if os.path.isdir(description_dir):
                zip_file = None
                other_files = []

                # Itera sobre os arquivos no diretório `description`
                for f in os.listdir(description_dir):
                    if f.endswith('.zip'):
                        zip_file = f  # Supondo que só há um arquivo .zip
                    else:
                        other_files.append(f)  # Adiciona outros arquivos à lista `other_files`

                if zip_file:
                    # Caminho completo do arquivo .zip
                    inner_zip_path = os.path.join(description_dir, zip_file)
                    
                    # Cria um diretório temporário para extrair o conteúdo do .zip
                    with tempfile.TemporaryDirectory() as extracted_dir:
                        # Extrai o conteúdo do .zip para o diretório temporário
                        with zipfile.ZipFile(inner_zip_path, 'r') as inner_zip_ref:
                            inner_zip_ref.extractall(extracted_dir)

                        # Par de arquivos input/output usando a função auxiliar
                        input_output_pairs_visible = self.pair_input_output_files(tmpdirname, visible=True)
                        print("Pares de arquivos: ", input_output_pairs_visible)
                        
                        # Cria objetos InputOutput para cada par de arquivos
                        for pair in input_output_pairs:
                            input_output = InputOutput.objects.create(
                                question=new_question,
                                visible=pair['visible'],
                                input=pair['input'],
                                output=pair['output']
                            )
                        
                        extracted_files = os.listdir(extracted_dir)
                        # Filtra apenas os arquivos, ignorando diretórios
                        files_only = [f for f in extracted_files if os.path.isfile(os.path.join(extracted_dir, f))]

                        # Exibe os arquivos encontrados
                        print("Arquivos extraídos:", files_only)
                        
                        for file in files_only:
                            file_path = os.path.join(extracted_dir, file)
                            with open(file_path, 'rb') as f:
                                django_file = File(f)  # Cria o objeto File do Django

                                # Cria um objeto QuestionFile para cada arquivo extraído
                                QuestionFile.objects.create(
                                    question=new_question,  # Relaciona com a questão
                                    file_name=file,         # Nome do arquivo
                                    file=django_file        # Associa o arquivo ao campo `FileField`
        )
                        

                        

                else:
                    print("Nenhum arquivo .zip encontrado no diretório 'description'.")
            else:
                print("O diretório 'description' não foi encontrado.")
            
            
           
            
            return Response({"message": "Questões importadas com sucesso."},
                status=status.HTTP_201_CREATED)

            
            
            
    
