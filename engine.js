
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const COLS = 10, ROWS = 12, SIZE = 30;
let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
const pieces = [
  [[1, 1, 1, 1]], [[1, 1], [1, 1]], [[0, 1, 0], [1, 1, 1]],
  [[1, 1, 0], [0, 1, 1]], [[0, 1, 1], [1, 1, 0]],
  [[1, 0, 0], [1, 1, 1]], [[0, 0, 1], [1, 1, 1]]
];
let piece = null, x = 0, y = 0, score = 0;
let interval = null;
let gamePaused = false;
let startTime = Date.now();

function drawBlock(x, y, color = "red") {
  ctx.fillStyle = color;
  ctx.fillRect(x * SIZE, y * SIZE, SIZE, SIZE);
  ctx.strokeStyle = "black";
  ctx.strokeRect(x * SIZE, y * SIZE, SIZE, SIZE);
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c]) drawBlock(c, r, "skyblue");
    }
  }
  for (let r = 0; r < piece.length; r++) {
    for (let c = 0; c < piece[r].length; c++) {
      if (piece[r][c]) drawBlock(x + c, y + r);
    }
  }
}

function rotate(matrix) {
  return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
}

function spawnPiece() {
  const newPiece = pieces[Math.floor(Math.random() * pieces.length)];
  const testX = 3, testY = 0;
  for (let r = 0; r < newPiece.length; r++) {
    for (let c = 0; c < newPiece[r].length; c++) {
      if (newPiece[r][c] && board[testY + r][testX + c]) {
        clearInterval(interval);
        gamePaused = true;
        alert("🛑 Koniec hry. Tvoje skóre je " + score + ".");
        return;
      }
    }
  }
  piece = newPiece;
  x = testX;
  y = testY;
  drawBoard();
}

function merge() {
  for (let r = 0; r < piece.length; r++) {
    for (let c = 0; c < piece[r].length; c++) {
      if (piece[r][c]) board[y + r][x + c] = 1;
    }
  }
}


function clearRows() {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(val => val)) {
      board.splice(r, 1);
      board.unshift(Array(COLS).fill(0));
      r++; // after removing row, check same index again
    }
  }

  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(val => val)) {
      board.splice(r, 1);
      board.unshift(Array(COLS).fill(0));
    }
  }
}

function drop() {
  if (!collision(0, 1, piece)) {
    y++;
  } else {
    merge();
    clearRows();
    spawnPiece();
  }
  drawBoard();
}

function collision(dx, dy, newPiece) {
  for (let r = 0; r < newPiece.length; r++) {
    for (let c = 0; c < newPiece[r].length; c++) {
      if (newPiece[r][c]) {
        let nx = x + c + dx;
        let ny = y + r + dy;
        if (nx < 0 || nx >= COLS || ny >= ROWS || board[ny][nx]) return true;
      }
    }
  }
  return false;
}

function move(dir) {
  if (!collision(dir, 0, piece)) {
    x += dir;
    drawBoard();
  }
}

function rotatePiece() {
  const rotated = rotate(piece);
  if (!collision(0, 0, rotated)) {
    piece = rotated;
    drawBoard();
  }
}

function gameLoop() {
  if (!gamePaused) {
    drop();
    checkTimeForQuestion();
  }
}

function askAreaQuestion() {
  const questionText = document.querySelector("#question p");
  if (questionText) {
    questionText.textContent = "🟦 Prosím, vypočítaj OBSAH všetkých modrých políčok na spodku hracej plochy (v cm²):";
  }
  const input = document.getElementById("answerInput");
  input.value = "";
  input.focus();
}

function submitAnswer() {
  const input = document.getElementById("answerInput");
  const feedback = document.getElementById("feedback");
  const userAns = parseInt(input.value);
  const correct = board.flat().filter(v => v).length;
  if (userAns === correct) {
    score += 100;
    feedback.textContent = "✅ Správne! Získavaš 100 bodov."; feedback.style.visibility = "visible"; alert("✅ Správne! Získavaš 100 bodov.");
  } else {
    score -= 100;
    feedback.textContent = "❌ Nesprávne. Strácaš 100 bodov."; feedback.style.visibility = "visible"; alert("❌ Nesprávne. Strácaš 100 bodov.");
  }
  document.getElementById("score").textContent = "Skóre: " + score;
  setTimeout(() => {
    feedback.textContent = ""; feedback.style.visibility = "hidden";;
    startTime = Date.now();
    gamePaused = false;
    interval = setInterval(gameLoop, 1000);
  }, 2500);
}

function checkTimeForQuestion() {
  const now = Date.now();
  if (!gamePaused && now - startTime >= 30000) {
    gamePaused = true;
    clearInterval(interval);
    askAreaQuestion();
  }
}

function resetGame() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  score = 0;
  document.getElementById("score").textContent = "Skóre: 0";
  spawnPiece();
  drawBoard();
  startTime = Date.now();
  gamePaused = false;
  interval = setInterval(gameLoop, 1000);
}


document.addEventListener("keydown", e => {
  if (e.key === "r" || e.key === "R") { resetGame(); return; }

  if (document.activeElement.id === "answerInput" && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
    e.preventDefault(); return;
  }

  if (gamePaused) {
    if (e.key === "Enter") submitAnswer();
    return;
  }
  switch (e.key) {
    case "ArrowLeft": move(-1); break;
    case "ArrowRight": move(1); break;
    case "ArrowDown": drop(); break;
    case "ArrowUp": rotatePiece(); break;
    case "Enter": submitAnswer(); break;
    case "r":
    case "R": resetGame(); break;
  }
});

resetGame();
