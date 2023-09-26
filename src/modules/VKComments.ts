import {
  $Enums,
  COMMENTS_SOURCE,
  PrismaClient,
  VkComment,
  VkCommentAssociatedKeyword,
  VkCommentAssociatedTrend
} from "@prisma/client";
import { inject, injectable } from "inversify";
import "reflect-metadata";
import { DI_INDX } from "../constants/DI_INDX";
import { ILogger } from "./Logger";

type CreateCommentDto = {
  id: number;
  date: number;
  text: string;
  source: COMMENTS_SOURCE;
  vkUserId: number;
  vkTargetId: number;
};

export interface IVKComments {
  create(dto: CreateCommentDto): Promise<VkComment>;

  associateCommentWithTrend(
    trendId: number,
    vkCommentUuid: string
  ): Promise<VkCommentAssociatedTrend>;

  associateCommentWithKeywords(
    commentUuid: string,
    keywordsUuids: string[]
  ): Promise<VkCommentAssociatedKeyword[]>;
}

@injectable()
export class VKComments implements IVKComments {
  @inject(DI_INDX.Logger)
  private readonly _logger: ILogger;

  private readonly _client: PrismaClient;

  constructor() {
    this._client = new PrismaClient();
  }

  async associateCommentWithKeywords(
    commentUuid: string,
    keywordsUuids: string[]
  ): Promise<{ id: number; keywordUuid: string; vkCommentUuid: string }[]> {
    const createdRecords: VkCommentAssociatedKeyword[] = [];

    for (const keywordUuid of keywordsUuids) {
      const candidate = await this._client.vkCommentAssociatedKeyword.findFirst(
        {
          where: {
            vkCommentUuid: commentUuid,
            keywordUuid
          }
        }
      );

      if (candidate) createdRecords.push(candidate);

      const newRecord = await this._client.vkCommentAssociatedKeyword.create({
        data: {
          vkCommentUuid: commentUuid,
          keywordUuid
        }
      });

      createdRecords.push(newRecord);
    }

    return createdRecords;
  }

  async associateCommentWithTrend(
    trendId: number,
    vkCommentUuid: string
  ): Promise<{ id: number; trendId: number; vkCommentUuid: string }> {
    this._logger.debug(`Associate comment ${vkCommentUuid} -> ${trendId}`);

    const candidate = await this._client.vkCommentAssociatedTrend.findFirst({
      where: { trendId, vkCommentUuid }
    });

    if (candidate) return candidate;

    return await this._client.vkCommentAssociatedTrend.create({
      data: {
        trendId: trendId,
        vkCommentUuid: vkCommentUuid
      }
    });
  }

  async create(dto: CreateCommentDto): Promise<{
    uuid: string;
    id: number;
    date: number;
    text: string;
    source: $Enums.COMMENTS_SOURCE;
    createdAt: Date;
    vkUserId: number;
    vkTargetId: number;
  }> {
    this._logger.debug(`Add comment to registry: ${dto.id}`);
    const candidate = await this._client.vkComment.findFirst({ where: dto });

    if (candidate) return candidate;
    return await this._client.vkComment.create({ data: dto });
  }
}
