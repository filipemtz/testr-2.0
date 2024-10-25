
import os
import uuid
import json
import time
import shutil
import subprocess
from abc import ABC, abstractmethod
from typing import Any, Dict, Tuple
from datetime import datetime
from pathlib import Path
import platform

from .docker_runner import DockerRunner
from .unsafe_runner import UnsafeRunner
from .runner_interface import RunnerInterface
from backend.models.input_output import InputOutput
from backend.models.submission import Submission
from backend.models.question import Question
from backend.models.question_file import QuestionFile
from backend.utils.io import unzip, safe_load_yaml


class BaseJudge(ABC):
    def __init__(self, keep_files: bool):
        self.config = safe_load_yaml("../config.yaml")
        self._keep_files = keep_files

    def judge(self, submission: Submission, verbose: bool = False) -> Dict[str, Any]:
        self.test_uuid = str(uuid.uuid4())

        self.verbose = verbose
        if verbose:
            print(f"New submission received - uuid: {self.test_uuid}.")

        self.submission = submission
        self.question = submission.question

        # test is defined as failed if there is at least one error message
        # in the end of the valuation.
        date_format = "%d/%m/%Y %H:%M:%S"
        dt = datetime.now().strftime(date_format)
        self.report = {"error_msgs": [],
                       "start_at": dt, "uuid": self.test_uuid}

        self._prepare_directory_and_files_for_test(self.test_uuid, submission)
        self._save_question_files(self.question)
        run_cmd, success = self._evaluate_files_and_prepare_executable()

        print("platform.system():", platform.system())
        if platform.system() == "Windows":
            run_cmd = run_cmd.replace("./", ".\\")

        if success:

            if self.config['judge']["use_docker"]:
                runner = DockerRunner(
                    run_cmd,
                    cpu=self.question.cpu_limit,
                    memory_mb=self.question.memory_limit,
                    timeout_seconds=self.question.time_limit_seconds,
                    # working dir is changed to self.test_dir internally
                    host_dir=self.test_dir,
                    docker_dir=f'/submissions/{self.test_uuid}'
                )
                # docker requires using paths with "/" as separator
                #d = os.path.normpath(self.test_dir)
                #d = d.replace("\\", "/")
                #run_cmd = f"docker run --memory={self.question.memory_limit}m --cpus={self.question.cpu_limit} -i --rm -v {d}:/{self.test_uuid} -w /{self.test_uuid} testr_docker_image timeout -s SIGKILL {self.question.time_limit_seconds}s {run_cmd}"
            else:
                runner = UnsafeRunner(run_cmd, running_dir=self.test_dir)

            self._run_input_output_tests(runner)

        self._cleanup()

        self.report["end_at"] = datetime.now().strftime(date_format)

        return self.report

    @abstractmethod
    def _evaluate_files_and_prepare_executable(self) -> Tuple[str, bool]:
        """ Check if the necessary source code files are provided, prepare
        the executable (e.g., compile, assign permissions), and return the
        command to run the executable along with a boolean to indicate if
        the preparation was successful. The method is abstract because it
        is language-dependent.
        """

    def _prepare_directory_and_files_for_test(self,
                                              test_uuid,
                                              submission: Submission):

        # create directory to run the tests
        self.test_dir = Path(self.config['judge']['autojudge_directory'])
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

    def _run_input_output_tests(self, runner: RunnerInterface):
        # get the question inputs and outputs from the db
        in_out_tests = InputOutput.objects.filter(
            question=self.question)

        # we assume success if there are no tests
        self.report["input_output_test_report"] = {
            "tests_reports": []
        }

        for counter, in_out_test in enumerate(in_out_tests):
            test_report = {
                "input": in_out_test.input,
                "expected_output": in_out_test.output,
                "visible": in_out_test.visible,
                "time_limit_exceeded": False,
                "success": True,
            }

            # clean the input string
            # 1) remove "\r"
            input_str = in_out_test.input.strip().replace("\r", "")
            # 2) remove spaces in the beginning and end of lines
            input_str = "\n".join([line.strip()
                                  for line in input_str.split("\n")])

            if self.verbose:
                print(f"Running test {counter} of {len(in_out_tests)}.")

            run_report = runner.run(input_str, verbose=self.verbose)

            if run_report['time_limit_exceeded']:
                test_report['time_limit_exceeded'] = True
                test_report['success'] = False
            else:
                self._write_input_output_test_report(
                    run_report['result'], test_report)

            self.report["input_output_test_report"]["tests_reports"].append(
                test_report)

        self._write_error_messages_from_tests()

    def _save_question_files(self, question: Question):
        self.known_question_files = []
        for question_file in question.questionfile_set.all():
            file_name = os.path.join(self.test_dir, question_file.file_name)
            self.known_question_files.append(file_name)
            os.symlink(question_file.file.path, file_name)

            if platform.system() == 'Windows':
                # windows requer permisao de admin para criar links simbolicos... estudar como resolver.
                shutil.copyfile(question_file.file.path, file_name)
            else:
                if os.path.exists(file_name):
                    os.remove(file_name)
                os.symlink(question_file.file.path, file_name)


    '''
    def _run_test(self,
                  run_cmd: str,
                  input_str: str,
                  time_limit_seconds: float,
                  test_report: Dict[str, Any]
                  ):

        start = time.time()
        time_limit_exceeded = False
        run_report = None

        try:
            # ############################################################
            # Run the command, wait for it to complete for as much time
            # as the timeout argument, and then return a CompletedProcess
            # instance.
            # see https://docs.python.org/3/library/subprocess.html
            # ############################################################
            run_report = subprocess.run(
                run_cmd,
                input=input_str,
                capture_output=True,
                # timeout=time_limit_seconds,
                # because some cmds have spaces (e.g., "python program.py")
                shell=True,
                text=True)

            print("Run Report:", run_report, "\n")

            # when running with docker, we use the timeout function that returns
            # error 124 when the program takes longer to finish than than the
            # given time.
            if run_report.returncode == 124:
                time_limit_exceeded = True

        except subprocess.TimeoutExpired:
            time_limit_exceeded = True

        if time_limit_exceeded:
            test_report["time_limit_exceeded"] = True
            test_report["success"] = False
            run_report = None

        end = time.time()
        test_report["running_time"] = end - start

        return run_report
    '''

    def _write_error_messages_from_tests(self):

        visible_test_id = 1
        n_hidden_test_timeouts = 0
        n_hidden_test_output_mismatch_fails = 0
        n_hidden_test_runtime_fails = 0
        n_hidden_tests = 0

        for test in self.report["input_output_test_report"]["tests_reports"]:
            if test["success"]:
                if test["visible"]:
                    visible_test_id += 1
                else:
                    n_hidden_tests += 1
                continue

            if test["visible"]:
                if test["time_limit_exceeded"]:
                    self.report["error_msgs"].append(
                        f"time limit exceeded in test {visible_test_id}.")
                elif (test["return_code"] != 0) or (test["program_errors"] != ""):
                    self.report["error_msgs"].append(
                        f"runtime error in test {visible_test_id} <br> <hr>" +
                        f"<b>Return Code:</b> {test['return_code']} <br>" +
                        "<b>Error msg:</b> <br>" +
                        test["program_errors"].replace("\n", "<br>") +
                        "<hr> <br>"
                    )
                else:
                    self.report["error_msgs"].append(
                        f"output mismatch in test {visible_test_id}. <div class='row'> <div class='col'> <b> Expected: </b> <br> {test['expected_output']} </div> <div class='col'> <b> Produced: </b> <br> {test['program_output']} </div> </div>")
                visible_test_id += 1
            else:
                if test["time_limit_exceeded"]:
                    n_hidden_test_timeouts += 1
                elif (test["return_code"] != 0) or (test["program_errors"] != ""):
                    n_hidden_test_runtime_fails += 1
                else:
                    n_hidden_test_output_mismatch_fails += 1
                n_hidden_tests += 1

        if n_hidden_test_timeouts > 0:
            percent_hidden_timeouts = 100 * \
                (n_hidden_test_timeouts / n_hidden_tests)
            self.report["error_msgs"].append(
                f"{percent_hidden_timeouts:.0f}% timeouts in hidden input/output tests.")

        if n_hidden_test_runtime_fails > 0:
            percent_runtime_fails = 100 * \
                (n_hidden_test_runtime_fails / n_hidden_tests)
            self.report["error_msgs"].append(
                f"{percent_runtime_fails:.0f}% runtime errors in hidden input/output tests.")

        if n_hidden_test_output_mismatch_fails > 0:
            percent_output_mismatchs = 100 * \
                (n_hidden_test_output_mismatch_fails / n_hidden_tests)
            self.report["error_msgs"].append(
                f"{percent_output_mismatchs:.0f}% output mismatches in hidden input/output tests.")

    def _write_input_output_test_report(
            self,
            run_report: subprocess.CompletedProcess,
            test_report: Dict[str, Any]) -> None:

        test_report["program_output"] = run_report.stdout
        test_report["program_errors"] = run_report.stderr
        test_report["return_code"] = run_report.returncode

        # Split without args does a great job cleaning the strings:
        # it removes: "\r", "\t", double spaces, spaces before new
        # lines, etc. If the sequence of words is equals, the program
        # passes the test.
        test_report["output_mismatch"] = \
            test_report["program_output"].split() != \
            test_report["expected_output"].split()

        test_report["success"] = \
            (not test_report["output_mismatch"]) and \
            (test_report["return_code"] == 0) and \
            (len(test_report["program_errors"]) == 0)

    def _cleanup(self):
        # clean up resources used for running the tests, e.g., remove the test
        # directory.

        if not self._keep_files:
            shutil.rmtree(self.test_dir)


"""
# TODO: extract the methods for saving files from below.
def _run_input_output_tests_docker(self, run_cmd: str):
    # get the question inputs and outputs from the db
    in_out_tests = InputOutput.objects.filter(
        question=self.question)

    # we assume success if there are no tests
    self.report["input_output_test_report"] = {
        "tests_reports": []
    }

    script_path = os.path.join(self.test_dir, "run.sh")
    script_file = open(script_path, "w")

    for idx, in_out_test in enumerate(in_out_tests):
        test_report = {
            "input": in_out_test.input,
            "expected_output": in_out_test.output,
            "visible": in_out_test.visible,
            "time_limit_exceeded": False,
            "success": True,
        }

        # clean the input string
        input_str = in_out_test.input.strip().replace("\r", "")
        output_str = in_out_test.output.strip().replace("\r", "")

        # save input and output to a file
        in_file = f"test_{idx}_in.txt"
        out_file = f"test_{idx}_out.txt"
        program_file = f"test_{idx}_program.txt"
        error_file = f"test_{idx}_error.txt"
        diff_file = f"test_{idx}_diff.txt"

        in_path = os.path.join(self.test_dir, in_file)
        out_path = os.path.join(self.test_dir, out_file)

        with open(in_path, "w") as f:
            f.write(input_str)

        with open(out_path, "w") as f:
            f.write(output_str)

        script_file.write(
            f"timeout {self.question.time_limit_seconds} {run_cmd} < {in_file} > {program_file} 2> {error_file}\n")

        script_file.write(
            f"diff {out_file} {program_file} > {diff_file}\n")

    script_file.close()

    # f = open(os.path.join(self.test_dir, "Dockerfile"))
    # f.write("\n")

        # run report will be defined if time limit is not exceeded.
        if run_report:
            # DEBUG:
            # print("return code:")
            # print(run_report.returncode)
            # print("program output:")
            # print(run_report.stdout)
            # print("program error:")
            # print(run_report.stderr)
            self._write_input_output_test_report(run_report, test_report)

        self.report["input_output_test_report"]["tests_reports"].append(
            test_report)

    self._write_error_messages_from_tests()
"""
