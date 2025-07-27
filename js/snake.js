// --- Neo-brutalist Snake ---
const canvas = document.getElementById('snake-canvas');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const GRID_SIZE = 20;
const GRID_WIDTH = W / GRID_SIZE;
const GRID_HEIGHT = H / GRID_SIZE;

class Snake {
  constructor() {
    this.body = [{x: 10, y: 10}];
    this.direction = {x: 1, y: 0};
    this.growing = false;
  }
  
  update() {
    const head = {x: this.body[0].x + this.direction.x, y: this.body[0].y + this.direction.y};
    
    // Wall collision
    if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) {
      return false;
    }
    
    // Self collision
    for (let segment of this.body) {
      if (head.x === segment.x && head.y === segment.y) {
        return false;
      }
    }
    
    this.body.unshift(head);
    if (!this.growing) {
      this.body.pop();
    } else {
      this.growing = false;
    }
    return true;
  }
  
  draw() {
    ctx.fillStyle = '#a084e8';
    for (let segment of this.body) {
      ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
    }
    // Head
    ctx.fillStyle = '#b6e61d';
    ctx.fillRect(this.body[0].x * GRID_SIZE, this.body[0].y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
  }
  
  changeDirection(newDir) {
    if (this.direction.x !== -newDir.x || this.direction.y !== -newDir.y) {
      this.direction = newDir;
    }
  }
  
  eat(food) {
    if (this.body[0].x === food.x && this.body[0].y === food.y) {
      this.growing = true;
      return true;
    }
    return false;
  }
}

class Food {
  constructor(snake) {
    this.snake = snake;
    this.respawn();
  }
  
  respawn() {
    do {
      this.x = Math.floor(Math.random() * GRID_WIDTH);
      this.y = Math.floor(Math.random() * GRID_HEIGHT);
    } while (this.isOnSnake());
  }
  
  isOnSnake() {
    for (let segment of this.snake.body) {
      if (this.x === segment.x && this.y === segment.y) {
        return true;
      }
    }
    return false;
  }
  
  draw() {
    ctx.fillStyle = '#ff6f91';
    ctx.fillRect(this.x * GRID_SIZE, this.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
  }
}

class Game {
  constructor() {
    this.snake = new Snake();
    this.food = new Food(this.snake);
    this.score = 0;
    this.gameOver = false;
    this.bindKeys();
    this.loop = this.loop.bind(this);
    this.loop();
  }
  
  bindKeys() {
    document.addEventListener('keydown', e => {
      if (this.gameOver && (e.key === 'r' || e.key === 'R')) return this.restart();
      if (this.gameOver) return;
      
      switch(e.key) {
        case 'ArrowUp':
          this.snake.changeDirection({x: 0, y: -1});
          break;
        case 'ArrowDown':
          this.snake.changeDirection({x: 0, y: 1});
          break;
        case 'ArrowLeft':
          this.snake.changeDirection({x: -1, y: 0});
          break;
        case 'ArrowRight':
          this.snake.changeDirection({x: 1, y: 0});
          break;
        case 'r':
        case 'R':
          this.restart();
          break;
      }
    });
  }
  
  update() {
    if (this.gameOver) return;
    
    if (!this.snake.update()) {
      this.gameOver = true;
      return;
    }
    
    if (this.snake.eat(this.food)) {
      this.score += 10;
      this.food.respawn();
    }
  }
  
  draw() {
    ctx.fillStyle = '#23293a';
    ctx.fillRect(0, 0, W, H);
    
    // Grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    
    this.snake.draw();
    this.food.draw();
    
    // Score
    ctx.font = 'bold 22px Arial Black, Arial, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText('Score: ' + this.score, 16, 32);
    
    if (this.gameOver) {
      ctx.font = 'bold 36px Arial Black, Arial, sans-serif';
      ctx.fillStyle = '#ff6f91';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', W / 2, H / 2);
      ctx.font = 'bold 20px Arial Black, Arial, sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText('Press R to Restart', W / 2, H / 2 + 40);
    }
  }
  
  restart() {
    this.snake = new Snake();
    this.food = new Food();
    this.score = 0;
    this.gameOver = false;
  }
  
  loop() {
    this.update();
    this.draw();
    setTimeout(() => requestAnimationFrame(this.loop), 150);
  }
}

new Game(); 