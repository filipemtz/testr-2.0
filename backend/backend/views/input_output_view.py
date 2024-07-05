
from accounts.authentication import JWTAuthentication
from rest_framework import permissions, viewsets


from ..models.input_output import InputOutput
from ..serializers import InputOutputSerializer

class InputOutputViewSet(viewsets.ModelViewSet):
    queryset = InputOutput.objects.all()
    serializer_class = InputOutputSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication] 