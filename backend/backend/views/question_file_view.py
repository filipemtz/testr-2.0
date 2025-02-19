from rest_framework import viewsets
from ..models import QuestionFile
from ..serializers import QuestionFileSerializer
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.decorators import action
from rest_framework.response import Response
from accounts.permissions import IsTeacher, IsStudentSafeMethods
class QuestionFileViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows question files to be viewed, created, or deleted.
    """
    queryset = QuestionFile.objects.all()
    serializer_class = QuestionFileSerializer
    permission_classes = [IsTeacher | IsStudentSafeMethods]
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    
    # Retorna apenas os arquivos que o usuário está relacionado por meio dos cursos
    def get_queryset(self):
        user = self.request.user
        return (QuestionFile.objects.filter(question__section__course__teachers=user) | QuestionFile.objects.filter(question__section__course__students=user)).distinct()
    

