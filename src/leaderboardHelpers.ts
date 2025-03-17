import { RedditAPIClient, RedisClient } from "@devvit/public-api";

/**
 * Represents an item in the leaderboard.
 */
export type LEADER_BOARD_ITEM = {
  score: number;
  currentUserLeaderBoardID: string;
  userName: string;
};

/**
 * Represents the leaderboard as an array of leaderboard items.
 */
export type LEADER_BOARD = LEADER_BOARD_ITEM[];

const timestamp = new Date()?.getTime()?.toString(36); // Base 36 for shorter string

/**
 * Generates a unique leaderboard ID for the current user.
 * @param {RedditAPIClient} reddit - The Reddit API client instance.
 * @returns {Promise<string>} The generated leaderboard ID.
 */
export const getUserLeaderBoardID = async (reddit: RedditAPIClient): Promise<string> => {
  const currentUserName = await reddit.getCurrentUsername();
  return `guess_color_game_${currentUserName}_leaderboard_score`;
};

/**
 * Retrieves the current Reddit username or generates an anonymous identifier if not available.
 * @param {RedditAPIClient} reddit - The Reddit API client instance.
 * @returns {Promise<string>} The current username or an anonymous identifier.
 */
export const getCurrentUsername = async (reddit: RedditAPIClient): Promise<string> => {
  const currentUserName = await reddit.getCurrentUsername();
  return currentUserName || `Anonymous${timestamp}`;
};

/**
 * Generates a random ID using timestamp and a random string.
 * @returns {string} The generated random ID.
 */
export const generateRandomID = (): string => {
  const randomString = Math?.random()?.toString(36)?.substring(2, 15); // Remove '0.' and take 13 characters
  return timestamp + randomString;
};

/**
 * Creates a leaderboard score object for a user.
 * @param {string | number} score - The user's score.
 * @param {string} currentUserLeaderBoardID - The leaderboard ID for the user.
 * @param {string} userName - The user's name.
 * @returns {LEADER_BOARD_ITEM} The leaderboard item object.
 */
export const createUserLeaderBoardScoreObject = (
  score:  number,
  currentUserLeaderBoardID: string,
  userName: string
): LEADER_BOARD_ITEM => {
  return { currentUserLeaderBoardID, userName, score };
};

/**
 * Generates a leaderboard name based on the current subreddit and optional post ID.
 * @param {RedditAPIClient} reddit - The Reddit API client instance.
 * @param {string} [postId] - The optional post ID.
 * @returns {Promise<string>} The leaderboard name.
 */
export const getLeaderBoardName = async (
  reddit: RedditAPIClient,
  postId?: string
): Promise<string> => {
  const subreddit = await reddit.getCurrentSubreddit();
  return `guess_color_combo_${subreddit}_${postId}`;
};

/**
 * Retrieves the leaderboard from Redis.
 * @param {RedisClient} redis - The Redis client instance.
 * @param {RedditAPIClient} reddit - The Reddit API client instance.
 * @param {string} [postId] - The optional post ID.
 * @returns {Promise<LEADER_BOARD>} The leaderboard array.
 */
export const getLeaderBoard = async (
  redis: RedisClient,
  reddit: RedditAPIClient,
  postId?: string
): Promise<LEADER_BOARD> => {
  const leaderBoardName = await getLeaderBoardName(reddit, postId);
  const leaderBoard = await redis.get(leaderBoardName);
  return leaderBoard ? JSON.parse(leaderBoard) : [];
};

/**
 * Creates a new leaderboard in Redis.
 * @param {RedisClient} redis - The Redis client instance.
 * @param {RedditAPIClient} reddit - The Reddit API client instance.
 * @param {string} [postId] - The optional post ID.
 */
export const createLeaderBoard = async (
  redis: RedisClient,
  reddit: RedditAPIClient,
  postId?: string
): Promise<void> => {
  const leaderBoardName = await getLeaderBoardName(reddit, postId);
  await redis.set(leaderBoardName, JSON.stringify([]));
};

/**
 * Adds or updates a score in the leaderboard.
 * @param {LEADER_BOARD} currentLeaderBoard - The existing leaderboard array.
 * @param {LEADER_BOARD_ITEM} updateItem - The leaderboard item to add or update.
 * @returns {LEADER_BOARD} The updated leaderboard.
 */
export const addOrUpdateScore = (
  currentLeaderBoard: LEADER_BOARD,
  updateItem: LEADER_BOARD_ITEM
): LEADER_BOARD => {
  const existingIndex = currentLeaderBoard.findIndex(
    (item) => item.currentUserLeaderBoardID === updateItem.currentUserLeaderBoardID
  );

  let state: "update" | "add" | "replace" | "ignore";
  if (existingIndex !== -1) {
    state = "update";
  } else if (currentLeaderBoard.length < 200) {
    state = "add";
  } else {
    const minScoreItem = currentLeaderBoard.reduce((min, item) =>
      item.score < min.score ? item : min
    );
    state = updateItem.score > minScoreItem.score ? "replace" : "ignore";
  }

  switch (state) {
    case "update":
      currentLeaderBoard[existingIndex].score = updateItem.score;
      break;
    case "add":
      currentLeaderBoard.push(updateItem);
      break;
    case "replace":
      const minScoreItem = currentLeaderBoard?.reduce((min, item) =>
        item.score < min.score ? item : min
      );
      const minIndex = currentLeaderBoard.findIndex(
        (item) => item.currentUserLeaderBoardID === minScoreItem.currentUserLeaderBoardID
      );
      currentLeaderBoard.splice(minIndex, 1, updateItem);
      break;
    case "ignore":
      break;
  }

  currentLeaderBoard.sort((a, b) => b.score - a.score);
  return currentLeaderBoard;
};

/**
 * Updates the leaderboard in Redis.
 * @param {RedisClient} redis - The Redis client instance.
 * @param {RedditAPIClient} reddit - The Reddit API client instance.
 * @param {LEADER_BOARD} currentLeaderBoard - The current leaderboard array.
 * @param {LEADER_BOARD_ITEM} updateItem - The leaderboard item to update.
 * @param {string} [postId] - The optional post ID.
 */
export const updateLeaderBoard = async (
  redis: RedisClient,
  reddit: RedditAPIClient,
  currentLeaderBoard: LEADER_BOARD,
  updateItem: LEADER_BOARD_ITEM,
  postId?: string
): Promise<void> => {
  const updatedLeaderBoard = addOrUpdateScore(currentLeaderBoard, updateItem);
  const leaderBoardName = await getLeaderBoardName(reddit, postId);
  await redis.set(leaderBoardName, JSON.stringify(updatedLeaderBoard));
};
