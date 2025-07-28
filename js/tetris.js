// --- Neo-brutalist Tetris ---
const canvas = document.getElementById('tetris-canvas');
const ctx = canvas.getContext('2d');
const COLS = 10;
const ROWS = 20;
const BLOCK = 32;
const board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
const colors = [
  '#fff', // empty
  '#a084e8', // I
  '#b6e61d', // O
  '#23293a', // T
  '#ff6f91', // S
  '#3a6ee8', // Z
  '#ffb199', // J
  '#232526', // L
];
const tetrominoes = [
  [], // no piece
  [[1, 1, 1, 1]], // I
  [[2, 2], [2, 2]], // O
  [[0, 3, 0], [3, 3, 3]], // T
  [[0, 4, 4], [4, 4, 0]], // S
  [[5, 5, 0], [0, 5, 5]], // Z
  [[6, 0, 0], [6, 6, 6]], // J
  [[0, 0, 7], [7, 7, 7]], // L
];
let current, pos, score = 0, gameOver = false;

function makePiece(id) {
  const shape = tetrominoes[id].map(row => [...row]);
  return { shape, id, rotation: 0 };
}

function resetPiece() {
  const id = 1 + Math.floor(Math.random() * 7);
  const piece = makePiece(id);
  current = piece;
  pos = { x: Math.floor(COLS / 2) - Math.ceil(current.shape[0].length / 2), y: 0 };
  if (collides(0, 0, current.shape)) gameOver = true;
}

function collides(dx, dy, shape) {
  for (let y = 0; y < shape.length; ++y) {
    for (let x = 0; x < shape[y].length; ++x) {
      if (shape[y][x] && (
        board[y + pos.y + dy]?.[x + pos.x + dx] !== 0 ||
        y + pos.y + dy >= ROWS ||
        x + pos.x + dx < 0 ||
        x + pos.x + dx >= COLS
      )) return true;
    }
  }
  return false;
}

function merge() {
  for (let y = 0; y < current.shape.length; ++y)
    for (let x = 0; x < current.shape[y].length; ++x)
      if (current.shape[y][x]) board[y + pos.y][x + pos.x] = current.id;
}

function rotate(shape) {
  // Rotate 90 degrees clockwise
  return shape[0].map((_, i) => shape.map(row => row[i])).reverse();
}

function clearLines() {
  let lines = 0;
  for (let y = ROWS - 1; y >= 0; --y) {
    if (board[y].every(cell => cell)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(0));
      lines++;
      y++;
    }
  }
  // Tetris scoring: 1=100, 2=300, 3=500, 4=800
  if (lines > 0) {
    const lineScores = [0, 100, 300, 500, 800];
    score += lineScores[lines] || (lines * 100);
  }
}

function drawBlock(x, y, id) {
  ctx.fillStyle = colors[id];
  ctx.fillRect(x * BLOCK, y * BLOCK, BLOCK, BLOCK);
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 3;
  ctx.strokeRect(x * BLOCK, y * BLOCK, BLOCK, BLOCK);
}

function draw() {
  ctx.fillStyle = '#e3eaff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < ROWS; ++y)
    for (let x = 0; x < COLS; ++x)
      if (board[y][x]) drawBlock(x, y, board[y][x]);
  for (let y = 0; y < current.shape.length; ++y)
    for (let x = 0; x < current.shape[y].length; ++x)
      if (current.shape[y][x]) drawBlock(x + pos.x, y + pos.y, current.id);
  ctx.font = 'bold 22px Arial Black, Arial, sans-serif';
  ctx.fillStyle = '#232526';
  ctx.textAlign = 'left';
  ctx.fillText('Score: ' + score, 10, 30);
  if (gameOver) {
    ctx.fillStyle = '#ff6f91';
    ctx.font = 'bold 32px Arial Black, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
    ctx.font = 'bold 20px Arial Black, Arial, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText('Press R to Restart', canvas.width / 2, canvas.height / 2 + 40);
  }
}

function drop() {
  if (!gameOver) {
    if (!collides(0, 1, current.shape)) {
      pos.y++;
    } else {
      merge();
      clearLines();
      resetPiece();
    }
    draw();
  }
}

function move(dx) {
  if (!collides(dx, 0, current.shape)) {
    pos.x += dx;
    draw();
  }
}

function hardDrop() {
  while (!collides(0, 1, current.shape)) pos.y++;
  drop();
}

function rotatePiece() {
  const rotated = rotate(current.shape);
  if (!collides(0, 0, rotated)) {
    current.shape = rotated;
    draw();
  }
}

document.addEventListener('keydown', e => {
  if (gameOver && (e.key === 'r' || e.key === 'R')) {
    e.preventDefault();
    return restartGame();
  }
  if (gameOver) return;
  
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    move(-1);
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    move(1);
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    drop();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    rotatePiece();
  } else if (e.key === ' ') {
    e.preventDefault();
    hardDrop();
  } else if (e.key === 'r' || e.key === 'R') {
    e.preventDefault();
    restartGame();
  }
});

function restartGame() {
  for (let y = 0; y < ROWS; ++y) board[y].fill(0);
  score = 0;
  gameOver = false;
  resetPiece();
  draw();
}

function gameLoop() {
  if (!gameOver) drop();
  setTimeout(gameLoop, 400);
}

resetPiece();
draw();
gameLoop(); 