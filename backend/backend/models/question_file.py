
from django.db import models
from django.utils import timezone
from .question import Question


def upload_file(instance, filename):
    if '/' in filename or '\\' in filename:
        return filename
    timestamp = timezone.now().strftime("%Y%m%d%H%M%S")
    return f'{instance.question.id}-{timestamp}-{filename}'

class QuestionFile(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    file = models.FileField(upload_to=upload_file)
    file_name = models.CharField(max_length=128)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.id} - Question {self.question.id} - {self.file_name}"

