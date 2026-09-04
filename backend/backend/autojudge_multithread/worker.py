import os
from multiprocessing import Process
from time import sleep


class JudgeWorker(Process):
    def __init__(
        self,
        worker_id,
        stop_event,
        keep,
        verbose,
        sleep_time,
    ):
        super().__init__()

        self.worker_id = worker_id
        self.stop_event = stop_event
        self.keep = keep
        self.verbose = verbose
        self.sleep_time = sleep_time

    def initialize(self):
        # initialize django for the worker process
        import django

        os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
        django.setup()
        from django.db import connections

        # Every worker owns its own database connections.
        connections.close_all()

        # imports that access the django infrastrcutre must happen after django setup
        from backend.autojudge.autojudge_runner import AutoJudgeRunner
        from backend.autojudge_multithread.submission_repository import (
            SubmissionRepository,
        )

        self.runner = AutoJudgeRunner
        self.repository = SubmissionRepository

    def run(self):
        self.initialize()
        from django.db import connection

        print(f"[Worker {self.worker_id}] initialized.")
        sleep(2)

        while not self.stop_event.is_set():
            connection.ensure_connection()
            submission = self.repository.acquire()
            if submission is None:
                print(f"[Worker {self.worker_id}] " f"Waiting for submissions.")
                sleep(self.sleep_time)
                continue

            if self.verbose:
                print(
                    f"[Worker {self.worker_id}] "
                    f"Evaluating submission {submission.id}"
                )

            try:
                self.runner.evaluate(
                    submission,
                    self.keep,
                    self.verbose,
                )

            except Exception:
                self.repository.mark_internal_error(submission)
                raise
