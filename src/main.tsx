import "./createPost.js";
import { Devvit, useState, useWebView } from "@devvit/public-api";
import type { DevvitMessage, WebViewMessage } from "./message.js";

Devvit.configure({
  redditAPI: true,
  redis: true,
});

// Registers the game as a custom post
Devvit.addCustomPostType({
  name: "RGB Color Breakdown Game",
  height: "tall",
  render: (context) => {
    const [score, setScore] = useState(0);

    const webView = useWebView<WebViewMessage, DevvitMessage>({
      url: "index.html", // The webview game
      async onMessage(message, webView) {
        switch (message.type) {
          case "webViewReady":
            webView.postMessage({ type: "initialData", data: { score } });
            break;
          case "updateScore":
            setScore(message.data.newScore);
            webView.postMessage({ type: "scoreUpdated", data: { newScore: message.data.newScore } });
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
      <vstack grow padding="medium">
        <vstack grow alignment="middle center">
          <text size="large" weight="bold">
            🎨 RGB Color Breakdown Game
          </text>
          <text size="medium">🏆 Current Score: {score}</text>
          <button onPress={() => webView.mount()}>Start Game</button>
        </vstack>
      </vstack>
    );
  },
});

export default Devvit;
