import {
  $Enums,
  PrismaClient,
  Trend,
  VK_TARGET_TYPE,
  VkTarget,
  VkTargetAssociatedKeyword,
  VkTargetAssociatedTrend,
  VkTargetAssociatedUser
} from "@prisma/client";
import { injectable } from "inversify";
import "reflect-metadata";

export type CreateVKTargetDto = {
  id: number;
  profilePictureUrl: string;
  name: string;
  domain: string;
  type: VK_TARGET_TYPE;
};

export interface IVKTargets {
  createIfNotExist(dto: CreateVKTargetDto): Promise<VkTarget>;
  getAllGroups(): Promise<VkTarget[]>;
  associateUser(
    targetId: number,
    userId: number
  ): Promise<VkTargetAssociatedUser>;
  // TODO: findMany()
  targetsCount(): Promise<number>;

  reader(take: number, skip: number): Promise<VkTarget>;
  isUserAssociatedWithTarget(
    userId: number,
    targetId: number
  ): Promise<boolean>;

  associateTargetWithTrend(
    targetId: number,
    trendId: number
  ): Promise<VkTargetAssociatedTrend>;

  associateTargetWithKeywords(
    targetId: number,
    keywordsUuids: string[]
  ): Promise<VkTargetAssociatedKeyword[]>;

  countAll(): Promise<number>;
}

@injectable()
export class VKTargets implements IVKTargets {
  private readonly _client: PrismaClient;

  public constructor() {
    this._client = new PrismaClient();
  }

  async countAll(): Promise<number> {
    return await this._client.vkTarget.count();
  }

  async associateTargetWithKeywords(
    targetId: number,
    keywordsUuids: string[]
  ): Promise<{ id: number; vkTargetId: number; keywordUuid: string }[]> {
    const createdRecords: VkTargetAssociatedKeyword[] = [];

    for (const uuid of keywordsUuids) {
      const candidate = await this._client.vkTargetAssociatedKeyword.findFirst({
        where: {
          vkTargetId: targetId,
          keywordUuid: uuid
        }
      });

      if (candidate) createdRecords.push(candidate);

      const createdRecord = await this._client.vkTargetAssociatedKeyword.create(
        {
          data: {
            vkTargetId: targetId,
            keywordUuid: uuid
          }
        }
      );

      createdRecords.push(createdRecord);
    }

    return createdRecords;
  }

  async associateTargetWithTrend(
    targetId: number,
    trendId: number
  ): Promise<{ id: number; vkTargetId: number; trendId: number }> {
    const candidate = await this._client.vkTargetAssociatedTrend.findFirst({
      where: {
        trendId,
        vkTargetId: targetId
      }
    });

    if (candidate) return candidate;

    return await this._client.vkTargetAssociatedTrend.create({
      data: {
        trendId,
        vkTargetId: targetId
      }
    });
  }

  async isUserAssociatedWithTarget(
    userId: number,
    targetId: number
  ): Promise<boolean> {
    const candidate = await this._client.vkTargetAssociatedUser.findFirst({
      where: {
        vkUserId: userId,
        vkTargetId: targetId
      }
    });

    return Boolean(candidate);
  }

  reader(
    take: number,
    skip: number
  ): Promise<{
    id: number;
    profilePictureUrl: string;
    name: string;
    domain: string;
    type: $Enums.VK_TARGET_TYPE;
    observable: boolean;
    updatedAt: Date;
  }> {
    return this._client.vkTarget.findFirst({
      take,
      skip
    });
  }

  targetsCount(): Promise<number> {
    return this._client.vkTarget.count();
  }

  async associateUser(
    targetId: number,
    userId: number
  ): Promise<{ id: number; vkUserId: number; vkTargetId: number }> {
    const candidate = await this._client.vkTargetAssociatedUser.findFirst({
      where: {
        vkTargetId: targetId,
        vkUserId: userId
      }
    });

    if (candidate) return candidate;

    return await this._client.vkTargetAssociatedUser.create({
      data: {
        vkTargetId: targetId,
        vkUserId: userId
      }
    });
  }

  async getAllGroups(): Promise<
    {
      id: number;
      profilePictureUrl: string;
      name: string;
      domain: string;
      type: $Enums.VK_TARGET_TYPE;
      observable: boolean;
      updatedAt: Date;
    }[]
  > {
    return await this._client.vkTarget.findMany({
      where: { type: VK_TARGET_TYPE.GROUP }
    });
  }

  async createIfNotExist(dto: CreateVKTargetDto): Promise<{
    id: number;
    profilePictureUrl: string;
    name: string;
    domain: string;
    type: $Enums.VK_TARGET_TYPE;
    observable: boolean;
    updatedAt: Date;
  }> {
    const candidate = await this._client.vkTarget.findFirst({
      where: { id: dto.id }
    });

    if (candidate) return candidate;

    return await this._client.vkTarget.create({
      data: {
        id: dto.id,
        profilePictureUrl: dto.profilePictureUrl,
        name: dto.name,
        domain: dto.domain,
        type: dto.type
      }
    });
  }
}
