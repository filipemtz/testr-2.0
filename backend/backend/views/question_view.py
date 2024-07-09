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
class QuestionViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication, TokenAuthentication]

    @action(detail=True, methods=['get'])
    def inputs_outputs(self, request, pk=None):
        question = self.get_object()
        inputs_outputs = question.inputoutput_set.all()
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
