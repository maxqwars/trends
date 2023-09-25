import { VK_TARGET_TYPE } from "@prisma/client";
import { ILogger, IVKServiceAPI, IVKTargets, IWorkerPool } from "../modules";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { cpus } from "os";
import EventEmitter from "node:events";
import { VKObserverWorkerData } from "../workers/VKObserverWorker";

const __filename = fileURLToPath(import.meta.url) as unknown as string;
const __dirname = dirname(__filename);

const pathToVkObserverWorker = join(__dirname, "../workers/VKObserverWorker");
export class ObserverModel {
  private readonly _workersPool: IWorkerPool;
  private readonly _vkTargets: IVKTargets;
  private readonly _logger: ILogger;
  private readonly _vkServiceApi: IVKServiceAPI;

  constructor(
    workerPool: IWorkerPool,
    vkTargets: IVKTargets,
    logger: ILogger,
    vkServiceApi: IVKServiceAPI
  ) {
    this._workersPool = workerPool;
    this._vkTargets = vkTargets;
    this._logger = logger;
    this._vkServiceApi = vkServiceApi;
  }

  private async _runTaskInVKObserverPool(
    id: number,
    type: VK_TARGET_TYPE,
    contentType: "comments" | "posts",
    depth: number
  ) {
    const WALL_END_EVENT = Symbol.for("WALL_END_EVENT");
    const eventEmitter = new EventEmitter();

    const postsCount = await this._vkServiceApi.postsCount(id, type);
    const limit = postsCount < 100 ? postsCount : depth;

    return new Promise((resolve, reject) => {
      const wallReader = this._vkServiceApi.createWallReader(
        id,
        type,
        postsCount,
        limit
      );

      const timing = 100

      const interval = setInterval(async () => {
        if (this._workersPool.freeWorkersCount > 0) {
          const { done, value: postsPromise } = wallReader.next();

          if (done) {
            eventEmitter.emit(WALL_END_EVENT, null);
          }

          if (!done && postsPromise) {
            const { items: posts } = await postsPromise;

            // console.log(posts.length);

            this._workersPool.execute<VKObserverWorkerData>(
              {
                posts,
                targetId: id,
                contentType: contentType
              },
              (error, result) => {
                this._logger.info(String(result));

                if (error) {
                  this._logger.error(error.message);
                  reject(error);
                }
              }
            );

            // postsPromise.then(({ items: posts }) => {
            // this._workersPool.execute<VKObserverWorkerData>(
            //   {
            //     posts,
            //     targetId: id,
            //     contentType: contentType
            //   },
            //   (error, result) => {
            //     this._logger.info(String(result));

            //     if (error) {
            //       this._logger.error(error.message);
            //       reject(error);
            //     }
            //   }
            // );
            // });
          }
        }
      }, timing);

      eventEmitter.on(WALL_END_EVENT, () => {
        clearInterval(interval);
        resolve(true);
      });
    });
  }

  async vkTrendsCommentsObserver(
    contentType: "comments" | "posts",
    depth: number,
    threads: "all" | number
  ) {
    const targetsCount = await this._vkTargets.targetsCount();

    /* Prepare pool */
    this._workersPool.configure({
      threads: threads === "all" ? cpus().length - 1 : Number(threads),
      worker: pathToVkObserverWorker + ".js",
      name: "VK_OBS_POOL"
    });

    /* Spawn workers */
    this._workersPool.spawn();

    /*  */
    while (true) {
      for (let i = 0; i < targetsCount; i++) {
        const { id, type } = await this._vkTargets.reader(1, i);
        if (type === "USER") continue;
        await this._runTaskInVKObserverPool(
          id,
          type,
          contentType,
          Number(depth)
        );
      }
    }

    /* Terminate workers */
    // this._workersPool.terminate();
  }
}
