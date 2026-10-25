# exports.py
import io
import json
import os
import zipfile

from django.db.models import Prefetch
from django.utils import timezone

from ..models import (
    Course,
    DbTestInfo,
    InputOutput,
    Question,
    QuestionFile,
    Section,
)


def serialize_question(question, attached_files):
    """Serialize a question and collect its files for the ZIP."""

    data = {
        "name": question.name,
        "description": question.description,
        "language": question.language,
        "time_limit": question.time_limit_seconds,
        "memory_limit": question.memory_limit,
        "cpu_limit": question.cpu_limit,
        "deadline": (
            timezone.localtime(question.submission_deadline).strftime("%Y/%m/%d")
            if timezone.is_aware(question.submission_deadline)
            else question.submission_deadline.strftime("%Y/%m/%d")
        ),
        "tests": [
            {"input": test.input, "output": test.output}
            for test in question.inputoutput_set.all()
        ],
    }

    # Additional information for SQL and Relax questions.
    try:
        db_info = question.dbtestinfo
    except DbTestInfo.DoesNotExist:
        db_info = None

    if db_info is not None:
        data["db_test_info"] = {
            "database": db_info.database,
            "correct_query": db_info.correct_query,
        }

    # Include attached files in the ZIP and reference them in JSON.
    file_entries = []

    for item in question.questionfile_set.all():
        # Use only the basename, preventing directory traversal.
        original_name = (
            os.path.basename(item.file_name.replace("\\", "/")) or f"file_{item.pk}"
        )

        archive_path = f"files/question_{question.pk}/" f"{item.pk}_{original_name}"

        file_entries.append(
            {
                "file_name": item.file_name,
                "path": archive_path,
            }
        )

        attached_files.append((archive_path, item.file))

    if file_entries:
        data["files"] = file_entries

    return data


def serialize_section(section, attached_files):
    """Serialize a section as a list of questions."""

    return [
        serialize_question(question, attached_files)
        for question in section.question_set.all()
    ]


def serialize_course(course, attached_files):
    """Serialize a course using section names as JSON keys."""

    result = {}

    sections = course.section_set.all().order_by("order", "id")

    for section in sections:
        if section.name in result:
            raise ValueError(f"Duplicate section name in course: {section.name!r}")

        result[section.name] = serialize_section(section, attached_files)

    return result


def build_zip(manifest, manifest_name, attached_files):
    """Create a ZIP containing a JSON manifest and attached files."""

    buffer = io.BytesIO()

    with zipfile.ZipFile(buffer, mode="w", compression=zipfile.ZIP_DEFLATED) as archive:
        archive.writestr(
            manifest_name,
            json.dumps(
                manifest,
                ensure_ascii=False,
                indent=2,
            ),
        )

        for archive_path, field_file in attached_files:
            # Read through Django's storage backend, not local paths.
            with field_file.open("rb") as source:
                archive.writestr(archive_path, source.read())

    buffer.seek(0)
    return buffer.getvalue()


def export_question_zip(question):
    attached_files = []
    manifest = serialize_question(question, attached_files)

    return build_zip(manifest, "question.json", attached_files)


def export_section_zip(section):
    attached_files = []
    manifest = {section.name: serialize_section(section, attached_files)}

    return build_zip(manifest, "section.json", attached_files)


def export_course_zip(course):
    attached_files = []
    manifest = serialize_course(course, attached_files)

    return build_zip(manifest, "course.json", attached_files)
