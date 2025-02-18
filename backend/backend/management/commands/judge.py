
import random
from time import sleep
from django.db.utils import OperationalError
from django.core.management.base import BaseCommand

from backend.models.submission import Submission, SubmissionStatus
from backend.autojudge.autojudge_runner import AutoJudgeRunner


class Command(BaseCommand):
    help = 'Judge submissions.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--rerun',
            action='store_true',
            help='Use this option to evaluate all submissions again.')

        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Control the amount of output printed to the screen.')

        parser.add_argument(
            '--keep',
            action='store_true',
            help='Prevent deletion of files in autojudge directory.')

        parser.add_argument(
            '--sleep_time',
            type=int,
            default=0.3,
            help='Number of seconds autojudge will sleep when there are no submissions to evaluate.')

    def handle(self, *args, **options):
        print("\nAutojudge running.\n")

        # handle the case in which the judge starts before the backend finishes initializing the basic infrastructure
        while True:
            try:
                if Submission.objects.exists():
                    break
            except OperationalError:
                print("Waiting for the submissions table to be created...")
                sleep(1)

        if options['rerun']:
            Submission.objects.update(
                status=SubmissionStatus.WAITING_EVALUATION)

        while True:

            submissions = Submission.objects.filter(
                status=SubmissionStatus.WAITING_EVALUATION)

            if len(submissions) == 0:
                # print(
                #    f"No submissions without evaluation were found. Sleeping for {options['sleep_time']} seconds.")
                sleep(options['sleep_time'])
            else:
                subs = list(submissions.all())
                random.shuffle(subs)
                selected_submission = subs[0]

                if options['verbose']:
                    print("EVALUATING SUBMISSION:", selected_submission.id,
                        "STUDENT:", selected_submission.student.first_name, selected_submission.student,
                        "QUESTION:", selected_submission.question)

                AutoJudgeRunner.evaluate(
                    selected_submission, options['keep'], options['verbose'])
