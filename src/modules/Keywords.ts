import {
  Keyword,
  PrismaClient,
  TrendExcludeKeyword,
  TrendIncludeKeyword
} from "@prisma/client";
import { inject, injectable } from "inversify";
import "reflect-metadata";
import { DI_INDX } from "../constants/DI_INDX";
import { ITextTools } from "./TextTools";

export interface IKeywords {
  create(word: string): Promise<Keyword>;
  createMany(keywords: string[]): Promise<Keyword[]>;

  associateWithTrendIncludeKeyword(
    trendId: number,
    keywordUuid: string
  ): Promise<TrendIncludeKeyword>;

  associateWithTrendExcludeKeyword(
    trendId: number,
    keywordUuid: string
  ): Promise<TrendExcludeKeyword>;

  getTrendAssociatedKeywordsCount(trendId: number): Promise<number>;

  removeAssociatedWithTrendKeywords(trendId: number): Promise<number>;

  removeTrendAssociations(trendId: number): Promise<void>;

  getRegisteredKeywords(keywordsUuids: string[]): Promise<Keyword[]>;

  countAll(): Promise<number>;
}

@injectable()
export class Keywords implements IKeywords {
  @inject(DI_INDX.TextTools)
  private readonly _textTools: ITextTools;

  private readonly _client: PrismaClient;

  constructor() {
    this._client = new PrismaClient();
  }

  async countAll(): Promise<number> {
    return await this._client.keyword.count();
  }

  async getRegisteredKeywords(
    keywordsUuids: string[]
  ): Promise<{ uuid: string; word: string }[]> {
    return await this._client.keyword.findMany({
      where: { uuid: { in: keywordsUuids } }
    });
  }

  async getTrendAssociatedKeywordsCount(trendId: number): Promise<number> {
    throw new Error("Method not implemented.");
  }

  async removeAssociatedWithTrendKeywords(trendId: number): Promise<number> {
    throw new Error("Method not implemented.");
  }

  async removeTrendAssociations(trendId: number): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async associateWithTrendExcludeKeyword(
    trendId: number,
    keywordUuid: string
  ): Promise<TrendExcludeKeyword> {
    const candidate = await this._client.trendExcludeKeyword.findFirst({
      where: {
        trendId,
        keywordUuid
      }
    });

    if (candidate) return candidate;

    return await this._client.trendExcludeKeyword.create({
      data: {
        trendId,
        keywordUuid
      }
    });
  }

  async associateWithTrendIncludeKeyword(
    trendId: number,
    keywordUuid: string
  ): Promise<{ id: number; keywordUuid: string; trendId: number }> {
    const candidate = await this._client.trendIncludeKeyword.findFirst({
      where: {
        trendId,
        keywordUuid
      }
    });

    if (candidate) return candidate;

    return await this._client.trendIncludeKeyword.create({
      data: {
        trendId,
        keywordUuid
      }
    });
  }

  async createMany(keywords: string[]): Promise<Keyword[]> {
    const created = [];

    for (const word in keywords) {
      const optimizedWord = word.toLowerCase();
      const createdWord = await this.create(optimizedWord);
      created.push(createdWord);
    }

    return created;
  }

  async create(word: string): Promise<Keyword> {
    const uuid = this._textTools.hashString(word);

    const candidate = await this._client.keyword.findFirst({ where: { uuid } });

    if (candidate) return candidate;

    return await this._client.keyword.create({
      data: {
        uuid,
        word
      }
    });
  }
}
