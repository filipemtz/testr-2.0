
import os

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Setup the backend in the first use.'

    def handle(self, *args, **options):
        os.system("python manage.py migrate")
        User.objects.create_superuser('admin', 'admin@admin.com', 'admin')
        print("\nCreated superuser with username='admin' and password='admin'.\n")
        os.system("python manage.py setperms permissions.json")
