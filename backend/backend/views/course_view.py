from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from ..models.course import Course
from ..models.question import Question
from ..models.section import Section
from ..models.input_output import InputOutput
from ..models.question_file import QuestionFile

from rest_framework.views import APIView

from rest_framework.authentication import TokenAuthentication
from accounts.permissions import IsTeacher, IsStudentSafeMethods
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

from accounts.serializers import UserRegisterSerializer, UserSerializer
from ..serializers.course_serializer import CourseSerializer
from ..serializers.section_serializer import SectionSerializer
import csv


class CourseViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsTeacher | IsStudentSafeMethods] 
    authentication_classes = [SessionAuthentication, TokenAuthentication]

    
    @action(detail=True, methods=['get'])
    def sections(self, request, pk=None):
        """
        Retrieve all sections associated with a specific course.
        """
        course = self.get_object()
        
        if request.user in course.teachers.all():
            sections = course.section_set.all()
        else:
            sections = course.section_set.filter(visible=True)

        serializer = SectionSerializer(sections, many=True, context={'request': request})
        return Response(serializer.data)
    
    # exibe apenas os cursos aos quais o usuario está relacionado. Além de permitir que o professor edite apenas os cursos que ele leciona
    def get_queryset(self):
        user = self.request.user
        return (Course.objects.filter(teachers=user) | Course.objects.filter(students=user)).distinct()
    
class CourseRemoveTeacherAPIView(APIView):
    permission_classes = [IsTeacher]
    authentication_classes = [SessionAuthentication, TokenAuthentication]

    def post(self, request, course_id=None):
        course = Course.objects.get(pk=course_id)
        teacher_id = request.data.get('teacher_id')
        
        user = request.user
        if not course.teachers.filter(id=user.id).exists():
            return Response({'error': 'Você não tem permissão para remover professores deste curso.'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            teacher = User.objects.get(id=teacher_id)
        except User.DoesNotExist:
            return Response({'error': 'Professor não encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        if teacher in course.teachers.all():
            course.teachers.remove(teacher)
            return Response({'message': f'Professor {teacher.username} removido do curso com sucesso.'})
        else:
            return Response({'error': 'Este professor não está associado a este curso.'}, status=status.HTTP_400_BAD_REQUEST)

class CourseAddTeacherAPIView(APIView):
    permission_classes = [IsTeacher]
    authentication_classes = [SessionAuthentication, TokenAuthentication]

    def post(self, request, course_id=None):
        course = Course.objects.get(pk=course_id)
        username = request.data.get('teacher_username')
        
        user = request.user
        if not course.teachers.filter(id=user.id).exists():
            return Response({'error': 'Você não tem permissão para adicionar professores a este curso.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            user = User.objects.get(username=username)
            group = user.groups.get()

            if(group.name == "teacher"): 
                if(course.teachers.filter(id=user.id).exists()):
                    return Response({'error': 'Professor já está no curso.'}, status=status.HTTP_404_NOT_FOUND)
                else:
                    course.teachers.add(user)
                    return Response({'message': f'Professor {user.username} adicionado ao curso com sucesso.'})
            else:
                return Response({'error': 'Alunos não podem ser professores.'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'Usuário não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        
class CourseAddStudentAPIView(APIView):
    permission_classes = [IsTeacher]
    authentication_classes = [SessionAuthentication, TokenAuthentication]

    def post(self, request, course_id=None):
        course = Course.objects.get(pk=course_id)
        username = request.data.get('student_username')
        
        user = request.user
        if not course.teachers.filter(id=user.id).exists():
            return Response({'error': 'Você não tem permissão para adicionar alunos a este curso.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            user = User.objects.get(username=username)
            group = user.groups.get()

            if(group.name == "student"): 
                if(course.students.filter(id=user.id).exists()):
                    return Response({'error': 'Aluno já está no curso.'}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    course.students.add(user)
                    return Response({'message': f'Aluno {user.username} adicionado ao curso com sucesso.'})
            else:
                return Response({'error': 'Professores não podem ser alunos.'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'Usuário não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        
class CourseRegisterStudentsAPIView(APIView):
    permission_classes = [IsTeacher]
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    
    def post(self, request, course_id=None):
        course = Course.objects.get(pk=course_id)
        
        if not course.teachers.filter(id=request.user.id).exists():
            return Response({'message': 'You do not have permission to add students to this course.'}, status=status.HTTP_403_FORBIDDEN)
        
        csv_file = request.FILES['file']
        
        required_columns = {'username', 'password', 'email', 'first_name', 'last_name'}
        csv_columns = set(next(csv.reader([csv_file.read().decode('utf-8').splitlines()[0]], delimiter=';')))
        
        if not required_columns.issubset(csv_columns):
            return Response({'message': 'O arquivo CSV está faltando colunas obrigatórias.'}, status=status.HTTP_400_BAD_REQUEST)
        
        csv_file.seek(0)  # Reset file pointer to the beginning
        
        decoded_file = csv_file.read().decode('utf-8').splitlines()
        reader = csv.DictReader(decoded_file, delimiter=';')

        success = []
        errors = []
        print('eu')
        for row in reader:
            data = {
                'username': row['username'],
                'password': row['password'],
                'password_confirm': row['password'], 
                'email': row['email'],
                'first_name': row['first_name'],
                'last_name': row['last_name'],
                'group': 'student'
            }


            user = User.objects.filter(username=row['username']).first()
            if user:
                if not course.students.filter(id=user.id).exists():
                    course.students.add(user)
                    success.append(f"Usuário {user.username} já existe e foi adicionado ao curso.")
                else:
                    errors.append(f"Usuário {user.username} já está no curso.")
            else:
                serializer = UserRegisterSerializer(data=data)
                if serializer.is_valid():
                    serializer.save()

                    user = serializer.instance

                    user.first_name = row['first_name']
                    user.last_name = row['last_name']
                    user.save()

                    #token, created = Token.objects.get_or_create(user=user)
                    course.students.add(user)
                    # responses.append({
                    #    'token': token.key, 
                    #    'user': UserSerializer(user).data
                    # })
                    success.append(f"Usuário {row['username']} criado e adicionado ao curso.")
                else:
                    error_messages = []
                    for field, messages in serializer.errors.items():
                        error_messages.append(f"{field}: {', '.join(messages)}")
                
                    errors.append(f"Usuário {row['username']} - " + "; ".join(error_messages))
                    
        response_data = {
            "status": "success" if success else "error",
            "message": f"{len(success)} usuários processados, {len(errors)} erros.",
            "details": success + errors
        }        

        return Response(response_data, status=status.HTTP_201_CREATED if not errors else status.HTTP_400_BAD_REQUEST)
    
class CourseTeachersAPIView(APIView):
    permission_classes = [IsTeacher]
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    def get(self, request, course_id=None):
        course = Course.objects.get(pk=course_id)
        
        if not course.teachers.filter(id=request.user.id).exists():
            return Response({'error': 'You do not have permission to view teachers of this course.'}, status=403)
        
        
        teachers = course.teachers.all()

        data = []
        for t in teachers:
            data.append({
                'teacher': UserSerializer(t).data,
            })

        return Response(data)
    
class CourseReportAPIView(APIView):
    """
    Relatório por turma mostrando para cada aluno quantas questões foram resolvidas (submissão existe e o status é sucesso),
    quantas foram tentadas (submissão existe) e quantas não foram tentadas (submissão não existe).
    """
    permission_classes = [IsTeacher]
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    def get(self, request, course_id=None):
        course = Course.objects.get(pk=course_id)
        
        
        if not course.teachers.filter(id=request.user.id).exists():
            return Response({'error': 'You do not have permission to view this report.'}, status=status.HTTP_403_FORBIDDEN)
        
        
        students = course.students.all()

        data = []
        for student in students:
            solved = 0
            tried = 0
            not_tried = 0
            
            questions = Question.objects.filter(section__course=course)
            for question in questions:
                submission = question.submission_set.filter(student=student).first()
                if submission:
                    if submission.status == 'SC':
                        solved += 1
                    elif submission.status == 'FL':
                        tried += 1
                else:
                    not_tried += 1

            data.append({
                'student': UserSerializer(student).data,
                'solved': solved,
                'tried': tried,
                'not_tried': not_tried
            })

        return Response(data)
    
# Cria uma cópia de um curso que o professor leciona para um novo curso sem alunos mas com todas as questões, seções e arquivos associados
class CourseCreateCopyAPIView(APIView):
    permission_classes = [IsTeacher]
    authentication_classes = [SessionAuthentication, TokenAuthentication]

    def post(self, request, course_id=None):
        course = Course.objects.get(pk=course_id)

        if not course.teachers.filter(id=request.user.id).exists():
            return Response({'error': 'You do not have permission to copy this course.'}, status=status.HTTP_403_FORBIDDEN)

        # Cria o novo curso
        new_course = Course.objects.create(
            name=f"{course.name} - Copy",
        )
        new_course.teachers.add(request.user)

        # Copia seções, questões e arquivos associados
        for section in course.section_set.all():
            new_section = Section.objects.create(
                course=new_course,
                name=section.name,
                created_at=section.created_at
            )

            for question in section.question_set.all():
                new_question = Question.objects.create(
                    section=new_section,
                    name=question.name,
                    description=question.description,
                    language=question.language,
                    time_limit_seconds=question.time_limit_seconds,
                    memory_limit=question.memory_limit,
                    cpu_limit=question.cpu_limit,
                    submission_deadline=question.submission_deadline
                )

                for input_output in question.inputoutput_set.all():
                    InputOutput.objects.create(
                        question=new_question,
                        input=input_output.input,
                        output=input_output.output,
                        visible=input_output.visible
                    )

                for question_file in question.questionfile_set.all():
                    QuestionFile.objects.create(
                        question=new_question,
                        file=question_file.file,
                        file_name=question_file.file_name,
                    )

        # Retorna o novo curso com o contexto da requisição
        serializer = CourseSerializer(new_course, context={'request': request})
        return Response(serializer.data)

    