from rest_framework import viewsets
from ..models import QuestionFile
from ..serializers import QuestionFileSerializer
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.permissions import IsAuthenticated

class QuestionFileViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows question files to be viewed, created, or deleted.
    """
    queryset = QuestionFile.objects.all()
    serializer_class = QuestionFileSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication, TokenAuthentication]
