from rest_framework import serializers

from ..models.question import Question, RelaxTestInfo


class QuestionSerializer(serializers.ModelSerializer):
    # solved = serializers.BooleanField(read_only=True)

    class Meta:
        model = Question
        fields = [
            "url",
            "id",
            "section",
            "name",
            "description",
            "language",
            "submission_deadline",
            "memory_limit",
            "time_limit_seconds",
            "cpu_limit",
            "visible",
            "order",
        ]


class RelaxTestInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RelaxTestInfo
        fields = "__all__"
