from rest_framework import serializers
from ..models import Submission, SubmissionStatus

class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = ['id', 'question', 'student', 'file', 'file_name', 'created_at', 'status', 'report_json']
        read_only_fields = ['id', 'created_at', 'status', 'report_json']


