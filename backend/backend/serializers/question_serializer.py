from rest_framework import serializers
from ..models.question import Question

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['url', 'id', 'section', 'name', 'description', 'language', 'submission_deadline', 'memory_limit',
                  'time_limit_seconds', 'cpu_limit']