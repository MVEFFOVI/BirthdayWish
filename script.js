
const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");

const celebration = document.getElementById("celebration");
const greeting = document.getElementById("greeting");

let particles = [];
let confetti = [];
let animationId;
let running = false;
let startTime = 0;
let lastExplosion = 0;
let transitionTimeout;
let finishTimeout;

// Délka úvodní animace v milisekundách
const CELEBRATION_DURATION = 6000;

// Přizpůsobení velikosti obrazovky
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Náhodné číslo
function random(min, max) {
  return Math.random() * (max - min) + min;
}

// Jednotlivá částice ohňostroje
class Particle {
  constructor(x, y, color, angle, speed) {
    this.x = x;
    this.y = y;
    this.color = color;

    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    this.alpha = 1;
    this.decay = random(0.008, 0.018);
    this.gravity = 0.045;
    this.friction = 0.985;
    this.radius = random(1.2, 3);
  }

  update() {
    this.vx *= this.friction;
    this.vy *= this.friction;

    this.vy += this.gravity;

    this.x += this.vx;
    this.y += this.vy;

    this.alpha -= this.decay;
  }

  draw() {
    ctx.save();

    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 12;
    ctx.shadowColor = this.color;

    ctx.beginPath();
    ctx.arc(
      this.x,
      this.y,
      this.radius,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.restore();
  }
}

// Vytvoření výbuchu ohňostroje
function createExplosion(x, y) {
  const colors = [
    "#D4AF37",
    "#E83E67",
    "#0088CC",
    "#8050C8",
    "#E69A00",
    "#24A65A",
    "#B8860B"
  ];

  const color = colors[
    Math.floor(Math.random() * colors.length)
  ];

  const count = 110;

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = random(1.5, 6);

    particles.push(
      new Particle(x, y, color, angle, speed)
    );
  }

  // Zlaté jiskry kolem výbuchu
  for (let i = 0; i < 35; i++) {
    particles.push(
      new Particle(
        x,
        y,
        "#C99725",
        random(0, Math.PI * 2),
        random(1, 4)
      )
    );
  }
}

// Jednotlivé konfety
class Confetti {
  constructor() {
    this.reset();
    this.y = random(-canvas.height, 0);
  }

  reset() {
    this.x = random(0, canvas.width);
    this.y = random(-150, -20);

    this.width = random(4, 9);
    this.height = random(7, 15);

    this.speed = random(1, 3);
    this.rotation = random(0, Math.PI * 2);
    this.rotationSpeed = random(-0.06, 0.06);
    this.swing = random(0, Math.PI * 2);

    const colors = [
      "#D4AF37",
      "#E83E67",
      "#0088CC",
      "#8050C8",
      "#E69A00",
      "#24A65A"
    ];

    this.color = colors[
      Math.floor(Math.random() * colors.length)
    ];
  }

  update() {
    this.y += this.speed;
    this.swing += 0.025;
    this.x += Math.sin(this.swing) * 0.7;
    this.rotation += this.rotationSpeed;

    if (this.y > canvas.height + 20) {
      this.reset();
    }
  }

  draw() {
    ctx.save();

    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    ctx.fillStyle = this.color;
    ctx.fillRect(
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );

    ctx.restore();
  }
}

// Vytvoření konfet
function createConfetti() {
  confetti = [];

  for (let i = 0; i < 130; i++) {
    confetti.push(new Confetti());
  }
}

// Hlavní animační smyčka
function animate(timestamp) {
  if (!running) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const elapsed = timestamp - startTime;

  // Pravidelné výbuchy ohňostrojů
  if (
    elapsed < CELEBRATION_DURATION &&
    timestamp - lastExplosion > 380
  ) {
    createExplosion(
      random(canvas.width * 0.15, canvas.width * 0.85),
      random(canvas.height * 0.12, canvas.height * 0.65)
    );

    lastExplosion = timestamp;
  }

  // Aktualizace částic
  particles = particles.filter(p => p.alpha > 0);

  particles.forEach(p => {
    p.update();
    p.draw();
  });

  // Aktualizace konfet
  confetti.forEach(c => {
    c.update();
    c.draw();
  });

  animationId = requestAnimationFrame(animate);
}

// Spuštění celého překvapení
function startAnimation() {
  clearTimeout(transitionTimeout);
  clearTimeout(finishTimeout);
  cancelAnimationFrame(animationId);

  particles = [];
  confetti = [];

  resizeCanvas();
  createConfetti();

  celebration.style.display = "block";
  celebration.classList.remove("fade-out");
  greeting.classList.remove("visible");

  running = true;
  startTime = performance.now();
  lastExplosion = 0;

  // První ohňostroje ihned po otevření
  for (let i = 0; i < 4; i++) {
    createExplosion(
      random(canvas.width * 0.15, canvas.width * 0.85),
      random(canvas.height * 0.15, canvas.height * 0.65)
    );
  }

  animationId = requestAnimationFrame(animate);

  // Přechod na narozeninové přání
  transitionTimeout = setTimeout(() => {
    greeting.classList.add("visible");
    celebration.classList.add("fade-out");
  }, CELEBRATION_DURATION);

  // Ukončení animace ohňostroje
  finishTimeout = setTimeout(() => {
    running = false;
    cancelAnimationFrame(animationId);
    celebration.style.display = "none";
  }, CELEBRATION_DURATION + 2200);
}

// Opětovné přehrání
function restartAnimation() {
  startAnimation();
}

// Automatické spuštění po načtení
window.addEventListener("load", startAnimation);
