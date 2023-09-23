import { DI_INDX } from './constants/DI_INDX'
import { CrawlerModel } from './models/CrawlerModel'
import {  ILogger, IVKServiceAPI, IVKTargets, IWorkerPool, invContainer } from './modules'
import { Command } from 'commander'


const cmd = new Command()
const crawler = new CrawlerModel(
  invContainer.get<IVKServiceAPI>(DI_INDX.VKServiceAPI),
  invContainer.get<ILogger>(DI_INDX.Logger),
  invContainer.get<IWorkerPool>(DI_INDX.WorkerPool),
  invContainer.get<IVKTargets>(DI_INDX.VKTargets)
)

cmd.command('test').action(() => crawler.test())

cmd.parse()