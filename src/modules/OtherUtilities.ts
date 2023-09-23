import { injectable } from "inversify";
import "reflect-metadata";

export interface IOtherUtilities {
  wait(ms: number): Promise<void>;
}

@injectable()
export class OtherUtilities implements IOtherUtilities {
  wait(ms: number): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(), ms);
    });
  }
}
