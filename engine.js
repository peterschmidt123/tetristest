let grid, currentPiece, gridCols = 10, gridRows = 20, cellSize = 30;
let dropInterval = 1000, lastDropTime = 0;
let score = 0, answerShown = false;
let shapes = [
  [[1, 1, 1, 1]],
  [[1, 1], [1, 1]],
  [[0, 1, 0], [1, 1, 1]],
  [[1, 1, 0], [0, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
  [[1, 0, 0], [1, 1, 1]],
  [[0, 0, 1], [1, 1, 1]]
];

function setup() {
  createCanvas(gridCols * cellSize, gridRows * cellSize).parent("game-container");
  resetGame();
}

function draw() {
  background(255);
  drawGrid();
  drawPiece(currentPiece);

  if (millis() - lastDropTime > dropInterval && !answerShown) {
    if (!movePiece(currentPiece, 0, 1)) {
      mergeToGrid(currentPiece);
      clearFullRows();
      newPiece();
    }
    lastDropTime = millis();
  }
}

function resetGame() {
  grid = Array.from({ length: gridRows }, () => Array(gridCols).fill(0));
  newPiece();
  score = 0;
  updateScore();
  answerShown = false;
}

function newPiece() {
  let shape = random(shapes);
  currentPiece = {
    shape: shape.map(row => [...row]),
    x: floor(gridCols / 2) - floor(shape[0].length / 2),
    y: 0
  };
}

function drawGrid() {
  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      stroke(0);
      fill(grid[r][c] ? "#79c2d0" : 255);
      rect(c * cellSize, r * cellSize, cellSize, cellSize);
    }
  }
}

function drawPiece(p) {
  fill("#e26a6a");
  for (let r = 0; r < p.shape.length; r++) {
    for (let c = 0; c < p.shape[r].length; c++) {
      if (p.shape[r][c]) {
        rect((p.x + c) * cellSize, (p.y + r) * cellSize, cellSize, cellSize);
      }
    }
  }
}

function movePiece(p, dx, dy) {
  if (!collides(p, dx, dy)) {
    p.x += dx;
    p.y += dy;
    return true;
  }
  return false;
}

function collides(p, dx, dy) {
  for (let r = 0; r < p.shape.length; r++) {
    for (let c = 0; c < p.shape[r].length; c++) {
      if (p.shape[r][c]) {
        let newX = p.x + c + dx;
        let newY = p.y + r + dy;
        if (newX < 0 || newX >= gridCols || newY >= gridRows || (newY >= 0 && grid[newY][newX])) {
          return true;
        }
      }
    }
  }
  return false;
}

function mergeToGrid(p) {
  for (let r = 0; r < p.shape.length; r++) {
    for (let c = 0; c < p.shape[r].length; c++) {
      if (p.shape[r][c]) {
        grid[p.y + r][p.x + c] = 1;
      }
    }
  }
}

function clearFullRows() {
  for (let r = gridRows - 1; r >= 0; r--) {
    if (grid[r].every(cell => cell)) {
      grid.splice(r, 1);
      grid.unshift(Array(gridCols).fill(0));
      score += 10;
      updateScore();
    }
  }
}

function updateScore() {
  document.getElementById("score").innerText = "Skóre: " + score;
}

function rotatePiece(p) {
  let newShape = p.shape[0].map((_, i) => p.shape.map(row => row[i])).reverse();
  let testPiece = { shape: newShape, x: p.x, y: p.y };
  if (!collides(testPiece, 0, 0)) {
    p.shape = newShape;
  }
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) movePiece(currentPiece, -1, 0);
  else if (keyCode === RIGHT_ARROW) movePiece(currentPiece, 1, 0);
  else if (keyCode === DOWN_ARROW) movePiece(currentPiece, 0, 1);
  else if (keyCode === UP_ARROW) rotatePiece(currentPiece);
  else if (key === "R" || key === "r") resetGame();
}

function checkAnswer() {
  const answer = parseInt(document.getElementById("answer-input").value);
  const actual = grid.flat().reduce((a, b) => a + b, 0);
  if (answer === actual) {
    score += 50;
  } else {
    score -= 25;
  }
  updateScore();
  document.getElementById("answer-input").value = "";
}
