import {
  ILogger,
  IVKServiceAPI,
  IVKTargets,
  IVKUsers,
  IWorkerPool
} from "../modules";
import "reflect-metadata";

export class CrawlerModel {
  private readonly _vkServiceApi: IVKServiceAPI;
  private readonly _logger: ILogger;
  private readonly _pool: IWorkerPool;
  private readonly _vkTargets: IVKTargets;
  private readonly _vkUsers: IVKUsers;

  public constructor(
    vkServiceApi: IVKServiceAPI,
    logger: ILogger,
    pool: IWorkerPool,
    vkTargets: IVKTargets,
    vkUsers: IVKUsers
  ) {
    this._vkServiceApi = vkServiceApi;
    this._logger = logger;
    this._pool = pool;
    this._vkTargets = vkTargets;
    this._vkUsers = vkUsers;
  }

  async grabVKSubscribers() {
    const groups = await this._vkTargets.getAllGroups();
    const ids = groups.map((data) => data.id);

    for (const id of ids) {
      const membersCount = await this._vkServiceApi.membersCount(id);

      if (membersCount > 0) {
        const membersReader = this._vkServiceApi.membersReader(
          id,
          membersCount
        );

        for (const membersPromise of membersReader) {
          const { items } = await membersPromise;
          const usersData = await this._vkServiceApi.getUsersInfo(items);

          for (const userData of usersData) {
            if (userData.first_name === "DELETED") continue;

            const user = await this._vkUsers.createIfNotExist({
              id: userData.id,
              domain: userData.domain,
              firstName: userData.first_name,
              lastName: userData.last_name,
              profilePictureUrl: userData.photo_200
            });

            const association = await this._vkTargets.associateUser(id, user.id)
          }
        }
      }
    }
  }
}
