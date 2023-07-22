class Card {
  constructor(id, height, width) {
    this.element = document.createElement("div");
    this.element.id = id;
    this.element.className = "card";
    this.element.style.width = width;
    this.element.style.height = height;
  }

  showCard(number) {
    this.element.classList.add("visible");
    this.element.textContent = number;
  }

  hideCard() {
    this.element.classList.remove("visible");
    this.element.textContent = "";
  }
}

class Timer {
  constructor(timeLimit, timerContainer, endGame) {
    this.timeLimit = timeLimit;
    this.timeLeft = timeLimit;
    this.timeInterval = null;
    this.isPaused = false;
    this.endGame = endGame;
    this.timerElement = document.createElement("div");
    this.timerElement.textContent = `Time left: ${this.timeLeft}`;
    timerContainer.appendChild(this.timerElement);
  }

  startTimer() {
    let timeLeft = this.timeLimit;
    this.timeInterval = setInterval(() => {
      if (!this.isPaused) {
        timeLeft--;
        this.timerElement.textContent = `Time left: ${timeLeft}`;
      }
      if (timeLeft === 0) {
        this.endGame();
      }
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.timeInterval);
  }
}

class MatchGrid {
  constructor(args) {
    this.height = args.height;
    this.width = args.width;
    this.columns = args.columns;
    this.rows = args.rows;
    this.timeLimit = args.timeLimit;
    this.theme = args.theme;

    this.timer = null;
    this.cards = [];
    this.numbers = [];
    this.selectedCards = [];
    this.matchedCards = [];

    this.container = document.getElementById("gameContainer");
    this.timerContainer = document.getElementById("timerContainer");

    this.initialize();
  }

  initialize() {
    this.timer = new Timer(
      this.timeLimit,
      this.timerContainer,
      this.endGame.bind(this, false)
    );
    this.timer.startTimer();
    this.createGrid();
  }

  createGrid() {
    this.container.className = this.theme;
    this.container.style.width = `${this.width}px`;
    this.container.style.height = `${this.height}px`;
    this.container.addEventListener(
      "mouseleave",
      () => (this.timer.isPaused = true)
    );
    this.container.addEventListener(
      "mouseenter",
      () => (this.timer.isPaused = false)
    );
    this.flipCardListener = (e) => this.flipCard(e);
    this.container.addEventListener("click", this.flipCardListener);

    let cardsAmount = this.rows * this.columns;
    if (cardsAmount % 2 !== 0) {
      --cardsAmount;
    }

    const cardHeight = `${Math.round(this.height / this.rows) - 10}px`;
    const cardWidth = `${Math.round(this.width / this.columns) - 10}px`;

    this.generateNumbers(cardsAmount);

    for (let i = 0; i < cardsAmount; i++) {
      const card = new Card(i, cardHeight, cardWidth);
      this.container.appendChild(card.element);
      this.cards.push(card);
    }
  }

  generateNumbers(amount) {
    for (let i = 0; i < amount / 2; i++) {
      this.numbers.push(i + 1, i + 1);
    }
    return this.numbers.sort(() => Math.random() - 0.5);
  }

  flipCard(e) {
    if (e.target.id === "gameContainer") return;
    if (this.selectedCards.length >= 2) return;

    const card = e.target;
    if (card === this.selectedCards[0]) return;

    const number = this.numbers[card.id];
    this.cards[card.id].showCard(number);
    this.selectedCards.push(card);

    if (this.selectedCards.length === 2) {
      const [card1, card2] = this.selectedCards;

      if (card1.textContent === card2.textContent) {
        this.matchedCards.push(card1, card2);
        this.selectedCards = [];
      }

      if (card1.textContent !== card2.textContent) {
        setTimeout(() => {
          this.cards[card1.id].hideCard();
          this.cards[card2.id].hideCard();
          this.selectedCards = [];
        }, 1000);
      }
    }

    if (this.matchedCards.length === this.cards.length) {
      this.endGame(true);
    }
  }

  endGame(win) {
    this.timer.stopTimer();
    const message = win ? "Congratulations, you won!" : "Game over!";
    this.timerContainer.textContent = message;
    this.container.removeEventListener("click", this.flipCardListener);
  }

  reload() {
    this.container.innerHTML = "";
    this.timerContainer.innerHTML = "";
    this.cards = [];
    this.selectedCards = [];
    this.matchedCards = [];
    this.numbers = [];
    this.initialize();
  }
}

const startButton = document.getElementById("startButton");
const reloadButton = document.getElementById("reloadButton");

startButton.addEventListener("click", startGame);

const args = {
  height: 400,
  width: 400,
  columns: 4,
  rows: 4,
  timeLimit: 60,
  theme: "dark",
};

function startGame() {
  const game = new MatchGrid(args);
  startButton.disabled = true;
  reloadButton.disabled = false;
  reloadButton.addEventListener("click", reload);

  function reload() {
    game.reload();
  }
}
