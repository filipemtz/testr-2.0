# Generated by Django 5.0.6 on 2024-10-19 21:13

import backend.models.question_file
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0004_alter_course_students'),
    ]

    operations = [
        migrations.AlterField(
            model_name='questionfile',
            name='file',
            field=models.FileField(upload_to=backend.models.question_file.upload_file),
        ),
    ]