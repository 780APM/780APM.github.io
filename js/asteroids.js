// --- Neo-brutalist Asteroids ---
const canvas = document.getElementById('asteroids-canvas');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

// Utility
function randBetween(a, b) { return a + Math.random() * (b - a); }
function dist(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); }

class Ship {
  constructor() {
    this.x = W / 2;
    this.y = H / 2;
    this.r = 18;
    this.angle = -Math.PI / 2;
    this.vel = { x: 0, y: 0 };
    this.thrusting = false;
    this.rotation = 0;
    this.dead = false;
    this.respawnTimer = 0;
  }
  update() {
    if (this.thrusting) {
      this.vel.x += Math.cos(this.angle) * 0.08;
      this.vel.y += Math.sin(this.angle) * 0.08;
    }
    this.vel.x *= 0.98;
    this.vel.y *= 0.98;
    this.x += this.vel.x;
    this.y += this.vel.y;
    this.angle += this.rotation;
    // Screen wrap
    if (this.x < 0) this.x += W;
    if (this.x > W) this.x -= W;
    if (this.y < 0) this.y += H;
    if (this.y > H) this.y -= H;
  }
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    // Ship body
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.r, 0);
    ctx.lineTo(-this.r * 0.7, this.r * 0.7);
    ctx.lineTo(-this.r * 0.5, 0);
    ctx.lineTo(-this.r * 0.7, -this.r * 0.7);
    ctx.closePath();
    ctx.stroke();
    // Thrust
    if (this.thrusting) {
      ctx.strokeStyle = '#b6e61d';
      ctx.beginPath();
      ctx.moveTo(-this.r * 0.5, 0);
      ctx.lineTo(-this.r - 8, 0);
      ctx.stroke();
    }
    ctx.restore();
  }
  respawn() {
    this.x = W / 2;
    this.y = H / 2;
    this.vel = { x: 0, y: 0 };
    this.angle = -Math.PI / 2;
    this.dead = false;
    this.respawnTimer = 0;
  }
}

class Asteroid {
  constructor(x, y, r, level = 1) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.level = level;
    this.angle = randBetween(0, Math.PI * 2);
    this.speed = randBetween(0.3, 0.8) / level;
    this.vel = {
      x: Math.cos(this.angle) * this.speed,
      y: Math.sin(this.angle) * this.speed
    };
    this.vertices = [];
    const verts = 10 + Math.floor(Math.random() * 4);
    for (let i = 0; i < verts; i++) {
      const ang = (Math.PI * 2 / verts) * i;
      const rad = this.r * randBetween(0.7, 1.1);
      this.vertices.push({ x: Math.cos(ang) * rad, y: Math.sin(ang) * rad });
    }
  }
  update() {
    this.x += this.vel.x;
    this.y += this.vel.y;
    if (this.x < -this.r) this.x += W + this.r * 2;
    if (this.x > W + this.r) this.x -= W + this.r * 2;
    if (this.y < -this.r) this.y += H + this.r * 2;
    if (this.y > H + this.r) this.y -= H + this.r * 2;
  }
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.strokeStyle = '#a084e8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
    for (let v of this.vertices) ctx.lineTo(v.x, v.y);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

class Bullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = 7;
    this.r = 2.5;
    this.life = 0;
    this.maxLife = 60;
  }
  update() {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.life++;
    // Screen wrap
    if (this.x < 0) this.x += W;
    if (this.x > W) this.x -= W;
    if (this.y < 0) this.y += H;
    if (this.y > H) this.y -= H;
  }
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.fillStyle = '#b6e61d';
    ctx.beginPath();
    ctx.arc(0, 0, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class Game {
  constructor() {
    this.ship = new Ship();
    this.asteroids = [];
    this.bullets = [];
    this.score = 0;
    this.lives = 3;
    this.gameOver = false;
    this.spawnAsteroids(4);
    this.bindKeys();
    this.loop = this.loop.bind(this);
    this.loop();
  }
  spawnAsteroids(n) {
    this.asteroids = [];
    for (let i = 0; i < n; i++) {
      let x, y;
      do {
        x = randBetween(0, W);
        y = randBetween(0, H);
      } while (dist(x, y, this.ship.x, this.ship.y) < 100);
      this.asteroids.push(new Asteroid(x, y, randBetween(32, 48)));
    }
  }
  bindKeys() {
    document.addEventListener('keydown', e => {
      if (this.gameOver && (e.key === 'r' || e.key === 'R')) return this.restart();
      if (this.ship.dead) return;
      if (e.key === 'ArrowLeft') this.ship.rotation = -0.04;
      else if (e.key === 'ArrowRight') this.ship.rotation = 0.04;
      else if (e.key === 'ArrowUp') this.ship.thrusting = true;
      else if (e.key === ' ') this.shoot();
      else if (e.key === 'r' || e.key === 'R') this.restart();
    });
    document.addEventListener('keyup', e => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') this.ship.rotation = 0;
      else if (e.key === 'ArrowUp') this.ship.thrusting = false;
    });
  }
  shoot() {
    if (this.bullets.length < 5) {
      this.bullets.push(new Bullet(
        this.ship.x + Math.cos(this.ship.angle) * this.ship.r,
        this.ship.y + Math.sin(this.ship.angle) * this.ship.r,
        this.ship.angle
      ));
    }
  }
  update() {
    if (this.gameOver) return;
    this.ship.update();
    for (let a of this.asteroids) a.update();
    for (let b of this.bullets) b.update();
    // Remove old bullets
    this.bullets = this.bullets.filter(b => b.life < b.maxLife);
    // Bullet-asteroid collision
    for (let i = this.asteroids.length - 1; i >= 0; i--) {
      const a = this.asteroids[i];
      for (let j = this.bullets.length - 1; j >= 0; j--) {
        const b = this.bullets[j];
        if (dist(a.x, a.y, b.x, b.y) < a.r) {
          this.bullets.splice(j, 1);
          this.splitAsteroid(i);
          this.score += 100;
          break;
        }
      }
    }
    // Ship-asteroid collision
    if (!this.ship.dead) {
      for (let a of this.asteroids) {
        if (dist(a.x, a.y, this.ship.x, this.ship.y) < a.r + this.ship.r * 0.7) {
          this.lives--;
          this.ship.dead = true;
          this.ship.respawnTimer = 60;
        }
      }
    }
    // Respawn logic
    if (this.ship.dead) {
      this.ship.respawnTimer--;
      if (this.ship.respawnTimer <= 0) {
        if (this.lives > 0) this.ship.respawn();
        else this.gameOver = true;
      }
    }
    // Next level
    if (this.asteroids.length === 0) {
      this.spawnAsteroids(4 + Math.floor(this.score / 500));
    }
  }
  splitAsteroid(i) {
    const a = this.asteroids[i];
    if (a.r > 20) {
      this.asteroids.push(new Asteroid(a.x, a.y, a.r / 1.7, a.level + 1));
      this.asteroids.push(new Asteroid(a.x, a.y, a.r / 1.7, a.level + 1));
    }
    this.asteroids.splice(i, 1);
  }
  draw() {
    ctx.fillStyle = '#23293a';
    ctx.fillRect(0, 0, W, H);
    // Score & lives
    ctx.font = 'bold 22px Arial Black, Arial, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText('Score: ' + this.score, 16, 32);
    ctx.textAlign = 'right';
    ctx.fillText('Lives: ' + this.lives, W - 16, 32);
    // Entities
    for (let a of this.asteroids) a.draw();
    for (let b of this.bullets) b.draw();
    if (!this.ship.dead) this.ship.draw();
    // Game over
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
    this.score = 0;
    this.lives = 3;
    this.gameOver = false;
    this.ship = new Ship();
    this.bullets = [];
    this.spawnAsteroids(4);
  }
  loop() {
    this.update();
    this.draw();
    requestAnimationFrame(this.loop);
  }
}

new Game(); 