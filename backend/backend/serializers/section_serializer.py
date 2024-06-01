from rest_framework import serializers
from ..models.section import Section

class SectionSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Section
        fields = ['url', 'id', 'course', 'name', 'created_at']