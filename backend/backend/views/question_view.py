from ..models.question import Question
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
            
    
