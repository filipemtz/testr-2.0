# Generated by Django 5.0.6 on 2024-11-06 01:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0005_alter_questionfile_file'),
    ]

    operations = [
        migrations.AddField(
            model_name='question',
            name='visible',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='section',
            name='visible',
            field=models.BooleanField(default=True),
        ),
    ]
