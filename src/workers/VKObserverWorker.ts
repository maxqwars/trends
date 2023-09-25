import { IVKTargets, VKTargets } from "./../modules/VKTargets";
import { parentPort, threadId } from "node:worker_threads";
import { WallWallpostFull } from "vk-io/lib/api/schemas/objects";
import {
  ILogger,
  ITextTools,
  ITrends,
  IVKServiceAPI,
  IVKUsers,
  invContainer
} from "../modules";
import { DI_INDX } from "../constants/DI_INDX";

const LOG_H = "VKOBSWORK:";
const users = invContainer.get<IVKUsers>(DI_INDX.VKUsers);
const serviceApi = invContainer.get<IVKServiceAPI>(DI_INDX.VKServiceAPI);
const trends = invContainer.get<ITrends>(DI_INDX.Trends);
const textTools = invContainer.get<ITextTools>(DI_INDX.TextTools);
const logger = invContainer.get<ILogger>(DI_INDX.Logger);
const targets = invContainer.get<IVKTargets>(DI_INDX.VKTargets);

export type VKObserverWorkerData = {
  posts: WallWallpostFull[];
  targetId: number;
  contentType: "comments" | "posts";
};

async function findTrendContainedComments(posts: WallWallpostFull[]) {
  for (const post of posts) {
    const commentsCount = await serviceApi.commentsCount(
      post.id,
      post.owner_id
    );

    // Skip post if comments count = 0
    if (commentsCount === 0) continue;

    const commentsReader = serviceApi.createCommentsReader(
      post.id,
      post.owner_id,
      commentsCount
    );

    for (const promise of commentsReader) {
      const { items: comments } = await promise;

      for (const comment of comments) {

        if (!Object.hasOwn(comment, 'id')) continue;

        if (Object.hasOwn(comment, "thread") && comment.thread.count > 0) {
          // TODO: Add comments thread read feature
        }

        const userAdded = await users.isAdded(comment.from_id);
        logger.debug(`${LOG_H} User associated ${userAdded}`);

        if (!userAdded) {
          const userData = (
            await serviceApi.getUsersInfo([comment.from_id])
          )[0];

          logger.debug(`${LOG_H} Create user ${userData.id}`);

          const user = await users.createIfNotExist({
            id: userData.id,
            profilePictureUrl: userData.photo_200,
            firstName: userData.first_name,
            lastName: userData.last_name,
            domain: userData.domain
          });
        }

        const isAssociated = await targets.isUserAssociatedWithTarget(
          comment.from_id,
          Math.abs(comment.owner_id) * 1
        );

        if (!isAssociated) {
          logger.debug(
            `${LOG_H} Associate user ${comment.from_id} with target ${comment.owner_id}`
          );

          await targets.associateUser(
            Math.abs(comment.owner_id) * 1,
            comment.from_id
          );
        }
      }
    }
  }
}

async function findTrendContainedPosts(posts: WallWallpostFull[]) {
  return;
}

parentPort.on("message", async (data: VKObserverWorkerData) => {
  if (data.contentType === "comments") {
    await findTrendContainedComments(data.posts);
  }

  // if (data.contentType === "posts") {
  //   findTrendContainedPosts(data.posts).then(() => {
  //     parentPort.postMessage(true);
  //     return;
  //   });
  // }

  parentPort.postMessage(true);
  return;
});
