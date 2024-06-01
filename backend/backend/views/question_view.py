from ..models.question import Question
from ..serializers.question_serializer import  QuestionSerializer

from rest_framework import permissions, viewsets
from rest_framework.authentication import SessionAuthentication

class QuestionViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]
