const T = {
  ru: {
    play: 'Играть',
    daily: 'Испытание дня',
    rules: 'Как играть',
    best: 'Рекорд',
    throws: 'Броски',
    score: 'Счёт',
    power: 'Сила броска',
    aim: 'Наведи и бросай',
    throw: 'БРОСИТЬ САҚА',
    hit: 'Попадание!',
    miss: 'Промах',
    win: 'Жеңіс! Ты выбил 8 асыков.',
    lose: 'Раунд завершён',
    again: 'Играть ещё',
    home: 'Главная',
    trad: 'Правила цифровой версии',
    author: 'Авторские дополнения',
    language: 'Язык'
  },
  kz: {
    play: 'Ойнау',
    daily: 'Күн сынағы',
    rules: 'Қалай ойнайды',
    best: 'Рекорд',
    throws: 'Лақтыру',
    score: 'Ұпай',
    power: 'Лақтыру күші',
    aim: 'Нысананы көзде де лақтыр',
    throw: 'САҚАНЫ ЛАҚТЫР',
    hit: 'Тиді!',
    miss: 'Мүлт кетті',
    win: 'Жеңіс! 8 асық ұрылды.',
    lose: 'Ойын аяқталды',
    again: 'Қайта ойнау',
    home: 'Басты бет',
    trad: 'Цифрлық ойын ережелері',
    author: 'Авторлық толықтырулар',
    language: 'Тіл'
  },
  en: {
    play: 'Play',
    daily: 'Daily Challenge',
    rules: 'How to play',
    best: 'Best',
    throws: 'Throws',
    score: 'Score',
    power: 'Throw power',
    aim: 'Aim and throw',
    throw: 'THROW SAQA',
    hit: 'Hit!',
    miss: 'Miss',
    win: 'Жеңіс! You knocked out 8 asyks.',
    lose: 'Round over',
    again: 'Play again',
    home: 'Home',
    trad: 'Digital rules',
    author: 'Original additions',
    language: 'Language'
  }
};

let lang = localStorage.getItem('saqa-lang') || 'ru';
let mode = 'classic';

const canvas = document.querySelector('#gameCanvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.querySelector('#score');
const throwsEl = document.querySelector('#throws');
const powerEl = document.querySelector('#power');
const messageEl = document.querySelector('#message');

const throwBtn = document.querySelector('#throwBtn');
const againBtn = document.querySelector('#againBtn');

let W = 900;
let H = 520;

let aimX = W / 2;
let aimY = H / 2;

let power = 65;
let throwing = false;
let gameOver = false;

let score = 0;
let throws = 0;

const MAX_THROWS = 15;
const WIN_SCORE = 8;

let saqa = {
  x: 110,
  y: H / 2,
  r: 15,
  vx: 0,
  vy: 0,
  active: true
};

let asyks = [];

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();

  const ratio = window.devicePixelRatio || 1;

  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;

  W = rect.width;
  H = rect.height;

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  if (!throwing) {
    saqa.x = 90;
    saqa.y = H / 2;
  }

  createAsyks();
}

function createAsyks() {
  asyks = [];

  const centerX = W * 0.63;
  const centerY = H / 2;

  const positions = [];

  if (mode === 'daily') {
    const pattern = [
      [-75, -55],
      [0, -65],
      [75, -50],
      [-45, 0],
      [45, -5],
      [-90, 50],
      [0, 55],
      [90, 45],
      [-15, 110],
      [65, 105],
      [-110, -100],
      [115, -110],
      [-130, 10],
      [130, 15],
      [0, 0]
    ];

    pattern.forEach(([x, y]) => {
      positions.push({
        x: centerX + x,
        y: centerY + y
      });
    });
  } else {
    const rows = [
      { count: 5, y: -75 },
      { count: 5, y: 0 },
      { count: 5, y: 75 }
    ];

    rows.forEach(row => {
      const spacing = 48;
      const start = -(row.count - 1) * spacing / 2;

      for (let i = 0; i < row.count; i++) {
        positions.push({
          x: centerX + start + i * spacing,
          y: centerY + row.y
        });
      }
    });
  }

  asyks = positions.map((p, i) => ({
    id: i,
    x: p.x,
    y: p.y,
    r: 15,
    hit: false,
    rotation: Math.random() * Math.PI * 2,
    vx: 0,
    vy: 0
  }));
}

function resetGame() {
  score = 0;
  throws = 0;
  gameOver = false;
  throwing = false;

  messageEl.textContent = T[lang].aim;

  saqa = {
    x: 90,
    y: H / 2,
    r: 15,
    vx: 0,
    vy: 0,
    active: true
  };

  createAsyks();
  updateUI();
}

function updateUI() {
  if (scoreEl) scoreEl.textContent = score;
  if (throwsEl) throwsEl.textContent = `${throws}/${MAX_THROWS}`;
  if (powerEl) powerEl.textContent = `${Math.round(power)}%`;
}

function drawBackground() {
  ctx.clearRect(0, 0, W, H);

  // Summer yard
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#dcefd8');
  sky.addColorStop(1, '#b9d79f');

  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Sun
  ctx.beginPath();
  ctx.arc(W - 70, 65, 32, 0, Math.PI * 2);
  ctx.fillStyle = '#f7d77a';
  ctx.fill();

  // Ground
  ctx.fillStyle = '#cda875';
  ctx.fillRect(0, H * 0.33, W, H * 0.67);

  // Grass details
  ctx.strokeStyle = 'rgba(68,100,45,.25)';
  ctx.lineWidth = 2;

  for (let i = 0; i < 90; i++) {
    const x = Math.random() * W;
    const y = H * 0.35 + Math.random() * H * 0.62;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 2, y - 5);
    ctx.stroke();
  }

  // Playing area
  ctx.fillStyle = 'rgba(104,72,42,.15)';
  ctx.beginPath();
  ctx.ellipse(W * 0.64, H / 2, W * 0.29, H * 0.34, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(88,61,39,.45)';
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.ellipse(W * 0.64, H / 2, W * 0.29, H * 0.34, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Throw line
  ctx.strokeStyle = '#fff5dc';
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.moveTo(70, H * 0.22);
  ctx.lineTo(70, H * 0.78);
  ctx.stroke();

  ctx.font = 'bold 12px sans-serif';
  ctx.fillStyle = 'rgba(70,45,25,.6)';
  ctx.fillText('6 м', 48, H * 0.5);
}

function drawAsyk(a) {
  if (a.hit) return;

  ctx.save();

  ctx.translate(a.x, a.y);
  ctx.rotate(a.rotation);

  // shadow
  ctx.fillStyle = 'rgba(0,0,0,.18)';
  ctx.beginPath();
  ctx.ellipse(3, 5, a.r * 1.15, a.r * .65, 0, 0, Math.PI * 2);
  ctx.fill();

  // asyk body
  ctx.fillStyle = '#eee0bd';
  ctx.strokeStyle = '#6b5138';
  ctx.lineWidth = 2;

  ctx.beginPath();

  ctx.moveTo(-10, -5);
  ctx.quadraticCurveTo(-16, -13, -7, -17);
  ctx.quadraticCurveTo(0, -19, 5, -12);
  ctx.quadraticCurveTo(14, -10, 13, 0);
  ctx.quadraticCurveTo(14, 9, 5, 13);
  ctx.quadraticCurveTo(-4, 17, -10, 9);
  ctx.quadraticCurveTo(-15, 2, -10, -5);

  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = 'rgba(100,70,45,.25)';
  ctx.beginPath();
  ctx.arc(-3, -5, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawSaqa() {
  if (!saqa.active) return;

  ctx.save();

  ctx.translate(saqa.x, saqa.y);

  ctx.fillStyle = 'rgba(0,0,0,.25)';
  ctx.beginPath();
  ctx.ellipse(5, 7, 18, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#3e2b21';
  ctx.strokeStyle = '#201711';
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.ellipse(0, 0, 18, 14, -0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#9a7047';

  ctx.beginPath();
  ctx.ellipse(-5, -3, 8, 5, -0.25, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawAim() {
  if (throwing || gameOver) return;

  ctx.save();

  ctx.strokeStyle = 'rgba(255,248,224,.8)';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(aimX, aimY, 18, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(aimX - 28, aimY);
  ctx.lineTo(aimX - 8, aimY);

  ctx.moveTo(aimX + 8, aimY);
  ctx.lineTo(aimX + 28, aimY);

  ctx.moveTo(aimX, aimY - 28);
  ctx.lineTo(aimX, aimY - 8);

  ctx.moveTo(aimX, aimY + 8);
  ctx.lineTo(aimX, aimY + 28);

  ctx.stroke();

  ctx.restore();
}

function render() {
  drawBackground();

  asyks.forEach(drawAsyk);

  drawSaqa();
  drawAim();
}

function throwSaqa() {
  if (throwing || gameOver) return;

  if (throws >= MAX_THROWS) {
    finishGame();
    return;
  }

  throwing = true;
  throws++;

  const dx = aimX - saqa.x;
  const dy = aimY - saqa.y;

  const length = Math.sqrt(dx * dx + dy * dy) || 1;

  const normalizedX = dx / length;
  const normalizedY = dy / length;

  const speed = 7 + power * 0.13;

  saqa.vx = normalizedX * speed;
  saqa.vy = normalizedY * speed;

  saqa.active = true;

  messageEl.textContent = '';

  updateUI();
}

function updatePhysics() {
  if (!throwing) return;

  saqa.x += saqa.vx;
  saqa.y += saqa.vy;

  saqa.vx *= 0.985;
  saqa.vy *= 0.985;

  // collision with asyks
  let hitSomething = false;

  asyks.forEach(a => {
    if (a.hit) return;

    const dx = saqa.x - a.x;
    const dy = saqa.y - a.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < saqa.r + a.r + 4) {
      a.hit = true;

      const angle = Math.atan2(dy, dx);

      a.vx = Math.cos(angle) * 4;
      a.vy = Math.sin(angle) * 4;

      score++;
      hitSomething = true;

      // small impulse to nearby asyks
      asyks.forEach(other => {
        if (other.hit || other === a) return;

        const ox = other.x - a.x;
        const oy = other.y - a.y;
        const od = Math.sqrt(ox * ox + oy * oy);

        if (od < 65) {
          other.x += ox / Math.max(od, 1) * 8;
          other.y += oy / Math.max(od, 1) * 8;
        }
      });
    }
  });

  asyks.forEach(a => {
    if (a.hit) {
      a.x += a.vx;
      a.y += a.vy;
      a.vx *= 0.94;
      a.vy *= 0.94;
      a.rotation += 0.06;
    }
  });

  // Slow down
  const velocity = Math.sqrt(
    saqa.vx * saqa.vx +
    saqa.vy * saqa.vy
  );

  if (
    velocity < 0.55 ||
    saqa.x > W + 50 ||
    saqa.x < -50 ||
    saqa.y > H + 50 ||
    saqa.y < -50
  ) {
    throwing = false;

    saqa.x = 90;
    saqa.y = H / 2;
    saqa.vx = 0;
    saqa.vy = 0;

    if (hitSomething) {
      messageEl.textContent = T[lang].hit;
    } else {
      messageEl.textContent = T[lang].miss;
    }

    if (score >= WIN_SCORE || throws >= MAX_THROWS) {
      finishGame();
    }

    updateUI();
  }
}

function finishGame() {
  gameOver = true;
  throwing = false;

  if (score >= WIN_SCORE) {
    messageEl.textContent = T[lang].win;

    const best = Number(localStorage.getItem('saqa-best') || 0);

    if (score > best) {
      localStorage.setItem('saqa-best', score);
    }
  } else {
    messageEl.textContent = `${T[lang].lose}: ${score} / ${WIN_SCORE}`;
  }

  updateBest();
}

function updateBest() {
  const best = Number(localStorage.getItem('saqa-best') || 0);

  const bestEl = document.querySelector('#best');

  if (bestEl) {
    bestEl.textContent = best;
  }
}

function setAimFromPointer(event) {
  const rect = canvas.getBoundingClientRect();

  let clientX;
  let clientY;

  if (event.touches && event.touches.length) {
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  } else {
    clientX = event.clientX;
    clientY = event.clientY;
  }

  aimX = clientX - rect.left;
  aimY = clientY - rect.top;

  aimX = Math.max(20, Math.min(W - 20, aimX));
  aimY = Math.max(20, Math.min(H - 20, aimY));
}

canvas.addEventListener('mousemove', setAimFromPointer);

canvas.addEventListener(
  'touchmove',
  event => {
    event.preventDefault();
    setAimFromPointer(event);
  },
  { passive: false }
);

canvas.addEventListener('click', event => {
  setAimFromPointer(event);
});

throwBtn?.addEventListener('click', throwSaqa);

againBtn?.addEventListener('click', resetGame);

const powerRange = document.querySelector('#powerRange');

powerRange?.addEventListener('input', event => {
  power = Number(event.target.value);
  updateUI();
});

document.querySelectorAll('[data-lang]').forEach(button => {
  button.addEventListener('click', () => {
    lang = button.dataset.lang;

    localStorage.setItem('saqa-lang', lang);

    updateTexts();
  });
});

document.querySelectorAll('[data-mode]').forEach(button => {
  button.addEventListener('click', () => {
    mode = button.dataset.mode;

    resetGame();

    document
      .querySelectorAll('[data-mode]')
      .forEach(b => b.classList.remove('active'));

    button.classList.add('active');
  });
});

function updateTexts() {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.dataset.i18n;

    if (T[lang][key]) {
      element.textContent = T[lang][key];
    }
  });

  if (!throwing && !gameOver) {
    messageEl.textContent = T[lang].aim;
  }

  updateUI();
  updateBest();
}

function gameLoop() {
  updatePhysics();
  render();

  requestAnimationFrame(gameLoop);
}

window.addEventListener('resize', resizeCanvas);

resizeCanvas();
updateTexts();
updateBest();
gameLoop();
