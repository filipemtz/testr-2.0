from ..models.section import Section
from ..serializers.section_serializer import SectionSerializer
from rest_framework import permissions, viewsets
from rest_framework.authentication import SessionAuthentication

class SectionViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [SessionAuthentication]
    lookup_field = 'pk'