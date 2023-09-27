import express from "express";
import {
  IKeywords,
  ILogger,
  ITrends,
  IVKComments,
  IVKTargets,
  IVKUserAPI,
  IVKUsers,
  invContainer
} from "../modules";
import { DI_INDX } from "../constants/DI_INDX";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { engine } from "express-handlebars";
import { millify } from "millify";
import { platform, cpus, arch, totalmem } from "node:os";
import trendsRoutes from './trends'

const logger = invContainer.get<ILogger>(DI_INDX.Logger);
const trendsModule = invContainer.get<ITrends>(DI_INDX.Trends);
const vkTargetsModule = invContainer.get<IVKTargets>(DI_INDX.VKTargets);
const vkUsersModule = invContainer.get<IVKUsers>(DI_INDX.VKUsers);
const vkCommentsModule = invContainer.get<IVKComments>(DI_INDX.VKComments);
const keywordsModule = invContainer.get<IKeywords>(DI_INDX.Keywords);

const app = express();

const __filename = fileURLToPath(import.meta.url) as unknown as string;
const __dirname = dirname(__filename);

const VIEW_ENG_VIEWS_PATH = join(__dirname, `../../views`);
const STATIC_FILES_PATH = join(__dirname, `../../public`);

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", VIEW_ENG_VIEWS_PATH);

app.use(express.static(STATIC_FILES_PATH));

app.use(trendsRoutes)

app.get("/", async (req, res) => {
  const trendsRecordsCount = await trendsModule.countAll();
  const keywordsRecordsCount = await keywordsModule.countAll();
  const vkCommentsRecordsCount = await vkCommentsModule.countAll();
  const vkUsersRecordsCount = await vkUsersModule.countAll();
  const vkTargetsRecordsCount = await vkTargetsModule.countAll();

  const trendsCount = millify(trendsRecordsCount);
  const keywordsCount = millify(keywordsRecordsCount);
  const vkCommentsCount = millify(vkCommentsRecordsCount);
  const vkUsersCount = millify(vkUsersRecordsCount);
  const vkTargetCount = millify(vkTargetsRecordsCount);

  res.render("home", {
    trendsRecordsCount: trendsCount,
    keywordsRecordsCount: keywordsCount,
    vkCommentsRecordsCount: vkCommentsCount,
    vkUsersRecordsCount: vkUsersCount,
    vkTargetsRecordsCount: vkTargetCount,
    platformArch: arch().toLocaleUpperCase(),
    cpuThreads: cpus().length,
    totalMem: millify(totalmem(), {
      units: ["B", "KB", "MB", "GB", "TB"],
      space: true
    }),
    platform: platform().toLocaleUpperCase()
  });
});

export function startServer(port: number) {
  app.listen(port, () => {
    logger.debug(`Path to views ${VIEW_ENG_VIEWS_PATH}`);
    logger.debug(`Path to static ${STATIC_FILES_PATH}`);
    logger.all(`Trends web ui available on http://localhost:${port}/`);
  });
}
