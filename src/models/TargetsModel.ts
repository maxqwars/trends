import { VK_TARGET_TYPE } from "@prisma/client";
import { ILogger, IStorage, IVKServiceAPI, IVKTargets } from "../modules";
import { VK_OBJECT_TYPE } from "../modules/VKServiceAPI";

export class TargetsModel {
  private readonly _storage: IStorage;
  private readonly _logger: ILogger;
  private readonly _vkTargets: IVKTargets;
  private readonly _vkServiceApi: IVKServiceAPI;

  constructor(
    storage: IStorage,
    logger: ILogger,
    vkTargets: IVKTargets,
    vkServiceApi: IVKServiceAPI
  ) {
    this._storage = storage;
    this._logger = logger;
    this._vkTargets = vkTargets;
    this._vkServiceApi = vkServiceApi;
  }

  private async _registerVKPublics(ids: number[]) {
    const groupsData = await this._vkServiceApi.getGroupsInfo(ids);

    for (const groupData of groupsData) {
      await this._vkTargets.createIfNotExist({
        id: groupData.id,
        name: groupData.name,
        profilePictureUrl: groupData.photo_200,
        domain: groupData.domain,
        type: VK_TARGET_TYPE.GROUP
      });
    }
  }

  private async _registerVKUsers(ids: number[]) {
    const usersData = await this._vkServiceApi.getUsersInfo(ids);

    for (const userData of usersData) {
      await this._vkTargets.createIfNotExist({
        id: userData.id,
        name: `${userData.first_name} ${userData.last_name}`,
        profilePictureUrl: userData.photo_200,
        domain: userData.domain,
        type: VK_TARGET_TYPE.USER
      });
    }
  }

  async loadVKTargets(filename: string) {
    const reader = this._storage.fileReader(filename);
    const targetTypeUser = [];
    const targetTypePublic = [];
    const domains = [];

    for (const line of reader) {
      const str = line.toString();

      const { id, type } = await this._vkServiceApi.getId(str);

      switch (type) {
        case VK_OBJECT_TYPE.GROUP: {
          targetTypePublic.push(id);
          break;
        }
        case VK_OBJECT_TYPE.USER: {
          targetTypeUser.push(id);
        }
      }
    }

    this._logger.info(
      `Read complete, found: ${targetTypeUser.length} users and ${targetTypePublic.length} publics`
    );

    await this._registerVKPublics(targetTypePublic);
    await this._registerVKUsers(targetTypeUser);

    return;
  }
}
