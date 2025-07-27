function loadGame(game) {
  const container = document.getElementById('game-container');
  if (!container) return;
  if (game === 'asteroids') {
    container.innerHTML = '[Asteroids game will appear here]';
    // Future: dynamically load asteroids.js
  } else if (game === 'tetris') {
    container.innerHTML = '[Tetris game will appear here]';
    // Future: dynamically load tetris.js
  }
} 