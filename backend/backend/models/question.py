from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .section import Section

class Language(models.TextChoices):
    CCPP = 'CC', _('C/C++')
    PYTHON = 'PT', _('Python')
    JUPYTER = 'JP', _('Jupyter')

class Question(models.Model):
    section = models.ForeignKey(Section, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, default='')

    language = models.TextField(
        max_length=2,
        choices=Language.choices,
        default=Language.PYTHON
    )

    time_limit_seconds = models.FloatField(default=30)
    memory_limit = models.FloatField(default=200)
    cpu_limit = models.FloatField(default=0.25)
    created_at = models.DateTimeField(default=timezone.now)
    submission_deadline = models.DateTimeField(default=timezone.now)
    visible = models.BooleanField(default=True)

    def __str__(self):
        return self.name

    def submission_is_open(self):
        if timezone.now() < self.submission_deadline:
            return True
        return False