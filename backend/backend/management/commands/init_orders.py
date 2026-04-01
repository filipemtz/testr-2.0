from decimal import Decimal

from django.core.management.base import BaseCommand

from backend.models import Course, Question, Section


class Command(BaseCommand):
    help = "Initialize the section and question orders after first migration."

    def handle(self, *args, **options):
        for course in Course.objects.all():
            self._set_sections_positions(course)
        print("Done.")

    def _set_sections_positions(self, course):
        sections = Section.objects.filter(course=course).all()
        for i, section in enumerate(sections):
            section.order = Decimal(i)
            section.save()
            self._set_questions_positions(section)

    def _set_questions_positions(self, section):
        questions = Question.objects.filter(section=section).all()
        for j, question in enumerate(questions):
            question.order = Decimal(j)
            question.save()
