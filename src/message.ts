import { RedisClient, RedditAPIClient } from "@devvit/public-api";

export type DevvitMessage =
  | { type: "initialData"; data: { score: number } }
  | {
      type: "scoreUpdated";
      data: {
        newScore: number;
        postId?: string;
      };
    };

export type WebViewMessage =
  | { type: "webViewReady" }
  | { type: "updateScore"; data: { newScore: number } };

export type DevvitSystemMessage = {
  data: { message: DevvitMessage };
  type?: "devvit-message" | string;
};
