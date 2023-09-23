import { ITrends } from "../modules";

export class TrendsModel {
  private readonly _trends: ITrends;

  constructor(trends: ITrends) {
    this._trends = trends;
  }

  async create(
    name: string,
    includeKeywords: string[],
    excludeKeywords: string[]
  ) {
    await this._trends.create(name, includeKeywords, excludeKeywords);
  }
}
