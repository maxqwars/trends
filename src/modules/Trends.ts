import {
  PrismaClient,
  Trend,
  TrendExcludeKeyword,
  TrendIncludeKeyword
} from "@prisma/client";
import { inject, injectable } from "inversify";
import "reflect-metadata";
import { DI_INDX } from "../constants/DI_INDX";
import { ILogger } from "./Logger";
import { IKeywords } from "./Keywords";

type PaginationReadResult = {
  page: number;
  items: number;
  itemsPerPage: number;
  pagesCount: number;
  trends: Trend[];
};

export interface ITrends {
  create(
    name: string,
    includeKeywords: string[],
    excludeKeywords: string[]
  ): Promise<Trend>;

  remove(name: string): Promise<void>;

  returnAllTrendsContainedIncludeWord(
    keywordsUuid: string[]
  ): Promise<Array<TrendIncludeKeyword[]>>;

  returnAllTrendsContainedExcludeWord(
    keywordsUuid: string[]
  ): Promise<Array<TrendExcludeKeyword[]>>;

  returnTrendExcludeKeywords(trendId: number): Promise<TrendExcludeKeyword[]>;

  findTrendExcludeKeywords(
    trendId: number,
    keywordsUuids: string[]
  ): Promise<TrendExcludeKeyword[]>;

  returnTrendsContainsSelectedKeywordsAsInclude(
    keywordsUuids: string[]
  ): Promise<TrendIncludeKeyword[]>;

  countAll(): Promise<number>;

  paginationRead(
    page: number,
    itemsPerPage: number
  ): Promise<PaginationReadResult>;

  getTrendIncludeKeywords(trendId: number): Promise<string[]>;
  getTrendExcludeKeywords(trendId: number): Promise<string[]>;
}

@injectable()
export class Trends implements ITrends {
  @inject(DI_INDX.Logger)
  private readonly _logger: ILogger;

  @inject(DI_INDX.Keywords)
  private readonly _keywords: IKeywords;

  private readonly _client: PrismaClient;

  constructor() {
    this._client = new PrismaClient();
  }

  async getTrendIncludeKeywords(trendId: number): Promise<string[]> {
    const keywordsUuids = await this._client.trendIncludeKeyword.findMany({
      where: {
        trendId
      }
    });

    const keywords = await this._client.keyword.findMany({
      where: {
        uuid: { in: keywordsUuids.map((record) => record.keywordUuid) }
      }
    });

    return keywords.map((record) => record.word);
  }

  async getTrendExcludeKeywords(trendId: number): Promise<string[]> {
    const keywordsUuids = await this._client.trendExcludeKeyword.findMany({
      where: {
        trendId
      }
    });

    const keywords = await this._client.keyword.findMany({
      where: {
        uuid: { in: keywordsUuids.map((record) => record.keywordUuid) }
      }
    });

    return keywords.map((record) => record.word);
  }

  async countAll(): Promise<number> {
    return await this._client.trend.count();
  }

  async paginationRead(
    page: number,
    itemsPerPage: number
  ): Promise<PaginationReadResult> {
    const recordsCount = await this._client.trend.count();

    const pagesCount = Math.ceil(recordsCount / itemsPerPage);

    const take = itemsPerPage;
    const skip = page > 1 ? page * itemsPerPage : 0;

    const trends = await this._client.trend.findMany({
      take,
      skip,
      select: {
        id: true,
        name: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return {
      items: recordsCount,
      pagesCount,
      itemsPerPage,
      page,
      trends
    };
  }

  async returnTrendsContainsSelectedKeywordsAsInclude(
    keywordsUuids: string[]
  ): Promise<{ id: number; keywordUuid: string; trendId: number }[]> {
    return await this._client.trendIncludeKeyword.findMany({
      where: {
        keywordUuid: { in: keywordsUuids }
      }
    });
  }

  async findTrendExcludeKeywords(
    trendId: number,
    keywordsUuids: string[]
  ): Promise<{ id: number; keywordUuid: string; trendId: number }[]> {
    // TODO: Change `findMany` to `count`
    return await this._client.trendExcludeKeyword.findMany({
      where: {
        trendId,
        keywordUuid: { in: keywordsUuids }
      }
    });
  }

  async returnTrendExcludeKeywords(
    trendId: number
  ): Promise<{ id: number; keywordUuid: string; trendId: number }[]> {
    return await this._client.trendExcludeKeyword.findMany({
      where: { trendId }
    });
  }

  async returnAllTrendsContainedIncludeWord(
    keywordsUuid: string[]
  ): Promise<{ id: number; keywordUuid: string; trendId: number }[][]> {
    const result: Array<TrendIncludeKeyword[]> = [];

    for (const uuid of keywordsUuid) {
      const record = await this._client.trendIncludeKeyword.findMany({
        where: { keywordUuid: uuid }
      });

      if (record.length > 0) result.push(record);
    }

    return result;
  }

  async returnAllTrendsContainedExcludeWord(
    keywordsUuid: string[]
  ): Promise<{ id: number; keywordUuid: string; trendId: number }[][]> {
    const result: Array<TrendExcludeKeyword[]> = [];

    for (const uuid of keywordsUuid) {
      const record = await this._client.trendExcludeKeyword.findMany({
        where: { keywordUuid: uuid }
      });

      if (record.length > 0) result.push(record);
    }

    return result;
  }

  async remove(name: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async create(
    name: string,
    includeKeywords: string[],
    excludeKeywords: string[]
  ): Promise<{
    id: number;
    name: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }> {
    /*
     * Find exist trend or create new
     */
    const candidate = await this._client.trend.findFirst({ where: { name } });
    const trend = !candidate
      ? await this._client.trend.create({ data: { name } })
      : candidate;

    // Associate include keywords
    for (const includeKeyword of includeKeywords) {
      const keyword = await this._keywords.create(includeKeyword.toLowerCase());
      await this._keywords.associateWithTrendIncludeKeyword(
        trend.id,
        keyword.uuid
      );
    }

    // Associate exclude keywords
    for (const excludeKeyword of excludeKeywords) {
      const keyword = await this._keywords.create(excludeKeyword.toLowerCase());
      await this._keywords.associateWithTrendExcludeKeyword(
        trend.id,
        keyword.uuid
      );
    }

    return trend;
  }
}
