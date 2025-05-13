
import os
import uuid
import json
import time
import shutil

from glob import glob
from abc import ABC, abstractmethod
from typing import Any, Dict, Tuple
from datetime import datetime
from pathlib import Path
import platform

import pytest
import threading
import queue

from .docker_runner import DockerRunner
from .unsafe_runner import UnsafeRunner
from .runner_interface import RunnerInterface
from backend.models.input_output import InputOutput
from backend.models.submission import Submission
from backend.models.question import Question
from backend.models.question_file import QuestionFile
from backend.utils.io import unzip, safe_load_yaml
from decouple import config



class PytestReportHook:
    def __init__(self):
        self.report = {}

    def pytest_terminal_summary(self, terminalreporter, exitstatus, config):
        """ hook called after generating the reports for all tests """
        for result_type in ['passed', 'failed', 'error']:
            self.report[result_type] = []

            if result_type not in terminalreporter.stats:
                continue

            tests = terminalreporter.stats[result_type]

            for test in tests:
                print(test)
                test_report = {
                    "file": test.fspath,
                    "name": test.head_line,
                    "start": test.start,
                    "stop": test.stop,
                    "outcome": test.outcome,
                    "when": test.when,
                    "message": ""
                }

                if not test.longrepr:
                    test_report["message"] = "success"
                else:
                    last_exception = test.longrepr.chain[-1]
                    test_report["message"] = last_exception[1].message

                self.report[result_type].append(test_report)


def do_judging(q: queue.Queue):
    # Run pytest
    hook = PytestReportHook()
    pytest.main(["-qq", "--tb=no", "-s"], plugins=[hook])
    q.put(hook.report)


class JupyterJudge(ABC):
    def __init__(self, keep_files: bool):
        self._keep_files = keep_files

    def _run_pytest(self):
        return {}

    def judge(self, submission: Submission, verbose: bool = False) -> Dict[str, Any]:
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
        self.report = {"error_msgs": [],
                       "start_at": dt,
                       "uuid": self.test_uuid,
                       "end_at": dt}

        self._prepare_directory_and_files_for_test(self.test_uuid, submission)
        self._save_question_files(self.question)

        current_dir = os.getcwd()

        # change dir to the one containing the ipynb file
        os.chdir(self.test_dir)
        
        # search for ipynb files and check if there is a single one
        paths = glob("**/*ipynb", recursive=True)
        print("jupyter notebooks:", paths)
        if len(paths) == 0:
            self.report['error_msgs'].append('No .ipynb file found in the submission.')
        elif len(paths) > 1:
            self.report['error_msgs'].append('More than one .ipynb file found in the submission.')
        else:
            ipynb_path = paths[0]
            ipynb_dir = os.path.dirname(ipynb_path)

            # Run pytest
            q = queue.Queue()
            thread = threading.Thread(target=do_judging, args=(q, ))
            thread.start()
            results = q.get()
            thread.join()

            # transformar o relatorio do pytest no formato esperado pelo restante do sistema
            for key in ['failed', 'error']:
                for test_report in results[key]:
                    name = test_report['name']
                    msg = test_report['message']
                    self.report['error_msgs'].append(f"<b>{name}</b>: {msg}")

        os.chdir(current_dir)

        self._cleanup()

        self.report["end_at"] = datetime.now().strftime(date_format)

        return self.report

    def _prepare_directory_and_files_for_test(self,
                                              test_uuid,
                                              submission: Submission):

        # create directory to run the tests
        self.test_dir = Path(config('AUTOJUDGE_DIRECTORY'))
        self.test_dir = self.test_dir.joinpath(test_uuid)
        self.test_dir.mkdir(parents=True)

        # save the submitted file
        file_name = self.test_dir.joinpath(submission.file_name)

        if platform.system() == 'Windows':
            # windows requer permisao de admin para criar links simbolicos... estudar como resolver.
            shutil.copyfile(submission.file.path, file_name)
        else:
            if os.path.exists(file_name):
                os.remove(file_name)
            os.symlink(submission.file.path, file_name)

        # unzip file if needed, and then remove the zip file
        if file_name.suffix == '.zip':
            file_name_str = str(file_name)
            unzip(file_name_str, str(self.test_dir))
            os.remove(file_name_str)


    def _save_question_files(self, question: Question):
        self.known_question_files = []

        for question_file in question.questionfile_set.all():
            file_name = os.path.join(self.test_dir, question_file.file_name)
            self.known_question_files.append(file_name)

            if platform.system() == 'Windows':
                # windows requer permisao de admin para criar links simbolicos... estudar como resolver.
                shutil.copyfile(question_file.file.path, file_name)
            else:
                if os.path.exists(file_name):
                    os.remove(file_name)
                os.symlink(question_file.file.path, file_name)

    def _cleanup(self):
        # clean up resources used for running the tests, e.g., remove the test
        # directory.
        if not self._keep_files:
            shutil.rmtree(self.test_dir)

