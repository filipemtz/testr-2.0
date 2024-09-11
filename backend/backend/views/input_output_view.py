
from rest_framework import permissions, viewsets


from ..models.input_output import InputOutput
from ..serializers import InputOutputSerializer
from rest_framework.authentication import TokenAuthentication
from rest_framework.authentication import SessionAuthentication
from accounts.permissions import IsTeacher, ReadOnly

class InputOutputViewSet(viewsets.ModelViewSet):
    queryset = InputOutput.objects.all()
    serializer_class = InputOutputSerializer
    permission_classes = [IsTeacher | ReadOnly]
    authentication_classes = [SessionAuthentication, TokenAuthentication] 
    # Retorna apenas os arquivos que o usuário está relacionado por meio dos cursos
    def get_queryset(self):
        user = self.request.user
        return (InputOutput.objects.filter(question__section__course__teachers=user) | InputOutput.objects.filter(question__section__course__students=user, visible=True)).distinct()