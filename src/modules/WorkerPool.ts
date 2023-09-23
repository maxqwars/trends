import { injectable } from "inversify";
import "reflect-metadata";
import { AsyncResource } from "node:async_hooks";
import { EventEmitter } from "node:events";
import { resolve } from "node:path";
import { Worker } from "node:worker_threads";

export type PoolConfig = {
  threadsNumber: number;
  pathToWorkerFile: string;
  poolName: string;
};

export interface IWorkerPool {
  threadsCount: number;
  workersCount: number;
  freeWorkersCount: number;

  setup(config: PoolConfig);
  spawn(): void;
  execute<T>(data: T, callback);
  terminate(): void;
}

const TASK_INFO = Symbol("TASK_INFO");
const WORKER_FREE_EVENT = Symbol("WORKER_FREE_EVENT");

class WorkerPoolTASK_INFO extends AsyncResource {
  private readonly callback;

  constructor(callback) {
    super("WorkerPoolTaskInfo");
    this.callback = callback;
  }

  done<T>(err, result: T) {
    this.runInAsyncScope(this.callback, null, err, result);
    this.emitDestroy();
  }
}

@injectable()
export class WorkerPool implements IWorkerPool {
  private _threadsCount = 0;
  private pathToWorkerFile: string;
  private poolName: string;
  private emitter = new EventEmitter();

  private workers: Worker[] = [];
  private freeWorkers: Worker[] = [];

  get freeWorkersCount() {
    return this.freeWorkers.length;
  }

  get workersCount() {
    return this.workers.length;
  }

  get threadsCount() {
    return this._threadsCount;
  }

  setup(config: PoolConfig) {
    this._threadsCount = config.threadsNumber;
    this.pathToWorkerFile = config.pathToWorkerFile;
    this.poolName = config.poolName;
  }

  spawn() {
    for (let i = 0; i < this._threadsCount; i++) {
      this._createWorker();
    }
  }

  terminate() {
    for (const worker of this.workers) worker.terminate();
  }

  execute<T>(task: T, cb) {
    if (this.freeWorkers.length === 0) {
      this.emitter.once(WORKER_FREE_EVENT, () => this.execute(task, cb));
      return;
    }

    const worker = this.freeWorkers.pop();
    worker[TASK_INFO] = new WorkerPoolTASK_INFO(cb);
    worker.postMessage(task);
  }

  private _createWorker() {
    const worker = new Worker(resolve(this.pathToWorkerFile));

    worker.on("message", (result) => {
      worker[TASK_INFO].done(null, result);
      worker[TASK_INFO] = null;
      this.freeWorkers.push(worker);

      this.emitter.emit(WORKER_FREE_EVENT);
    });

    worker.on("error", (err) => {
      if (worker[TASK_INFO]) worker[TASK_INFO].done(err, null);
      else this.emitter.emit("error", err);

      this.workers.splice(this.workers.indexOf(worker), 1);
      this._createWorker();
    });

    this.workers.push(worker);
    this.freeWorkers.push(worker);
    this.emitter.emit(WORKER_FREE_EVENT);
  }
}
