import { injectable } from "inversify";
import "reflect-metadata";

export interface IVKComments {
  create(): void;

  associateWithKeyword(): void;
  associateWithTrend(): void;

  getAssociatedKeywords(): void;
  getAssociatedTrends(): void;
}

@injectable()
export class VKComments implements IVKComments {
  create(): void {
    throw new Error("Method not implemented.");
  }
  associateWithKeyword(): void {
    throw new Error("Method not implemented.");
  }
  associateWithTrend(): void {
    throw new Error("Method not implemented.");
  }
  getAssociatedKeywords(): void {
    throw new Error("Method not implemented.");
  }
  getAssociatedTrends(): void {
    throw new Error("Method not implemented.");
  }
}
