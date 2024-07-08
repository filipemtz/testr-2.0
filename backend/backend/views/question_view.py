from ..models.question import Question
from ..serializers.question_serializer import QuestionSerializer
from ..serializers.input_output_serializer import InputOutputSerializer
from rest_framework.decorators import action
from rest_framework import permissions, viewsets
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication

from accounts.authentication import JWTAuthentication

class QuestionViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    @action(detail=True, methods=['get'])
    def inputs_outputs(self, request, pk=None):
        question = self.get_object()
        inputs_outputs = question.inputoutput_set.all()
        serializer = InputOutputSerializer(inputs_outputs, many=True, context={'request': request})
        return Response(serializer.data)
