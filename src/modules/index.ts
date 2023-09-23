import { Container } from "inversify";
import "reflect-metadata";

/*
 * Import modules
 */
import { IEnvironment, Environment } from "./Environment";
import { IStorage, Storage } from "./Storage";
import { IKeywords, Keywords } from "./Keywords";
import { ILogger, Logger } from "./Logger";
import { IOtherUtilities, OtherUtilities } from "./OtherUtilities";
import { ITextTools, TextTools } from "./TextTools";
import { ITrends, Trends } from "./Trends";
import { IVKComments, VKComments } from "./VKComments";
import { IVKServiceAPI, VKServiceAPI } from "./VKServiceAPI";
import { IVKTargets, VKTargets } from "./VKTargets";
import { IVKUserAPI, VKUserAPI } from "./VKUserAPI";
import { IVKUsers, VKUsers } from "./VKUsers";
import { IWorkerPool, WorkerPool } from "./WorkerPool";
import { DI_INDX } from "../constants/DI_INDX";

/*
 * Export interfaces
 */
export { IEnvironment } from "./Environment";
export { IStorage } from "./Storage";
export { IKeywords } from "./Keywords";
export { ILogger } from "./Logger";
export { IOtherUtilities } from "./OtherUtilities";
export { ITextTools } from "./TextTools";
export { ITrends } from "./Trends";
export { IVKComments } from "./VKComments";
export { IVKServiceAPI } from "./VKServiceAPI";
export { IVKTargets } from "./VKTargets";
export { IVKUserAPI } from "./VKUserAPI";
export { IVKUsers } from "./VKUsers";
export { IWorkerPool } from "./WorkerPool";

/*
 * Declare modules list
 */

/*
 * Create dependencies container
 */
const invContainer = new Container();

/*
 * Bind dependencies key & implementation
 */
invContainer.bind<IEnvironment>(DI_INDX.Environment).to(Environment);
invContainer.bind<IStorage>(DI_INDX.Storage).to(Storage);
invContainer.bind<IKeywords>(DI_INDX.Keywords).to(Keywords);
invContainer.bind<ILogger>(DI_INDX.Logger).to(Logger);
invContainer.bind<IOtherUtilities>(DI_INDX.OtherUtilities).to(OtherUtilities);
invContainer.bind<ITextTools>(DI_INDX.TextTools).to(TextTools);
invContainer.bind<ITrends>(DI_INDX.Trends).to(Trends);
invContainer.bind<IVKComments>(DI_INDX.VKComments).to(VKComments);
invContainer.bind<IVKServiceAPI>(DI_INDX.VKServiceAPI).to(VKServiceAPI);
invContainer.bind<IVKTargets>(DI_INDX.VKTargets).to(VKTargets);
invContainer.bind<IVKUserAPI>(DI_INDX.VKUsersAPI).to(VKUserAPI);
invContainer.bind<IVKUsers>(DI_INDX.VKUsers).to(VKUsers);
invContainer.bind<IWorkerPool>(DI_INDX.WorkerPool).to(WorkerPool);

/*
 * Export IoC
 */
export { invContainer };
