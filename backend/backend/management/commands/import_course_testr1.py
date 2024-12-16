

import os 
import json
from datetime import datetime 
from pathlib import Path
from tqdm import tqdm

from django.core.management.base import BaseCommand
from django.core.files import File

from backend.models import *


class Command(BaseCommand):
    help = 'Import courses from testr-1.0'

    def add_arguments(self, parser):
        parser.add_argument("in_dir",
                            type=str,
                            help='Directory containing data exported from testr 1.0.')

        parser.add_argument("id_course",
                            type=int,
                            help='Id of the course for which data will be imported.')

    def handle(self, *args, **options):
        course = Course.objects.get(id=options['id_course'])

        f = open(os.path.join(options["in_dir"], "course.json"), "r")
        course_json = json.load(f)
        f.close()

        for section in tqdm(course_json['sections']):
            new_section = Section(course=course, name=section['name'])
            new_section.save()

            for question in section['questions']:
                new_question = Question(section=new_section,
                        name=question['name'],
                        description=question['description'],
                        language=question['language'],
                        time_limit_seconds=question['time_limit_seconds'],
                        memory_limit=question['memory_limit'],
                        cpu_limit=question['cpu_limit'],
                        submission_deadline=datetime.strptime(question['submission_deadline'], '%Y/%m/%d %H:%M:%S'))

                new_question.save()

                for question_file in question['files']:
                    parts = Path(question_file).parts
                    question_file = os.path.join(options['in_dir'], *parts[1:])

                    with open(question_file, "rb") as f:
                        django_file = File(f)

                        new_file = QuestionFile(question=new_question,
                                file=django_file,
                                file_name=parts[-1])

                        new_file.save()


                for in_out in question['tests']:
                    new_io = InputOutput(question=new_question,
                            input=in_out['input'],
                            output=in_out['output'])

                    new_io.save()

        print("Done.")

