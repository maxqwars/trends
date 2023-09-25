import { parentPort, threadId } from "node:worker_threads";
import { WallWallpostFull } from "vk-io/lib/api/schemas/objects";

export type VKObserverWorkerData = {
  posts: WallWallpostFull[];
  targetId: number;
  contentType: "comments" | "posts";
};

async function findTrendContainedComments(posts: WallWallpostFull[]) {
  posts.map(info => console.log(info.donut))
  return;
}

async function findTrendContainedPosts(posts: WallWallpostFull[]) {
  return;
}

parentPort.on("message", async (data: VKObserverWorkerData) => {
  if (data.contentType === "comments") {
    await findTrendContainedComments(data.posts)
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
