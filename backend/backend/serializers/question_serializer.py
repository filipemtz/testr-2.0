from rest_framework import serializers

from ..models.question import Question


class QuestionSerializer(serializers.ModelSerializer):
    solved = serializers.BooleanField(read_only=True)

    class Meta:
        model = Question
        fields = "__all__"
        # [
        #     "url",
        #     "id",
        #     "section",
        #     "name",
        #     "description",
        #     "language",
        #     "submission_deadline",
        #     "memory_limit",
        #     "time_limit_seconds",
        #     "cpu_limit",
        #     "visible",
        # ]
