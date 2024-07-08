from rest_framework import viewsets, permissions
from ..models import QuestionFile
from ..serializers import QuestionFileSerializer
from accounts.authentication import JWTAuthentication
from rest_framework.authentication import SessionAuthentication
class QuestionFileViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows question files to be viewed, created, or deleted.
    """
    queryset = QuestionFile.objects.all()
    serializer_class = QuestionFileSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [SessionAuthentication, JWTAuthentication]
