import { Command } from "commander";
import { ObserverModel } from "./models/ObserverModel";
import {
  ILogger,
  IVKServiceAPI,
  IVKTargets,
  IWorkerPool,
  invContainer
} from "./modules";
import { DI_INDX } from "./constants/DI_INDX";

const cmd = new Command();

const observer = new ObserverModel(
  invContainer.get<IWorkerPool>(DI_INDX.WorkerPool),
  invContainer.get<IVKTargets>(DI_INDX.VKTargets),
  invContainer.get<ILogger>(DI_INDX.Logger),
  invContainer.get<IVKServiceAPI>(DI_INDX.VKServiceAPI)
);

cmd
  .command("start")
  .option("--platform <platform>")
  .option("--content-type <type>")
  .option("--threads <threads>")
  .option("--depth <depth>")
  .action(({ platform, contentType, depth, threads }) => {
    if (platform === "vk") {
      if (contentType === "comments") {
        observer.vkTrendsCommentsObserver(contentType, depth, threads);
      }
    }
  });

cmd.parse();
