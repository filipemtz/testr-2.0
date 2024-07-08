from ..models.section import Section
from ..serializers.section_serializer import SectionSerializer
from ..serializers.question_serializer import QuestionSerializer
from rest_framework import permissions, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from accounts.authentication import JWTAuthentication
from rest_framework.authentication import SessionAuthentication
class SectionViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [SessionAuthentication, JWTAuthentication]

    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        """
        Retrieve all questions associated with a specific section.
        """
        section = self.get_object()
        questions = section.question_set.all()
        serializer = QuestionSerializer(questions, many=True, context={'request': request})
        return Response(serializer.data)