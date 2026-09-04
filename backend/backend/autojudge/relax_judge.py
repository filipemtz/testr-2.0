import traceback
import uuid
from datetime import datetime
from typing import Any

from backend.models.question import RelaxTestInfo
from backend.models.submission import Submission
from pyrelax.data import databases
from pyrelax.engine import execute_query


class RelaxJudge:
    def __init__(self, keep_files: bool):
        self._keep_files = keep_files

    def judge(self, submission: Submission, verbose: bool = False) -> dict[str, Any]:
        self.test_uuid = str(uuid.uuid4())

        self.verbose = verbose
        if verbose:
            print(f"New submission received - uuid: {self.test_uuid}.")

        self.submission = submission
        self.question = submission.question

        # test is defined as failed if there is at least one error message
        # in the end of the evaluation.
        date_format = "%d/%m/%Y %H:%M:%S"
        dt = datetime.now().strftime(date_format)

        self.report = {
            "error_msgs": [],
            "start_at": dt,
            "uuid": self.test_uuid,
            "end_at": dt,
        }

        ##########################
        # VALIDATIONS
        ##########################

        if submission.file.path[-4:] != ".txt":
            self.report["error_msgs"].append(
                "Submission should contain a file with extension .txt ."
            )
            return

        relax_info = RelaxTestInfo.objects.filter(question=self.question)
        if relax_info.count() == 0:
            self.report["error_msgs"].append(
                "Relax information missing for the question."
            )
            return
        else:
            relax_info = relax_info.first()

        if relax_info.database not in databases:
            self.report["error_msgs"].append("Invalid database.")
            return

        ##########################
        # JUDGING
        ##########################
        student_query = submission.file.read().decode("utf-8")
        tables = databases[relax_info.database]

        student_result = teacher_result = None

        try:
            student_result = execute_query(student_query, tables)
        except Exception as e:
            self.report["error_msgs"].append("Error in student query: " + e.__repr__())
            print(traceback.format_exc())

        try:
            teacher_result = execute_query(relax_info.correct_query, tables)
        except Exception as e:
            self.report["error_msgs"].append("Error in teacher query: " + e.__repr__())
            print(traceback.format_exc())

        result_match = False
        if (student_result is not None) and (teacher_result is not None):
            result_match = (
                teacher_result.sort_values(teacher_result.columns.tolist())
                .reset_index(drop=True)
                .equals(
                    student_result.sort_values(
                        student_result.columns.tolist()
                    ).reset_index(drop=True)
                )
            )

        if not result_match:
            self.report["error_msgs"].append("Query result is incorrect.")

        self.report["end_at"] = datetime.now().strftime(date_format)

        return self.report
