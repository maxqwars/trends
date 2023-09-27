import { parentPort } from "node:worker_threads";
import { WallWallpostFull } from "vk-io/lib/api/schemas/objects";
import {
  IKeywords,
  ILogger,
  IOtherUtilities,
  ITextTools,
  ITrends,
  IVKComments,
  IVKServiceAPI,
  IVKTargets,
  IVKUsers,
  invContainer
} from "../modules";
import { DI_INDX } from "../constants/DI_INDX";

const LOG_H = "VKOBSWORK:";
const users = invContainer.get<IVKUsers>(DI_INDX.VKUsers);
const serviceApi = invContainer.get<IVKServiceAPI>(DI_INDX.VKServiceAPI);
const trendsModule = invContainer.get<ITrends>(DI_INDX.Trends);
const textTools = invContainer.get<ITextTools>(DI_INDX.TextTools);
const logger = invContainer.get<ILogger>(DI_INDX.Logger);
const targets = invContainer.get<IVKTargets>(DI_INDX.VKTargets);
const commentsModule = invContainer.get<IVKComments>(DI_INDX.VKComments);
const otherUtilsModule = invContainer.get<IOtherUtilities>(
  DI_INDX.OtherUtilities
);
const keywordsModule = invContainer.get<IKeywords>(DI_INDX.Keywords);

export type VKObserverWorkerData = {
  posts: WallWallpostFull[];
  targetId: number;
  contentType: "comments" | "posts";
};

async function findTrendContainedComments(posts: WallWallpostFull[]) {
  const timing = 100;

  for (const post of posts) {
    await otherUtilsModule.wait(timing);
    const commentsCount = await serviceApi.commentsCount(
      post.id,
      post.owner_id
    );

    // Skip post if comments count = 0
    if (commentsCount === 0) continue;

    try {
      const commentsReader = serviceApi.createCommentsReader(
        post.id,
        post.owner_id,
        commentsCount
      );
    } catch (e) {
      logger.error(e.message);
      return;
    }

    const commentsReader = serviceApi.createCommentsReader(
      post.id,
      post.owner_id,
      commentsCount
    );

    for (const promise of commentsReader) {
      await otherUtilsModule.wait(timing);
      const { items: comments } = await promise;

      for (const comment of comments) {
        await otherUtilsModule.wait(timing);

        if (Object.hasOwn(comment, "thread") && comment.thread.count > 0) {
          // TODO: Add comments thread read feature
        }

        const userAdded = await users.isAdded(comment.from_id);

        if (!userAdded) {
          const userData = (
            await serviceApi.getUsersInfo([comment.from_id])
          )[0];

          await users.createIfNotExist({
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
          await targets.associateUser(
            Math.abs(comment.owner_id) * 1,
            comment.from_id
          );
        }

        if (comment.text.length === 0 || comment.from_id === 0) continue;
        let commentText = comment.text;

        commentText = textTools.removeUnicodeEmoji(commentText);
        commentText = textTools.removeEol(commentText);
        commentText = textTools.removeUrls(commentText);

        const textKeywords = textTools.parseWords(commentText);

        if (textKeywords.length === 0) continue;

        const keywordsUuids = textKeywords.map((word) =>
          textTools.hashString(word)
        );

        const registeredKeywords = (
          await keywordsModule.getRegisteredKeywords(keywordsUuids)
        ).map((r) => r.uuid);

        logger.debug(
          `${comment.owner_id}_${comment.from_id}_${comment.id} contains: ${textKeywords.length} keywords`
        );

        const associatedTrends =
          await trendsModule.returnTrendsContainsSelectedKeywordsAsInclude(
            keywordsUuids
          );

        if (associatedTrends.length === 0) continue;

        logger.info(
          `Comment have associated trends: ${associatedTrends.length}`
        );

        for (const trend of associatedTrends) {
          await otherUtilsModule.wait(timing);
          if (!trend) continue;

          const { trendId } = trend;

          const excludeKeywords = await trendsModule.findTrendExcludeKeywords(
            trendId,
            keywordsUuids
          );

          if (excludeKeywords.length > 0) continue;

          logger.info(
            `Comment ${comment.id} not have trend exclude keywords, add to comments database`
          );

          /* Create comment record */
          const createdComment = await commentsModule.create({
            id: comment.id,
            date: comment.date,
            text: comment.text,
            source: "OBSERVER",
            vkUserId: comment.from_id,
            vkTargetId: Math.abs(comment.owner_id) * 1
          });

          /* Associate User & Trend */
          await users.associateUserWithTrend(comment.from_id, trendId);

          await users.associateUserWithKeywords(
            comment.from_id,
            registeredKeywords
          );

          // Associate comment->trend
          await commentsModule.associateCommentWithTrend(
            trendId,
            createdComment.uuid
          );

          await commentsModule.associateCommentWithKeywords(
            createdComment.uuid,
            registeredKeywords
          );

          await targets.associateTargetWithTrend(
            Math.abs(comment.owner_id) * 1,
            trendId
          );

          await targets.associateTargetWithKeywords(
            Math.abs(comment.owner_id) * 1,
            registeredKeywords
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
  /* Find comments contained trends */
  if (data.contentType === "comments") {
    try {
      await findTrendContainedComments(data.posts);
      await otherUtilsModule.wait(1000);
      parentPort.postMessage(true);
    } catch (e) {
      logger.error(e.message);
      parentPort.postMessage(true);
    }
  }

  return;
});
