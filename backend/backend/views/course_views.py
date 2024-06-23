from rest_framework import permissions, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from ..models.course import Course
from ..serializers.course_serializer import CourseSerializer
from ..serializers.section_serializer import SectionSerializer
from accounts.authentication import JWTAuthentication

class CourseViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=True, methods=['get'])
    def sections(self, request, pk=None):
        print(request)
        course = self.get_object()
        sections = course.section_set.all()
        serializer = SectionSerializer(sections, many=True, context={'request': request})
        return Response(serializer.data)
