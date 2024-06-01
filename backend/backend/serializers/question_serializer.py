from rest_framework import serializers
from ..models.question import Question

class QuestionSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Question
        fields = ['url', 'id', 'section', 'name', 'description', 'created_at', 'submission_deadline', 'memory_limit',
                  'time_limit_seconds', 'cpu_limit']