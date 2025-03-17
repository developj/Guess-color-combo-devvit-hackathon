import { RedditAPIClient, RedisClient } from "@devvit/public-api";

export type LEADER_BOARD_ITEM = {
  score: string | number;
  currentUserLeaderBoardID: string;
  userName: string;
};

export type LEADER_BOARD = LEADER_BOARD_ITEM[];

const timestamp = new Date()?.getTime()?.toString(36); // Base 36 for shorter string

export const getUserLeaderBoardID = async (reddit: RedditAPIClient) => {
  const currentUserName = await reddit.getCurrentUsername();
  return `guess_color_game_${currentUserName}_leaderboard_score`;
};

export const getCurrentUsername = async (reddit: RedditAPIClient) => {
  const currentUserName = await reddit.getCurrentUsername();
  return currentUserName || `Anonymous${timestamp}`;
};

export const generateRandomID = () => {
  const randomString = Math?.random()?.toString(36)?.substring(2, 15); // Remove '0.' and take 13 characters
  return timestamp + randomString;
};

export const createUserLeaderBoardScoreObject = (
  score: string | number,
  currentUserLeaderBoardID: string,
  userName: string
) => {
  return { currentUserLeaderBoardID, userName, score };
};

export const getLeaderBoardName = async (
  reddit: RedditAPIClient,
  postId?: string | undefined
) => {
  const subreddit = await reddit.getCurrentSubreddit();
  return `guess_color_combo_${subreddit}_${postId}`;
};

export const getLeaderBoard = async (
  redis: RedisClient,
  reddit: RedditAPIClient,
  postId?: string | undefined
): Promise<LEADER_BOARD> => {
  const leaderBoardName = await getLeaderBoardName(reddit, postId);
  const leaderBoard = await redis.get(leaderBoardName);
  if(!leaderBoard){
    return [];
  }
  const result: LEADER_BOARD = JSON.parse(leaderBoard);
  return result || [];
};


export const createLeaderBoard= async(
    redis: RedisClient,
    reddit: RedditAPIClient,
    postId?: string | undefined
  )=>{
    const leaderBoardName = await getLeaderBoardName(reddit, postId);
    await redis.set(leaderBoardName,JSON.stringify([]));
}
