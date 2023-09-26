import {
  PrismaClient,
  VkUser,
  VkUserAssociatedKeyword,
  VkUserAssociatedTrend
} from "@prisma/client";
import { injectable } from "inversify";
import "reflect-metadata";

type CreateUserDto = {
  id: number;
  profilePictureUrl: string;
  firstName: string;
  lastName: string;
  domain: string;
};
export interface IVKUsers {
  createIfNotExist(dto: CreateUserDto): Promise<VkUser>;
  isAdded(id: number): Promise<Boolean>;
  associateUserWithTrend(
    userId: number,
    trendId: number
  ): Promise<VkUserAssociatedTrend>;
  associateUserWithKeywords(
    userId: number,
    keywordsUuids: string[]
  ): Promise<VkUserAssociatedKeyword[]>;
}

@injectable()
export class VKUsers implements IVKUsers {
  private readonly _client: PrismaClient;

  constructor() {
    this._client = new PrismaClient();
  }

  async associateUserWithTrend(
    userId: number,
    trendId: number
  ): Promise<{ id: number; vkUserId: number; trendId: number }> {
    const candidate = await this._client.vkUserAssociatedTrend.findFirst({
      where: {
        vkUserId: userId,
        trendId: trendId
      }
    });

    if (candidate) return candidate;

    return await this._client.vkUserAssociatedTrend.create({
      data: {
        vkUserId: userId,
        trendId: trendId
      }
    });
  }

  async associateUserWithKeywords(
    userId: number,
    keywordsUuids: string[]
  ): Promise<{ id: number; vkUserId: number; keywordUuid: string }[]> {
    const result: VkUserAssociatedKeyword[] = [];

    for (const uuid of keywordsUuids) {
      const candidate = await this._client.vkUserAssociatedKeyword.findFirst({
        where: {
          vkUserId: userId,
          keywordUuid: uuid
        }
      });

      if (candidate) result.push(candidate);

      const created = await this._client.vkUserAssociatedKeyword.create({
        data: {
          vkUserId: userId,
          keywordUuid: uuid
        }
      });

      result.push(created);
    }

    return result;
  }

  async isAdded(id: number): Promise<Boolean> {
    const user = await this._client.vkUser.findFirst({ where: { id } });
    return Boolean(user);
  }

  async createIfNotExist(dto: CreateUserDto): Promise<{
    id: number;
    profilePictureUrl: string;
    firstName: string;
    lastName: string;
    domain: string;
    note: string;
    createdAt: Date;
    updatedAt: Date;
  }> {
    const candidate = await this._client.vkUser.findFirst({
      where: { id: dto.id }
    });

    if (candidate) return candidate;

    return await this._client.vkUser.create({
      data: dto
    });
  }
}
