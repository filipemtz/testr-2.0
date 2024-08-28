from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.authentication import SessionAuthentication
from ..models.course import Course
from ..serializers.course_serializer import CourseSerializer
from ..serializers.section_serializer import SectionSerializer
from rest_framework.authentication import TokenAuthentication
from accounts.permissions import IsTeacher, ReadOnly
from rest_framework.permissions import IsAuthenticated

class CourseViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsTeacher | ReadOnly] 
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    
    @action(detail=True, methods=['get'])
    def sections(self, request, pk=None):
        """
        Retrieve all sections associated with a specific course.
        """
        course = self.get_object()
        sections = course.section_set.all()
        serializer = SectionSerializer(sections, many=True, context={'request': request})
        return Response(serializer.data)
    
    # exibe apenas os cursos aos quais o usuario está relacionado. Além de permitir que o professor edite apenas os cursos que ele leciona
    def get_queryset(self):
        user = self.request.user
        return Course.objects.filter(teachers=user) | Course.objects.filter(students=user)
    
    
    
    
    

        
        
    
    
