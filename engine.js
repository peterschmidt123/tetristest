let grid = Array.from({length: 20}, () => Array(10).fill(0));
let tetrominoes = [
  [[1, 1, 1, 1]], [[1, 1], [1, 1]], [[0, 1, 0], [1, 1, 1]],
  [[1, 0, 0], [1, 1, 1]], [[0, 0, 1], [1, 1, 1]],
  [[0, 1, 1], [1, 1, 0]], [[1, 1, 0], [0, 1, 1]]
];
let current, pos, timer = 0, fallSpeed = 30;
let score = 0, questionActive = false, correctAnswer = 0, userInput = "", rightAnswers = 0;
let gameOver = false;

function setup() {
  createCanvas(300, 440);
  frameRate(30);
  startGame();
}

function draw() {
  background(250);
  drawGrid();
  if (!gameOver) drawTetromino();
  drawUI();

  if (gameOver || questionActive) return;

  timer++;
  if (timer % fallSpeed === 0) {
    pos.y++;
    if (collides()) {
      pos.y--;
      merge();
      clearLines();
      spawn();
    }
  }

  if (frameCount % (30 * 30) === 0) askQuestion();
}

function keyPressed() {
  if (key === 'R') startGame();

  if (gameOver) return;

  if (questionActive) {
    if (keyCode === ENTER) {
      if (parseInt(userInput) === correctAnswer) {
        score += 100; rightAnswers++;
        if (rightAnswers % 5 === 0) fallSpeed = max(5, fallSpeed - 5);
      } else {
        score -= 100;
        alert("Zlá odpoveď. Správny obsah bol: " + correctAnswer + " cm²");
      }
      questionActive = false;
      userInput = "";
    } else if (keyCode === BACKSPACE) {
      userInput = userInput.slice(0, -1);
    } else if (key >= '0' && key <= '9') {
      userInput += key;
    }
    return;
  }

  if (keyCode === LEFT_ARROW) {
    pos.x--;
    if (collides()) pos.x++;
  }
  if (keyCode === RIGHT_ARROW) {
    pos.x++;
    if (collides()) pos.x--;
  }
  if (keyCode === DOWN_ARROW) {
    pos.y++;
    if (collides()) {
      pos.y--;
      merge();
      clearLines();
      spawn();
    }
  }
  if (keyCode === UP_ARROW) rotate();
}

function rotate() {
  let newMatrix = current[0].map((_, i) => current.map(row => row[i])).reverse();
  let old = current;
  current = newMatrix;
  if (collides()) current = old;
}

function collides() {
  for (let y = 0; y < current.length; y++) {
    for (let x = 0; x < current[y].length; x++) {
      if (current[y][x]) {
        let nx = pos.x + x, ny = pos.y + y;
        if (ny >= 20 || nx < 0 || nx >= 10 || grid[ny][nx]) return true;
      }
    }
  }
  return false;
}

function merge() {
  for (let y = 0; y < current.length; y++) {
    for (let x = 0; x < current[y].length; x++) {
      if (current[y][x]) {
        let ny = pos.y + y, nx = pos.x + x;
        if (ny < 0) {
          gameOver = true;
          return;
        }
        grid[ny][nx] = 1;
      }
    }
  }
}

function clearLines() {
  for (let y = grid.length - 1; y >= 0; y--) {
    if (grid[y].every(cell => cell === 1)) {
      grid.splice(y, 1);
      grid.unshift(Array(10).fill(0));
      y++;
    }
  }
}

function drawGrid() {
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 10; x++) {
      if (grid[y][x]) {
        fill(100, 200, 255);
        rect(x * 30, y * 20, 30, 20);
      }
    }
  }
}

function drawTetromino() {
  fill(255, 100, 100);
  for (let y = 0; y < current.length; y++) {
    for (let x = 0; x < current[y].length; x++) {
      if (current[y][x]) {
        rect((pos.x + x) * 30, (pos.y + y) * 20, 30, 20);
      }
    }
  }
}

function drawUI() {
  fill(0); textSize(14);
  text("Skóre: " + score, 10, 20);
  if (questionActive) {
    text("Otázka: Aký je OBSAH (v cm²)?", 10, 360);
    text("Tvoja odpoveď: " + userInput, 10, 380);
  }
  if (gameOver) {
    fill(255, 0, 0);
    text("Koniec hry – Stlač R pre reštart", 30, 200);
  }
}

function askQuestion() {
  questionActive = true;
  correctAnswer = 0;
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 10; x++) {
      if (grid[y][x]) correctAnswer++;
    }
  }
}

function spawn() {
  current = random(tetrominoes).map(row => row.slice());
  pos = {x: 3, y: 0};
  if (collides()) {
    gameOver = true;
  }
}

function startGame() {
  grid = Array.from({length: 20}, () => Array(10).fill(0));
  score = 0;
  timer = 0;
  fallSpeed = 30;
  questionActive = false;
  userInput = "";
  gameOver = false;
  rightAnswers = 0;
  spawn();
}
