import { ILogger, IVKServiceAPI, IVKTargets, IWorkerPool } from "../modules";
import "reflect-metadata";

export class CrawlerModel {
  private readonly _vkServiceApi: IVKServiceAPI;
  private readonly _logger: ILogger;
  private readonly _pool: IWorkerPool;
  private readonly _vkTargets: IVKTargets;

  public constructor(
    vkServiceApi: IVKServiceAPI,
    logger: ILogger,
    pool: IWorkerPool,
    vkTargets: IVKTargets
  ) {
    this._vkServiceApi = vkServiceApi;
    this._logger = logger;
    this._pool = pool;
    this._vkTargets = vkTargets;
  }

  test() {
    this._logger.debug("CrawlerModel works correctly");
  }
}
