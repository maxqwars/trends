import { PrismaClient, VkUser } from "@prisma/client";
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
}

@injectable()
export class VKUsers implements IVKUsers {
  private readonly _client: PrismaClient;

  constructor() {
    this._client = new PrismaClient();
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
