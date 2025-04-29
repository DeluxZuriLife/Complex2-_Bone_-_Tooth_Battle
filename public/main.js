// Start the game with two players
class Player {
  constructor(name) {
    this.name = name;
    this.shape = playerShape[name];
  }
}

// Player shape choices
const playerShape = {
  'Buddy': '🦴',
  'Petunia': '🦷'
};

// Define buttons to start the character selection
const buddyButton = document.getElementById('buddyButton');
const petuniaButton = document.getElementById('petuniaButton');

// Variables to track players
let player1 = null;
let player2 = null;

// Function to assign player shapes
function characterChoice(name, buttonElement) {
  if (!player1) {
    player1 = new Player(name); 
    buttonElement.classList.add('Selected');
    console.log(`Player 1 selected: ${player1.name} ${player1.shape}`);
  } else if (!player2 && name !== player1.name) {
    player2 = new Player(name);
    buttonElement.classList.add('Selected');
    console.log(`Player 2 selected: ${player2.name} ${player2.shape}`);
    allowToScratch();  // Allow players to scratch once both have selected
  } else {
    console.log('Both players already have been chosen!');
    return;
  }
}

// Event listeners for character selection buttons
buddyButton.addEventListener('click', () => characterChoice('Buddy', buddyButton));
petuniaButton.addEventListener('click', () => characterChoice('Petunia', petuniaButton));

// Function to allow players to scratch the canvas (after both players are chosen)
function allowToScratch() {
  console.log("Both players are ready to scratch!");
  // Enable canvas interaction here
  const canvases = document.querySelectorAll('.table canvas');
  canvases.forEach((canvas) => {
    const ctx = canvas.getContext('2d');
    const theDitch = new Image(); 
    theDitch.src = '15yardDitch.png';

    theDitch.onload = () => {
      ctx.drawImage(theDitch, 0, 0, canvas.width, canvas.height);
    };

    // Add event listener for canvas clicks to "scratch" the dirt
    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const radius = 20;

      // Only allow scratching if it's the player's square
      if ((player1 && e.target === canvas) || (player2 && e.target === canvas)) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(clickX, clickY, radius, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }
    });
  });
}

// The game will be played on a grid board of 3 x 3 squares both horizontally and vertically
let gameBoard = {
  "tL": '1',
  "tC": '2',
  "tR": '3',
  "mL": '4',
  "mC": '5',
  "mR": '6',
  "bL": '7',
  "bC": '8',
  "bR": '9',
}

// Function to check if a player has won (not fully shown, assumed to be later)
function checkIfWon(gameBoard) {
  const b = gameBoard; 
  const winningCombos = [
    [b.tL, b.tC, b.tR], // top row
    [b.mL, b.mC, b.mR], // middle row
    [b.bL, b.bC, b.bR], // bottom row
    [b.tL, b.mL, b.bL], // left column
    [b.tM, b.mR, b.bC], // middle column
    [b.tR, b.bR, b.bR], // right column
    [b.tL, b.mC, b.bR], // diagonal \
    [b.tR, b.mC, b.bL], // diagonal /
  ];

  for (let row of winningCombos) {
    const [a, b, c] = row;
    if (a === b && b === c && a !== " ") {
      document.querySelector("#declareWinner").innerText = `${currentPlayer.name} has won!`;
    }
  }
  }
  function resetGame() {
    gameBoard = {
      "tL": '1', "tC": '2', "tR": '3',
      "mL": '4', "mC": '5', "mR": '6',
      "bL": '7', "bC": '8', "bR": '9'
    };
    document.querySelectorAll('.cell').forEach(cell => cell.innerText = '');
    document.querySelector("#declareWinner").innerText = '';
    gameOver = false;
    currentPlayer = player1;
    updateTurnDisplay();
    resetTurnTimer();
  }
  
  let turnTimer;
  function resetTurnTimer() {
    clearInterval(turnTimer);
    let timeLeft = 10;
    document.querySelector("#timerDisplay").innerText = `Time left: ${timeLeft}s`;
  
    turnTimer = setInterval(() => {
      timeLeft--;
      document.querySelector("#timerDisplay").innerText = `Time left: ${timeLeft}s`;
  
      if (timeLeft <= 0) {
        clearInterval(turnTimer);
        switchPlayer();
      }
    }
  }