import { DI_INDX } from "./constants/DI_INDX";
import { CrawlerModel } from "./models/CrawlerModel";
import {
  ILogger,
  IVKServiceAPI,
  IVKTargets,
  IVKUsers,
  IWorkerPool,
  invContainer
} from "./modules";
import { Command } from "commander";

const cmd = new Command();
const crawler = new CrawlerModel(
  invContainer.get<IVKServiceAPI>(DI_INDX.VKServiceAPI),
  invContainer.get<ILogger>(DI_INDX.Logger),
  invContainer.get<IWorkerPool>(DI_INDX.WorkerPool),
  invContainer.get<IVKTargets>(DI_INDX.VKTargets),
  invContainer.get<IVKUsers>(DI_INDX.VKUsers)
);

cmd
  .command("grab")
  .option("--platform <platform>")
  .option("--content-type <type>")
  .action(({ platform, contentType }) => {
    if (platform === "vk" && contentType === "subscribers") {
      crawler.grabVKSubscribers();
    }
  });

cmd.parse();
