import { injectable } from "inversify";
import 'reflect-metadata'

export interface IVKTargets {}

@injectable()
export class VKTargets implements IVKTargets {}
