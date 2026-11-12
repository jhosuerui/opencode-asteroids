'use strict';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = 800;
const H = 600;

// ── Input ─────────────────────────────────────────────────────────────────────
const keys = {};
const justPressed = {};

window.addEventListener('keydown', e => {
  justPressed[e.code] = !keys[e.code];
  keys[e.code] = true;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code))
    e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

function pressed(code) {
  const val = justPressed[code];
  justPressed[code] = false;
  return val;
}

// ── Utils ─────────────────────────────────────────────────────────────────────
const wrap  = (v, max) => ((v % max) + max) % max;
const dist  = (a, b)   => Math.hypot(a.x - b.x, a.y - b.y);
const rand  = (min, max) => min + Math.random() * (max - min);
const randInt = (min, max) => Math.floor(rand(min, max + 1));

// ── Bullet ────────────────────────────────────────────────────────────────────
class Bullet {
  constructor(x, y, angle, color = '#fff') {
    this.x = x;
    this.y = y;
    const SPEED = 520;
    this.vx = Math.cos(angle) * SPEED;
    this.vy = Math.sin(angle) * SPEED;
    this.ttl  = 1.1;
    this.radius = 2;
    this.color = color;
    this.dead = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Asteroid ──────────────────────────────────────────────────────────────────
const RADII  = [0, 16, 30, 50];   // por tamaño 1, 2, 3
const SPEEDS = [0, 85, 55, 32];   // velocidad base por tamaño
const POINTS = [0, 100, 50, 20];  // puntos por tamaño

class Asteroid {
  constructor(x, y, size = 3) {
    this.x    = x;
    this.y    = y;
    this.size = size;
    this.radius = RADII[size];
    this.dead = false;

    const angle = rand(0, Math.PI * 2);
    const speed = SPEEDS[size] + rand(-15, 15);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.rotSpeed = rand(-1.2, 1.2);
    this.rot = rand(0, Math.PI * 2);

    // Polígono irregular
    const n = randInt(8, 13);
    this.verts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = this.radius * rand(0.6, 1.0);
      this.verts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
  }

  update(dt) {
    this.x   = wrap(this.x + this.vx * dt, W);
    this.y   = wrap(this.y + this.vy * dt, H);
    this.rot += this.rotSpeed * dt;
  }

  split() {
    if (this.size <= 1) return [];
    return [
      new Asteroid(this.x, this.y, this.size - 1),
      new Asteroid(this.x, this.y, this.size - 1),
    ];
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    ctx.moveTo(this.verts[0][0], this.verts[0][1]);
    for (let i = 1; i < this.verts.length; i++)
      ctx.lineTo(this.verts[i][0], this.verts[i][1]);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

// ── Estrella fugaz ────────────────────────────────────────────────────────────
const FUGAZ_TTL     = 6;     // segundos de vida antes de desvanecerse sola
const FUGAZ_POINTS  = 250;   // puntos por destruirla

class EstrellaFugaz {
  constructor() {
    // Aparece en un borde aleatorio apuntando hacia el interior de la pantalla
    const edge = randInt(0, 3);   // 0 arriba, 1 derecha, 2 abajo, 3 izquierda
    let angle;
    if (edge === 0) {         this.x = rand(0, W); this.y = 0;  angle = rand(Math.PI / 4, Math.PI * 3 / 4); }
    else if (edge === 1) {    this.x = W;  this.y = rand(0, H); angle = rand(Math.PI * 3 / 4, Math.PI * 5 / 4); }
    else if (edge === 2) {    this.x = rand(0, W); this.y = H;  angle = rand(-Math.PI * 3 / 4, -Math.PI / 4); }
    else {                    this.x = 0;  this.y = rand(0, H); angle = rand(-Math.PI / 4, Math.PI / 4); }

    const speed = rand(250, 320);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.radius = 12;
    this.ttl  = FUGAZ_TTL;
    this.dead = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;   // se desvanece sola
  }

  draw() {
    // Parpadeo cuando está por expirar
    if (this.ttl < 1.5 && Math.floor(this.ttl * 8) % 2 === 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(Math.atan2(this.vy, this.vx));

    // Estela de cometa
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(255, 240, 170, 0.45)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(-34, 0);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 240, 170, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(-18, 0);
    ctx.stroke();

    // Núcleo brillante
    ctx.strokeStyle = '#ffec9e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 250, 210, 0.9)';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// ── Skins de la nave ──────────────────────────────────────────────────────────
// Cada skin define color de trazo, color de la llama del propulsor, la silueta
// (vértices en coordenadas locales, nariz hacia +x) y la distancia de la nariz,
// de donde salen los disparos.
const SKINS = [
  {
    nombre: 'CLÁSICA',
    stroke: '#fff',
    llama:  'rgba(255, 130, 0, 0.85)',
    nariz:  21,
    cuerpo: [[20, 0], [-12, -9], [-7, 0], [-12, 9]],
  },
  {
    nombre: 'DARDO',
    stroke: '#f4f',
    llama:  'rgba(120, 220, 255, 0.85)',
    nariz:  27,
    cuerpo: [[26, 0], [-10, -6], [-5, 0], [-10, 6]],
  },
  {
    nombre: 'ÍGNEA',
    stroke: '#f44',
    llama:  'rgba(255, 220, 60, 0.85)',
    nariz:  19,
    cuerpo: [[18, 0], [-2, -8], [-12, -4], [-8, 0], [-12, 4], [-2, 8]],
  },
  {
    nombre: 'ESMERALDA',
    stroke: '#4f4',
    llama:  'rgba(150, 255, 180, 0.85)',
    nariz:  17,
    cuerpo: [[16, 0], [-10, -12], [-4, 0], [-10, 12]],
  },
  {
    nombre: 'DORADA',
    stroke: '#fc3',
    llama:  'rgba(255, 255, 255, 0.85)',
    nariz:  16,
    cuerpo: [[15, 0], [5, -7], [-9, -7], [-12, 0], [-9, 7], [5, 7]],
  },
];

// La skin elegida se recuerda entre partidas. try/catch por si localStorage
// no está disponible (p. ej. contexto sandboxed): entonces no se persiste.
function loadSkin() {
  try {
    const v = Number(localStorage.getItem('asteroids-skin'));
    return Number.isInteger(v) && v >= 0 && v < SKINS.length ? v : 0;
  } catch { return 0; }
}
function saveSkin() {
  try { localStorage.setItem('asteroids-skin', String(skinIndex)); } catch {}
}

let skinIndex    = loadSkin();
let skinMsgTimer = 0;   // tiempo restante del aviso "NAVE: ..." al cambiar de skin

// ── Ship ──────────────────────────────────────────────────────────────────────
class Ship {
  constructor() { this.reset(); }

  reset() {
    this.x      = W / 2;
    this.y      = H / 2;
    this.angle  = -Math.PI / 2;
    this.vx     = 0;
    this.vy     = 0;
    this.radius = 12;
    this.thrusting     = false;
    this.invincible    = 3;
    this.shootCooldown = 0;
    this.speedTimer    = 0;   // tiempo restante del power-up de velocidad
    this.shieldTimer   = 0;   // tiempo restante del escudo
    this.tripleTimer   = 0;   // tiempo restante del disparo triple (tecla T)
    this.dead          = false;
  }

  update(dt) {
    if (this.dead) return;
    if (this.invincible    > 0) this.invincible    -= dt;
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    if (this.speedTimer    > 0) this.speedTimer    -= dt;
    if (this.shieldTimer   > 0) this.shieldTimer   -= dt;
    if (this.tripleTimer   > 0) this.tripleTimer   -= dt;

    const boost  = this.speedTimer > 0 ? 2 : 1;  // power-up de velocidad: ×2
    const ROT   = 3.5 * boost;   // rad/s
    const THRUST = 260 * boost;  // px/s²
    const DRAG   = 0.987;

    if (keys['ArrowLeft'])  this.angle -= ROT * dt;
    if (keys['ArrowRight']) this.angle += ROT * dt;

    this.thrusting = !!keys['ArrowUp'];
    if (this.thrusting) {
      this.vx += Math.cos(this.angle) * THRUST * dt;
      this.vy += Math.sin(this.angle) * THRUST * dt;
    }

    this.vx *= DRAG;
    this.vy *= DRAG;
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
  }

  tryShoot() {
    if (this.shootCooldown > 0 || this.dead) return [];
    this.shootCooldown = 0.2;
    const NOSE = SKINS[skinIndex].nariz;
    const ox = this.x + Math.cos(this.angle) * NOSE;
    const oy = this.y + Math.sin(this.angle) * NOSE;

    // Disparo triple: 3 balas paralelas en línea recta (mismo ángulo, sin abanico),
    // desfasadas perpendicularmente a la nariz. Se pintan de amarillo mientras dura.
    if (this.tripleTimer > 0) {
      const px = Math.cos(this.angle + Math.PI / 2);   // dirección perpendicular
      const py = Math.sin(this.angle + Math.PI / 2);
      const GAP = 6;
      return [-GAP, 0, GAP].map(off =>
        new Bullet(ox + px * off, oy + py * off, this.angle, '#ff0'));
    }

    return [new Bullet(ox, oy, this.angle)];
  }

  draw() {
    if (this.dead) return;
    // Parpadeo durante invencibilidad de reaparición
    if (this.invincible > 0 && Math.floor(this.invincible * 8) % 2 === 0) return;

    // Con el power-up de velocidad activo, la nave se tiñe de cian
    const boosted = this.speedTimer > 0;
    const skin = SKINS[skinIndex];

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.strokeStyle = boosted ? '#0ff' : skin.stroke;
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';

    // Silueta definida por la skin seleccionada
    ctx.beginPath();
    ctx.moveTo(skin.cuerpo[0][0], skin.cuerpo[0][1]);
    for (let i = 1; i < skin.cuerpo.length; i++)
      ctx.lineTo(skin.cuerpo[i][0], skin.cuerpo[i][1]);
    ctx.closePath();
    ctx.stroke();

    // Llama del propulsor (más larga y eléctrica con el power-up)
    if (this.thrusting && Math.random() > 0.35) {
      ctx.beginPath();
      ctx.moveTo(-8, -4);
      ctx.lineTo(-8 - rand(6, 14) * (boosted ? 1.5 : 1), 0);
      ctx.lineTo(-8,  4);
      ctx.strokeStyle = boosted ? 'rgba(120, 220, 255, 0.9)' : skin.llama;
      ctx.stroke();
    }

    // Campo de escudo (pulsa suavemente y parpadea al terminar)
    if (this.shieldTimer > 0 &&
        !(this.shieldTimer < 1.5 && Math.floor(this.shieldTimer * 8) % 2 === 0)) {
      const alpha = 0.35 + 0.15 * Math.sin(this.shieldTimer * 10);
      ctx.strokeStyle = `rgba(0, 255, 0, ${alpha.toFixed(2)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, SHIELD_RADIUS, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}

// ── Partículas (explosión) ────────────────────────────────────────────────────
class Particle {
  constructor(x, y) {
    this.x  = x;
    this.y  = y;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(30, 130);
    this.vx   = Math.cos(angle) * speed;
    this.vy   = Math.sin(angle) * speed;
    this.life = rand(0.4, 1.1);
    this.ttl  = this.life;
    this.dead = false;
  }

  update(dt) {
    this.x  += this.vx * dt;
    this.y  += this.vy * dt;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    const alpha = this.ttl / this.life;
    ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 0.05, this.y - this.vy * 0.05);
    ctx.stroke();
  }
}

// ── PowerUps (velocidad y escudo) ─────────────────────────────────────────────
const POWERUP_TTL     = 10;   // segundos que el ítem permanece en el mapa
const SPEEDUP_DUR     = 5;    // duración del efecto de velocidad en la nave
const SHIELD_DUR      = 5;    // duración del escudo en la nave
const SHIELD_RADIUS   = 24;   // radio de protección del escudo
const TRIPLE_DUR      = 5;    // duración del disparo triple activado con T

class PowerUp {
  constructor(x, y, kind = 'speed') {
    this.kind = kind;   // 'speed' | 'shield'
    this.x = x;
    this.y = y;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(10, 40);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.radius = 10;
    this.ttl  = POWERUP_TTL;
    this.dead = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    // Parpadeo cuando está por expirar
    if (this.ttl < 2 && Math.floor(this.ttl * 8) % 2 === 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    const shield = this.kind === 'shield';
    const color  = shield ? '#0f0' : '#0ff';

    // Halo tenue
    ctx.strokeStyle = shield ? 'rgba(0, 255, 0, 0.35)' : 'rgba(0, 255, 255, 0.35)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = color;
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';

    if (shield) {
      // Escudo ⛨
      ctx.beginPath();
      ctx.moveTo( 0, -7);
      ctx.lineTo( 6, -4);
      ctx.lineTo( 5,  3);
      ctx.lineTo( 0,  7);
      ctx.lineTo(-5,  3);
      ctx.lineTo(-6, -4);
      ctx.closePath();
      ctx.stroke();
    } else {
      // Rayo ⚡
      ctx.beginPath();
      ctx.moveTo( 2, -7);
      ctx.lineTo(-3,  1);
      ctx.lineTo(-1,  1);
      ctx.lineTo(-2,  7);
      ctx.lineTo( 3, -1);
      ctx.lineTo( 1, -1);
      ctx.closePath();
      ctx.stroke();
    }

    ctx.restore();
  }
}

// ── Estado del juego ──────────────────────────────────────────────────────────
let ship, bullets, asteroids, particles, powerUps, fugaces;
let score, lives, level;
let state;      // 'playing' | 'dead' | 'gameover'
let deadTimer;
let fugazTimer; // cuenta atrás para la próxima estrella fugaz

function spawnAsteroids(count) {
  const SAFE_DIST = 130;
  for (let i = 0; i < count; i++) {
    let x, y;
    do {
      x = rand(0, W);
      y = rand(0, H);
    } while (Math.hypot(x - W / 2, y - H / 2) < SAFE_DIST);
    asteroids.push(new Asteroid(x, y, 3));
  }
}

function initGame() {
  ship          = new Ship();
  bullets   = [];
  asteroids = [];
  particles = [];
  powerUps  = [];
  fugaces   = [];
  score  = 0;
  lives  = 3;
  level  = 1;
  state  = 'playing';
  fugazTimer = rand(8, 12);   // la primera fugaz no tarda demasiado
  spawnAsteroids(4);
}

function nextLevel() {
  level++;
  bullets   = [];
  particles = [];
  powerUps  = [];
  fugaces   = [];
  fugazTimer = rand(10, 16);
  ship.reset();
  spawnAsteroids(3 + level);
}

function explode(x, y, count = 8) {
  for (let i = 0; i < count; i++) particles.push(new Particle(x, y));
}

// Destruye un asteroide: puntos, explosión, fragmentos y posible power-up.
// Lo comparten las balas y el escudo.
function destroyAsteroid(a) {
  a.dead = true;
  score += POINTS[a.size];
  explode(a.x, a.y, a.size * 5);
  // 12% de soltar un power-up de velocidad; 10% adicional (sobre el resto), un escudo
  if (Math.random() < 0.12)      powerUps.push(new PowerUp(a.x, a.y, 'speed'));
  else if (Math.random() < 0.10) powerUps.push(new PowerUp(a.x, a.y, 'shield'));
  return a.split();
}

function killShip() {
  explode(ship.x, ship.y, 14);
  ship.dead = true;
  lives--;
  if (lives <= 0) {
    state = 'gameover';
  } else {
    state     = 'dead';
    deadTimer = 2;
  }
}

// ── Update ────────────────────────────────────────────────────────────────────
function update(dt) {
  // Cambio de skin con S (disponible en cualquier estado del juego)
  if (skinMsgTimer > 0) skinMsgTimer -= dt;
  if (pressed('KeyS')) {
    skinIndex = (skinIndex + 1) % SKINS.length;
    skinMsgTimer = 1.5;
    saveSkin();
  }

  if (state === 'gameover') {
    if (pressed('Space')) initGame();
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    fugaces.forEach(f => f.update(dt));
    fugaces = fugaces.filter(f => !f.dead);
    return;
  }

  if (state === 'dead') {
    deadTimer -= dt;
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    asteroids.forEach(a => a.update(dt));
    fugaces.forEach(f => f.update(dt));
    fugaces = fugaces.filter(f => !f.dead);
    if (deadTimer <= 0) { state = 'playing'; ship.reset(); }
    return;
  }

  // Activar disparo triple con T (5 s; pulsar de nuevo refresca el temporizador)
  if (pressed('KeyT')) ship.tripleTimer = TRIPLE_DUR;

  // Disparar
  if (pressed('Space')) {
    bullets.push(...ship.tryShoot());
  }

  ship.update(dt);
  bullets.forEach(b => b.update(dt));
  asteroids.forEach(a => a.update(dt));
  particles.forEach(p => p.update(dt));
  powerUps.forEach(p => p.update(dt));
  fugaces.forEach(f => f.update(dt));

  bullets   = bullets.filter(b => !b.dead);
  particles = particles.filter(p => !p.dead);
  powerUps  = powerUps.filter(p => !p.dead);
  fugaces   = fugaces.filter(f => !f.dead);

  // Aparición aleatoria de la estrella fugaz
  fugazTimer -= dt;
  if (fugazTimer <= 0) {
    fugaces.push(new EstrellaFugaz());
    fugazTimer = rand(10, 16);
  }

  // Bala vs asteroide
  const newAsteroids = [];
  for (const b of bullets) {
    for (const a of asteroids) {
      if (!a.dead && !b.dead && dist(b, a) < a.radius) {
        b.dead = true;
        newAsteroids.push(...destroyAsteroid(a));
      }
    }
  }
  asteroids = asteroids.filter(a => !a.dead).concat(newAsteroids);
  bullets   = bullets.filter(b => !b.dead);

  // Bala vs estrella fugaz
  for (const b of bullets) {
    for (const f of fugaces) {
      if (!f.dead && !b.dead && dist(b, f) < f.radius) {
        b.dead = true;
        f.dead = true;
        score += FUGAZ_POINTS;
        explode(f.x, f.y, 16);
      }
    }
  }
  bullets = bullets.filter(b => !b.dead);

  // Nave vs power-up (velocidad o escudo)
  for (const p of powerUps) {
    if (dist(ship, p) < ship.radius + p.radius) {
      p.dead = true;
      if (p.kind === 'shield') ship.shieldTimer = SHIELD_DUR;
      else                     ship.speedTimer = SPEEDUP_DUR;
    }
  }
  powerUps = powerUps.filter(p => !p.dead);

  // Nave vs asteroide: con el escudo activo, el asteroide explota al tocar el campo
  if (ship.invincible <= 0) {
    if (ship.shieldTimer > 0) {
      const frags = [];
      for (const a of asteroids) {
        if (!a.dead && dist(ship, a) < SHIELD_RADIUS + a.radius * 0.82)
          frags.push(...destroyAsteroid(a));
      }
      asteroids = asteroids.filter(a => !a.dead).concat(frags);
    } else {
      for (const a of asteroids) {
        if (dist(ship, a) < ship.radius + a.radius * 0.82) {
          killShip();
          break;
        }
      }
    }
  }

  // Nave vs estrella fugaz: el escudo la destruye y suma sus puntos
  if (ship.invincible <= 0 && state === 'playing') {
    for (const f of fugaces) {
      const radio = ship.shieldTimer > 0 ? SHIELD_RADIUS : ship.radius;
      if (!f.dead && dist(ship, f) < radio + f.radius * 0.8) {
        if (ship.shieldTimer > 0) {
          f.dead = true;
          score += FUGAZ_POINTS;
          explode(f.x, f.y, 16);
        } else {
          killShip();
          break;
        }
      }
    }
  }

  // Nivel completado (las estrellas fugaces no bloquean el avance)
  if (asteroids.length === 0 && state === 'playing') nextLevel();
}

// ── Draw ──────────────────────────────────────────────────────────────────────
function drawLifeIcon(x, y) {
  // Misma silueta de la skin actual, reducida para el HUD
  const skin = SKINS[skinIndex];
  const s = 0.45;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-Math.PI / 2);
  ctx.strokeStyle = skin.stroke;
  ctx.lineWidth   = 1.2;
  ctx.lineJoin    = 'round';
  ctx.beginPath();
  ctx.moveTo(skin.cuerpo[0][0] * s, skin.cuerpo[0][1] * s);
  for (let i = 1; i < skin.cuerpo.length; i++)
    ctx.lineTo(skin.cuerpo[i][0] * s, skin.cuerpo[i][1] * s);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawHUD() {
  ctx.fillStyle = '#fff';
  ctx.font = '15px monospace';

  ctx.textAlign = 'left';
  ctx.fillText(`SCORE  ${score}`, 14, 26);

  ctx.textAlign = 'center';
  ctx.fillText(`NIVEL ${level}`, W / 2, 26);

  for (let i = 0; i < lives; i++)
    drawLifeIcon(W - 16 - i * 22, 18);

  // Barras de tiempo restante de los efectos activos (apiladas si coinciden)
  let barY = 46;
  if (!ship.dead && ship.speedTimer > 0) {
    const w = 100 * (ship.speedTimer / SPEEDUP_DUR);
    ctx.fillStyle = '#0ff';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('VELOCIDAD', 14, barY);
    ctx.fillRect(14, barY + 6, w, 4);
    barY += 20;
  }

  if (!ship.dead && ship.tripleTimer > 0) {
    const w = 100 * (ship.tripleTimer / TRIPLE_DUR);
    ctx.fillStyle = '#ff0';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('TRIPLE', 14, barY);
    ctx.fillRect(14, barY + 6, w, 4);
    barY += 20;
  }

  // Barra de tiempo restante del escudo
  if (!ship.dead && ship.shieldTimer > 0) {
    const w = 100 * (ship.shieldTimer / SHIELD_DUR);
    ctx.fillStyle = '#0f0';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('ESCUDO', 14, barY);
    ctx.fillRect(14, barY + 6, w, 4);
    barY += 20;
  }

}

// Aviso temporal al cambiar de skin
function drawSkinMsg() {
  if (skinMsgTimer <= 0) return;
  ctx.globalAlpha = Math.min(1, skinMsgTimer / 0.4);   // se desvanece al final
  ctx.textAlign = 'center';
  ctx.fillStyle = SKINS[skinIndex].stroke;
  ctx.font = '18px monospace';
  ctx.fillText(`NAVE: ${SKINS[skinIndex].nombre}`, W / 2, 60);
  ctx.globalAlpha = 1;
}

function drawOverlay(title, sub) {
  ctx.textAlign   = 'center';
  ctx.fillStyle   = '#fff';
  ctx.font        = 'bold 46px monospace';
  ctx.fillText(title, W / 2, H / 2 - 18);
  ctx.font        = '18px monospace';
  ctx.fillStyle   = 'rgba(255,255,255,0.65)';
  ctx.fillText(sub, W / 2, H / 2 + 22);
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  particles.forEach(p => p.draw());
  asteroids.forEach(a => a.draw());
  fugaces.forEach(f => f.draw());
  bullets.forEach(b => b.draw());
  powerUps.forEach(p => p.draw());
  ship.draw();

  drawHUD();
  drawSkinMsg();

  if (state === 'gameover')
    drawOverlay('GAME OVER', `PUNTAJE: ${score}   —   ESPACIO PARA REINICIAR   ·   S: CAMBIAR NAVE`);
}

// ── Loop principal ────────────────────────────────────────────────────────────
let lastTime = null;

function loop(ts) {
  const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

initGame();
requestAnimationFrame(loop);
