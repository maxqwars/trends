import { PrismaClient, Trend } from "@prisma/client";
import { inject, injectable } from "inversify";
import "reflect-metadata";
import { DI_INDX } from "../constants/DI_INDX";
import { ILogger } from "./Logger";
import { IKeywords } from "./Keywords";

export interface ITrends {
  create(
    name: string,
    includeKeywords: string[],
    excludeKeywords: string[]
  ): Promise<Trend>;

  remove(name: string): Promise<void>
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
