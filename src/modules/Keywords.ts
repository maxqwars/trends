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
  delete(): void;
  getAssociatedTrends(): void;
  getAssociatedVKComments(): void;
  getAssociatedVKTargets(): void;
  getAssociatedVKUser(): void;

  associateWithVKComment(): void;
  associateWithVKTarget(): void;
  associateWithVKUser(): void;
  associateWithTrendIncludeKeyword(
    trendId: number,
    keywordUuid: string
  ): Promise<TrendIncludeKeyword>;

  associateWithTrendExcludeKeyword(
    trendId: number,
    keywordUuid: string
  ): Promise<TrendExcludeKeyword>;
}

@injectable()
export class Keywords implements IKeywords {
  @inject(DI_INDX.TextTools)
  private readonly _textTools: ITextTools;

  private readonly _client = new PrismaClient();

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

  delete(): void {
    throw new Error("Method not implemented.");
  }
  getAssociatedTrends(): void {
    throw new Error("Method not implemented.");
  }
  getAssociatedVKComments(): void {
    throw new Error("Method not implemented.");
  }
  getAssociatedVKTargets(): void {
    throw new Error("Method not implemented.");
  }
  getAssociatedVKUser(): void {
    throw new Error("Method not implemented.");
  }
  associateWithVKComment(): void {
    throw new Error("Method not implemented.");
  }
  associateWithVKTarget(): void {
    throw new Error("Method not implemented.");
  }
  associateWithVKUser(): void {
    throw new Error("Method not implemented.");
  }
}
