import { injectable } from "inversify";
import "reflect-metadata";
import { readFile, appendFile } from "node:fs/promises";
import { cwd, platform } from "node:process";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { fromFile } from "gen-readlines";

export interface IStorage {
  readFileAsLinesArr(pathToFile: string): Promise<string[]>;
  appendLine(pathToFile: string, line: string): Promise<string>;
  isExist(pathToEntry: string): Promise<boolean>;
  fileReader(pathToFile: string): Generator<Buffer, void, unknown>;
}

@injectable()
export class Storage implements IStorage {
  private readonly _cwd = cwd();
  private readonly _eol = platform !== "win32" ? "\n" : "\r\n";

  public constructor() {}

  async readFileAsLinesArr(pathToFile: string): Promise<string[]> {
    const REL_PATH = join(this._cwd, pathToFile);
    return (await readFile(REL_PATH, { encoding: "utf-8" })).split(this._eol);
  }

  async appendLine(pathToFile: string, line: string) {
    const REL_PATH = join(this._cwd, pathToFile);
    await appendFile(REL_PATH, `${line}${this._eol}`, {
      encoding: "utf-8"
    });

    return line;
  }

  async isExist(pathToEntry: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (existsSync(pathToEntry)) resolve(true);
      else resolve(false);
    });
  }

  fileReader(pathToFile: string) {
    const REL_PATH = join(this._cwd, pathToFile);
    return fromFile(REL_PATH);
  }
}
