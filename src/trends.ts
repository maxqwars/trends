import { TrendsModel } from "./models/TrendModel";
import { Command } from "commander";
import { ITrends, invContainer } from "./modules";
import { DI_INDX } from "./constants/DI_INDX";

const cmd = new Command();
const trends = new TrendsModel(invContainer.get<ITrends>(DI_INDX.Trends));

cmd
  .command("create-trend")
  .option("--name <name>")
  .option("--include <include...>")
  .option("--exclude <exclude...>")
  .action(({ name, include, exclude }) => {
    trends.create(name, include, exclude)
  });

cmd.parse();
