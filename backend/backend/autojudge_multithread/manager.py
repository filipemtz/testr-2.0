from multiprocessing import Process

from backend.autojudge_multithread.worker import JudgeWorker


class WorkerManager:
    def __init__(self, workers, verbose, keep, sleep_time):
        self.workers = workers
        self.verbose = verbose
        self.keep = keep
        self.sleep_time = sleep_time

    def start(self, stop_event):
        processes = []
        for worker_id in range(self.workers):
            worker = JudgeWorker(
                worker_id=worker_id,
                stop_event=stop_event,
                keep=self.keep,
                verbose=self.verbose,
                sleep_time=self.sleep_time,
            )

            worker.start()
            processes.append(worker)

        print(f">> [Manager] {self.workers} process created.")

        for p in processes:
            p.join()
