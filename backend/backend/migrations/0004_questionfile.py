# Generated by Django 5.0.6 on 2024-07-08 00:52

import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0003_alter_course_options_question_language'),
    ]

    operations = [
        migrations.CreateModel(
            name='QuestionFile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.BinaryField()),
                ('file_name', models.CharField(max_length=128)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('question', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='backend.question')),
            ],
            options={
                'ordering': ['created_at'],
            },
        ),
    ]
