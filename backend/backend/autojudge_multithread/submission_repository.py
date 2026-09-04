from backend.models.submission import (
    Submission,
    SubmissionStatus,
)
from django.db import transaction


class SubmissionRepository:

    @staticmethod
    def acquire():
        with transaction.atomic():
            submission = (
                Submission.objects.select_for_update(skip_locked=True)
                .filter(status=SubmissionStatus.WAITING_EVALUATION)
                .first()
            )

            if submission is None:
                return None

            submission.status = SubmissionStatus.RUNNING
            submission.save(update_fields=["status"])

            return submission

    @staticmethod
    def mark_internal_error(submission):
        submission.status = SubmissionStatus.INTERNAL_ERROR
        submission.save(update_fields=["status"])
