import { injectable } from "inversify";
import 'reflect-metadata'

export interface IVKUsers {}

@injectable()
export class VKUsers implements IVKUsers {}
