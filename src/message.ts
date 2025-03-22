import { RedisClient, RedditAPIClient } from "@devvit/public-api";

export type DevvitMessage =
  | { type: "initialData"; data: { score: number } }
  | {
      type: "scoreUpdated";
      data: {
        newScore: number;
        postId?: string;
      };
    }
  | {
      type: "correctColorCombination";
      data: { selectedColor: number[]; bonusPoints: number; score: number };
    }
  | { type: "wrongColorCombination"; data: { attempts: number } };

export type WebViewMessage =
  | { type: "webViewReady" }
  | { type: "updateScore"; data: { newScore: number } }
  | {
      type: "correctSelection";
      data: { selectedColor: number[]; bonusPoints: number; score: number };
    }
  | { type: "wrongSelection"; data: { attempts: number } };

export type DevvitSystemMessage = {
  data: { message: DevvitMessage };
  type?: "devvit-message" | string;
};
