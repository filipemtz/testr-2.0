import signal
from multiprocessing import Event

from django.core.management.base import BaseCommand

from backend.autojudge_multithread.manager import WorkerManager
from backend.models.submission import (
    Submission,
    SubmissionStatus,
)


class Command(BaseCommand):
    help = "Run the automatic judge."

    def add_arguments(self, parser):
        parser.add_argument("--workers", type=int, default=4)
        parser.add_argument("--verbose", action="store_true")
        parser.add_argument("--keep", action="store_true")
        parser.add_argument("--sleep-time", type=float, default=1)
        parser.add_argument("--rerun", action="store_true")

    def handle(self, *args, **options):
        if options["rerun"]:
            Submission.objects.filter(status=SubmissionStatus.FINISHED).update(
                status=SubmissionStatus.WAITING_EVALUATION
            )

        manager = WorkerManager(
            workers=options["workers"],
            verbose=options["verbose"],
            keep=options["keep"],
            sleep_time=options["sleep_time"],
        )

        stop_event = Event()

        def shutdown(signum, frame):
            stop_event.set()

        signal.signal(signal.SIGINT, shutdown)
        signal.signal(signal.SIGTERM, shutdown)

        manager.start(stop_event)
