import { Devvit } from "@devvit/public-api";
import { createLeaderBoard } from "./leaderboard.js";

// Adds a new menu item to the subreddit allowing users to create a game post
Devvit.addMenuItem({
  label: "Play RGB Color Breakdown Game 🎨",
  location: "subreddit",
  onPress: async (_event, context) => {
    const { reddit, ui, postId, redis } = context;
    await createLeaderBoard(redis,reddit,postId);
    
    const subreddit = await reddit.getCurrentSubreddit();
    const post = await reddit.submitPost({
      title: "🎨 Can You Guess the Color Breakdown?",
      subredditName: subreddit.name,
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">Loading the game...</text>
        </vstack>
      ),
    });
    ui.showToast({ text: "Game post created!" });
    ui.navigateTo(post);
  },
});
