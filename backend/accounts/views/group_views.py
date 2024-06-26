from django.contrib.auth.models import Group
from rest_framework import permissions, viewsets
from ..serializers.group_serializer import GroupSerializer
from accounts.authentication import JWTAuthentication

class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all().order_by('name')
    serializer_class = GroupSerializer
    authentication_classes = [JWTAuthentication]

