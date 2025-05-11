
import json
import traceback
from datetime import datetime

from .cpp_judge import CppJudge
from .base_judge import BaseJudge
from .python_judge import PythonJudge
from .jupyter_judge import JupyterJudge

from backend.models.question import Language
from backend.models.submission import Submission, SubmissionStatus


class AutoJudgeRunner:
    judges = {
        Language.CCPP.value: CppJudge,
        Language.PYTHON.value: PythonJudge,
        Language.JUPYTER.value: JupyterJudge,
    }

    @classmethod
    def evaluate(cls,
                 submission: Submission,
                 keep_files: bool = False,
                 verbose: bool = False
                 ) -> None:

        judge_class = AutoJudgeRunner.judges[submission.question.language]

        judge = judge_class(keep_files)
        try:
            report = judge.judge(submission, verbose)
        except Exception as e:
            if verbose:
                print("\n[!! IMPORTANT !!] A submission crashed the autojudge with the following error:")
                print(traceback.format_exc())
            date_format = "%d/%m/%Y %H:%M:%S"
            dt = datetime.now().strftime(date_format)
            report = {
                "error_msgs": [f"The submission crashed the autojudge: {traceback.format_exc()}"],
                "start_at": dt,
                "end_at": dt,
                "uuid": "",
                "input_output_test_report": {
                    "tests_reports": []
                }
            }

        report_json = json.dumps(report)
        submission.report_json = report_json

        if len(report["error_msgs"]) == 0:
            submission.status = SubmissionStatus.SUCCESS
        else:
            submission.status = SubmissionStatus.FAIL

        submission.save()

        if verbose:
            print("--------------------------")

        print(
            f"Submission {report['uuid']}: {submission} evaluated with {submission.status.label}.")

        if verbose:
            print("--------------------------")

        if verbose and (len(report["error_msgs"]) > 0):
            print("Error messages:")
            print("--------------------------")
            for msg in report["error_msgs"]:
                print("* ", msg)
            print("--------------------------")

    @classmethod
    def register_judge(cls, language: str, judge_class: BaseJudge) -> None:
        AutoJudgeRunner.judges[language] = judge_class
