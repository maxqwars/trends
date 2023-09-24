import { inject, injectable } from "inversify";
import "reflect-metadata";
import { IEnvironment, ILogger } from "../modules";
import { API, VK } from "vk-io";
import {
  GroupsGetByIdObjectLegacyResponse,
  GroupsGetMembersResponse,
  UsersGetResponse,
  WallGetCommentResponse,
  WallGetResponse
} from "vk-io/lib/api/schemas/responses";
import { DI_INDX } from "../constants/DI_INDX";

export enum VK_OBJECT_TYPE {
  USER = "USER",
  GROUP = "GROUP"
}

export interface IVKServiceAPI {
  getId(url: string): Promise<{ id: number; type: VK_OBJECT_TYPE } | null>;
  extractDomainFromUrl(url: string): string | null;
  getGroupsInfo(id: number[]): Promise<GroupsGetByIdObjectLegacyResponse>;
  getUsersInfo(id: number[]): Promise<UsersGetResponse>;
  // createCommentDirectUrl(ownerId: number, commentId: number): string | null;
  // postCommentsCount(ownerId: number, postId: number): Promise<number | null>;
  // wallItemsCount(ownerId: number): Promise<number | null>;
  //   userInfo(id: number): Promise<UsersGetResponse | null>;
  //   publicInfo(id: number): Promise<GroupsGetByIdObjectLegacyResponse | null>;
  //   wallReader(
  //     ownerId: number,
  //     count: number,
  //     depth: number
  //   ): Generator<Promise<WallGetResponse>, void, unknown>;
  //   commentsReader(): Generator<Promise<WallGetCommentResponse>, void, unknown>;
  membersReader(
    id: number,
    count: number
  ): Generator<Promise<GroupsGetMembersResponse>, void, unknown>;
  membersCount(id: number): Promise<number>;
  //   getUsersInfo(ids: number[]): Promise<UsersGetResponse>;
}

@injectable()
export class VKServiceAPI implements IVKServiceAPI {
  private readonly _env: IEnvironment;
  private readonly _logger: ILogger;
  private readonly _api: API;

  constructor(
    @inject(DI_INDX.Environment) env: IEnvironment,
    @inject(DI_INDX.Logger) logger: ILogger
  ) {
    this._logger = logger;
    this._env = env;

    const vk = new VK({ token: this._env.VK_SERVICE_TOKEN });
    this._api = vk.api;
  }

  *membersReader(
    id: number,
    membersCount: number
  ): Generator<Promise<GroupsGetMembersResponse>, void, unknown> {
    const defaultCount = 100;
    let take = defaultCount;
    let processed = 0;
    let rest = membersCount;

    while (rest !== 0) {
      yield this._api.groups.getMembers({
        group_id: String(id),
        count: take,
        offset: processed
      });

      processed = processed + take;
      rest = rest - take;

      if (rest < defaultCount) {
        take = rest;
      }
    }
  }

  async membersCount(id: number): Promise<number> {
    try {
      const { count } = await this._api.groups.getMembers({
        group_id: id + "",
        count: 0
      });
      return count;
    } catch (e) {
      return 0;
    }
  }

  async getUsersInfo(id: number[]): Promise<UsersGetResponse> {
    return await this._api.users.get({
      user_ids: [id],
      fields: ["domain", "photo_200", "status"]
    });
  }

  async getGroupsInfo(
    ids: number[]
  ): Promise<GroupsGetByIdObjectLegacyResponse> {
    const negativeIds = ids.map((id) => Math.abs(id));

    const data = await this._api.groups.getById({
      group_ids: negativeIds
    });

    return data;
  }

  extractDomainFromUrl(url: string): string {
    return url.replace(new RegExp(/(https:\/\/vk.com\/)/gm), "");
  }

  private async _getGroupId(
    domain: string
  ): Promise<GroupsGetByIdObjectLegacyResponse | null> {
    try {
      const response = await this._api.groups.getById({
        group_ids: [domain]
      });

      return response.length ? response : null;
    } catch (e) {
      return null;
    }
  }

  private async _getUserId(domain: string): Promise<UsersGetResponse | null> {
    const response = await this._api.users.get({
      user_ids: [domain]
    });
    return response.length ? response : null;
  }

  async getId(url: string): Promise<{ id: number; type: VK_OBJECT_TYPE }> {
    this._logger.debug(`Search VK object under URL: ${url}`);

    const shortName = this.extractDomainFromUrl(url);
    const usrId = await this._getUserId(shortName);
    const grpId = await this._getGroupId(shortName);

    if (usrId) {
      return {
        id: usrId[0].id,
        type: VK_OBJECT_TYPE.USER
      };
    }

    if (grpId) {
      return {
        id: grpId[0].id,
        type: VK_OBJECT_TYPE.GROUP
      };
    }

    return null;
  }
}
