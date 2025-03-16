class ColorGame {
    constructor() {
      this.score = 0;
      this.attempts = 0;
      this.targetColor = this.generateRandomColor();
      this.init();
    }
  
    init() {
      this.colorBox = document.getElementById("color-box");
      this.optionsContainer = document.getElementById("options-container");
      this.scoreElement = document.getElementById("score");
      this.messageElement = document.getElementById("message");
  
      this.renderGame();
  
      document.getElementById("restart").addEventListener("click", () => this.resetGame());
  
      window.addEventListener("message", this.handleMessage.bind(this));
  
      this.postMessage({ type: "webViewReady" });
    }
  
    generateRandomColor() {
      return [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)];
    }
  
    getTextColor(rgb) {
      const brightness = rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114;
      return brightness < 128 ? "#FFFFFF" : "#000000"; // White text for dark backgrounds, black for light
    }
  
    renderGame() {
      this.colorBox.style.backgroundColor = `rgb(${this.targetColor.join(",")})`;
      this.optionsContainer.innerHTML = "";
      this.messageElement.textContent = "";
  
      const correctOption = this.createOption(this.targetColor);
      const incorrectOptions = Array.from({ length: 4 }, () => this.createOption(this.generateRandomColor()));
  
      const allOptions = [correctOption, ...incorrectOptions].sort(() => Math.random() - 0.5);
      allOptions.forEach((option) => this.optionsContainer.appendChild(option));
    }
  
    createOption(color) {
      const option = document.createElement("div");
      option.classList.add("option");
  
      color.forEach((value, i) => {
        const colorBox = document.createElement("div");
        colorBox.classList.add("color-box");
        colorBox.style.backgroundColor = `rgb(${i === 0 ? value : 0}, ${i === 1 ? value : 0}, ${i === 2 ? value : 0})`;
        
        // Set text color based on brightness
        colorBox.style.color = this.getTextColor([i === 0 ? value : 0, i === 1 ? value : 0, i === 2 ? value : 0]);
        
        colorBox.textContent = value;
        option.appendChild(colorBox);
      });
  
      option.onclick = () => this.handleGuess(color);
      return option;
    }
  
    handleGuess(selectedColor) {
      if (JSON.stringify(selectedColor) === JSON.stringify(this.targetColor)) {
        this.score += this.attempts === 0 ? 10 : 5;
        this.messageElement.textContent = "🎉 Correct! Next round!";
        this.scoreElement.textContent = this.score;
        setTimeout(() => this.resetGame(), 3000);
      } else {
        this.attempts++;
        if (this.attempts === 2) {
          this.messageElement.textContent = `❌ Wrong! Correct: RGB(${this.targetColor.join(",")})`;
        } else {
          this.messageElement.textContent = "⚠️ Try again! One more chance.";
        }
      }
    }
  
    resetGame() {
      this.attempts = 0;
      this.targetColor = this.generateRandomColor();
      this.renderGame();
    }
  
    postMessage(msg) {
      parent.postMessage(msg, "*");
    }
  }
  
  new ColorGame();
  