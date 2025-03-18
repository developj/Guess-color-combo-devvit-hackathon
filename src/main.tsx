import "./createPost.js";
import { Devvit, useState, useWebView } from "@devvit/public-api";
import type { DevvitMessage, WebViewMessage } from "./message.js";
import { getLeaderBoard } from "./leaderboardHelpers.js";

Devvit.configure({
  redditAPI: true,
  redis: true,
});

// Registers the game as a custom post
Devvit.addCustomPostType({
  name: "RGB Color Breakdown Game",
  height: "tall",
  render: (context) => {
    const { reddit, redis, postId } = context;
    const [score, setScore] = useState(0);
    const [currentLeaderBoard, setCurrentLeaderBoard] = useState(
      async () => await getLeaderBoard(redis, reddit, postId)
    );

    const webView = useWebView<WebViewMessage, DevvitMessage>({
      url: "index.html", // The webview game
      async onMessage(message, webView) {
        switch (message.type) {
          case "webViewReady":
            webView.postMessage({ type: "initialData", data: { score } });
            break;
          case "updateScore":
            setScore(message.data.newScore);
            webView.postMessage({
              type: "scoreUpdated",
              data: { newScore: message.data.newScore },
            });
            break;
          default:
            throw new Error(`Unknown message type: ${message satisfies never}`);
        }
      },
      onUnmount() {
        context.ui.showToast("Game closed!");
      },
    });

    return (
      <vstack backgroundColor="#2E3192" grow padding="medium">
        <zstack grow alignment="top center" width="100%" height="100%">
          <image
            url="colorCombo.jpg"
            width="100%"
            height="100%"
            imageWidth={300}
            imageHeight={250}
            description="Play Guess Color Combo"
          />
          <vstack grow padding="medium" />
          <vstack
            backgroundColor="rgba(0, 0, 0, 0.6)"
            padding="medium"
            grow
            cornerRadius="small"
            alignment="middle center"
          >
            <text color="#fff" size="xxlarge" weight="bold">
               🏆 Current Score: {score}
            </text>
            <spacer />
          </vstack>
        </zstack>
        <vstack grow alignment="middle center" padding="medium">
          <button size="large" width={50} onPress={() => webView.mount()}>
            Start Game
          </button>
        </vstack>
      </vstack>
    );
  },
});

export default Devvit;
