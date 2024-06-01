from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .course import Course

class Section(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.name