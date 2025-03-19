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

      // When the Devvit app sends a message with `postMessage()`, this will be triggered
       addEventListener('message', this.#onMessage);

       this.init();
    }
  
    /**
     * Initializes the game by selecting DOM elements and setting up event listeners.
     */
    init() {
      /** @type {HTMLDivElement} The main color display box */
      this.colorBox = /** @type {HTMLDivElement} */ (document.getElementById("color-box"));
      /** @type {HTMLDivElement} The container holding the color options */
      this.optionsContainer = /** @type {HTMLDivElement} */ (document.getElementById("options-container"));
      /** @type {HTMLSpanElement} The score display element */
      this.scoreElement = /** @type {HTMLSpanElement} */ (document.getElementById("score"));
      /** @type {HTMLSpanElement} The message display element */
      this.messageElement = /** @type {HTMLSpanElement} */ (document.getElementById("message"));
      /** @type {HTMLDivElement} The loading screen container */
      this.loadingContainer = /** @type {HTMLDivElement} */ (document.querySelector(".loading"));
      /** @type {HTMLDivElement} The main content container */
      this.contentContainer = /** @type {HTMLDivElement} */ (document.getElementById(".content"));
  
      this.renderGame();
  
      document.getElementById("restart").addEventListener("click", () => this.restartGame());
  
      window.addEventListener("message", this.handleMessage.bind(this));
      
       // This event gets called when the web view is loaded
       addEventListener('load', () => {
        this.postMessage({ type: 'webViewReady' });
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
        Math.floor(Math.random() * 256)
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
     this.loadingContainer.style.display = "none";
      this.colorBox.style.backgroundColor = `rgb(${this.targetColor.join(",")})`;
      this.optionsContainer.innerHTML = "";
      this.messageElement.textContent = "";
      
      const correctOption = this.createOption(this.targetColor);
      const incorrectOptions = Array.from({ length: 4 }, () => this.createOption(this.generateRandomColor()));
  
      const allOptions = [correctOption, ...incorrectOptions].sort(() => Math.random() - 0.5);
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
        colorBox.style.backgroundColor = `rgb(${i === 0 ? value : 0}, ${i === 1 ? value : 0}, ${i === 2 ? value : 0})`;
        colorBox.style.color = this.getTextColor([i === 0 ? value : 0, i === 1 ? value : 0, i === 2 ? value : 0]);
        colorBox.textContent = value;
        option.appendChild(colorBox);
      });
  
      option.onclick = () => this.handleGuess(color);
      return option;
    }
  
    /**
     * Handles the user's guess.
     * @param {number[]} selectedColor The selected color array.
     */
    handleGuess(selectedColor) {
      if (JSON.stringify(selectedColor) === JSON.stringify(this.targetColor) && this.attempts < 2) {
        this.score += this.attempts === 0 ? 10 : 5;
        // this.messageElement.textContent = "🎉 Correct! Next round!";
        this.scoreElement.textContent = this.score;
        this.postMessage({  type: "updateScore", data: { newScore: this.score } });
        this.loadingContainer.style.display = "flex";
      } else {
        this.attempts++;
        if (this.attempts === 2) {
          this.messageElement.textContent = `❌ Wrong! Correct: RGB(${this.targetColor.join(",")})`;
        } else if(this.attempts === 1) {
          this.messageElement.textContent = "⚠️ Try again! One more chance.";
        }
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
    if (ev.data.type !== 'devvit-message') return;
    const { message } = ev.data.data;

    switch (message.type) {
      case 'initialData': {
        // Load initial data
        const { score } = message.data;
        // dont want to do anything with the current score

        break;
      }
      case 'scoreUpdated': {
        const { newScore, postId } = message.data;
        
        setTimeout(() => this.resetGame(), 2500);
        break;
      }
      default:
        /** to-do: @satisifes {never} */
        const _ = message;
        break;
    }
  };


  
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
  