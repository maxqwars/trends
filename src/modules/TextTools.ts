import XXH from "js-xxhash";
import keywordsExtractor from "keyword-extractor";
import { injectable } from "inversify";
import "reflect-metadata";

export interface ITextTools {
  hashString(str: string): string;
  parseWords(text: string): string[];
  removeUnicodeEmoji(text: string): string;
  removeUrls(text: string): string;
  removeEol(text: string): string;
}

@injectable()
export class TextTools implements ITextTools {
  hashString(str: string): string {
    return XXH.xxHash32(str, 0xabcd).toString(16);
  }

  parseWords(text: string): string[] {
    return keywordsExtractor.extract(text, {
      language: "russian",
      remove_digits: true,
      remove_duplicates: true,
      return_changed_case: true
    });
  }

  removeUnicodeEmoji(text: string): string {
    const filtered = text.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      ""
    );
    return filtered;
  }

  removeUrls(text: string): string {
    const filtered = text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, "");
    return filtered;
  }

  removeEol(text: string): string {
    const filtered = text.replace(/\n/g, " ");
    return filtered;
  }
}
