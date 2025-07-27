// --- Neo-brutalist Breakout ---
const canvas = document.getElementById('breakout-canvas');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

class Paddle {
  constructor() {
    this.width = 100;
    this.height = 15;
    this.x = W / 2 - this.width / 2;
    this.y = H - 50;
    this.speed = 8;
  }
  
  update() {
    if (keys.left && this.x > 0) this.x -= this.speed;
    if (keys.right && this.x < W - this.width) this.x += this.speed;
  }
  
  draw() {
    ctx.fillStyle = '#a084e8';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

class Ball {
  constructor(game) {
    this.game = game;
    this.radius = 8;
    this.x = W / 2;
    this.y = H - 70;
    this.dx = 4;
    this.dy = -4;
    this.launched = false;
  }
  
  update() {
    if (!this.launched) {
      this.x = this.game.paddle.x + this.game.paddle.width / 2;
      return;
    }
    
    this.x += this.dx;
    this.y += this.dy;
    
    // Wall collision
    if (this.x <= this.radius || this.x >= W - this.radius) {
      this.dx = -this.dx;
    }
    if (this.y <= this.radius) {
      this.dy = -this.dy;
    }
    
    // Paddle collision
    if (this.y + this.radius >= this.game.paddle.y && 
        this.y - this.radius <= this.game.paddle.y + this.game.paddle.height &&
        this.x >= this.game.paddle.x && 
        this.x <= this.game.paddle.x + this.game.paddle.width) {
      this.dy = -Math.abs(this.dy);
      // Angle based on hit position
      const hitPos = (this.x - this.game.paddle.x) / this.game.paddle.width;
      this.dx = (hitPos - 0.5) * 8;
    }
    
    // Bottom collision
    if (this.y >= H) {
      this.game.lives--;
      this.reset();
    }
  }
  
  draw() {
    ctx.fillStyle = '#b6e61d';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  
  reset() {
    this.x = W / 2;
    this.y = H - 70;
    this.dx = 4;
    this.dy = -4;
    this.launched = false;
  }
  
  launch() {
    if (!this.launched) {
      this.launched = true;
    }
  }
}

class Brick {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.width = 60;
    this.height = 20;
    this.color = color;
    this.active = true;
  }
  
  draw() {
    if (!this.active) return;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }
  
  checkCollision(ball) {
    if (!this.active) return false;
    
    if (ball.x + ball.radius > this.x && 
        ball.x - ball.radius < this.x + this.width &&
        ball.y + ball.radius > this.y && 
        ball.y - ball.radius < this.y + this.height) {
      this.active = false;
      ball.dy = -ball.dy;
      return true;
    }
    return false;
  }
}

class Game {
  constructor() {
    this.paddle = new Paddle();
    this.ball = new Ball(this);
    this.bricks = [];
    this.score = 0;
    this.lives = 3;
    this.gameOver = false;
    this.level = 1;
    this.createBricks();
    this.bindKeys();
    this.loop = this.loop.bind(this);
    this.loop();
  }
  
  createBricks() {
    this.bricks = [];
    const colors = ['#ff6f91', '#3a6ee8', '#b6e61d', '#a084e8'];
    const rows = 5;
    const cols = 8;
    const brickWidth = 60;
    const brickHeight = 20;
    const padding = 5;
    const offsetX = (W - cols * (brickWidth + padding)) / 2;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = offsetX + col * (brickWidth + padding);
        const y = 50 + row * (brickHeight + padding);
        const color = colors[row % colors.length];
        this.bricks.push(new Brick(x, y, color));
      }
    }
  }
  
  bindKeys() {
    document.addEventListener('keydown', e => {
      if (this.gameOver && (e.key === 'r' || e.key === 'R')) return this.restart();
      if (this.gameOver) return;
      
      switch(e.key) {
        case 'ArrowLeft':
          keys.left = true;
          break;
        case 'ArrowRight':
          keys.right = true;
          break;
        case ' ':
          this.ball.launch();
          break;
        case 'r':
        case 'R':
          this.restart();
          break;
      }
    });
    
    document.addEventListener('keyup', e => {
      switch(e.key) {
        case 'ArrowLeft':
          keys.left = false;
          break;
        case 'ArrowRight':
          keys.right = false;
          break;
      }
    });
  }
  
  update() {
    if (this.gameOver) return;
    
    this.paddle.update();
    this.ball.update();
    
    // Brick collisions
    for (let brick of this.bricks) {
      if (brick.checkCollision(this.ball)) {
        this.score += 10;
      }
    }
    
    // Check if all bricks destroyed
    if (this.bricks.every(brick => !brick.active)) {
      this.level++;
      this.createBricks();
      this.ball.reset();
    }
    
    // Check game over
    if (this.lives <= 0) {
      this.gameOver = true;
    }
  }
  
  draw() {
    ctx.fillStyle = '#23293a';
    ctx.fillRect(0, 0, W, H);
    
    this.paddle.draw();
    this.ball.draw();
    for (let brick of this.bricks) brick.draw();
    
    // UI
    ctx.font = 'bold 22px Arial Black, Arial, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText('Score: ' + this.score, 16, 32);
    ctx.textAlign = 'right';
    ctx.fillText('Lives: ' + this.lives, W - 16, 32);
    ctx.textAlign = 'center';
    ctx.fillText('Level: ' + this.level, W / 2, 32);
    
    if (this.gameOver) {
      ctx.font = 'bold 36px Arial Black, Arial, sans-serif';
      ctx.fillStyle = '#ff6f91';
      ctx.fillText('Game Over', W / 2, H / 2);
      ctx.font = 'bold 20px Arial Black, Arial, sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText('Press R to Restart', W / 2, H / 2 + 40);
    }
  }
  
  restart() {
    this.paddle = new Paddle();
    this.ball = new Ball();
    this.bricks = [];
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.gameOver = false;
    this.createBricks();
  }
  
  loop() {
    this.update();
    this.draw();
    requestAnimationFrame(this.loop);
  }
}

const keys = {left: false, right: false};
new Game(); 