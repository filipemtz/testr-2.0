from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _
from django.utils import timezone

from .question import Question


class SubmissionStatus(models.TextChoices):
    WAITING_EVALUATION = 'WE', _('Waiting Evaluation')
    FAIL = 'FL', _('Fail')
    SUCCESS = 'SC', _('Success')


class Submission(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    file = models.BinaryField()
    file_name = models.CharField(max_length=128)
    status = models.TextField(
        max_length=2,
        choices=SubmissionStatus.choices,
        default=SubmissionStatus.WAITING_EVALUATION
    )
    created_at = models.DateTimeField(default=timezone.now)
    report_json = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['question', 'student']  # Garantir unicidade no nível do banco de dados

    @classmethod
    def solved_by_user(cls, question: Question, user: User) -> bool:
        """Check if a user has solved a question."""
        succs = Submission.objects.filter(
            student=user,
            question=question,
            status=SubmissionStatus.SUCCESS
        )

        return succs.count() > 0

    def save(self, *args, **kwargs):
        # Verificar se já existe uma submissão com o mesmo par question-student
        existing_submission = Submission.objects.filter(question=self.question, student=self.student).first()
        if existing_submission:
            # Se existir, atualizar a submissão existente
            existing_submission.file = self.file
            existing_submission.file_name = self.file_name
            existing_submission.status = self.status
            existing_submission.created_at = timezone.now()  # Atualizar a data de criação
            existing_submission.report_json = self.report_json
            super(Submission, existing_submission).save(*args, **kwargs)
        else:
            # Se não existir, criar uma nova submissão
            super().save(*args, **kwargs)

    def status_label(self):
        return SubmissionStatus(self.status).label

    def __str__(self):
        return f"{self.student.username} - question '{self.question.name}' - file '{self.file_name}'"
