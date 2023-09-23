import { injectable } from "inversify";
import 'reflect-metadata'

export interface ITrends {}

@injectable()
export class Trends implements ITrends {}
