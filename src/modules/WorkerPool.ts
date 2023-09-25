import { injectable } from "inversify";
import "reflect-metadata";
import { AsyncResource } from "node:async_hooks";
import { EventEmitter } from "node:events";
import { resolve } from "node:path";
import { Worker } from "node:worker_threads";

type PoolConfigurationType = {
  threads: number;
  worker: string;
  name: string;
};

const taskInfo = Symbol("taskInfo");
const workerFreeEvent = Symbol("workerFreeEvent");

class WorkerPoolTaskInfo extends AsyncResource {
  private readonly _cb;

  constructor(cb) {
    super("WorkerPoolTaskInfo");
    this._cb = cb;
  }

  done<T>(error, result: T) {
    this.runInAsyncScope(this._cb, null, error, result);
    this.emitDestroy();
  }
}

export interface IWorkerPool {
  /* Fields */
  threadsCount: number;
  workersCount: number;
  freeWorkersCount: number;

  /* Methods */
  configure(config: PoolConfigurationType);
  spawn();
  close();
  execute<T>(data: T, cb);
}

@injectable()
export class WorkerPool implements IWorkerPool {
  private _threadsCount: number;
  private _worker: string;
  private _name: string;

  private readonly _emitter = new EventEmitter();

  private _workers: Worker[] = [];
  private _freeWorkers: Worker[] = [];

  get threadsCount() {
    return this._threadsCount;
  }

  get workersCount() {
    return this._workers.length;
  }

  get freeWorkersCount() {
    return this._freeWorkers.length;
  }

  close() {
    for (const worker of this._workers) worker.terminate();
  }

  spawn() {
    for (let i = 0; i < this._threadsCount; i++) {
      this._createWorker();
    }
  }

  execute<T>(data: T, cb) {
    if (this._freeWorkers.length === 0) {
      this._emitter.once(workerFreeEvent, () => this.execute<T>(data, cb));
      return;
    }

    const worker = this._freeWorkers.pop();
    worker[taskInfo] = new WorkerPoolTaskInfo(cb);
    worker.postMessage(data);
  }

  configure(config: PoolConfigurationType) {
    this._threadsCount = config.threads;
    this._worker = config.worker;
    this._name = config.name;
  }

  private _createWorker() {
    const worker = new Worker(resolve(this._worker));

    worker.on("message", (result) => {
      console.log("Worker complete task");

      worker[taskInfo].done(null, result);
      worker[taskInfo] = null;

      this._freeWorkers.push(worker);
      this._emitter.emit(workerFreeEvent);
    });

    worker.on("error", (error) => {
      if (worker[taskInfo]) worker[taskInfo].done(error, null);
      else this._emitter.emit("error", error);

      this._workers.splice(this._workers.indexOf(worker), 1);
      this._createWorker();
    });

    this._workers.push(worker);
    this._freeWorkers.push(worker);
    this._emitter.emit(workerFreeEvent);
  }
}
