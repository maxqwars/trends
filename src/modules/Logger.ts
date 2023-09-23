import { injectable } from "inversify";
import "reflect-metadata";
import {
  blueBright,
  redBright,
  yellowBright,
  greenBright,
  whiteBright
} from "colorette";
import dayjs from "dayjs";

export type LEVELS = "all" | "info" | "warn" | "debug" | "error";

export interface ILogger {
  level: LEVELS;
  setLogLevel(level: LEVELS);
  info(msg: string);
  debug(msg: string);
  warn(msg: string);
  all(msg: string);
  error(msg: string);
}

@injectable()
export class Logger implements ILogger {
  private _level: LEVELS;

  constructor() {
    this._level = "all";
  }

  info(msg: string) {
    console.log(
      `${dayjs(Date.now()).format("DD-MM-YY HH:ss:mm")} INFO: ${greenBright(
        msg
      )}`
    );
  }

  debug(msg: string) {
    console.log(
      `${dayjs(Date.now()).format("DD-MM-YY HH:ss:mm")} DEBUG: ${blueBright(
        msg
      )}`
    );
  }

  all(msg: string) {
    console.log(
      `${dayjs(Date.now()).format("DD-MM-YY HH:ss:mm")} ALL: ${whiteBright(
        msg
      )}`
    );
  }

  warn(msg: string) {
    console.log(
      `${dayjs(Date.now()).format("DD-MM-YY HH:ss:mm")} WARN: ${yellowBright(
        msg
      )}`
    );
  }

  error(msg: string) {
    console.log(
      `${dayjs(Date.now()).format("DD-MM-YY HH:ss:mm")} ERROR: ${redBright(
        msg
      )}`
    );
  }

  setLogLevel(level: LEVELS) {
    this._level = level;
  }

  get level() {
    return this._level;
  }
}
