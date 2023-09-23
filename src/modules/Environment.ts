import { injectable } from "inversify";
import { config } from "dotenv";
import { env } from "node:process";

export interface IEnvironment {
  LOG_LEVEL: string;
  VK_SERVICE_TOKEN: string;
  VK_USER_TOKEN: string;
}

@injectable()
export class Environment implements IEnvironment {
  private readonly _LOG_LEVEL: string;
  private readonly _VK_SERVICE_TOKEN: string;
  private readonly _VK_USER_TOKEN: string;

  constructor() {
    config();

    this._LOG_LEVEL = env.LOG_LEVEL;
    this._VK_SERVICE_TOKEN = env.VK_SERVICE_TOKEN;
    this._VK_USER_TOKEN = env.VK_USER_TOKEN;
  }

  get LOG_LEVEL() {
    return this._LOG_LEVEL;
  }

  get VK_SERVICE_TOKEN() {
    return this._VK_SERVICE_TOKEN;
  }

  get VK_USER_TOKEN() {
    return this._VK_USER_TOKEN;
  }
}
