# Generated by Django 5.0.6 on 2024-08-15 00:47

from django.db import migrations, models
from backend.models import submission

class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='submission',
            name='file',
            field=models.FileField(upload_to=submission.upload_file),
        ),
    ]