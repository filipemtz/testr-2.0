
from rest_framework import serializers
from ..models import Course

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['url', 'id', 'name', 'visible', 'teachers', 'students']
