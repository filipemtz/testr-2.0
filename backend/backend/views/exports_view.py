# views.py
from accounts.permissions.is_teacher import IsTeacher
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils.text import slugify
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.views import APIView

from backend.export_import.exports import (
    export_course_zip,
    export_question_zip,
    export_section_zip,
)
from backend.models import Course, Question, Section


def zip_download(content, filename):
    response = HttpResponse(content, content_type="application/zip")
    response["Content-Disposition"] = f'attachment; filename="{filename}"'
    return response


class ExportCourseView(APIView):
    permission_classes = (IsTeacher,)
    authentication_classes = (SessionAuthentication, TokenAuthentication)

    def get(self, request, course_id):
        course = get_object_or_404(
            Course.objects.filter(teachers=request.user),
            pk=course_id,
        )

        content = export_course_zip(course)
        filename = f"course_{course.id}_{slugify(course.name)}.zip"

        return zip_download(content, filename)


class ExportSectionView(APIView):
    permission_classes = (IsTeacher,)
    authentication_classes = (SessionAuthentication, TokenAuthentication)

    def get(self, request, section_id):
        section = get_object_or_404(
            Section.objects.filter(course__teachers=request.user),
            pk=section_id,
        )

        content = export_section_zip(section)
        filename = f"section_{section.id}_{slugify(section.name)}.zip"

        return zip_download(content, filename)


class ExportQuestionView(APIView):
    permission_classes = (IsTeacher,)
    authentication_classes = (SessionAuthentication, TokenAuthentication)

    def get(self, request, question_id):
        question = get_object_or_404(
            Question.objects.filter(section__course__teachers=request.user),
            pk=question_id,
        )

        content = export_question_zip(question)
        filename = f"question_{question.id}_{slugify(question.name)}.zip"

        return zip_download(content, filename)
