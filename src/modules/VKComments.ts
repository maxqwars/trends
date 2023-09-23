import { injectable } from "inversify";
import 'reflect-metadata'

export interface IVKComments {}

@injectable()
export class VKComments implements IVKComments {}