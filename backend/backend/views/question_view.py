from ..models.question import Question
from ..serializers import QuestionFileSerializer, QuestionSerializer

from rest_framework import permissions, viewsets
from rest_framework.decorators import action
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
    authentication_classes = [SessionAuthentication, JWTAuthentication]

    @action(detail=True, methods=['get'])
    def files(self, request, pk=None):
        """
        Retrieve all files associated with a specific question.
        """
        question = self.get_object()
        files = question.questionfile_set.all()
        serializer = QuestionFileSerializer(files, many=True, context={'request': request})
        return Response(serializer.data)