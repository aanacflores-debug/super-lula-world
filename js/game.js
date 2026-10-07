/* ============================================================================
 * SUPER LULA WORLD — motor do jogo (HTML5 Canvas)
 * Plataforma 2D: andar, pular, derrotar perrengues, coletar votos e bons feitos.
 * Sem dependências. Dados em js/levels.js (window.SLW_DATA).
 * ==========================================================================*/
(function () {
"use strict";

const { BONS_FEITOS, LEVELS } = window.SLW_DATA;

/* ----------------------------- Constantes ------------------------------- */
const TS = 48;                 // tamanho do tile (px)
const VIEW_W = 912;            // largura lógica do canvas
const VIEW_H = 528;            // altura lógica do canvas (== altura do mundo)
const ROWS = 11;

const GRAVITY   = 0.72;
const MAX_FALL  = 16;
const MOVE_ACC  = 0.95;
const MOVE_MAX  = 5.2;
const AIR_ACC   = 0.6;
const FRICTION  = 0.78;
const JUMP_VEL  = -13.4;
const JUMP_CUT  = 0.45;
const COYOTE    = 6;           // frames
const JUMP_BUF  = 7;           // frames
const ENEMY_SPD = 1.25;
const STOMP_VY  = -9.5;
const INVULN    = 70;          // frames de invencibilidade após dano

const SOLID = new Set(["G", "B", "=", "?", "Q"]);

/* ----------------------------- Canvas ----------------------------------- */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = true;

/* ----------------------------- Estado ----------------------------------- */
const State = { MENU: "menu", HELP: "help", PLAY: "play", FEITO: "feito",
                FASE: "fase", OVER: "over", WIN: "win" };
let state = State.MENU;

let levelIndex = 0;
let grid = [];                 // matriz de chars
let levelCols = 0;
let levelPxW = 0;
let spikes = [];               // {x,y,w,h}
let coins = [];                // {x,y,taken,phase}
let stars = [];                // {x,y,taken,deed,phase}
let enemies = [];              // {x,y,w,h,vx,alive,t,sx,sy}
let flag = { x: 0, y: 0 };
let startPos = { x: 0, y: 0 };
let particles = [];

let player = null;
let cam = { x: 0 };

let votos = 0;
let vidas = 3;
const collectedDeeds = new Set(); // índices já desbloqueados (persistem no jogo)
let deedCursor = 0;               // próximo índice de BONS_FEITOS a atribuir
let deedTarget = BONS_FEITOS.length; // quantos bons feitos dá pra reunir no total

/* Conta quantas estrelas 'S' existem em todas as fases (cap no nº de feitos). */
function computeDeedTarget() {
  let n = 0;
  LEVELS.forEach((lv) => lv.rows.forEach((r) => { for (const ch of r) if (ch === "S") n++; }));
  deedTarget = Math.min(n, BONS_FEITOS.length);
}

let deathTimer = 0;            // >0 durante animação de queda/morte
let winFlashT = 0;

/* ----------------------------- Input ------------------------------------ */
const keys = { left: false, right: false, jump: false };
let jumpHeld = false;
let jumpBuffer = 0;
let coyote = 0;

function setKey(k, down) {
  if (k === "jump") {
    if (down && !jumpHeld) jumpBuffer = JUMP_BUF;
    if (!down) jumpReleasedFlag = true;
    jumpHeld = down;
    keys.jump = down;
  } else {
    keys[k] = down;
  }
}
let jumpReleasedFlag = false;

const KEYMAP = {
  ArrowLeft: "left", KeyA: "left",
  ArrowRight: "right", KeyD: "right",
  ArrowUp: "jump", KeyW: "jump", Space: "jump", KeyZ: "jump",
};

window.addEventListener("keydown", (e) => {
  const k = KEYMAP[e.code];
  if (k) { e.preventDefault(); setKey(k, true); }
  if (e.code === "Enter") primaryAction();
});
window.addEventListener("keyup", (e) => {
  const k = KEYMAP[e.code];
  if (k) { e.preventDefault(); setKey(k, false); }
});

/* Botões touch */
document.querySelectorAll(".tbtn").forEach((btn) => {
  const k = btn.dataset.key;
  const press = (e) => { e.preventDefault(); setKey(k, true); };
  const release = (e) => { e.preventDefault(); setKey(k, false); };
  btn.addEventListener("pointerdown", press);
  btn.addEventListener("pointerup", release);
  btn.addEventListener("pointercancel", release);
  btn.addEventListener("pointerleave", release);
});

/* Mostra controles touch em dispositivos de toque */
if (window.matchMedia("(hover:none) and (pointer:coarse)").matches) {
  document.getElementById("touch-controls").classList.remove("hidden");
}

/* ----------------------------- Áudio ------------------------------------ */
let actx = null;
function audio() {
  if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
  return actx;
}
function beep(freq, dur, type, vol) {
  const a = audio(); if (!a) return;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type || "square";
  o.frequency.value = freq;
  g.gain.value = vol || 0.08;
  o.connect(g); g.connect(a.destination);
  const t = a.currentTime;
  g.gain.setValueAtTime(g.gain.value, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.start(t); o.stop(t + dur);
}
function sfx(name) {
  switch (name) {
    case "jump":  beep(520, 0.12, "square", 0.07); break;
    case "coin":  beep(880, 0.07, "square", 0.06); setTimeout(() => beep(1175, 0.08, "square", 0.06), 60); break;
    case "stomp": beep(300, 0.09, "sawtooth", 0.08); break;
    case "feito": [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(f, 0.14, "triangle", 0.08), i * 90)); break;
    case "hurt":  beep(200, 0.25, "sawtooth", 0.09); break;
    case "clear": [523, 659, 784, 1046, 1318].forEach((f, i) => setTimeout(() => beep(f, 0.16, "triangle", 0.08), i * 110)); break;
    case "block": beep(420, 0.06, "square", 0.06); break;
  }
}

/* ----------------------------- Carregar fase ---------------------------- */
function loadLevel(idx) {
  const def = LEVELS[idx];
  const raw = def.rows.slice();
  // normaliza larguras
  let maxLen = 0;
  raw.forEach((r) => (maxLen = Math.max(maxLen, r.length)));
  const rows = raw.map((r) => r.padEnd(maxLen, " "));

  levelCols = maxLen;
  levelPxW = maxLen * TS;
  grid = [];
  spikes = []; coins = []; stars = []; enemies = [];
  particles = [];

  for (let r = 0; r < ROWS; r++) {
    const line = rows[r] || "";
    const gridRow = [];
    for (let c = 0; c < maxLen; c++) {
      const ch = line[c] || " ";
      const px = c * TS, py = r * TS;
      switch (ch) {
        case "P":
          startPos = { x: px + 7, y: py + 4 };
          gridRow.push(" ");
          break;
        case "o":
          coins.push({ x: px + TS / 2, y: py + TS / 2, taken: false, phase: Math.random() * 6.28 });
          gridRow.push(" ");
          break;
        case "S": {
          // atribui um bom feito distinto enquanto houver; estrelas extras viram bônus
          const deed = deedCursor < BONS_FEITOS.length ? deedCursor : null;
          stars.push({ x: px + TS / 2, y: py + TS / 2, taken: false, deed, phase: Math.random() * 6.28 });
          deedCursor++;
          gridRow.push(" ");
          break;
        }
        case "E":
          enemies.push({ x: px + 8, y: py + 8, w: TS - 16, h: TS - 10,
                         vx: -ENEMY_SPD, alive: true, t: 0, sx: px + 8, sy: py + 8 });
          gridRow.push(" ");
          break;
        case "^":
          spikes.push({ x: px + 6, y: py + TS - 20, w: TS - 12, h: 20 });
          gridRow.push(" ");
          break;
        case "F":
          flag = { x: px + TS / 2, y: py };
          gridRow.push(" ");
          break;
        default:
          gridRow.push(ch);
      }
    }
    grid.push(gridRow);
  }

  resetPlayerAndEnemies();
  cam.x = 0;
  deathTimer = 0;

  document.getElementById("hud-fase").textContent = "Fase " + (idx + 1);
  document.getElementById("hud-feitos-total").textContent = deedTarget;
  updateHUD();
}

function resetPlayerAndEnemies() {
  player = {
    x: startPos.x, y: startPos.y, w: 30, h: 44,
    vx: 0, vy: 0, onGround: false, facing: 1,
    t: 0, invuln: 0, alive: true,
  };
  enemies.forEach((e) => { e.x = e.sx; e.y = e.sy; e.vx = -ENEMY_SPD; e.alive = true; });
  jumpBuffer = 0; coyote = 0; jumpHeld = false;
}

/* ----------------------------- Colisão ---------------------------------- */
function tileAt(c, r) {
  if (r < 0 || r >= ROWS || c < 0 || c >= levelCols) return "G"; // fora = parede (teto/laterais); fundo tratado como queda
  return grid[r][c];
}
function isSolidCell(c, r) {
  if (c < 0 || c >= levelCols) return true;     // paredes laterais
  if (r < 0) return false;                      // céu: deixa subir e sair? não — teto é passável aqui
  if (r >= ROWS) return false;                  // abaixo do mundo = buraco
  return SOLID.has(grid[r][c]);
}

/* Resolve colisão do jogador contra tiles sólidos, eixo a eixo. */
function moveAndCollide(ent) {
  // --- eixo X ---
  ent.x += ent.vx;
  let left = Math.floor(ent.x / TS);
  let right = Math.floor((ent.x + ent.w) / TS);
  let top = Math.floor(ent.y / TS);
  let bottom = Math.floor((ent.y + ent.h - 1) / TS);
  if (ent.vx > 0) {
    for (let r = top; r <= bottom; r++) {
      if (isSolidCell(right, r)) { ent.x = right * TS - ent.w - 0.01; ent.vx = 0; break; }
    }
  } else if (ent.vx < 0) {
    for (let r = top; r <= bottom; r++) {
      if (isSolidCell(left, r)) { ent.x = (left + 1) * TS + 0.01; ent.vx = 0; break; }
    }
  }

  // --- eixo Y ---
  ent.y += ent.vy;
  ent.onGround = false;
  left = Math.floor(ent.x / TS);
  right = Math.floor((ent.x + ent.w - 1) / TS);
  top = Math.floor(ent.y / TS);
  bottom = Math.floor((ent.y + ent.h) / TS);
  if (ent.vy > 0) {
    for (let c = left; c <= right; c++) {
      if (isSolidCell(c, bottom)) { ent.y = bottom * TS - ent.h - 0.01; ent.vy = 0; ent.onGround = true; break; }
    }
  } else if (ent.vy < 0) {
    for (let c = left; c <= right; c++) {
      if (isSolidCell(c, top)) {
        ent.y = (top + 1) * TS + 0.01; ent.vy = 0;
        headBonk(c, top);  // bateu a cabeça
        break;
      }
    }
  }
}

function headBonk(c, r) {
  const ch = grid[r] && grid[r][c];
  if (ch === "?") {
    grid[r][c] = "Q";
    votos += 1;
    spawnParticles((c + 0.5) * TS, r * TS, "#ffd12e", 8);
    sfx("block");
    updateHUD();
  }
}

/* ----------------------------- Update ----------------------------------- */
function update() {
  player.t++;
  enemies.forEach((e) => e.t++);
  updateParticles();

  if (deathTimer > 0) {
    // animação de morte (sobe e cai)
    player.vy += GRAVITY;
    player.y += player.vy;
    deathTimer--;
    if (deathTimer === 0) afterDeath();
    return;
  }

  // --- input horizontal ---
  const acc = player.onGround ? MOVE_ACC : AIR_ACC;
  if (keys.left && !keys.right)  { player.vx -= acc; player.facing = -1; }
  else if (keys.right && !keys.left) { player.vx += acc; player.facing = 1; }
  else if (player.onGround) player.vx *= FRICTION;
  else player.vx *= 0.96;
  player.vx = clamp(player.vx, -MOVE_MAX, MOVE_MAX);
  if (Math.abs(player.vx) < 0.05) player.vx = 0;

  // --- pulo (buffer + coyote + altura variável) ---
  if (player.onGround) coyote = COYOTE; else if (coyote > 0) coyote--;
  if (jumpBuffer > 0) jumpBuffer--;
  if (jumpBuffer > 0 && coyote > 0) {
    player.vy = JUMP_VEL;
    player.onGround = false;
    coyote = 0; jumpBuffer = 0;
    sfx("jump");
    spawnParticles(player.x + player.w / 2, player.y + player.h, "#ffffff", 5);
  }
  if (jumpReleasedFlag) {
    if (player.vy < 0) player.vy *= JUMP_CUT;
    jumpReleasedFlag = false;
  }

  // --- gravidade ---
  player.vy += GRAVITY;
  if (player.vy > MAX_FALL) player.vy = MAX_FALL;

  moveAndCollide(player);

  if (player.invuln > 0) player.invuln--;

  // --- queda no buraco ---
  if (player.y > VIEW_H + 80) { die(); return; }

  updateEnemies();
  checkSpikes();
  checkCoins();
  checkStars();
  checkFlag();
  updateCamera();
}

function updateEnemies() {
  enemies.forEach((e) => {
    if (!e.alive) return;
    e.vy = (e.vy || 0) + GRAVITY;
    if (e.vy > MAX_FALL) e.vy = MAX_FALL;

    // X
    e.x += e.vx;
    let left = Math.floor(e.x / TS);
    let right = Math.floor((e.x + e.w) / TS);
    let top = Math.floor(e.y / TS);
    let bottom = Math.floor((e.y + e.h - 1) / TS);
    if (e.vx > 0) {
      for (let r = top; r <= bottom; r++) if (isSolidCell(right, r)) { e.x = right * TS - e.w - 0.01; e.vx = -ENEMY_SPD; break; }
    } else {
      for (let r = top; r <= bottom; r++) if (isSolidCell(left, r)) { e.x = (left + 1) * TS + 0.01; e.vx = ENEMY_SPD; break; }
    }
    // Y
    e.y += e.vy;
    left = Math.floor(e.x / TS);
    right = Math.floor((e.x + e.w - 1) / TS);
    bottom = Math.floor((e.y + e.h) / TS);
    e.onGround = false;
    if (e.vy > 0) {
      for (let c = left; c <= right; c++) if (isSolidCell(c, bottom)) { e.y = bottom * TS - e.h - 0.01; e.vy = 0; e.onGround = true; break; }
    }
    // vira na beirada (não cai de plataformas)
    if (e.onGround) {
      const dir = e.vx > 0 ? 1 : -1;
      const aheadC = Math.floor((e.x + e.w / 2 + dir * (e.w / 2 + 4)) / TS);
      const belowR = Math.floor((e.y + e.h + 6) / TS);
      if (!isSolidCell(aheadC, belowR)) e.vx = -e.vx;
    }

    // colisão com jogador
    if (player.invuln === 0 && deathTimer === 0 && aabb(player, e)) {
      const falling = player.vy > 1.5;
      const aboveEnough = (player.y + player.h) - e.y < 22;
      if (falling && aboveEnough) {
        e.alive = false;
        player.vy = STOMP_VY;
        spawnParticles(e.x + e.w / 2, e.y + e.h / 2, "#9a86b0", 10);
        sfx("stomp");
      } else {
        hurt();
      }
    }
  });
}

function checkSpikes() {
  if (player.invuln > 0 || deathTimer > 0) return;
  for (const s of spikes) {
    if (rectsOverlap(player.x, player.y, player.w, player.h, s.x, s.y, s.w, s.h)) { die(); return; }
  }
}

function checkCoins() {
  for (const c of coins) {
    if (c.taken) continue;
    if (rectsOverlap(player.x, player.y, player.w, player.h, c.x - 14, c.y - 14, 28, 28)) {
      c.taken = true;
      votos++;
      spawnParticles(c.x, c.y, "#ffd12e", 6);
      sfx("coin");
      updateHUD();
    }
  }
}

function checkStars() {
  for (const s of stars) {
    if (s.taken) continue;
    if (rectsOverlap(player.x, player.y, player.w, player.h, s.x - 20, s.y - 20, 40, 40)) {
      s.taken = true;
      votos += 5;
      spawnParticles(s.x, s.y, "#ff5a5a", 14);
      if (s.deed !== null && !collectedDeeds.has(s.deed)) {
        collectedDeeds.add(s.deed);
        updateHUD();
        sfx("feito");
        showFeito(s.deed);     // pausa e mostra pop-up
      } else {
        updateHUD();
        sfx("coin");
      }
      return;
    }
  }
}

function checkFlag() {
  if (player.x + player.w / 2 >= flag.x - 6) faseClear();
}

function updateCamera() {
  const target = player.x + player.w / 2 - VIEW_W * 0.42;
  cam.x += (target - cam.x) * 0.12;
  cam.x = clamp(cam.x, 0, Math.max(0, levelPxW - VIEW_W));
}

/* ----------------------------- Dano / morte ----------------------------- */
function hurt() {
  // dano leve: perde vida, recua e fica invencível por um tempo
  vidas--;
  updateHUD();
  sfx("hurt");
  if (vidas <= 0) { player.vy = -11; player.alive = false; deathTimer = 48; return; }
  player.invuln = INVULN;
  player.vy = -7;
  player.vx = player.facing * -4;
  spawnParticles(player.x + player.w / 2, player.y + player.h / 2, "#ff5a5a", 12);
}

/* morte por queda no buraco ou espinho: tira 1 vida e reinicia a fase */
function die() {
  if (deathTimer > 0) return;
  vidas = Math.max(0, vidas - 1);
  updateHUD();
  sfx("hurt");
  player.vy = -11;
  player.alive = false;
  deathTimer = 48;
}

function afterDeath() {
  if (vidas <= 0) { gameOver(); return; }
  resetPlayerAndEnemies();
  deathTimer = 0;
}

/* ----------------------------- Fluxo de telas --------------------------- */
function startGame() {
  votos = 0; vidas = 3;
  collectedDeeds.clear();
  deedCursor = 0;
  levelIndex = 0;
  loadLevel(0);
  switchState(State.PLAY);
}

function faseClear() {
  if (state !== State.PLAY) return;
  sfx("clear");
  switchState(State.FASE);
  const last = levelIndex >= LEVELS.length - 1;
  document.getElementById("fase-titulo").textContent =
    (LEVELS[levelIndex].nome) + " ✅";
  document.getElementById("fase-stats").innerHTML =
    `🗳️ Votos: <b>${votos}</b><br>⭐ Bons feitos: <b>${collectedDeeds.size}/${BONS_FEITOS.length}</b>`;
  document.getElementById("btn-next").textContent = last ? "Grande final 🎉" : "Próxima fase ▶";
}

function nextLevel() {
  if (levelIndex >= LEVELS.length - 1) { win(); return; }
  levelIndex++;
  deedCursor = Math.min(deedCursor, BONS_FEITOS.length); // mantém progressão
  loadLevel(levelIndex);
  switchState(State.PLAY);
}

function gameOver() { switchState(State.OVER); }

function win() {
  switchState(State.WIN);
  winFlashT = 0;
  const box = document.getElementById("win-feitos");
  box.innerHTML = "";
  [...collectedDeeds].sort((a, b) => a - b).forEach((i) => {
    const d = BONS_FEITOS[i];
    const span = document.createElement("span");
    span.textContent = d.emoji + " " + d.nome;
    box.appendChild(span);
  });
  document.getElementById("win-stats").innerHTML =
    `🗳️ Votos reunidos: <b>${votos}</b><br>⭐ Bons feitos: <b>${collectedDeeds.size}/${BONS_FEITOS.length}</b>`;
}

let pendingFeitoReturn = State.PLAY;
function showFeito(deedIdx) {
  const d = BONS_FEITOS[deedIdx];
  document.getElementById("feito-emoji").textContent = d.emoji;
  document.getElementById("feito-nome").textContent = d.nome;
  document.getElementById("feito-texto").textContent = d.texto;
  pendingFeitoReturn = State.PLAY;
  switchState(State.FEITO);
}

/* troca de estado mostra/esconde telas */
function switchState(s) {
  state = s;
  const screens = {
    [State.MENU]: "screen-menu",
    [State.HELP]: "screen-help",
    [State.FEITO]: "screen-feito",
    [State.FASE]: "screen-fase",
    [State.OVER]: "screen-gameover",
    [State.WIN]: "screen-win",
  };
  ["screen-menu","screen-help","screen-feito","screen-fase","screen-gameover","screen-win"]
    .forEach((id) => document.getElementById(id).classList.add("hidden"));
  if (screens[s]) document.getElementById(screens[s]).classList.remove("hidden");

  const playing = (s === State.PLAY || s === State.FEITO || s === State.FASE);
  document.getElementById("hud").classList.toggle("hidden", !playing);
}

/* botão Enter / ação primária conforme a tela */
function primaryAction() {
  if (state === State.MENU) startGame();
  else if (state === State.FEITO) switchState(State.PLAY);
  else if (state === State.FASE) nextLevel();
  else if (state === State.OVER) startGame();
  else if (state === State.WIN) startGame();
}

/* ----------------------------- HUD -------------------------------------- */
function updateHUD() {
  document.getElementById("hud-vidas").textContent = vidas;
  document.getElementById("hud-votos").textContent = votos;
  document.getElementById("hud-feitos").textContent = collectedDeeds.size;
}

/* ----------------------------- Partículas ------------------------------- */
function spawnParticles(x, y, color, n) {
  for (let i = 0; i < n; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 0.5) * 5 - 2,
      life: 1, color,
      r: 2 + Math.random() * 3,
    });
  }
}
function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.vy += 0.2; p.x += p.vx; p.y += p.vy; p.life -= 0.035;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

/* ----------------------------- Utilidades ------------------------------- */
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function aabb(a, b) { return rectsOverlap(a.x, a.y, a.w, a.h, b.x, b.y, b.w, b.h); }
function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

/* ============================================================================
 * RENDER
 * ==========================================================================*/
function render() {
  const def = LEVELS[levelIndex] || LEVELS[0];
  drawSky(def);
  drawParallax(def);

  ctx.save();
  ctx.translate(-Math.round(cam.x), 0);

  drawTiles();
  drawSpikes();
  drawCoins();
  drawStars();
  drawFlag();
  drawEnemies();
  if (player) drawLula();
  drawParticles();

  ctx.restore();
}

function drawSky(def) {
  const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  g.addColorStop(0, def.corCeu1);
  g.addColorStop(1, def.corCeu2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  // sol
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = "#fff4c2";
  ctx.beginPath();
  ctx.arc(VIEW_W - 110, 95, 46, 0, 7);
  ctx.fill();
  ctx.globalAlpha = 0.25;
  ctx.beginPath(); ctx.arc(VIEW_W - 110, 95, 66, 0, 7); ctx.fill();
  ctx.restore();
}

function drawParallax(def) {
  // colinas em duas camadas
  const baseY = VIEW_H - 70;
  drawHills(cam.x * 0.25, baseY + 20, 150, 70, shade(def.corCeu1, -0.25), 420);
  drawHills(cam.x * 0.45, baseY + 46, 110, 52, shade(def.corCeu1, -0.4), 320);

  // nuvens
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  const cloudBase = (cam.x * 0.15) % 600;
  for (let i = -1; i < 6; i++) {
    const cx = i * 320 - cloudBase + 120;
    const cy = 70 + (i % 2) * 40;
    cloud(cx, cy, 1 + (i % 2) * 0.3);
  }
}
function cloud(x, y, s) {
  ctx.beginPath();
  ctx.arc(x, y, 22 * s, 0, 7);
  ctx.arc(x + 24 * s, y + 4, 28 * s, 0, 7);
  ctx.arc(x + 54 * s, y, 20 * s, 0, 7);
  ctx.rect(x, y, 54 * s, 24 * s);
  ctx.fill();
}
function drawHills(offset, y, w, h, color, spacing) {
  ctx.fillStyle = color;
  const start = -((offset) % spacing) - spacing;
  for (let x = start; x < VIEW_W + spacing; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.quadraticCurveTo(x + w / 2, y - h, x + w, y + h);
    ctx.fill();
  }
  ctx.fillRect(0, y + h - 2, VIEW_W, h);
}

function drawTiles() {
  const c0 = Math.max(0, Math.floor(cam.x / TS) - 1);
  const c1 = Math.min(levelCols - 1, Math.floor((cam.x + VIEW_W) / TS) + 1);
  for (let r = 0; r < ROWS; r++) {
    for (let c = c0; c <= c1; c++) {
      const ch = grid[r][c];
      if (ch === " ") continue;
      const x = c * TS, y = r * TS;
      if (ch === "G") drawGround(x, y, r, c);
      else if (ch === "B") drawBrick(x, y);
      else if (ch === "=") drawPlatform(x, y);
      else if (ch === "?") drawQBlock(x, y, true);
      else if (ch === "Q") drawQBlock(x, y, false);
    }
  }
}

function drawGround(x, y, r, c) {
  const grassTop = (r === 0) || grid[r - 1][c] !== "G";
  // terra
  ctx.fillStyle = "#7a4a22";
  ctx.fillRect(x, y, TS, TS);
  ctx.fillStyle = "#6b3f1d";
  for (let i = 0; i < 3; i++) ctx.fillRect(x + 6 + i * 15, y + 10 + (i % 2) * 16, 7, 7);
  // grama no topo
  if (grassTop) {
    ctx.fillStyle = "#2faa4e";
    ctx.fillRect(x, y, TS, 14);
    ctx.fillStyle = "#38c45c";
    ctx.fillRect(x, y, TS, 6);
  }
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.strokeRect(x + 0.5, y + 0.5, TS, TS);
}

function drawBrick(x, y) {
  ctx.fillStyle = "#c2693b";
  ctx.fillRect(x, y, TS, TS);
  ctx.strokeStyle = "rgba(0,0,0,0.22)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, TS - 2, TS - 2);
  ctx.beginPath();
  ctx.moveTo(x, y + TS / 2); ctx.lineTo(x + TS, y + TS / 2);
  ctx.moveTo(x + TS / 2, y); ctx.lineTo(x + TS / 2, y + TS / 2);
  ctx.moveTo(x + TS / 4, y + TS / 2); ctx.lineTo(x + TS / 4, y + TS);
  ctx.moveTo(x + 3 * TS / 4, y + TS / 2); ctx.lineTo(x + 3 * TS / 4, y + TS);
  ctx.stroke();
  ctx.lineWidth = 1;
}

function drawPlatform(x, y) {
  ctx.fillStyle = "#b5832e";
  ctx.fillRect(x, y, TS, TS - 16);
  ctx.fillStyle = "#8a5f1c";
  ctx.fillRect(x, y + TS - 20, TS, 4);
  ctx.fillStyle = "#2faa4e";
  ctx.fillRect(x, y, TS, 7);
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.strokeRect(x + 0.5, y + 0.5, TS, TS - 16);
}

function drawQBlock(x, y, active) {
  ctx.fillStyle = active ? "#ffcf33" : "#9a7b3a";
  ctx.fillRect(x + 2, y + 2, TS - 4, TS - 4);
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 3, y + 3, TS - 6, TS - 6);
  ctx.lineWidth = 1;
  // rebites
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  [[8,8],[TS-12,8],[8,TS-12],[TS-12,TS-12]].forEach(([dx,dy]) => ctx.fillRect(x+dx,y+dy,4,4));
  if (active) {
    ctx.fillStyle = "#7a4a00";
    ctx.font = "bold 28px 'Baloo 2', sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("?", x + TS / 2, y + TS / 2 + 2);
  }
}

function drawSpikes() {
  for (const s of spikes) {
    if (s.x + s.w < cam.x - 40 || s.x > cam.x + VIEW_W + 40) continue;
    const n = 3, bw = s.w / n;
    ctx.fillStyle = "#8a8f99";
    for (let i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.moveTo(s.x + i * bw, s.y + s.h);
      ctx.lineTo(s.x + i * bw + bw / 2, s.y);
      ctx.lineTo(s.x + (i + 1) * bw, s.y + s.h);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = "#c9ced6";
    for (let i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.moveTo(s.x + i * bw + 3, s.y + s.h);
      ctx.lineTo(s.x + i * bw + bw / 2, s.y + 4);
      ctx.lineTo(s.x + i * bw + bw / 2 + 2, s.y + 6);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function drawCoins() {
  for (const c of coins) {
    if (c.taken) continue;
    if (c.x < cam.x - 40 || c.x > cam.x + VIEW_W + 40) continue;
    const sx = Math.abs(Math.cos((player ? player.t : 0) * 0.08 + c.phase));
    ctx.save();
    ctx.translate(c.x, c.y + Math.sin((player ? player.t : 0) * 0.06 + c.phase) * 3);
    ctx.scale(sx * 0.9 + 0.1, 1);
    ctx.fillStyle = "#ffd12e";
    ctx.beginPath(); ctx.arc(0, 0, 12, 0, 7); ctx.fill();
    ctx.strokeStyle = "#caa016"; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = "#a9820f";
    ctx.font = "bold 13px 'Baloo 2',sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("✓", 0, 1);
    ctx.restore();
    ctx.lineWidth = 1;
  }
}

function drawStars() {
  for (const s of stars) {
    if (s.taken) continue;
    if (s.x < cam.x - 60 || s.x > cam.x + VIEW_W + 60) continue;
    const t = (player ? player.t : 0) * 0.07 + s.phase;
    const pulse = 1 + Math.sin(t) * 0.08;
    const yoff = Math.sin(t) * 4;
    ctx.save();
    ctx.translate(s.x, s.y + yoff);
    // brilho
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = "#fff3a8";
    ctx.beginPath(); ctx.arc(0, 0, 24 * pulse, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
    drawStarShape(0, 0, 16 * pulse, 7.5 * pulse, "#ffdd33", "#c99a12");
    ctx.restore();
  }
}
function drawStarShape(cx, cy, outer, inner, fill, stroke) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const ang = -Math.PI / 2 + i * Math.PI / 5;
    const rad = i % 2 === 0 ? outer : inner;
    const px = cx + Math.cos(ang) * rad, py = cy + Math.sin(ang) * rad;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke();
  ctx.lineWidth = 1;
}

function drawFlag() {
  const x = flag.x, yTop = flag.y - TS * 2;
  if (x < cam.x - 60 || x > cam.x + VIEW_W + 60) return;
  // mastro
  ctx.fillStyle = "#555";
  ctx.fillRect(x - 3, yTop, 6, TS * 3);
  ctx.fillStyle = "#888";
  ctx.beginPath(); ctx.arc(x, yTop, 7, 0, 7); ctx.fill();
  // bandeira ondulando (verde/amarelo com estrela)
  const wv = Math.sin((player ? player.t : 0) * 0.12) * 5;
  ctx.fillStyle = "#1f9d55";
  ctx.beginPath();
  ctx.moveTo(x + 3, yTop + 6);
  ctx.lineTo(x + 56 + wv, yTop + 16);
  ctx.lineTo(x + 3, yTop + 34);
  ctx.closePath();
  ctx.fill();
  drawStarShape(x + 24, yTop + 18, 7, 3, "#ffdd33", "#b8900f");
  // base/urna
  ctx.fillStyle = "#1b3fae";
  ctx.fillRect(x - 16, flag.y - 2, 32, 2);
}

function drawEnemies() {
  for (const e of enemies) {
    if (!e.alive) continue;
    if (e.x + e.w < cam.x - 40 || e.x > cam.x + VIEW_W + 40) continue;
    const bob = Math.sin(e.t * 0.2) * 2;
    const cx = e.x + e.w / 2, cy = e.y + e.h / 2 + bob;
    // corpo (perrengue): roxo-acinzentado, carrancudo
    ctx.fillStyle = "#6e5a86";
    roundRect(e.x, e.y + bob, e.w, e.h, 9); ctx.fill();
    ctx.fillStyle = "#574468";
    roundRect(e.x + 3, e.y + e.h * 0.55 + bob, e.w - 6, e.h * 0.42, 7); ctx.fill();
    // olhos
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(cx - 7, cy - 6, 5, 0, 7); ctx.arc(cx + 7, cy - 6, 5, 0, 7); ctx.fill();
    ctx.fillStyle = "#15161a";
    const look = e.vx > 0 ? 1.5 : -1.5;
    ctx.beginPath(); ctx.arc(cx - 7 + look, cy - 6, 2.3, 0, 7); ctx.arc(cx + 7 + look, cy - 6, 2.3, 0, 7); ctx.fill();
    // sobrancelhas (bravo)
    ctx.strokeStyle = "#2a2233"; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy - 12); ctx.lineTo(cx - 3, cy - 9);
    ctx.moveTo(cx + 12, cy - 12); ctx.lineTo(cx + 3, cy - 9);
    ctx.stroke();
    // boca
    ctx.beginPath(); ctx.arc(cx, cy + 8, 4, Math.PI, 0); ctx.stroke();
    ctx.lineWidth = 1;
    // pezinhos
    ctx.fillStyle = "#3f3350";
    const fp = Math.sin(e.t * 0.3) * 2;
    ctx.fillRect(e.x + 4, e.y + e.h - 3 + bob, 8, 4 + fp);
    ctx.fillRect(e.x + e.w - 12, e.y + e.h - 3 + bob, 8, 4 - fp);
  }
}

/* ---- Lula ---- */
function drawLula() {
  const p = player;
  if (p.invuln > 0 && Math.floor(p.t / 4) % 2 === 0 && deathTimer === 0) return; // pisca
  const x = p.x, y = p.y, w = p.w, h = p.h;
  const cx = x + w / 2;
  const walking = p.onGround && Math.abs(p.vx) > 0.4;
  const swing = walking ? Math.sin(p.t * 0.3) : 0;
  const airborne = !p.onGround;

  ctx.save();
  ctx.translate(cx, y);
  ctx.scale(p.facing, 1);
  ctx.translate(-cx, -y);

  // sombra
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath(); ctx.ellipse(cx, y + h, w * 0.5, 5, 0, 0, 7); ctx.fill();

  // pernas (calça azul)
  ctx.fillStyle = "#213a7a";
  const legY = y + h - 15;
  if (airborne) {
    ctx.fillRect(cx - 11, legY, 9, 15);
    ctx.fillRect(cx + 2, legY - 3, 9, 15);
  } else {
    ctx.fillRect(cx - 11, legY, 9, 14 + swing * 2);
    ctx.fillRect(cx + 2, legY, 9, 14 - swing * 2);
  }
  // sapatos
  ctx.fillStyle = "#15161a";
  ctx.fillRect(cx - 12, y + h - 3, 11, 4);
  ctx.fillRect(cx + 1, y + h - 3, 11, 4);

  // tronco (camisa vermelha)
  ctx.fillStyle = "#e11021";
  roundRect(cx - 13, y + 15, 26, h - 28, 7); ctx.fill();
  // colarinho/gola
  ctx.fillStyle = "#c20d1b";
  ctx.fillRect(cx - 13, y + 15, 26, 5);

  // braços
  ctx.fillStyle = "#d10f1e";
  if (airborne) {
    ctx.fillRect(cx - 17, y + 16, 7, 15);
    ctx.fillRect(cx + 10, y + 14, 7, 15);
  } else {
    ctx.fillRect(cx - 17, y + 18, 7, 15 - swing * 2);
    ctx.fillRect(cx + 10, y + 18, 7, 15 + swing * 2);
  }
  // mãos
  ctx.fillStyle = "#e8b48a";
  ctx.fillRect(cx - 17, y + 31 - (airborne ? 2 : swing * 2), 7, 5);
  ctx.fillRect(cx + 10, y + 31 + (airborne ? 0 : swing * 2), 7, 5);

  // cabeça
  ctx.fillStyle = "#e8b48a";
  roundRect(cx - 11, y - 2, 22, 20, 8); ctx.fill();
  // orelha
  ctx.fillRect(cx + 9, y + 6, 4, 6);
  // cabelo grisalho
  ctx.fillStyle = "#d9d9de";
  ctx.beginPath();
  ctx.arc(cx, y + 2, 12, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(cx - 12, y + 2, 4, 7);
  // barba grisalha
  ctx.fillStyle = "#d4d4da";
  ctx.beginPath();
  ctx.moveTo(cx - 11, y + 9);
  ctx.quadraticCurveTo(cx, y + 24, cx + 11, y + 9);
  ctx.lineTo(cx + 11, y + 13);
  ctx.quadraticCurveTo(cx, y + 20, cx - 11, y + 13);
  ctx.closePath();
  ctx.fill();
  // olho + sobrancelha
  ctx.fillStyle = "#15161a";
  ctx.fillRect(cx + 3, y + 6, 2.6, 3);
  ctx.strokeStyle = "#cfcfd4"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx + 1, y + 4); ctx.lineTo(cx + 7, y + 4); ctx.stroke();
  // sorriso
  ctx.strokeStyle = "#8a5a33";
  ctx.beginPath(); ctx.arc(cx + 2, y + 12, 3, 0.1, Math.PI - 0.6); ctx.stroke();
  ctx.lineWidth = 1;

  ctx.restore();
}

function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function shade(hex, amt) {
  const c = hex.replace("#", "");
  let r = parseInt(c.substr(0, 2), 16), g = parseInt(c.substr(2, 2), 16), b = parseInt(c.substr(4, 2), 16);
  r = clamp(Math.round(r + r * amt), 0, 255);
  g = clamp(Math.round(g + g * amt), 0, 255);
  b = clamp(Math.round(b + b * amt), 0, 255);
  return `rgb(${r},${g},${b})`;
}

/* ============================================================================
 * LOOP PRINCIPAL
 * ==========================================================================*/
let last = 0, acc = 0;
const STEP = 1 / 60;
function frame(t) {
  if (!last) last = t;
  let dt = (t - last) / 1000; last = t;
  if (dt > 0.25) dt = 0.25;
  acc += dt;
  let guard = 0;
  while (acc >= STEP && guard < 5) {
    if (state === State.PLAY) update();
    acc -= STEP; guard++;
  }
  // em telas pausadas ainda animamos partículas/fundo levemente
  if (state !== State.PLAY && player) { enemies.forEach((e)=>e.t++); if(player) player.t++; }
  render();
  requestAnimationFrame(frame);
}

/* ----------------------------- Botões UI -------------------------------- */
function bind(id, fn) { const el = document.getElementById(id); if (el) el.addEventListener("click", () => { audio(); fn(); }); }
bind("btn-start", startGame);
bind("btn-help", () => switchState(State.HELP));
bind("btn-help-back", () => switchState(State.MENU));
bind("btn-feito-ok", () => switchState(State.PLAY));
bind("btn-next", nextLevel);
bind("btn-retry", startGame);
bind("btn-menu", () => switchState(State.MENU));
bind("btn-win-again", startGame);
bind("btn-win-menu", () => switchState(State.MENU));

/* ----------------------------- Início ----------------------------------- */
// pré-carrega a fase 1 ao fundo do menu para dar vida à tela
computeDeedTarget();
loadLevel(0);
switchState(State.MENU);
requestAnimationFrame(frame);

/* Hook de teste automatizado — ativo só com ?slwtest na URL; inerte em produção. */
if (typeof location !== "undefined" && location.search.indexOf("slwtest") !== -1) {
  window.__SLW = {
    get state() { return state; },
    get player() { return player; },
    get coins() { return coins; },
    get stars() { return stars; },
    get flag() { return flag; },
    get votos() { return votos; },
    setPos(x, y) { player.x = x; player.y = y; player.vx = 0; player.vy = 0; },
  };
}

})();
