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

enum VK_OBJECT_TYPE {
  USER = "USER",
  GROUP = "GROUP"
}

export interface IVKServiceAPI {
  extractDomainFromUrl(url: string): string | null;
  createCommentDirectUrl(ownerId: number, commentId: number): string | null;
  postCommentsCount(ownerId: number, postId: number): Promise<number | null>;
  wallItemsCount(ownerId: number): Promise<number | null>;
  getId(url: string): Promise<{ id: number; type: VK_OBJECT_TYPE } | null>;
  userInfo(id: number): Promise<UsersGetResponse | null>;
  publicInfo(id: number): Promise<GroupsGetByIdObjectLegacyResponse | null>;
  wallReader(
    ownerId: number,
    count: number,
    depth: number
  ): Generator<Promise<WallGetResponse>, void, unknown>;
  commentsReader(): Generator<Promise<WallGetCommentResponse>, void, unknown>;
  publicMembersReader(
    id: number,
    count: number
  ): Generator<Promise<GroupsGetMembersResponse>, void, unknown>;
  publicMembersCount(id: number): Promise<number>;
  getUsersInfo(ids: number[]): Promise<UsersGetResponse>;
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

  extractDomainFromUrl(url: string): string {
    throw new Error("Method not implemented.");
  }

  createCommentDirectUrl(ownerId: number, commentId: number): string {
    throw new Error("Method not implemented.");
  }

  postCommentsCount(ownerId: number, postId: number): Promise<number> {
    throw new Error("Method not implemented.");
  }

  wallItemsCount(ownerId: number): Promise<number> {
    throw new Error("Method not implemented.");
  }

  getId(url: string): Promise<{ id: number; type: VK_OBJECT_TYPE }> {
    throw new Error("Method not implemented.");
  }

  userInfo(id: number): Promise<UsersGetResponse> {
    throw new Error("Method not implemented.");
  }

  publicInfo(id: number): Promise<GroupsGetByIdObjectLegacyResponse> {
    throw new Error("Method not implemented.");
  }

  wallReader(
    ownerId: number,
    count: number,
    depth: number
  ): Generator<Promise<WallGetResponse>, void, unknown> {
    throw new Error("Method not implemented.");
  }

  commentsReader(): Generator<Promise<WallGetCommentResponse>, void, unknown> {
    throw new Error("Method not implemented.");
  }

  publicMembersReader(
    id: number,
    count: number
  ): Generator<Promise<GroupsGetMembersResponse>, void, unknown> {
    throw new Error("Method not implemented.");
  }

  publicMembersCount(id: number): Promise<number> {
    throw new Error("Method not implemented.");
  }

  getUsersInfo(ids: number[]): Promise<UsersGetResponse> {
    throw new Error("Method not implemented.");
  }
}
