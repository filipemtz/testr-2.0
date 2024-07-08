from rest_framework import serializers
from ..models import QuestionFile

class QuestionFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionFile
        fields = ['id', 'question', 'file', 'file_name', 'created_at']
