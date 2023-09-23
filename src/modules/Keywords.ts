import { injectable } from "inversify";
import "reflect-metadata";

export interface IKeywords {}

@injectable()
export class Keywords implements IKeywords {}
