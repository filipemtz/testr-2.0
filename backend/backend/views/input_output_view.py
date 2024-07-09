
from rest_framework import permissions, viewsets


from ..models.input_output import InputOutput
from ..serializers import InputOutputSerializer
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication

class InputOutputViewSet(viewsets.ModelViewSet):
    queryset = InputOutput.objects.all()
    serializer_class = InputOutputSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication, TokenAuthentication] 