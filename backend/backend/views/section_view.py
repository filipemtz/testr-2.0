from ..models.section import Section
from ..serializers.section_serializer import SectionSerializer
from ..serializers.question_serializer import QuestionSerializer
from rest_framework import permissions, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from accounts.permissions import IsTeacher, ReadOnly

class SectionViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    permission_classes = [IsTeacher | ReadOnly]
    authentication_classes = [SessionAuthentication, TokenAuthentication]

    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        """
        Retrieve all questions associated with a specific section.
        """
        section = self.get_object()
        
        if request.user in section.course.teachers.all():
            questions = section.question_set.all()
        else:
            questions = section.question_set.filter(visible=True)
        
        serializer = QuestionSerializer(questions, many=True, context={'request': request})
        return Response(serializer.data)
    
    # Retorna apenas as seções que o usuário está relacionado por meio dos cursos
    def get_queryset(self):
        user = self.request.user
        return (Section.objects.filter(course__teachers=user) | Section.objects.filter(course__students=user)).distinct()