import {
  $Enums,
  PrismaClient,
  VK_TARGET_TYPE,
  VkTarget,
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
}

@injectable()
export class VKTargets implements IVKTargets {
  private readonly _client: PrismaClient;

  public constructor() {
    this._client = new PrismaClient();
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
