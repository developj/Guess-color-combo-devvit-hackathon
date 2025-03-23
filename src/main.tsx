import "./createPost.js";
import { Devvit, useState, useWebView, useAsync } from "@devvit/public-api";
import type { DevvitMessage, WebViewMessage } from "./message.js";
import { usePaginator } from "./hooks/usePagination.js";
import {
  getLeaderBoard,
  getCurrentUsername,
  updateLeaderBoard,
  getUserLeaderBoardID,
  createUserLeaderBoardScoreObject,
  generateRandomID,
  truncateText,
} from "./leaderboardHelpers.js";
import { LEADER_BOARD, LEADER_BOARD_ITEM } from "./leaderboardHelpers.js";

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

    // Use the paginator hook
    const {
      currentPageData,
      currentPage,
      totalPages,
      nextPage,
      prevPage,
      goToPage,
      reset,
    } = usePaginator(diplayLeaderBoard || [], 10);

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
              currentLeaderBoard:
                learderBoard?.length === 0 ? currentLeaderBoard! : learderBoard,
              setCurrentLeaderBoard,
            });
            webView.postMessage({
              type: "scoreUpdated",
              data: { newScore: message.data?.newScore, postId: postId },
            });
            break;
          case "correctSelection":
            webView.postMessage({
              type: "correctColorCombination",
              data: {
                selectedColor: message.data?.selectedColor,
                bonusPoints: message.data?.bonusPoints,
                score: message.data?.score,
              },
            });
            break;

          case "wrongSelection":
            webView.postMessage({
              type: "wrongColorCombination",
              data: { attempts: message.data?.attempts },
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
        <vstack grow width={"100%"} height={"100%"}>
          <hstack height={"100%"} width={"100%"} grow>
            <zstack
              grow
              backgroundColor="rgba(0, 0, 0, 0.6)"
              alignment="top center"
              width="100%"
              height="100%"
            >
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

            <vstack padding="medium" backgroundColor="rgba(0, 0, 0, 0.6)">
              <vstack alignment="middle center">
                <image
                  url="homebunny03.png"
                  width="90px"
                  height="90px"
                  imageWidth={30}
                  imageHeight={30}
                  description="Play Guess Color Combo home bunny"
                />
              </vstack>
              <vstack width={"100%"} alignment="middle center" padding="small">
                <text weight="bold" color="white">
                  LeaderBoard
                </text>
              </vstack>
              {currentPageData && (
                <vstack>
                  {currentPageData?.map((item) => {
                    return (
                      <hstack key={item.currentUserLeaderBoardID} gap="small">
                        <icon color="KiwiGreen-200" name="hot" />
                        <text color="white">{truncateText(item.userName)}</text>
                        : <text color="white">{item.score}</text>
                      </hstack>
                    );
                  })}
                </vstack>
              )}
              <hstack alignment="middle center" gap="medium" padding="medium">
                <button
                  appearance="media"
                  textColor="#fff"
                  icon="left"
                  onPress={prevPage}
                  disabled={currentPage === 1}
                ></button>
                <text color="#fff" size="medium">
                  Page {currentPage} of {totalPages}
                </text>
                <button
                  appearance="media"
                  textColor="#fff"
                  icon="right"
                  onPress={nextPage}
                  disabled={currentPage === totalPages}
                ></button>
              </hstack>
            </vstack>
          </hstack>
          <hstack
            width={"100%"}
            backgroundColor="rgba(0, 0, 0, 0.6)"
            grow
            alignment="middle center"
            padding="small"
          >
            <image
              url="homebunny.png"
              width="70px"
              height="70px"
              imageWidth={30}
              imageHeight={30}
              description="Play Guess Color Combo home bunny 01"
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
              url="homebunny002.png"
              width="70px"
              height="70px"
              imageWidth={30}
              imageHeight={30}
              description="Play Guess Color Combo home bunny 02"
            />
          </hstack>
        </vstack>
      </zstack>
    );
  },
});

export default Devvit;
