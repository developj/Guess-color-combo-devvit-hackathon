/** @typedef {import('../src/message.ts').DevvitSystemMessage} DevvitSystemMessage */
/** @typedef {import('../src/message.ts').WebViewMessage} WebViewMessage */

/**
 * Represents a Color Guessing Game where users guess the RGB components of a displayed color.
 */
class ColorGame {
  constructor() {
    /** @type {number} The player's current score */
    this.score = 0;
    /** @type {number} The number of attempts the user has made for the current color */
    this.attempts = 0;
    /** @type {number[]} The target RGB color to guess */
    this.targetColor = this.generateRandomColor();
    this.startGameTime = Date.now();
    // When the Devvit app sends a message with `postMessage()`, this will be triggered
    addEventListener("message", this.#onMessage);

    this.init();
  }

  /**
   * Initializes the game by selecting DOM elements and setting up event listeners.
   */
  init() {
    /** @type {HTMLDivElement} The main color display box */
    this.colorBox = /** @type {HTMLDivElement} */ (
      document.getElementById("color-box")
    );
    /** @type {HTMLDivElement} The container holding the color options */
    this.optionsContainer = /** @type {HTMLDivElement} */ (
      document.getElementById("options-container")
    );
    /** @type {HTMLSpanElement} The score display element */
    this.scoreElement = /** @type {HTMLSpanElement} */ (
      document.getElementById("score")
    );
    /** @type {HTMLSpanElement} The message display element */
    this.messageElement = /** @type {HTMLSpanElement} */ (
      document.getElementById("message")
    );
    /** @type {HTMLDivElement} The loading screen container */
    this.loadingContainer = /** @type {HTMLDivElement} */ (
      document.querySelector(".loading")
    );
    /** @type {HTMLDivElement} The main content container */
    this.mainContianer = /** @type {HTMLDivElement} */ (
      document.querySelector(".bg-galaxy")
    );
    /** @type {HTMLButtonElement} game restart button */
    this.restartButton = /** @type {HTMLButtonElement} */ (
      document.querySelector(".restart-button")
    );
    /** @type {HTMLDivElement} The error game screen */
    this.gameError = /** @type {HTMLDivElement} */ (
      document.querySelector(".game-error")
    );
    /** @type {HTMLSpanElement} The bonus element */
    this.bonusEl = /** @type {HTMLSpanElement} */ (
      document.getElementById("bonusText")
    );
    /** @type {HTMLDivElement} Glowing ball */
    this.glowingBall = /** @type {HTMLDivElement} */ (
      document.querySelector(".glowing-ball")
    );

    this.renderGame();

    document
      .getElementById("restart")
      .addEventListener("click", () => this.restartGame());

    window.addEventListener("message", this.handleMessage.bind(this));

    // This event gets called when the web view is loaded
    addEventListener("load", () => {
      this.postMessage({ type: "webViewReady" });
    });
  }

  /**
   * Generates a random RGB color.
   * @returns {number[]} An array containing three values representing RGB color.
   */
  generateRandomColor() {
    return [
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
    ];
  }

  /**
   * Determines the appropriate text color for a given background color.
   * @param {number[]} rgb The RGB color array.
   * @returns {string} The appropriate text color (#FFFFFF for dark backgrounds, #000000 for light backgrounds).
   */
  getTextColor(rgb) {
    const brightness = rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114;
    return brightness < 128 ? "#FFFFFF" : "#000000";
  }

  /**
   * Renders the game interface, updating the displayed color and available options.
   */
  renderGame() {
    this.bonusPoints = 0;
    this.loadingContainer.style.display = "none";
    this.bonusEl.style.display = "none";
    this.glowingBall.style.display = "inline";
    this.glowingBallTimeoutID = setTimeout(() => {
      this.glowingBall.style.display = "none";
    }, 12000);
    setTimeout(() => {
      //this happens very fast but allow setting start time without issue
      this.startGameTime = Date.now();
    }, 200);
    this.gameError.style.display = "none";
    this.restartButton.classList.remove("start-restart-button-animation");
    this.colorBox.style.backgroundColor = `rgb(${this.targetColor.join(",")})`;
    this.optionsContainer.innerHTML = "";
    this.messageElement.textContent = "";

    const correctOption = this.createOption(this.targetColor);
    const incorrectOptions = Array.from({ length: 3 }, () =>
      this.createOption(this.generateRandomColor())
    );

    const allOptions = [correctOption, ...incorrectOptions].sort(
      () => Math.random() - 0.5
    );
    allOptions.forEach((option) => this.optionsContainer.appendChild(option));
  }

  /**
   * Creates a color option element.
   * @param {number[]} color The RGB color array.
   * @returns {HTMLDivElement} The option element containing RGB color components.
   */
  createOption(color) {
    const option = document.createElement("div");
    option.classList.add("option");

    color.forEach((value, i) => {
      const colorBox = document.createElement("div");
      colorBox.classList.add("color-box");
      colorBox.style.backgroundColor = `rgb(${i === 0 ? value : 0}, ${
        i === 1 ? value : 0
      }, ${i === 2 ? value : 0})`;
      colorBox.style.color = this.getTextColor([
        i === 0 ? value : 0,
        i === 1 ? value : 0,
        i === 2 ? value : 0,
      ]);
      colorBox.textContent = value;
      option.appendChild(colorBox);
    });

    option.onclick = () => this.handleGuess(color);
    return option;
  }

  /**
   * Handles the user's guess.
   * @param {number[]} selectedColor The RGB color array.
   */
  handleGuess(selectedColor) {
    this.endGameTime = Date.now();
    if (
      JSON.stringify(selectedColor) === JSON.stringify(this.targetColor) &&
      this.attempts < 2
    ) {
      this.bonusPoints = this.calculateBonus(
        this.startGameTime,
        this.endGameTime
      );
      this.score +=
        this.attempts === 0 ? 10 + this.bonusPoints : 5 + this.bonusPoints;

      this.postMessage({
        type: "correctSelection",
        data: {
          selectedColor,
          score: this.score,
          bonusPoints: this.bonusPoints,
        },
      });
    } else {
      this.attempts++;
      this.postMessage({
        type: "wrongSelection",
        data: { attempts: this.attempts },
      });
    }
  }

  /**
   * Resets the game state for a new round.
   */
  resetGame() {
    this.attempts = 0;
    this.targetColor = this.generateRandomColor();
    this.renderGame();
  }

  /**
   * Restarts the entire game, resetting the score and game state.
   */
  restartGame() {
    this.score = 0;
    this.scoreElement.textContent = this.score;
    this.resetGame();
  }

  /**
   * @arg {MessageEvent<DevvitSystemMessage>} ev
   * @return {void}
   */
  #onMessage = (ev) => {
    // Reserved type for messages sent via `context.ui.webView.postMessage`
    if (ev.data.type !== "devvit-message") return;
    const { message } = ev.data.data;

    switch (message.type) {
      case "initialData": {
        // Load initial data
        const { score } = message.data;
        // dont want to do anything with the current score

        break;
      }
      case "scoreUpdated": {
        const { newScore, postId } = message.data;

        setTimeout(() => {
          this.resetGame();
        }, 2500);
        break;
      }
      case "correctColorCombination": {
        const { selectedColor, bonusPoints, score } = message.data;
        //Update game score
        this.scoreElement.textContent = score;
        this.glowingBall.style.display = "none";
        this.postMessage({
          type: "updateScore",
          data: { newScore: score }, // this score contains the bonus as well
        });
        this.loadingContainer.style.display = "flex";
        this.showBonus(bonusPoints);
        clearTimeout(this.glowingBallTimeoutID);
        break;
      }
      case "wrongColorCombination": {
        const { attempts } = message.data;

        if (attempts === 2) {
          this.messageElement.textContent = `❌ Wrong! Correct: RGB(${this.targetColor.join(
            ","
          )})`;
          this.gameError.style.display = "flex";
          this.restartButton.classList.add("start-restart-button-animation");
          clearTimeout(this.glowingBallTimeoutID);
          this.glowingBall.style.display = "none";
        } else if (this.attempts === 1) {
          this.messageElement.textContent = "⚠️ Try again! One more chance.";
        }

        break;
      }
      default:
        /** to-do: @satisifes {never} */
        const _ = message;
        break;
    }
  };

  /**
   * Displays the bonus points
   * @arg {number} bonusPoints
   * @return {void}
   */
  showBonus(bonusPoints) {
    const xOffset = Math.floor(Math.random() * 60 - 80); // Random -80 to +80 px

    this.bonusEl.style.display = "flex";
    this.bonusEl.classList.add("active");
    this.bonusEl.textContent = `+${bonusPoints}`;
    this.bonusEl.style.setProperty("--x", `${xOffset}px`);
  }

  /**
   * Removes bonus point display
   */
  removeBonus() {
    this.bonusEl.classList.remove("active");
  }

  /**
   * Calculates a time-based bonus score using timestamps from Date.now().
   *
   * The quicker the action is completed, the higher the bonus:
   * - If completed instantly, bonus = 100.
   * - If completed in exactly 5 seconds, bonus = 0.
   * - If more than 5 seconds, bonus = 0.
   *
   * @param {number} startTime - The start time in milliseconds (e.g. from Date.now()).
   * @param {number} endTime - The end time in milliseconds (e.g. from Date.now()).
   * @returns {number} The calculated bonus score (0–100).
   *
   * @example
   * const start = Date.now();
   * // after some time...
   * const end = Date.now();
   * const bonus = calculateBonus(start, end);
   * console.log(`+${bonus} points`);
   */
  calculateBonus(startTime, endTime) {
    const timeDiff = endTime - startTime; // in milliseconds
    const maxTime = 12000; //get bonus when you select an option within 12 seconds
    const maxBonus = 100;

    if (timeDiff > maxTime) {
      return 0;
    }

    return Math.round(maxBonus * ((maxTime - timeDiff) / maxTime));
  }

  /**
   * Sends a message to the parent frame.
   * @param {Object} msg The message object to send.
   */
  postMessage(msg) {
    parent.postMessage(msg, "*");
  }
}

// Initialize the ColorGame
new ColorGame();
