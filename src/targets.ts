import { Command } from "commander";
import {
  ILogger,
  IStorage,
  IVKServiceAPI,
  IVKTargets,
  invContainer
} from "./modules";
import { DI_INDX } from "./constants/DI_INDX";
import { TargetsModel } from "./models/TargetsModel";

const cmd = new Command();
const logger = invContainer.get<ILogger>(DI_INDX.Logger);
const targets = new TargetsModel(
  invContainer.get<IStorage>(DI_INDX.Storage),
  invContainer.get<ILogger>(DI_INDX.Logger),
  invContainer.get<IVKTargets>(DI_INDX.VKTargets),
  invContainer.get<IVKServiceAPI>(DI_INDX.VKServiceAPI)
);

cmd
  .command("load")
  .option("--platform <platform>")
  .option("--filename <filename>")
  .action(({ platform, filename }) => {
    switch (platform) {
      case "vk":
        targets.loadVKTargets(filename);
        break;

      default: {
        logger.warn(`Unknown platform ${platform}, please use 'vk'`);
      }
    }
  });

cmd.parse();
