import { injectable } from "inversify";
import 'reflect-metadata'

export interface IVKUserAPI {}

@injectable()
export class VKUserAPI implements IVKUserAPI {}