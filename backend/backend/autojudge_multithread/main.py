import multiprocessing as mp
import os
import shutil
import signal
import tempfile
import threading
import time
import traceback
from dataclasses import dataclass, field


@dataclass(slots=True)
class Submission:
    submission_id: int
    problem_id: int
    language: str
    source_files: dict[str, bytes]
    submitted_at: float = field(default_factory=time.time)


class Worker(mp.Process):

    def __init__(self, worker_id, submission_queue, result_queue):
        super().__init__()
        self.worker_id = worker_id
        self.submission_queue = submission_queue
        self.result_queue = result_queue

    def compile(self, submission, workdir):
        print(
            f"[Worker {self.worker_id}] "
            f"Compiling submission {submission.submission_id}"
        )

        executable = os.path.join(workdir, "program")
        return {"success": True, "executable": executable, "message": ""}

    def execute_test(self, executable, testcase):
        return {"status": "Accepted", "time": 0.013, "memory": 123456}

    def evaluate(self, submission):
        workdir = tempfile.mkdtemp(prefix=f"submission_{submission.submission_id}_")
        try:
            # Save source files
            for filename, content in submission.source_files.items():
                path = os.path.join(workdir, filename)
                with open(path, "wb") as f:
                    f.write(content)

            # Compile
            compilation = self.compile(submission, workdir)
            if not compilation["success"]:
                return {
                    "submission_id": submission.submission_id,
                    "status": "Compilation Error",
                    "message": compilation["message"],
                }

            executable = compilation["executable"]

            testcases = range(20)
            results = []
            for testcase in testcases:
                result = self.execute_test(executable, testcase)
                results.append(result)
                #
                # Optional:
                # stop on first error
                #
                if result["status"] != "Accepted":
                    break

            return {
                "submission_id": submission.submission_id,
                "status": "Finished",
                "results": results,
            }

        finally:
            shutil.rmtree(workdir, ignore_errors=True)

    def run(self):
        signal.signal(signal.SIGINT, signal.SIG_IGN)
        print(f"Worker {self.worker_id} started " f"(pid={os.getpid()})")
        while True:
            # Parent disappeared.
            if os.getppid() == 1:
                break
            try:
                submission = self.submission_queue.get(timeout=1)
            except Exception:
                continue

            if submission is None:
                self.submission_queue.task_done()
                break

            try:
                result = self.evaluate(submission)
            except Exception:
                traceback.print_exc()

                result = {
                    "submission_id": submission.submission_id,
                    "status": "Internal Error",
                }

            self.result_queue.put(result)
            self.submission_queue.task_done()

        print(f"Worker {self.worker_id} finished.")


NUM_WORKERS = 4

submission_queue = mp.JoinableQueue()
result_queue = mp.Queue()
workers = []

shutdown_event = threading.Event()


def result_collector():
    while not shutdown_event.is_set():
        try:
            result = result_queue.get(timeout=1)
        except Exception:
            continue

        # Update database here...

        print(f"Submission " f"{result['submission_id']} " f"-> {result['status']}")


def shutdown(signum, frame):
    shutdown_event.set()


def start_workers():
    for i in range(NUM_WORKERS):
        worker = Worker(i, submission_queue, result_queue)
        worker.start()
        workers.append(worker)


def stop_workers():
    print("Stopping workers...")

    # One sentinel per worker.
    for _ in workers:
        submission_queue.put(None)

    submission_queue.join()

    for worker in workers:
        worker.join(timeout=10)
        if worker.is_alive():
            worker.terminate()
            worker.join()

    submission_queue.close()
    result_queue.close()


def submit(submission):
    submission_queue.put(submission)


if __name__ == "__main__":
    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)
    start_workers()

    collector = threading.Thread(target=result_collector, daemon=True)
    collector.start()

    # Simulated web server
    for i in range(20):
        submit(
            Submission(
                submission_id=i,
                problem_id=1,
                language="cpp",
                source_files={"main.cpp": b"""
                    int main(){return 0;}
                    """},
            )
        )

    try:
        while not shutdown_event.is_set():
            time.sleep(1)

    finally:
        #
        # Wait until every submission
        # has been processed.
        #
        submission_queue.join()
        stop_workers()
        shutdown_event.set()
        collector.join()
        print("Finished.")
