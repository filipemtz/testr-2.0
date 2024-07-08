import uuid

from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Course(models.Model):
    name = models.CharField(max_length=100, blank=False, null=False)
    enroll_password = models.UUIDField(default=uuid.uuid4)
    visible = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    teachers = models.ManyToManyField(User)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"#{self.id}: {self.name}"
