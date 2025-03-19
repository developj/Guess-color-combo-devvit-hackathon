import "./createPost.js";
import { Devvit, useState, useWebView, useAsync } from "@devvit/public-api";
import type { DevvitMessage, WebViewMessage } from "./message.js";
import {
  getLeaderBoard,
  getCurrentUsername,
  updateLeaderBoard,
  getUserLeaderBoardID,
  createUserLeaderBoardScoreObject,
  generateRandomID,
} from "./leaderboardHelpers.js";
import { LEADER_BOARD } from "./leaderboardHelpers.js";

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
    const { data: currentLeaderBoard } = useAsync(
      async () => await getLeaderBoard(redis, reddit, postId)
    );
    const [learderBoard, setCurrentLeaderBoard] = useState<LEADER_BOARD>([]);
    const {
      data: currentUserName,
      loading: loadingUserName,
      error: UserNameError,
    } = useAsync(async () => await getCurrentUsername(reddit));
    const { data: leaderBoardUserId } = useAsync(
      async () => await getUserLeaderBoardID(reddit)
    );

    const diplayLeaderBoard =
      learderBoard?.length > 0 ? learderBoard : currentLeaderBoard;

    const webView = useWebView<WebViewMessage, DevvitMessage>({
      url: "index.html", // The webview game
      async onMessage(message, webView) {
        switch (message.type) {
          case "webViewReady":
            webView.postMessage({ type: "initialData", data: { score } });
            break;
          case "updateScore":
            setScore(message.data.newScore);
            const updateItem = await createUserLeaderBoardScoreObject(
              message.data.newScore,
              leaderBoardUserId || generateRandomID(),
              currentUserName || `anonymous ${generateRandomID()}`
            );

            await updateLeaderBoard({
              reddit,
              redis,
              postId,
              updateItem,
              currentLeaderBoard: learderBoard || currentLeaderBoard,
              setCurrentLeaderBoard,
            });
            webView.postMessage({
              type: "scoreUpdated",
              data: { newScore: message.data.newScore, postId: postId },
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
      <zstack grow backgroundColor="AlienBlue-800">
         <image
            url="homebackground.jpg"
            width="100%"
            height="100%"
            imageWidth={300}
            imageHeight={250}
            description="Play Guess Color Combo"
          />
      <vstack grow width={"100%"} height={"100%"} >
        <hstack height={"100%"} width={"100%"} grow>
        <zstack grow backgroundColor="rgba(0, 0, 0, 0.6)" alignment="top center" width="100%" height="100%">
          <image
            url="colorCombo.jpg"
            width="100%"
            height="100%"
            imageWidth={300}
            imageHeight={250}
            description="Play Guess Color Combo"
          />
          
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
       
        <vstack padding="medium"  backgroundColor="rgba(0, 0, 0, 0.6)">
        <image
            url="homebunny03.png"
            width="90px"
            height="90px"
            imageWidth={30}
            imageHeight={30}
            description="Play Guess Color Combo"
          />
          <vstack width={"100%"} alignment="middle center" padding="small">
            <text weight="bold"  color="white">Leader Board</text>
            </vstack>
            {diplayLeaderBoard && (
              <vstack>
                {diplayLeaderBoard?.map((item) => {
                  return (
                    <hstack gap="small">
                      <icon color="KiwiGreen-200" name="hot" />
                      <text color="white">{item.userName}</text>: <text color="white">{item.score}</text>
                    </hstack>
                  );
                })}
              </vstack>
            )}
          </vstack>
        </hstack>
        <hstack width={"100%"} backgroundColor="rgba(0, 0, 0, 0.6)" grow alignment="middle center" padding="medium">
         
          <image
            url="homebunny.png"
            width="70px"
            height="70px"
            imageWidth={30}
            imageHeight={30}
            description="Play Guess Color Combo"
          />
          <button
            icon="topic-videogaming"
            size="large"
            width={50}
            onPress={() => webView.mount()}
          >
            Start Game
          </button>
          <image
            url="homebunny02.png"
            width="70px"
            height="70px"
            imageWidth={30}
            imageHeight={30}
            description="Play Guess Color Combo"
          />
        </hstack>
      </vstack>
      </zstack>
    );
  },
});

export default Devvit;
