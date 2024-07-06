from rest_framework import serializers
from ..models import InputOutput

class InputOutputSerializer(serializers.ModelSerializer):
    class Meta:
        model = InputOutput
        fields = ['id', 'url', 'question', 'input', 'output', 'visible']