
import os

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from decouple import config

class Command(BaseCommand):
    help = 'Setup the backend in the first use.'

    def handle(self, *args, **options):
        os.system("python manage.py migrate")
        if (User.objects.filter(username=config('ADMIN_USERNMAME', default='admin')).count() == 0):
            User.objects.create_superuser(config('ADMIN_USERNMAME', default='admin'), 
                                        config('ADMIN_EMAIL', default='admin@admin.com'), 
                                        config('ADMIN_PASSWORD', default='admin'))
            print("\nCreated superuser with username: " + config('ADMIN_USERNMAME', default='admin') + " and password: " + config('ADMIN_PASSWORD', default='admin'))
        os.system("python manage.py setperms permissions.json")
