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
