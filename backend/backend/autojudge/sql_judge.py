import traceback
import uuid
from datetime import datetime
from typing import Any

import duckdb
from backend.models.question import DbTestInfo
from backend.models.submission import Submission
from pyrelax.data import databases


class SQLJudge:
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

        test_info = DbTestInfo.objects.filter(question=self.question)
        if test_info.count() == 0:
            self.report["error_msgs"].append(
                "Relax information missing for the question."
            )
            return
        else:
            test_info = test_info.first()

        if test_info.database not in databases:
            self.report["error_msgs"].append("Invalid database.")
            return

        ##########################
        # JUDGING
        ##########################
        student_query = submission.file.read().decode("utf-8")
        student_result = teacher_result = None

        db_conn = self._setup_db(test_info)

        try:
            student_result = db_conn.sql(student_query).df()
        except Exception as e:
            self.report["error_msgs"].append("Error in student query: " + e.__repr__())
            print(traceback.format_exc())

        try:
            teacher_result = db_conn.sql(test_info.correct_query).df()
        except Exception as e:
            self.report["error_msgs"].append("Error in teacher query: " + e.__repr__())
            print(traceback.format_exc())

        db_conn.close()

        result_match = self._df_match(student_result, teacher_result)

        if not result_match:
            self.report["error_msgs"].append("Query result is incorrect.")

        self.report["end_at"] = datetime.now().strftime(date_format)

        return self.report

    def _setup_db(self, test_info):
        tables = databases[test_info.database]
        db_conn = duckdb.connect(database=":memory:")
        for name, df in tables.items():
            db_conn.register(name, df)
        return db_conn

    def _df_match(self, student_result, teacher_result):
        result_match = False

        if (student_result is not None) and (teacher_result is not None):
            if teacher_result.shape[1] != student_result.shape[1]:
                self.report["error_msgs"].append(
                    "Number of columns is different from what is expected."
                )
                result_match = False
            else:
                teacher = teacher_result.copy()
                student = student_result.copy()

                teacher.columns = range(teacher.shape[1])
                student.columns = range(student.shape[1])

                result_match = (
                    teacher.sort_values(teacher.columns.tolist())
                    .reset_index(drop=True)
                    .equals(
                        student.sort_values(student.columns.tolist()).reset_index(
                            drop=True
                        )
                    )
                )
        return result_match
