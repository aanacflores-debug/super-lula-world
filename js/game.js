/* ============================================================================
 * SUPER LULA WORLD — motor (HTML5 Canvas)
 * Cenas: menu, intro, seleção de personagem, mapa, missão, jogo (c/ chefão),
 * pausa, conquista, fim de fase, game over, vitória.
 * Dados em js/levels.js. Sem dependências.
 * ==========================================================================*/
(function () {
"use strict";

const { HISTORIA, HEROIS, CONQUISTAS, CHEFES, LEVELS, MAPA_NOS, PAINEL } = window.SLW_DATA;

/* ----------------------------- Constantes ------------------------------- */
const VIEW_W = 1280, VIEW_H = 704, TS = 64, ROWS = 11;
const GROUND_Y = (ROWS - 1) * TS;   // linha do chão (topo da última fileira)
const GRAVITY = 0.85, MAX_FALL = 19;
const MOVE_ACC = 1.05, AIR_ACC = 0.72, FRICTION = 0.8, MOVE_MAX = 6.4;
const JUMP_VEL = -18.4, JUMP_CUT = 0.45, COYOTE = 7, JUMP_BUF = 8;
const ENEMY_SPD = 1.3, STOMP_VY = -11.5, INVULN = 70;
const SOLID = new Set(["G", "B", "=", "?", "Q"]);

/* ----------------------------- Canvas / DPR ----------------------------- */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const DPR = Math.min(window.devicePixelRatio || 1, 2);
canvas.width = VIEW_W * DPR;
canvas.height = VIEW_H * DPR;

/* ----------------------------- Cenas ------------------------------------ */
const Scene = { MENU:"menu", INTRO:"intro", CHAR:"char", MAP:"map", MISSAO:"missao",
                PLAY:"play", PAUSE:"pause", FEITO:"feito", FASE:"fase", OVER:"over",
                WIN:"win", HELP:"help" };
let scene = Scene.MENU;

/* ----------------------------- Progresso -------------------------------- */
let heroId = "militante";
let completed = 0;                 // nº de fases concluídas (desbloqueia a próxima)
let levelIndex = 0;
let introStep = 0;
const collectedDeeds = [];         // lista de {nome,emoji,texto}
let totalDeeds = 0;
Object.values(CONQUISTAS).forEach((arr) => (totalDeeds += arr.length));

/* ----------------------------- Estado do jogo --------------------------- */
let grid = [], levelCols = 0, levelPxW = 0;
let hazards = [], coins = [], enemies = [], particles = [];
let boss = null, bossActive = false, bossDefeated = false;
let startPos = { x: 0, y: 0 };
let player = null;
let cam = { x: 0 };
let votos = 0, vidas = 3;
let deathTimer = 0;
let lastSafe = { x: 0, y: 0 };   // checkpoint (último chão pisado)
let factIndex = 0, factTimer = 0; // narrativa dos blocos '?'
let levelClearTimer = 0;
let deedQueue = [];
let hints = [], currentHint = "";

/* ----------------------------- Input ------------------------------------ */
const keys = { left:false, right:false, jump:false };
let jumpHeld = false, jumpBuffer = 0, coyote = 0, jumpReleasedFlag = false;

function setKey(k, down) {
  if (k === "jump") {
    if (down && !jumpHeld) jumpBuffer = JUMP_BUF;
    if (!down) jumpReleasedFlag = true;
    jumpHeld = down; keys.jump = down;
  } else keys[k] = down;
}
const KEYMAP = { ArrowLeft:"left", KeyA:"left", ArrowRight:"right", KeyD:"right",
                 ArrowUp:"jump", KeyW:"jump", Space:"jump", KeyZ:"jump" };
window.addEventListener("keydown", (e) => {
  if (e.code === "Escape" || e.code === "KeyP") { togglePause(); return; }
  const k = KEYMAP[e.code];
  if (k) { e.preventDefault(); setKey(k, true); }
  if (e.code === "Enter") primaryAction();
});
window.addEventListener("keyup", (e) => {
  const k = KEYMAP[e.code];
  if (k) { e.preventDefault(); setKey(k, false); }
});
document.querySelectorAll(".tbtn").forEach((btn) => {
  const k = btn.dataset.key;
  const p = (e) => { e.preventDefault(); audio(); setKey(k, true); };
  const r = (e) => { e.preventDefault(); setKey(k, false); };
  btn.addEventListener("pointerdown", p);
  btn.addEventListener("pointerup", r);
  btn.addEventListener("pointercancel", r);
  btn.addEventListener("pointerleave", r);
});
if (window.matchMedia("(hover:none) and (pointer:coarse)").matches)
  document.getElementById("touch-controls").classList.remove("hidden");

/* ----------------------------- Áudio / Música --------------------------- */
let actx = null, musicOn = true, musicTimer = null, musicStep = 0;
function audio() {
  if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
  if (actx && actx.state === "suspended") actx.resume();
  if (musicOn && !musicTimer) startMusic();
  return actx;
}
function tone(freq, dur, type, vol) {
  const a = actx; if (!a || freq <= 0) return;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type || "square"; o.frequency.value = freq;
  const t = a.currentTime;
  g.gain.setValueAtTime(vol || 0.06, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(a.destination);
  o.start(t); o.stop(t + dur);
}
function sfx(name) {
  if (!audio()) return;
  switch (name) {
    case "jump":  tone(520, 0.12, "square", 0.06); break;
    case "coin":  tone(880, 0.07, "square", 0.05); setTimeout(()=>tone(1175,0.08,"square",0.05),55); break;
    case "stomp": tone(300, 0.09, "sawtooth", 0.07); break;
    case "feito": [523,659,784,1046].forEach((f,i)=>setTimeout(()=>tone(f,0.15,"triangle",0.08),i*95)); break;
    case "hurt":  tone(200, 0.25, "sawtooth", 0.08); break;
    case "clear": [523,659,784,1046,1318].forEach((f,i)=>setTimeout(()=>tone(f,0.16,"triangle",0.08),i*110)); break;
    case "block": tone(440, 0.06, "square", 0.05); break;
    case "bosshit": tone(160,0.18,"sawtooth",0.09); setTimeout(()=>tone(120,0.2,"sawtooth",0.08),90); break;
    case "select": tone(660,0.08,"square",0.05); break;
  }
}
/* música original alegre (loop) */
const Nt = { C3:130.8,E3:164.8,F3:174.6,G3:196,A2:110,C4:261.6,D4:293.7,E4:329.6,
             F4:349.2,G4:392,A4:440,B4:493.9,C5:523.3,D5:587.3,E5:659.3,F5:698.5,G5:784 };
const MELODY = [Nt.G4,Nt.C5,Nt.E5,Nt.C5, Nt.G4,Nt.C5,Nt.E5,Nt.G5,
                Nt.A4,Nt.C5,Nt.F5,Nt.C5, Nt.G4,Nt.B4,Nt.D5,Nt.G4];
const BASS   = [Nt.C3,0,Nt.C3,0, Nt.A2,0,Nt.A2,0, Nt.F3,0,Nt.F3,0, Nt.G3,0,Nt.G3,0];
function startMusic() {
  if (!actx || musicTimer) return;
  musicTimer = setInterval(() => {
    if (!musicOn) return;
    const m = MELODY[musicStep % MELODY.length];
    const b = BASS[musicStep % BASS.length];
    if (m) tone(m, 0.22, "triangle", 0.045);
    if (b) tone(b, 0.26, "sine", 0.05);
    musicStep++;
  }, 200);
}
function toggleMusic() {
  musicOn = !musicOn;
  document.getElementById("btn-music").textContent = musicOn ? "🔊" : "🔇";
  if (musicOn) { audio(); }
}

/* ----------------------------- Carregar fase ---------------------------- */
function loadLevel(idx) {
  const def = LEVELS[idx];
  const raw = def.rows.slice();
  let maxLen = 0; raw.forEach((r) => (maxLen = Math.max(maxLen, r.length)));
  const rows = raw.map((r, i) => (i === ROWS - 1 ? r.padEnd(maxLen, "G") : r.padEnd(maxLen, " ")));

  levelCols = maxLen; levelPxW = maxLen * TS;
  grid = []; hazards = []; coins = []; enemies = []; particles = [];
  boss = null; bossActive = false; bossDefeated = false; levelClearTimer = 0; deedQueue = [];

  const chefeDef = CHEFES[def.chefe];

  for (let r = 0; r < ROWS; r++) {
    const line = rows[r]; const gridRow = [];
    for (let c = 0; c < maxLen; c++) {
      const ch = line[c] || " "; const px = c * TS, py = r * TS;
      switch (ch) {
        case "P": startPos = { x: px + 10, y: py - 4 }; gridRow.push(" "); break;
        case "o": coins.push({ x: px+TS/2, y: py+TS/2, taken:false, phase:Math.random()*6.28 }); gridRow.push(" "); break;
        case "E": enemies.push(makeEnemy(px+9, py+10)); gridRow.push(" "); break;
        case "N": enemies.push(makeEnemy(px+9, py+10, true)); gridRow.push(" "); break;
        case "w": hazards.push({ x:px+4, y:py+TS-22, w:TS-8, h:22, phase:Math.random()*6.28 }); gridRow.push(" "); break;
        case "X":
          boss = { x:px, y:py-TS, w:TS*1.6, h:TS*1.75, vx:ENEMY_SPD*0.9, vy:0,
                   hp:chefeDef.hp, maxhp:chefeDef.hp, alive:true, onGround:false,
                   t:0, invuln:0, sx:px, sy:py-TS, hopT:60,
                   leftBound: px - 6*TS + 6, kind: chefeDef.kind || "blob" };
          gridRow.push(" "); break;
        default: gridRow.push(ch);
      }
    }
    grid.push(gridRow);
  }

  // inimigos "fake news" voadores (posições em [coluna, linha])
  (def.flyers || []).forEach(([c, r]) => enemies.push(makeEnemy(c*TS+9, r*TS+10, true)));

  // tutorial
  hints = [];
  if (def.tutorial) {
    hints = [
      { x: 1*TS,  text: "Use <b>← →</b> (ou A D) para andar" },
      { x: 6*TS,  text: "Pule com <b>ESPAÇO / ⬆</b> embaixo do bloco <b>?</b> para soltar votos" },
      { x: 9*TS,  text: "Pule o <b>buraco</b> — não caia!" },
      { x: 17*TS, text: "Pule na <b>cabeça</b> dos políticos do atraso!" },
    ];
    if (boss) hints.push({ x: boss.x - 7*TS, text: "Chegou o <b>CHEFÃO</b>! Pule na cabeça dele várias vezes" });
  }
  currentHint = ""; document.getElementById("tutorial-hint").classList.add("hidden");
  factIndex = 0; factTimer = 0; document.getElementById("fact-banner").classList.add("hidden");

  resetPlayerAndEnemies();
  cam.x = 0; deathTimer = 0;
  document.getElementById("hud-feitos-total").textContent = totalDeeds;
  document.getElementById("boss-bar").classList.add("hidden");
  updateHUD();
}

function makeEnemy(x, y, flying) {
  return { x, y, w: TS-18, h: TS-14, vx: -ENEMY_SPD, vy:0, alive:true, onGround:false,
           t:Math.random()*60, sx:x, sy:y, flying:!!flying, baseY:y, range:5*TS };
}

function resetPlayerAndEnemies() {
  const hero = HEROIS.find((h) => h.id === heroId) || HEROIS[0];
  player = { x:startPos.x, y:startPos.y, w:40, h:56, vx:0, vy:0, onGround:false,
             facing:1, t:0, invuln:0, alive:true,
             jumpMul:hero.jump||1, speedMul:hero.speed||1, skin:hero.skin, trait:hero.trait };
  enemies.forEach((e) => { e.x=e.sx; e.y=e.sy; e.vx=-ENEMY_SPD; e.vy=0; e.alive=true; });
  if (boss) { boss.x=boss.sx; boss.y=boss.sy; boss.hp=boss.maxhp; boss.alive=true; boss.vx=ENEMY_SPD*0.9; boss.vy=0; boss.invuln=0; }
  bossActive = false; bossDefeated = false;
  lastSafe = { x: startPos.x, y: startPos.y };
  document.getElementById("boss-bar").classList.add("hidden");
  jumpBuffer=0; coyote=0; jumpHeld=false;
}

/* respawn gentil: volta ao último chão pisado, não ao início da fase */
function respawnAtCheckpoint() {
  enemies.forEach((e) => { e.x=e.sx; e.y=e.sy; e.vx=-ENEMY_SPD; e.vy=0; e.alive=true; });
  if (boss && !bossDefeated) { boss.x=boss.sx; boss.y=boss.sy; boss.hp=boss.maxhp; boss.vx=ENEMY_SPD*0.9; boss.vy=0; boss.invuln=0; boss.alive=true; }
  bossActive = false;
  document.getElementById("boss-bar").classList.add("hidden");
  player.x = lastSafe.x; player.y = lastSafe.y - 2;
  player.vx = 0; player.vy = 0; player.invuln = INVULN; player.alive = true;
  deathTimer = 0; jumpBuffer = 0; coyote = 0;
}

/* ----------------------------- Colisão ---------------------------------- */
function isSolidCell(c, r) {
  if (c < 0 || c >= levelCols) return true;
  if (r < 0 || r >= ROWS) return false;
  return SOLID.has(grid[r][c]);
}
function moveAndCollide(ent, bonk) {
  ent.x += ent.vx;
  let left=Math.floor(ent.x/TS), right=Math.floor((ent.x+ent.w)/TS);
  let top=Math.floor(ent.y/TS), bottom=Math.floor((ent.y+ent.h-1)/TS);
  if (ent.vx > 0) { for (let r=top;r<=bottom;r++) if (isSolidCell(right,r)){ent.x=right*TS-ent.w-0.01;ent.vx=0;break;} }
  else if (ent.vx < 0) { for (let r=top;r<=bottom;r++) if (isSolidCell(left,r)){ent.x=(left+1)*TS+0.01;ent.vx=0;break;} }

  ent.y += ent.vy; ent.onGround=false;
  left=Math.floor(ent.x/TS); right=Math.floor((ent.x+ent.w-1)/TS);
  top=Math.floor(ent.y/TS); bottom=Math.floor((ent.y+ent.h)/TS);
  if (ent.vy > 0) { for (let c=left;c<=right;c++) if (isSolidCell(c,bottom)){ent.y=bottom*TS-ent.h-0.01;ent.vy=0;ent.onGround=true;break;} }
  else if (ent.vy < 0) { for (let c=left;c<=right;c++) if (isSolidCell(c,top)){ent.y=(top+1)*TS+0.01;ent.vy=0;if(bonk)headBonk(c,top);break;} }
}
function headBonk(c, r) {
  if (grid[r] && grid[r][c] === "?") {
    grid[r][c] = "Q"; votos += 1;
    spawnParticles((c+0.5)*TS, r*TS, "#ffd12e", 8); sfx("block"); updateHUD();
    // narrativa: cada bloco conta um pedaço da história
    const fatos = LEVELS[levelIndex].fatos || [];
    if (factIndex < fatos.length) { showFact(fatos[factIndex]); factIndex++; }
  }
}
function showFact(text, tag, frames){
  const el = document.getElementById("fact-banner");
  el.innerHTML = "<span class='fb-tag'>" + (tag || "📖 A HISTÓRIA DO LULA") + "</span>" + text;
  el.classList.remove("hidden");
  factTimer = frames || 380; // ~6s
}

/* ----------------------------- Update ----------------------------------- */
function update() {
  player.t++; enemies.forEach((e)=>e.t++); if (boss) boss.t++;
  updateParticles();
  if (factTimer>0 && --factTimer===0) document.getElementById("fact-banner").classList.add("hidden");

  if (levelClearTimer > 0) {
    levelClearTimer--; player.vy += GRAVITY; moveAndCollide(player, false);
    if (levelClearTimer === 0) processDeedQueue();
    return;
  }
  if (deathTimer > 0) {
    player.vy += GRAVITY; player.y += player.vy; deathTimer--;
    if (deathTimer === 0) afterDeath();
    return;
  }

  // movimento
  const acc = player.onGround ? MOVE_ACC : AIR_ACC;
  const maxv = MOVE_MAX * player.speedMul;
  if (keys.left && !keys.right) { player.vx -= acc; player.facing=-1; }
  else if (keys.right && !keys.left) { player.vx += acc; player.facing=1; }
  else if (player.onGround) player.vx *= FRICTION; else player.vx *= 0.96;
  player.vx = clamp(player.vx, -maxv, maxv);
  if (Math.abs(player.vx) < 0.05) player.vx = 0;

  // pulo
  if (player.onGround) coyote = COYOTE; else if (coyote>0) coyote--;
  if (jumpBuffer>0) jumpBuffer--;
  if (jumpBuffer>0 && coyote>0) {
    player.vy = JUMP_VEL * player.jumpMul; player.onGround=false; coyote=0; jumpBuffer=0;
    sfx("jump"); spawnParticles(player.x+player.w/2, player.y+player.h, "#ffffff", 5);
  }
  if (jumpReleasedFlag) { if (player.vy<0) player.vy*=JUMP_CUT; jumpReleasedFlag=false; }

  player.vy += GRAVITY; if (player.vy>MAX_FALL) player.vy=MAX_FALL;
  moveAndCollide(player, true);
  if (player.invuln>0) player.invuln--;
  if (player.onGround && player.vy===0) lastSafe = { x: player.x, y: player.y };

  if (player.y > VIEW_H + 90) { die(); return; }

  updateEnemies();
  updateBoss();
  checkHazards();
  checkCoins();
  updateCamera();
  updateHints();
}

function defeatEnemy(e, bounce){
  e.alive=false;
  if (bounce) player.vy=STOMP_VY;
  spawnParticles(e.x+e.w/2, e.y+e.h/2, e.flying?"#e9e9ef":"#9a86b0", 12);
  sfx("stomp");
  if (player.trait==="moeda"){ votos+=5; spawnParticles(e.x+e.w/2, e.y, "#ffd12e", 10); updateHUD(); }
}
function updateEnemies() {
  const aggro = player.trait==="aggro";
  enemies.forEach((e) => {
    if (!e.alive) return;
    if (e.flying) {
      if (aggro) { e.vx = Math.sign(player.x - e.x) * ENEMY_SPD * 1.5 || e.vx; }
      else if (e.x < e.sx - e.range || e.x > e.sx + e.range) e.vx = -e.vx;
      e.x += e.vx;
      const cc = Math.floor((e.x + (e.vx>0?e.w:0))/TS), cr = Math.floor((e.y+e.h/2)/TS);
      if (isSolidCell(cc, cr)) e.vx = -e.vx;
      e.y = e.baseY + Math.sin(e.t*0.12)*10;
    } else {
      e.vy += GRAVITY; if (e.vy>MAX_FALL) e.vy=MAX_FALL;
      if (aggro && e.onGround) e.vx = Math.sign(player.x - e.x) * ENEMY_SPD * 1.5 || e.vx;
      enemyMove(e, aggro ? ENEMY_SPD*1.5 : ENEMY_SPD);
    }
    if (player.invuln===0 && deathTimer===0 && aabb(player, e)) {
      const stomp = player.vy>1.5 && (player.y+player.h)-e.y < 26;
      if (stomp) defeatEnemy(e, true);
      else if (player.trait==="forte") defeatEnemy(e, false);   // derruba no esbarrão
      else if (player.trait==="ileso") { /* passa ileso: sem dano */ }
      else hurt();
    }
  });
}
function enemyMove(e, spd) {
  e.x += e.vx;
  let left=Math.floor(e.x/TS), right=Math.floor((e.x+e.w)/TS);
  let top=Math.floor(e.y/TS), bottom=Math.floor((e.y+e.h-1)/TS);
  if (e.vx>0){ for(let r=top;r<=bottom;r++) if(isSolidCell(right,r)){e.x=right*TS-e.w-0.01;e.vx=-spd;break;} }
  else { for(let r=top;r<=bottom;r++) if(isSolidCell(left,r)){e.x=(left+1)*TS+0.01;e.vx=spd;break;} }
  e.y += e.vy;
  left=Math.floor(e.x/TS); right=Math.floor((e.x+e.w-1)/TS); bottom=Math.floor((e.y+e.h)/TS);
  e.onGround=false;
  if (e.vy>0){ for(let c=left;c<=right;c++) if(isSolidCell(c,bottom)){e.y=bottom*TS-e.h-0.01;e.vy=0;e.onGround=true;break;} }
  if (e.onGround){
    const dir=e.vx>0?1:-1;
    const aheadC=Math.floor((e.x+e.w/2+dir*(e.w/2+5))/TS);
    const belowR=Math.floor((e.y+e.h+6)/TS);
    if (!isSolidCell(aheadC,belowR)) e.vx=-e.vx;
  }
}

function updateBoss() {
  if (!boss || !boss.alive) return;
  // ativa quando o jogador chega perto
  if (!bossActive && player.x > boss.x - VIEW_W*0.45) {
    bossActive = true;
    const def = CHEFES[LEVELS[levelIndex].chefe];
    document.getElementById("boss-emoji").textContent = def.emoji;
    document.getElementById("boss-label").textContent = def.nome;
    document.getElementById("boss-bar").classList.remove("hidden");
    updateBossBar();
  }
  if (!bossActive) return;

  boss.vy += GRAVITY; if (boss.vy>MAX_FALL) boss.vy=MAX_FALL;
  boss.hopT--;
  if (boss.onGround && boss.hopT<=0) { boss.vy = -12; boss.hopT = 90 + Math.random()*60; }
  enemyMove(boss, Math.abs(boss.vx));
  if (boss.x < boss.leftBound) { boss.x = boss.leftBound; boss.vx = Math.abs(boss.vx); } // fica na arena
  if (boss.invuln>0) boss.invuln--;

  if (player.invuln===0 && deathTimer===0 && aabb(player, boss)) {
    if (player.vy>1.5 && (player.y+player.h)-boss.y < 34) {
      player.vy = STOMP_VY;
      if (boss.invuln===0) {
        boss.hp--; boss.invuln=45; boss.vx *= 1.18;
        spawnParticles(boss.x+boss.w/2, boss.y+10, "#ffd12e", 16); sfx("bosshit");
        updateBossBar();
        if (boss.hp<=0) defeatBoss();
      }
    } else hurt();
  }
}
function updateBossBar() {
  const pct = Math.max(0, boss.hp / boss.maxhp) * 100;
  document.getElementById("boss-hp-fill").style.width = pct + "%";
}
function defeatBoss() {
  boss.alive = false; bossDefeated = true;
  document.getElementById("boss-bar").classList.add("hidden");
  for (let i=0;i<40;i++) spawnParticles(boss.x+boss.w/2, boss.y+boss.h/2, ["#ffd12e","#1f9d55","#e11021","#1b3fae"][i%4], 1);
  sfx("clear");
  // prepara conquistas desta fase
  const chefe = LEVELS[levelIndex].chefe;
  deedQueue = CONQUISTAS[chefe].slice();
  levelClearTimer = 70;
}

function checkHazards() {
  if (player.invuln>0 || deathTimer>0) return;
  for (const h of hazards)
    if (rectsOverlap(player.x, player.y+player.h*0.4, player.w, player.h*0.6, h.x, h.y, h.w, h.h)) { die(); return; }
}
function checkCoins() {
  for (const c of coins) {
    if (c.taken) continue;
    if (rectsOverlap(player.x, player.y, player.w, player.h, c.x-18, c.y-18, 36, 36)) {
      c.taken=true; votos++; spawnParticles(c.x,c.y,"#ffd12e",6); sfx("coin"); updateHUD();
    }
  }
}
function updateCamera() {
  const target = player.x + player.w/2 - VIEW_W*0.4;
  cam.x += (target - cam.x) * 0.12;
  cam.x = clamp(cam.x, 0, Math.max(0, levelPxW - VIEW_W));
}
function updateHints() {
  if (!hints.length) return;
  let desired = "";
  for (const h of hints) if (player.x >= h.x) desired = h.text;
  if (desired !== currentHint) {
    currentHint = desired;
    const el = document.getElementById("tutorial-hint");
    if (desired) { el.innerHTML = desired; el.classList.remove("hidden"); }
    else el.classList.add("hidden");
  }
}

/* ----------------------------- Dano / morte ----------------------------- */
function hurt() {
  vidas--; updateHUD(); sfx("hurt");
  if (vidas<=0) { player.vy=-12; player.alive=false; deathTimer=50; return; }
  player.invuln=INVULN; player.vy=-8; player.vx=player.facing*-5;
  spawnParticles(player.x+player.w/2, player.y+player.h/2, "#ff5a5a", 12);
}
function die() {
  if (deathTimer>0) return;
  vidas=Math.max(0, vidas-1); updateHUD(); sfx("hurt");
  player.vy=-12; player.alive=false; deathTimer=50;
}
function afterDeath() {
  if (vidas<=0) { showScene(Scene.OVER); return; }
  respawnAtCheckpoint();
}

/* ----------------------------- Conquistas / fim de fase ----------------- */
function processDeedQueue() {
  if (deedQueue.length) {
    const d = deedQueue.shift();
    collectedDeeds.push(d);
    updateHUD();
    document.getElementById("feito-emoji").textContent = d.emoji;
    document.getElementById("feito-nome").textContent = d.nome;
    document.getElementById("feito-texto").textContent = d.texto;
    document.getElementById("feito-sabia").textContent = d.sabia ? "💡 " + d.sabia : "";
    sfx("feito");
    showScene(Scene.FEITO);
  } else {
    faseClear();
  }
}
function faseClear() {
  if (completed < levelIndex + 1) completed = levelIndex + 1;
  const last = levelIndex >= LEVELS.length - 1;
  const def = LEVELS[levelIndex];
  const policies = CONQUISTAS[def.chefe].map((c)=>`${c.emoji} ${c.nome}`).join("<br>");
  const skills = (def.skills||[]).join("<br>");
  document.getElementById("fase-titulo").textContent = def.nome + " ✅";
  document.getElementById("fase-stats").innerHTML =
    `<div class="fc-sec"><span class="fc-h">🏆 Conquistado neste mapa</span>${policies}</div>` +
    `<div class="fc-sec"><span class="fc-h">📈 O que melhorou no Brasil</span>${skills}</div>` +
    `<div class="fc-votos">🗳️ Votos: <b>${votos}</b> &nbsp;·&nbsp; ⭐ Total: <b>${collectedDeeds.length}/${totalDeeds}</b></div>`;
  document.getElementById("btn-next").textContent = last ? "Grande final 🎉" : "Ir para o mapa ▶";
  showScene(Scene.FASE);
}
function afterFase() {
  if (levelIndex >= LEVELS.length - 1 && completed >= LEVELS.length) { win(); return; }
  showScene(Scene.MAP);
}
function win() {
  const box = document.getElementById("win-feitos"); box.innerHTML = "";
  collectedDeeds.forEach((d) => { const s=document.createElement("span"); s.textContent=d.emoji+" "+d.nome; box.appendChild(s); });
  document.getElementById("win-stats").innerHTML =
    `🗳️ Votos reunidos: <b>${votos}</b><br>⭐ Conquistas: <b>${collectedDeeds.length}/${totalDeeds}</b>`;
  showScene(Scene.WIN);
}

/* ----------------------------- Fluxo de cenas --------------------------- */
function newGame() {
  votos=0; vidas=3; completed=0; collectedDeeds.length=0; heroId=selectedChar;
  showScene(Scene.MAP);
}
function enterLevel(idx) {
  levelIndex = idx; vidas = 3;
  const def = LEVELS[idx], chefe = CHEFES[def.chefe];
  document.getElementById("missao-badge").textContent = "FASE " + (idx+1);
  document.getElementById("missao-titulo").textContent = def.nome;
  document.getElementById("missao-texto").textContent = def.missao;
  document.getElementById("missao-chefe").textContent = chefe.emoji + " " + chefe.nome;
  showScene(Scene.MISSAO);
}
function startLevelPlay() {
  loadLevel(levelIndex);
  showScene(Scene.PLAY);
  // card de história no topo, contextualizando a era deste mapa
  const h = LEVELS[levelIndex].historiaInicio;
  if (h) showFact(h, "📖 A HISTÓRIA — FASE " + (levelIndex + 1), 540);
}
function togglePause() {
  if (scene === Scene.PLAY) showScene(Scene.PAUSE);
  else if (scene === Scene.PAUSE) showScene(Scene.PLAY);
}

/* mostra/esconde telas conforme a cena */
const SCREENS = ["screen-menu","screen-intro","screen-char","screen-map","screen-missao",
                 "screen-pause","screen-feito","screen-fase","screen-gameover","screen-win","screen-help"];
function showScene(s) {
  scene = s;
  const map = { [Scene.MENU]:"screen-menu",[Scene.INTRO]:"screen-intro",[Scene.CHAR]:"screen-char",
    [Scene.MAP]:"screen-map",[Scene.MISSAO]:"screen-missao",[Scene.PAUSE]:"screen-pause",
    [Scene.FEITO]:"screen-feito",[Scene.FASE]:"screen-fase",[Scene.OVER]:"screen-gameover",
    [Scene.WIN]:"screen-win",[Scene.HELP]:"screen-help" };
  SCREENS.forEach((id)=>document.getElementById(id).classList.add("hidden"));
  if (map[s]) document.getElementById(map[s]).classList.remove("hidden");

  const playingHud = (s===Scene.PLAY || s===Scene.PAUSE || s===Scene.FEITO || s===Scene.FASE);
  document.getElementById("hud").classList.toggle("hidden", !playingHud);
  const showBoss = (s===Scene.PLAY && bossActive && boss && boss.alive);
  document.getElementById("boss-bar").classList.toggle("hidden", !showBoss);
  if (s!==Scene.PLAY) { document.getElementById("tutorial-hint").classList.add("hidden"); document.getElementById("fact-banner").classList.add("hidden"); }

  if (s===Scene.INTRO) renderIntroSlide();
  if (s===Scene.MAP) {
    document.getElementById("map-sub").textContent =
      (completed>=LEVELS.length) ? "Tudo concluído! Clique para rejogar" : "Clique na fase que está brilhando";
    updatePainel();
  }
}

function primaryAction() {
  switch (scene) {
    case Scene.MENU: audio(); showScene(Scene.INTRO); introStep=0; renderIntroSlide(); break;
    case Scene.INTRO: introNext(); break;
    case Scene.CHAR: newGame(); break;
    case Scene.MISSAO: startLevelPlay(); break;
    case Scene.FEITO: processDeedQueue(); break;
    case Scene.FASE: afterFase(); break;
    case Scene.OVER: enterLevel(levelIndex); break;
    case Scene.WIN: showScene(Scene.MENU); break;
    case Scene.PAUSE: showScene(Scene.PLAY); break;
  }
}

/* ----------------------------- Intro ------------------------------------ */
/* Bandeira do Brasil desenhada em SVG (não depende de emoji, que não
   renderiza no Windows). */
const BR_FLAG_SVG = '<svg viewBox="0 0 100 70" style="height:80%;border:3px solid #15161a;border-radius:6px" xmlns="http://www.w3.org/2000/svg">' +
  '<rect width="100" height="70" fill="#009c3b"/>' +
  '<polygon points="50,7 92,35 50,63 8,35" fill="#ffdf00"/>' +
  '<circle cx="50" cy="35" r="15" fill="#002776"/>' +
  '<path d="M37 31 A 18 18 0 0 1 63 31" fill="none" stroke="#fff" stroke-width="2.4"/>' +
  '</svg>';

function renderIntroSlide() {
  const s = HISTORIA[introStep];
  const artEl = document.getElementById("intro-art");
  if (s.art === "brasil" || s.art === "vamos") {
    const extra = s.art === "vamos"
      ? '<span style="font-size:clamp(34px,9vw,56px);margin-left:10px">🚀</span>' : '';
    artEl.innerHTML = BR_FLAG_SVG + extra;
  } else {
    const e = { crianca:"👦", trabalho:"🔧", sindicato:"✊", presidente:"🎖️" }[s.art] || "⭐";
    artEl.innerHTML = '<span style="font-size:clamp(46px,12vw,76px)">' + e + '</span>';
  }
  document.getElementById("intro-titulo").textContent = s.titulo;
  document.getElementById("intro-texto").textContent = s.texto;
  const dots = document.getElementById("intro-dots"); dots.innerHTML = "";
  HISTORIA.forEach((_,i)=>{ const d=document.createElement("span"); if(i===introStep)d.className="on"; dots.appendChild(d); });
  document.getElementById("btn-intro-next").textContent = (introStep>=HISTORIA.length-1) ? "Escolher personagem ▶" : "Avançar ▶";
}
function introNext() {
  if (introStep < HISTORIA.length-1) { introStep++; renderIntroSlide(); }
  else showScene(Scene.CHAR);
}

/* ----------------------------- Seleção de personagem -------------------- */
let selectedChar = "militante";
function buildCharCards() {
  const list = document.getElementById("char-list"); list.innerHTML = "";
  HEROIS.forEach((h) => {
    const card = document.createElement("div");
    card.className = "char-card" + (h.id===selectedChar?" sel":"");
    const cv = document.createElement("canvas"); cv.width=72*2; cv.height=88*2;
    const cc = cv.getContext("2d"); cc.scale(2,2);
    drawHero(cc, 36, 10, 68, h.skin, 1, "idle", 0);
    card.appendChild(cv);
    const nm = document.createElement("div"); nm.className="cn"; nm.textContent=h.nome; card.appendChild(nm);
    const ds = document.createElement("div"); ds.className="cd"; ds.textContent=h.desc; card.appendChild(ds);
    card.addEventListener("click", () => { selectedChar=h.id; sfx("select"); buildCharCards(); });
    list.appendChild(card);
  });
}

/* ----------------------------- HUD -------------------------------------- */
function updateHUD() {
  document.getElementById("hud-vidas").textContent = vidas;
  document.getElementById("hud-votos").textContent = votos;
  document.getElementById("hud-feitos").textContent = collectedDeeds.length;
}

/* Painel do Brasil: indicadores reais que melhoram conforme as fases são vencidas. */
function updatePainel() {
  const el = document.getElementById("painel-br"); if (!el) return;
  let html = '<div class="pn-title">📊 Painel do Brasil</div>';
  PAINEL.forEach((p) => {
    const ok = completed > p.mapa;
    const val = ok
      ? `<span class="pn-antes">${p.antes}</span> → ${p.depois}`
      : `<span class="pn-antes">${p.antes}</span>`;
    html += `<div class="pn-row ${ok?'pn-ok':''}">` +
      `<span class="pn-ico">${p.icon}</span>` +
      `<span class="pn-nome">${p.nome}<small>${p.fonte}</small></span>` +
      `<span class="pn-val">${ok?'✓ ':''}${val}</span></div>`;
  });
  el.innerHTML = html;
}

/* ----------------------------- Partículas ------------------------------- */
function spawnParticles(x,y,color,n){
  for(let i=0;i<n;i++) particles.push({x,y,vx:(Math.random()-.5)*6,vy:(Math.random()-.5)*6-2,life:1,color,r:2+Math.random()*3.5});
}
function updateParticles(){
  for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.vy+=.2;p.x+=p.vx;p.y+=p.vy;p.life-=.033;if(p.life<=0)particles.splice(i,1);}
}

/* ----------------------------- Utils ------------------------------------ */
function clamp(v,a,b){return v<a?a:v>b?b:v;}
function aabb(a,b){return rectsOverlap(a.x,a.y,a.w,a.h,b.x,b.y,b.w,b.h);}
function rectsOverlap(ax,ay,aw,ah,bx,by,bw,bh){return ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;}
function shade(hex,amt){const c=hex.replace("#","");let r=parseInt(c.substr(0,2),16),g=parseInt(c.substr(2,2),16),b=parseInt(c.substr(4,2),16);r=clamp(Math.round(r+r*amt),0,255);g=clamp(Math.round(g+g*amt),0,255);b=clamp(Math.round(b+b*amt),0,255);return`rgb(${r},${g},${b})`;}
function roundRect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}

/* ============================================================================
 * RENDER
 * ==========================================================================*/
let bgT = 0;
function render() {
  ctx.setTransform(DPR,0,0,DPR,0,0);
  bgT++;
  if (scene===Scene.MAP) { drawMap(); return; }
  if (scene===Scene.MENU || scene===Scene.INTRO || scene===Scene.CHAR || scene===Scene.HELP) {
    drawBackdrop(); return;
  }
  // cenas de jogo (play/pause/feito/fase/over/win) desenham a fase
  const def = LEVELS[levelIndex] || LEVELS[0];
  drawSky(def); drawScenery(def);
  ctx.save(); ctx.translate(-Math.round(cam.x), 0);
  drawTiles(); drawHazards(); drawCoins();
  drawEnemies(); if (boss && boss.alive && bossActive) drawBoss();
  if (player) drawPlayer();
  drawParticles();
  ctx.restore();
}

/* fundo bonito para menus */
function drawBackdrop() {
  const g = ctx.createLinearGradient(0,0,0,VIEW_H);
  g.addColorStop(0,"#3d9bff"); g.addColorStop(1,"#cfeaff");
  ctx.fillStyle=g; ctx.fillRect(0,0,VIEW_W,VIEW_H);
  drawSun(VIEW_W-150,120);
  for(let i=0;i<5;i++){ const x=(i*320 - bgT*0.25)%(VIEW_W+320); cloud(x<0?x+VIEW_W+320:x, 90+(i%2)*60, 1.1); }
  // morros verdes + bandeirinha
  ctx.fillStyle="#2faa4e"; hill(VIEW_W*0.25,VIEW_H-120,260,130); hill(VIEW_W*0.7,VIEW_H-120,300,150);
  ctx.fillStyle="#1f9d55"; ctx.fillRect(0,VIEW_H-70,VIEW_W,70);
}

function drawSky(def){
  const g=ctx.createLinearGradient(0,0,0,VIEW_H);
  g.addColorStop(0,def.corCeu1); g.addColorStop(1,def.corCeu2);
  ctx.fillStyle=g; ctx.fillRect(0,0,VIEW_W,VIEW_H);
  drawSun(VIEW_W-150,120);
}
function drawSun(x,y){
  ctx.save(); ctx.globalAlpha=.9; ctx.fillStyle="#fff4c2";
  ctx.beginPath(); ctx.arc(x,y,54,0,7); ctx.fill();
  ctx.globalAlpha=.25; ctx.beginPath(); ctx.arc(x,y,78,0,7); ctx.fill(); ctx.restore();
}
function cloud(x,y,s){ ctx.fillStyle="rgba(255,255,255,.85)"; ctx.beginPath();
  ctx.arc(x,y,24*s,0,7); ctx.arc(x+28*s,y+5,30*s,0,7); ctx.arc(x+60*s,y,22*s,0,7);
  ctx.rect(x,y,60*s,26*s); ctx.fill(); }
function hill(cx,baseY,w,h){ ctx.beginPath(); ctx.moveTo(cx-w/2,baseY); ctx.quadraticCurveTo(cx,baseY-h,cx+w/2,baseY); ctx.fill(); }

/* cenário temático por fase (parallax) */
/* Camada de parallax SUAVE: a identidade de cada elemento vem do índice no
   MUNDO (não da posição de tela), então nada "pisca" ao andar. */
function sceneryLayer(p, spacing, cb){
  const base = cam.x * p;
  const i0 = Math.floor((base - spacing) / spacing);
  const i1 = Math.ceil((base + VIEW_W + spacing) / spacing);
  for (let i=i0;i<=i1;i++) cb(i, i*spacing - base);
}
function hashN(i, n){ let h=(i*2654435761)>>>0; h^=h>>>13; return (h>>>0)%n; }

function drawScenery(def){
  // nuvens (bem lentas)
  sceneryLayer(0.12, 360, (i,x)=> cloud(x+60, 64 + hashN(i,3)*44, 1));

  if (def.cenario==="sertao") {
    ctx.fillStyle="#c79e63";
    sceneryLayer(0.28, 520, (i,x)=> hill(x+260, GROUND_Y+6, 500, 122));
    sceneryLayer(0.5, 230, (i,x)=>{ const t=hashN(i,4), bx=x+115, by=GROUND_Y;
      if(t===0) mandacaru(bx,by); else if(t===1) carnauba(bx,by);
      else if(t===2) juazeiro(bx,by); else dryTree(bx,by); });
  } else if (def.cenario==="cidade") {
    sceneryLayer(0.35, 150, (i,x)=>{
      const hh=140+hashN(i,120);
      ctx.fillStyle=shade(def.corCeu1,-.35);
      ctx.fillRect(x, GROUND_Y-hh, 120, hh);
      ctx.fillStyle="rgba(255,255,220,.5)";
      for(let wy=GROUND_Y-hh+16; wy<GROUND_Y-12; wy+=26) for(let wx=x+14;wx<x+106;wx+=26) ctx.fillRect(wx,wy,12,14);
    });
  } else if (def.cenario==="campo") {
    ctx.fillStyle=shade(def.corCeu1,-.22);
    sceneryLayer(0.28, 540, (i,x)=> hill(x+270, GROUND_Y+6, 520, 148));
    sceneryLayer(0.5, 215, (i,x)=>{ if(hashN(i,4)<2) palm(x+105, GROUND_Y); else juazeiro(x+105, GROUND_Y); });
  } else if (def.cenario==="capital") {
    ctx.fillStyle=shade(def.corCeu1,-.3);
    sceneryLayer(0.3, 560, (i,x)=>{ sugarloaf(x+280, GROUND_Y); if(i%2===0) christ(x+280, GROUND_Y-176); });
  }
}
/* --- Vegetação da caatinga --- */
function mandacaru(x,b){            // cacto columnar nativo do sertão
  ctx.fillStyle="#3f7d3a";
  ctx.fillRect(x-7,b-92,14,92);
  ctx.fillRect(x-24,b-56,10,30); ctx.fillRect(x-24,b-56,16,10);
  ctx.fillRect(x+14,b-68,10,36);  ctx.fillRect(x+8,b-68,16,10);
  ctx.fillStyle="#2f5f2c"; ctx.fillRect(x-1,b-92,2,92);
  ctx.fillStyle="#e23b5a"; ctx.beginPath(); ctx.arc(x,b-95,5,0,7); ctx.fill();
}
function carnauba(x,b){            // palmeira "árvore da vida"
  ctx.fillStyle="#8a6a34"; ctx.fillRect(x-4,b-102,8,102);
  ctx.strokeStyle="#6b4a22"; ctx.lineWidth=1;
  for(let i=0;i<6;i++){ ctx.beginPath(); ctx.moveTo(x-4,b-100+i*16); ctx.lineTo(x+4,b-100+i*16); ctx.stroke(); }
  ctx.fillStyle="#2f8d3a";
  for(let a=0;a<7;a++){ const ang=-Math.PI/2+(a-3)*0.42; ctx.save(); ctx.translate(x,b-102); ctx.rotate(ang); ctx.beginPath(); ctx.ellipse(24,0,26,5,0,0,7); ctx.fill(); ctx.restore(); }
}
function juazeiro(x,b){            // árvore que fica verde mesmo na seca
  ctx.fillStyle="#6b4a2a"; ctx.fillRect(x-5,b-52,10,52);
  ctx.fillStyle="#3b8d43"; ctx.beginPath();
  ctx.arc(x,b-64,27,0,7); ctx.arc(x-21,b-56,18,0,7); ctx.arc(x+21,b-56,18,0,7); ctx.fill();
}
function dryTree(x,b){            // árvore seca retorcida (caatinga na seca)
  ctx.strokeStyle="#7a5330"; ctx.lineWidth=5; ctx.lineCap="round";
  ctx.beginPath();
  ctx.moveTo(x,b); ctx.lineTo(x,b-56);
  ctx.moveTo(x,b-32); ctx.lineTo(x-19,b-50);
  ctx.moveTo(x,b-42); ctx.lineTo(x+17,b-62);
  ctx.moveTo(x-11,b-42); ctx.lineTo(x-21,b-31);
  ctx.moveTo(x+9,b-52); ctx.lineTo(x+21,b-48);
  ctx.stroke(); ctx.lineWidth=1; ctx.lineCap="butt";
}
function palm(x,b){ ctx.fillStyle="#6b4a2a"; ctx.fillRect(x-5,b-80,10,80); ctx.fillStyle="#2f8d3a"; for(let a=0;a<5;a++){const ang=-Math.PI/2+(a-2)*0.5; ctx.beginPath(); ctx.ellipse(x+Math.cos(ang)*34,b-80+Math.sin(ang)*20,34,10,ang,0,7); ctx.fill();} }
function sugarloaf(x,b){ ctx.beginPath(); ctx.moveTo(x-90,b); ctx.quadraticCurveTo(x-60,b-150,x,b-170); ctx.quadraticCurveTo(x+70,b-150,x+100,b); ctx.fill(); }
function christ(x,y){ ctx.save(); ctx.fillStyle="rgba(240,240,245,.9)"; ctx.fillRect(x-4,y,8,70); ctx.fillRect(x-45,y+16,90,8); ctx.beginPath(); ctx.arc(x,y-6,8,0,7); ctx.fill(); ctx.restore(); }

function drawTiles(){
  const c0=Math.max(0,Math.floor(cam.x/TS)-1), c1=Math.min(levelCols-1,Math.floor((cam.x+VIEW_W)/TS)+1);
  for(let r=0;r<ROWS;r++) for(let c=c0;c<=c1;c++){
    const ch=grid[r][c]; if(ch===" ")continue; const x=c*TS,y=r*TS;
    if(ch==="G")drawGround(x,y,r,c); else if(ch==="B")drawBrick(x,y);
    else if(ch==="=")drawPlatform(x,y); else if(ch==="?")drawQ(x,y,true); else if(ch==="Q")drawQ(x,y,false);
  }
}
function drawGround(x,y,r,c){
  const top=(r===0)||grid[r-1][c]!=="G";
  ctx.fillStyle="#7a4a22"; ctx.fillRect(x,y,TS,TS);
  ctx.fillStyle="#6b3f1d"; for(let i=0;i<3;i++) ctx.fillRect(x+8+i*20,y+14+(i%2)*22,9,9);
  if(top){ ctx.fillStyle="#2faa4e"; ctx.fillRect(x,y,TS,18); ctx.fillStyle="#38c45c"; ctx.fillRect(x,y,TS,8); }
  ctx.strokeStyle="rgba(0,0,0,.12)"; ctx.strokeRect(x+.5,y+.5,TS,TS);
}
function drawBrick(x,y){
  ctx.fillStyle="#c2693b"; ctx.fillRect(x,y,TS,TS);
  ctx.strokeStyle="rgba(0,0,0,.22)"; ctx.lineWidth=2; ctx.strokeRect(x+1,y+1,TS-2,TS-2);
  ctx.beginPath(); ctx.moveTo(x,y+TS/2); ctx.lineTo(x+TS,y+TS/2); ctx.moveTo(x+TS/2,y); ctx.lineTo(x+TS/2,y+TS/2);
  ctx.moveTo(x+TS/4,y+TS/2); ctx.lineTo(x+TS/4,y+TS); ctx.moveTo(x+3*TS/4,y+TS/2); ctx.lineTo(x+3*TS/4,y+TS); ctx.stroke(); ctx.lineWidth=1;
}
function drawPlatform(x,y){
  ctx.fillStyle="#b5832e"; ctx.fillRect(x,y,TS,TS-22);
  ctx.fillStyle="#2faa4e"; ctx.fillRect(x,y,TS,9);
  ctx.strokeStyle="rgba(0,0,0,.15)"; ctx.strokeRect(x+.5,y+.5,TS,TS-22);
}
function drawQ(x,y,active){
  ctx.fillStyle=active?"#ffcf33":"#9a7b3a"; ctx.fillRect(x+3,y+3,TS-6,TS-6);
  ctx.strokeStyle="rgba(0,0,0,.35)"; ctx.lineWidth=2; ctx.strokeRect(x+4,y+4,TS-8,TS-8); ctx.lineWidth=1;
  ctx.fillStyle="rgba(0,0,0,.3)"; [[10,10],[TS-16,10],[10,TS-16],[TS-16,TS-16]].forEach(([dx,dy])=>ctx.fillRect(x+dx,y+dy,5,5));
  if(active){ ctx.fillStyle="#7a4a00"; ctx.font="bold 36px 'Baloo 2',sans-serif"; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText("?",x+TS/2,y+TS/2+2); }
}

function drawHazards(){
  for(const h of hazards){
    if(h.x+h.w<cam.x-40||h.x>cam.x+VIEW_W+40) continue;
    const bob=Math.sin(bgT*0.1+h.phase)*2;
    // poça escura borbulhante de "desinformação"
    ctx.fillStyle="#3a2b4d"; roundRect(ctx,h.x,h.y+bob+4,h.w,h.h-4,8); ctx.fill();
    ctx.fillStyle="#6a4f8a";
    for(let i=0;i<3;i++){ const bx=h.x+8+i*(h.w-16)/2.5; const by=h.y+bob+6+Math.sin(bgT*0.2+i)*3; ctx.beginPath(); ctx.arc(bx,by,4,0,7); ctx.fill(); }
    ctx.font="13px sans-serif"; ctx.textAlign="center"; ctx.fillText("💬", h.x+h.w/2, h.y+bob-2);
  }
}
function drawCoins(){
  for(const c of coins){
    if(c.taken)continue; if(c.x<cam.x-40||c.x>cam.x+VIEW_W+40)continue;
    const sx=Math.abs(Math.cos(bgT*0.08+c.phase));
    ctx.save(); ctx.translate(c.x, c.y+Math.sin(bgT*0.06+c.phase)*3); ctx.scale(sx*0.9+0.1,1);
    ctx.fillStyle="#ffd12e"; ctx.beginPath(); ctx.arc(0,0,15,0,7); ctx.fill();
    ctx.strokeStyle="#caa016"; ctx.lineWidth=2; ctx.stroke();
    ctx.fillStyle="#a9820f"; ctx.font="bold 16px 'Baloo 2'"; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText("✓",0,1);
    ctx.restore(); ctx.lineWidth=1;
  }
}

function drawEnemies(){
  for(const e of enemies){
    if(!e.alive)continue; if(e.x+e.w<cam.x-40||e.x>cam.x+VIEW_W+40)continue;
    if(e.flying) drawFakeNews(e.x,e.y,e.w,e.h,e.t);
    else drawVilao(e.x,e.y,e.w,e.h,e.vx,e.t);
  }
}
/* Inimigo "fake news": um jornalzinho/telinha mentirosa que voa */
function drawFakeNews(x,y,w,h,t){
  const cx=x+w/2, cy=y+h/2;
  // asas batendo
  const flap=Math.max(1.5, 4+Math.sin(t*0.4)*4);
  ctx.fillStyle="rgba(255,255,255,.85)";
  ctx.beginPath(); ctx.ellipse(x-4,cy-2,8,flap,-0.4,0,7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x+w+4,cy-2,8,flap,0.4,0,7); ctx.fill();
  // "jornal" branco
  ctx.fillStyle="#f3f3ee"; roundRect(ctx,x,y,w,h,4); ctx.fill();
  ctx.strokeStyle="#c9c9c0"; ctx.lineWidth=1.5; roundRect(ctx,x+1,y+1,w-2,h-2,4); ctx.stroke(); ctx.lineWidth=1;
  // tarja vermelha "FAKE"
  ctx.fillStyle="#d11a2a"; ctx.fillRect(x+3,y+5,w-6,10);
  ctx.fillStyle="#fff"; ctx.font="bold 9px 'Baloo 2',sans-serif"; ctx.textAlign="center"; ctx.textBaseline="middle";
  ctx.fillText("FAKE", cx, y+10);
  // linhas de "texto" mentiroso
  ctx.fillStyle="#b9b9b0";
  for(let i=0;i<3;i++) ctx.fillRect(x+5, y+20+i*6, w-10-((i*7)%10), 3);
  // olhinhos raivosos
  ctx.fillStyle="#15161a";
  ctx.fillRect(cx-7, y+h-9, 4, 4); ctx.fillRect(cx+3, y+h-9, 4, 4);
}
/* Vilão = "político do atraso": caricatura genérica de terno e gravata.
   Não representa pessoa real. */
function drawVilao(x,y,w,h,vx,t){
  const bob=Math.sin(t*0.18)*1.6, cx=x+w/2, topY=y+bob;
  const fp=Math.sin(t*0.3)*2;
  // sombra
  ctx.fillStyle="rgba(0,0,0,.15)"; ctx.beginPath(); ctx.ellipse(cx,y+h,w*0.44,4,0,0,7); ctx.fill();
  // pernas + sapatos
  ctx.fillStyle="#2a2d3a";
  ctx.fillRect(cx-w*0.22,y+h-14+bob,w*0.18,14+fp); ctx.fillRect(cx+w*0.04,y+h-14+bob,w*0.18,14-fp);
  ctx.fillStyle="#15161a";
  ctx.fillRect(cx-w*0.26,y+h-4+bob,w*0.22,4); ctx.fillRect(cx+w*0.04,y+h-4+bob,w*0.22,4);
  // braços (paletó)
  ctx.fillStyle="#2b2f44";
  ctx.fillRect(cx-w*0.47,topY+h*0.36,w*0.15,h*0.3); ctx.fillRect(cx+w*0.32,topY+h*0.36,w*0.15,h*0.3);
  // paletó
  ctx.fillStyle="#30344a"; roundRect(ctx,cx-w*0.35,topY+h*0.33,w*0.7,h*0.42,6); ctx.fill();
  // camisa branca (V)
  ctx.fillStyle="#f4f4f0";
  ctx.beginPath(); ctx.moveTo(cx-w*0.11,topY+h*0.33); ctx.lineTo(cx,topY+h*0.64); ctx.lineTo(cx+w*0.11,topY+h*0.33); ctx.closePath(); ctx.fill();
  // gravata vermelha
  ctx.fillStyle="#d11a2a";
  ctx.beginPath(); ctx.moveTo(cx-3.5,topY+h*0.35); ctx.lineTo(cx+3.5,topY+h*0.35); ctx.lineTo(cx+5,topY+h*0.6); ctx.lineTo(cx,topY+h*0.68); ctx.lineTo(cx-5,topY+h*0.6); ctx.closePath(); ctx.fill();
  // cabeça
  const hw=w*0.52, hh=h*0.36, hx=cx, hy=topY;
  ctx.fillStyle="#e3b088"; roundRect(ctx,hx-hw/2,hy,hw,hh,hw*0.3); ctx.fill();
  // cabelo preto repartido
  ctx.fillStyle="#1e1a18";
  ctx.beginPath(); ctx.arc(hx,hy+hh*0.28,hw*0.56,Math.PI,0); ctx.fill();
  ctx.fillRect(hx-hw*0.57,hy+hh*0.12,hw*1.14,hh*0.18);
  ctx.fillStyle="#e3b088"; ctx.fillRect(hx+hw*0.08,hy+hh*0.02,2,hh*0.26);
  // olhos + sobrancelhas (debochado)
  const look=vx>0?1.6:-1.6;
  ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(hx-hw*0.2,hy+hh*0.52,hw*0.14,0,7); ctx.arc(hx+hw*0.2,hy+hh*0.52,hw*0.14,0,7); ctx.fill();
  ctx.fillStyle="#15161a"; ctx.beginPath(); ctx.arc(hx-hw*0.2+look,hy+hh*0.52,hw*0.07,0,7); ctx.arc(hx+hw*0.2+look,hy+hh*0.52,hw*0.07,0,7); ctx.fill();
  ctx.strokeStyle="#1e1a18"; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(hx-hw*0.33,hy+hh*0.36); ctx.lineTo(hx-hw*0.08,hy+hh*0.44);
  ctx.moveTo(hx+hw*0.33,hy+hh*0.36); ctx.lineTo(hx+hw*0.08,hy+hh*0.44); ctx.stroke();
  // sorriso torto (deboche)
  ctx.beginPath(); ctx.moveTo(hx-hw*0.18,hy+hh*0.8); ctx.quadraticCurveTo(hx,hy+hh*0.68,hx+hw*0.22,hy+hh*0.84); ctx.stroke(); ctx.lineWidth=1;
}

function drawBoss(){
  const b=boss, bob=Math.sin(b.t*0.15)*3, cx=b.x+b.w/2, cy=b.y+b.h/2+bob;
  const def=CHEFES[LEVELS[levelIndex].chefe];
  const flash=(b.invuln>0 && Math.floor(b.t/4)%2===0);
  ctx.save();
  if (def.kind==="tycoon") drawTycoonBoss(b,cx,cy,bob,def,flash);
  else drawBlobBoss(b,cx,cy,bob,def,flash);
  ctx.restore();
}
/* Chefão-problema: criatura arredondada (SEM chifres de diabo). */
function drawBlobBoss(b,cx,cy,bob,def,flash){
  const look=b.vx>0?3:-3;
  ctx.fillStyle=flash?"#ffffff":def.cor; roundRect(ctx,b.x,b.y+bob,b.w,b.h,24); ctx.fill();
  ctx.fillStyle="rgba(0,0,0,.16)"; roundRect(ctx,b.x+6,b.y+b.h*0.56+bob,b.w-12,b.h*0.4,18); ctx.fill();
  // orelhinhas redondas (não chifres)
  ctx.fillStyle=flash?"#ffffff":def.cor;
  ctx.beginPath(); ctx.arc(b.x+b.w*0.24,b.y+bob+2,11,0,7); ctx.arc(b.x+b.w*0.76,b.y+bob+2,11,0,7); ctx.fill();
  // olhos
  ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(cx-20,cy-10,12,0,7); ctx.arc(cx+20,cy-10,12,0,7); ctx.fill();
  ctx.fillStyle="#c01020"; ctx.beginPath(); ctx.arc(cx-20+look,cy-10,5,0,7); ctx.arc(cx+20+look,cy-10,5,0,7); ctx.fill();
  // sobrancelhas bravas
  ctx.strokeStyle="#15161a"; ctx.lineWidth=4;
  ctx.beginPath(); ctx.moveTo(cx-32,cy-24); ctx.lineTo(cx-10,cy-14); ctx.moveTo(cx+32,cy-24); ctx.lineTo(cx+10,cy-14); ctx.stroke();
  // carranca com dentes
  ctx.fillStyle="#2a1a1a"; roundRect(ctx,cx-20,cy+8,40,14,5); ctx.fill();
  ctx.fillStyle="#fff"; for(let i=0;i<4;i++) ctx.fillRect(cx-16+i*10,cy+8,6,6);
  ctx.lineWidth=1;
  ctx.font="24px sans-serif"; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText(def.emoji, cx, cy+b.h*0.32);
}
/* Chefão final: caricatura satírica (estilo charge) da ameaça estrangeira à
   soberania — figura de terno, topete loiro e gravata vermelha. Não é pessoa
   real nomeada; é sátira política. */
function drawTycoonBoss(b,cx,cy,bob,def,flash){
  const look=b.vx>0?2:-2;
  const hw=b.w*0.6, hh=b.h*0.42, hx=cx, hy=b.y+bob+6;
  const skin=flash?"#ffffff":"#f0a86a";
  // terno
  ctx.fillStyle=flash?"#ffffff":def.cor; roundRect(ctx,b.x+b.w*0.08,b.y+b.h*0.44+bob,b.w*0.84,b.h*0.56,12); ctx.fill();
  // camisa branca (V)
  ctx.fillStyle="#f4f4f0";
  ctx.beginPath(); ctx.moveTo(cx-b.w*0.12,b.y+b.h*0.44+bob); ctx.lineTo(cx,b.y+b.h*0.66+bob); ctx.lineTo(cx+b.w*0.12,b.y+b.h*0.44+bob); ctx.closePath(); ctx.fill();
  // gravata vermelha comprida
  ctx.fillStyle="#d11a2a";
  ctx.beginPath(); ctx.moveTo(cx-6,b.y+b.h*0.46+bob); ctx.lineTo(cx+6,b.y+b.h*0.46+bob); ctx.lineTo(cx+9,b.y+b.h*0.99+bob); ctx.lineTo(cx,b.y+b.h*1.05+bob); ctx.lineTo(cx-9,b.y+b.h*0.99+bob); ctx.closePath(); ctx.fill();
  // cabeça bronzeada
  ctx.fillStyle=skin; roundRect(ctx,hx-hw/2,hy,hw,hh,hw*0.28); ctx.fill();
  // topete loiro
  ctx.fillStyle=flash?"#ffffff":"#f2d479";
  ctx.beginPath();
  ctx.moveTo(hx-hw*0.54,hy+hh*0.32);
  ctx.quadraticCurveTo(hx-hw*0.62,hy-hh*0.3, hx+hw*0.2,hy-hh*0.12);
  ctx.quadraticCurveTo(hx+hw*0.68,hy-hh*0.02, hx+hw*0.5,hy+hh*0.28);
  ctx.quadraticCurveTo(hx,hy+hh*0.04, hx-hw*0.54,hy+hh*0.32);
  ctx.closePath(); ctx.fill();
  // olhos pequenos
  ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(hx-hw*0.17,hy+hh*0.52,hw*0.09,0,7); ctx.arc(hx+hw*0.17,hy+hh*0.52,hw*0.09,0,7); ctx.fill();
  ctx.fillStyle="#1a2a66"; ctx.beginPath(); ctx.arc(hx-hw*0.15+look,hy+hh*0.52,hw*0.04,0,7); ctx.arc(hx+hw*0.19+look,hy+hh*0.52,hw*0.04,0,7); ctx.fill();
  // sobrancelhas loiras franzidas
  ctx.strokeStyle=flash?"#ffffff":"#d9b85a"; ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(hx-hw*0.28,hy+hh*0.38); ctx.lineTo(hx-hw*0.06,hy+hh*0.44);
  ctx.moveTo(hx+hw*0.06,hy+hh*0.44); ctx.lineTo(hx+hw*0.28,hy+hh*0.38); ctx.stroke();
  // boca em bico (carranca)
  ctx.strokeStyle="#9a4a3a"; ctx.lineWidth=3; ctx.beginPath(); ctx.ellipse(hx,hy+hh*0.8,hw*0.1,hh*0.07,0,0,7); ctx.stroke();
  ctx.lineWidth=1;
  ctx.font="22px sans-serif"; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText(def.emoji, cx, b.y+b.h*0.76+bob);
}

/* ---- Heróis (jogador e cards) ---- */
function drawPlayer(){
  const p=player;
  if(p.invuln>0 && Math.floor(p.t/4)%2===0 && deathTimer===0 && levelClearTimer===0) return;
  const dying = deathTimer>0;
  const walking = p.onGround && Math.abs(p.vx)>0.4;
  const swing = walking ? Math.sin(p.t*0.3) : 0;
  let state = p.onGround ? (walking?"walk":"idle") : "jump";
  if(dying) state = "dead";
  // tremidinha estilo Mario nos primeiros quadros da morte
  const shake = (dying && deathTimer>40) ? Math.sin(p.t*1.7)*4 : 0;
  drawHero(ctx, p.x+p.w/2+shake, p.y, p.h, p.skin, p.facing, state, swing, p.t);
}
/* Desenha o Lula — caricato e reconhecível (cabelo + barba grisalhos SEMPRE).
   skin: 'red' (camiseta+boné), 'suit' (terno), 'hat' (chapéu), 'forte' (bombado).
   state: 'idle' | 'walk' | 'jump' | 'dead'.  tick: contador p/ animação (respirada). */
function drawHero(c, cx, topY, H, skin, facing, state, swing, tick){
  const t = tick||0;
  const W=H*0.72, y=topY;
  const air=(state==="jump"), dead=(state==="dead");
  const breath = (state==="idle") ? Math.sin(t*0.09)*1.6 : 0;   // respirada parado

  const skinC="#e7b184", skinD="#cf9568", skinL="#f2c79e";
  let shirt="#e11021", shirtD="#b00d1a", pants="#2a4487", bare=true, hat="cap", buff=false;
  let hairC="#dcdce1", hairD="#b7b7bf", beardC="#e2e2e7";
  if(skin==="suit"){ shirt="#6e737d"; shirtD="#565b65"; pants="#4f535d"; bare=false; hat=null; }
  if(skin==="hat"){  shirt="#f4f0e4"; shirtD="#dcd6c4"; pants="#c7bb9c"; bare=false; hat="panama"; }
  if(skin==="forte"){ shirt="#e11021"; shirtD="#b00d1a"; pants="#2a2d3a"; bare=true; hat=null; buff=true;
                      hairC="#ffffff"; hairD="#e2e2e8"; beardC="#f7f7fa"; }

  c.save();
  c.translate(cx,y); c.scale(facing,1); c.translate(-cx,-y);
  if(dead){ c.translate(cx,y+H*0.5); c.rotate(0.16); c.translate(-cx,-(y+H*0.5)); } // tomba

  // sombra (some ao morrer)
  if(!dead){ c.fillStyle="rgba(0,0,0,.2)"; c.beginPath(); c.ellipse(cx,y+H,W*0.5,6,0,0,7); c.fill(); }

  // ---------- pernas ----------
  const legTop=y+H*0.64, legH=H*0.30, lw=W*0.22;
  c.fillStyle=pants;
  if(air||dead){ // recolhidas
    c.save(); c.translate(cx,legTop); c.rotate(-0.28); c.fillRect(-W*0.27,0,lw,legH*0.82);
      c.fillStyle="#17171c"; roundRect(c,-W*0.3,legH*0.74,lw+W*0.06,H*0.07,3); c.fill(); c.restore();
    c.fillStyle=pants;
    c.save(); c.translate(cx,legTop); c.rotate(0.32); c.fillRect(W*0.05,0,lw,legH*0.82);
      c.fillStyle="#17171c"; roundRect(c,W*0.02,legH*0.74,lw+W*0.06,H*0.07,3); c.fill(); c.restore();
  } else {
    c.fillRect(cx-W*0.26,legTop,lw,legH-swing*3);
    c.fillRect(cx+W*0.04,legTop,lw,legH+swing*3);
    c.fillStyle="#17171c";
    roundRect(c,cx-W*0.29,y+H-H*0.075,lw+W*0.06,H*0.075,3); c.fill();
    roundRect(c,cx+W*0.02,y+H-H*0.075,lw+W*0.06,H*0.075,3); c.fill();
  }

  // ---------- tronco ----------
  const tY=y+H*0.34-breath*0.3, tH=H*0.33+breath*0.3, tW=W*(buff?0.84:0.6);
  c.fillStyle=shirt; roundRect(c,cx-tW/2,tY,tW,tH,buff?12:8); c.fill();
  c.fillStyle=shirtD; roundRect(c,cx-tW/2,tY+tH*0.58,tW,tH*0.42,buff?12:8); c.fill();
  roundRect(c,cx-tW/2,tY,tW,tH,buff?12:8); c.strokeStyle="rgba(0,0,0,.25)"; c.lineWidth=2.4; c.stroke(); c.lineWidth=1;
  if(buff){
    c.strokeStyle=shirtD; c.lineWidth=2.4;
    c.beginPath(); c.moveTo(cx,tY+tH*0.14); c.lineTo(cx,tY+tH*0.52); c.stroke();
    c.beginPath(); c.arc(cx-tW*0.2,tY+tH*0.22,tW*0.16,0.2,1.2); c.arc(cx+tW*0.2,tY+tH*0.22,tW*0.16,Math.PI-1.2,Math.PI-0.2); c.stroke();
    c.lineWidth=1;
  }

  // ---------- braços ----------
  const aUp=H*(buff?0.2:0.17), aLo=H*(buff?0.17:0.14), aw=W*(buff?0.22:0.15), upY=tY+3;
  function arm(side){
    const ax = side<0 ? cx-tW/2-aw+3 : cx+tW/2-3;
    if(air||dead){ // erguidos em V (festejo no pulo / "ó!" da morte)
      c.save(); c.translate(ax+aw/2, upY+2); c.rotate(side*(air?-0.95:-1.2));
      c.fillStyle=buff?skinC:shirt; c.fillRect(-aw/2,0,aw,aUp);
      c.fillStyle=(bare||buff)?skinC:shirt; c.fillRect(-aw/2,aUp,aw,aLo);
      c.fillStyle=skinC; c.beginPath(); c.arc(0,aUp+aLo,aw*0.52,0,7); c.fill();
      c.restore(); return;
    }
    const sgn = side<0?-swing:swing;
    if(buff){
      c.fillStyle=skinC; c.beginPath(); c.ellipse(ax+aw/2, upY+aUp*0.5, aw*0.62, aUp*0.72, 0, 0, 7); c.fill();
      c.fillStyle=skinD; c.beginPath(); c.arc(ax+aw*(side<0?0.3:0.7), upY+aUp*0.5, aw*0.22, 0, 7); c.fill();
      c.fillStyle=skinC; c.fillRect(ax+aw*0.1, upY+aUp, aw*0.8, aLo+sgn*3);
      c.fillStyle=skinC; c.beginPath(); c.arc(ax+aw/2, upY+aUp+aLo+sgn*3, aw*0.42, 0, 7); c.fill();
    } else {
      c.fillStyle=shirt; c.fillRect(ax,upY,aw,aUp);
      c.fillStyle=bare?skinC:shirt; c.fillRect(ax,upY+aUp,aw,aLo+sgn*3);
      c.fillStyle=skinC; c.beginPath(); c.arc(ax+aw/2,upY+aUp+aLo+sgn*3+H*0.01,aw*0.55,0,7); c.fill();
    }
  }
  arm(-1); arm(1);
  if(buff){ c.fillStyle=shirt; c.fillRect(cx-tW*0.34,tY,tW*0.16,tH*0.3); c.fillRect(cx+tW*0.18,tY,tW*0.16,tH*0.3); }

  // detalhes de roupa
  if(skin==="suit"){
    c.fillStyle="#f6f6f2"; c.beginPath(); c.moveTo(cx-tW*0.18,tY); c.lineTo(cx,tY+tH*0.5); c.lineTo(cx+tW*0.18,tY); c.closePath(); c.fill();
    c.fillStyle=shirtD;
    c.beginPath(); c.moveTo(cx-tW*0.22,tY); c.lineTo(cx-tW*0.01,tY+tH*0.32); c.lineTo(cx-tW*0.01,tY); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(cx+tW*0.22,tY); c.lineTo(cx+tW*0.01,tY+tH*0.32); c.lineTo(cx+tW*0.01,tY); c.closePath(); c.fill();
    c.fillStyle="#d11a2a"; c.beginPath(); c.moveTo(cx-4,tY+tH*0.06); c.lineTo(cx+4,tY+tH*0.06); c.lineTo(cx+6,tY+tH*0.52); c.lineTo(cx,tY+tH*0.6); c.lineTo(cx-6,tY+tH*0.52); c.closePath(); c.fill();
  } else if(skin==="hat"){
    c.fillStyle=shirtD; c.beginPath(); c.moveTo(cx-tW*0.16,tY); c.lineTo(cx,tY+tH*0.2); c.lineTo(cx+tW*0.16,tY); c.closePath(); c.fill();
    c.fillStyle="#cfc8b4"; for(let i=0;i<3;i++) c.fillRect(cx-1,tY+tH*0.28+i*tH*0.18,2,4);
  } else if(!buff){
    c.fillStyle=shirtD; c.beginPath(); c.ellipse(cx,tY+3,tW*0.18,5,0,0,7); c.fill();
  }

  // ================= CABEÇA (grande e caricata) =================
  const hh=H*0.38, hw=W*0.64, hx=cx, hy=y-H*0.02+breath*0.6;
  // pescoço
  c.fillStyle=skinD; c.fillRect(hx-W*0.1, hy+hh*0.82, W*0.2, H*0.06);
  // orelhas
  c.fillStyle=skinC; c.beginPath(); c.arc(hx-hw*0.5,hy+hh*0.52,hw*0.12,0,7); c.arc(hx+hw*0.5,hy+hh*0.52,hw*0.12,0,7); c.fill();
  // rosto
  c.fillStyle=skinC; roundRect(c,hx-hw/2,hy+hh*0.04,hw,hh*0.92,hw*0.4); c.fill();
  c.fillStyle=skinL; roundRect(c,hx-hw*0.42,hy+hh*0.08,hw*0.48,hh*0.5,hw*0.3); c.fill();   // luz
  c.fillStyle=skinD; roundRect(c,hx+hw*0.2,hy+hh*0.1,hw*0.28,hh*0.78,hw*0.3); c.fill();     // sombra
  roundRect(c,hx-hw/2,hy+hh*0.04,hw,hh*0.92,hw*0.4); c.strokeStyle="rgba(0,0,0,.2)"; c.lineWidth=2; c.stroke(); c.lineWidth=1;

  // CABELO grisalho — cheio, jogado pra trás
  c.fillStyle=hairC;
  c.beginPath();
  c.moveTo(hx-hw*0.56,hy+hh*0.5);
  c.quadraticCurveTo(hx-hw*0.62,hy-hh*0.12,hx-hw*0.06,hy-hh*0.08);
  c.quadraticCurveTo(hx+hw*0.32,hy-hh*0.14,hx+hw*0.6,hy+hh*0.18);
  c.quadraticCurveTo(hx+hw*0.5,hy+hh*0.06,hx+hw*0.2,hy+hh*0.03);
  c.quadraticCurveTo(hx-hw*0.1,hy+hh*0.02,hx-hw*0.34,hy+hh*0.2);
  c.quadraticCurveTo(hx-hw*0.5,hy+hh*0.34,hx-hw*0.56,hy+hh*0.5);
  c.closePath(); c.fill();
  c.fillStyle=hairD; // mechas
  c.beginPath(); c.moveTo(hx-hw*0.5,hy+hh*0.42); c.quadraticCurveTo(hx-hw*0.2,hy+hh*0.06,hx+hw*0.12,hy+hh*0.08);
  c.lineTo(hx+hw*0.12,hy+hh*0.15); c.quadraticCurveTo(hx-hw*0.2,hy+hh*0.14,hx-hw*0.46,hy+hh*0.5); c.closePath(); c.fill();
  // costeletas ligam cabelo à barba
  c.fillStyle=hairC; c.fillRect(hx-hw*0.52,hy+hh*0.4,hw*0.1,hh*0.22); c.fillRect(hx+hw*0.42,hy+hh*0.4,hw*0.1,hh*0.22);

  // SOBRANCELHAS grossas grisalhas
  c.strokeStyle=hairD; c.lineWidth=hw*0.11; c.lineCap="round";
  c.beginPath(); c.moveTo(hx-hw*0.3,hy+hh*0.4); c.lineTo(hx-hw*0.06,hy+hh*0.42);
  c.moveTo(hx+hw*0.06,hy+hh*0.42); c.lineTo(hx+hw*0.3,hy+hh*0.4); c.stroke();
  c.lineWidth=1; c.lineCap="butt";

  // OLHOS
  if(dead){
    c.strokeStyle="#2a2320"; c.lineWidth=hw*0.07; c.lineCap="round";
    for(const ex of [-0.17,0.17]){ const X=hx+hw*ex, Y=hy+hh*0.5, r=hw*0.09;
      c.beginPath(); c.moveTo(X-r,Y-r); c.lineTo(X+r,Y+r); c.moveTo(X+r,Y-r); c.lineTo(X-r,Y+r); c.stroke(); }
    c.lineWidth=1; c.lineCap="butt";
  } else {
    c.fillStyle="#fff"; c.beginPath(); c.ellipse(hx-hw*0.17,hy+hh*0.5,hw*0.11,hw*0.12,0,0,7); c.ellipse(hx+hw*0.17,hy+hh*0.5,hw*0.11,hw*0.12,0,0,7); c.fill();
    c.fillStyle="#3a2d24"; c.beginPath(); c.arc(hx-hw*0.14,hy+hh*0.51,hw*0.055,0,7); c.arc(hx+hw*0.2,hy+hh*0.51,hw*0.055,0,7); c.fill();
  }

  // NARIZ
  c.fillStyle=skinD; c.beginPath(); c.ellipse(hx+hw*0.03,hy+hh*0.6,hw*0.1,hw*0.085,0,0,7); c.fill();
  c.fillStyle=skinC; c.beginPath(); c.ellipse(hx,hy+hh*0.57,hw*0.08,hw*0.07,0,0,7); c.fill();

  // BOCHECHAS rosadas
  c.fillStyle="rgba(214,110,90,.26)"; c.beginPath(); c.arc(hx-hw*0.28,hy+hh*0.64,hw*0.1,0,7); c.arc(hx+hw*0.28,hy+hh*0.64,hw*0.09,0,7); c.fill();

  // BARBA grisalha cheia (a marca do Lula)
  c.fillStyle=beardC;
  c.beginPath();
  c.moveTo(hx-hw*0.5,hy+hh*0.56);
  c.quadraticCurveTo(hx-hw*0.52,hy+hh*0.98,hx-hw*0.22,hy+hh*1.1);
  c.quadraticCurveTo(hx,hy+hh*1.22,hx+hw*0.22,hy+hh*1.1);
  c.quadraticCurveTo(hx+hw*0.52,hy+hh*0.98,hx+hw*0.5,hy+hh*0.56);
  c.quadraticCurveTo(hx+hw*0.3,hy+hh*0.74,hx+hw*0.14,hy+hh*0.67);
  c.quadraticCurveTo(hx,hy+hh*0.71,hx-hw*0.14,hy+hh*0.67);
  c.quadraticCurveTo(hx-hw*0.3,hy+hh*0.74,hx-hw*0.5,hy+hh*0.56);
  c.closePath(); c.fill();
  c.strokeStyle=hairD; c.lineWidth=1.2; c.globalAlpha=.45; // textura
  for(let i=-2;i<=2;i++){ c.beginPath(); c.moveTo(hx+hw*0.12*i,hy+hh*0.8); c.lineTo(hx+hw*0.12*i,hy+hh*1.04); c.stroke(); }
  c.globalAlpha=1; c.lineWidth=1;
  // BIGODE
  c.fillStyle=beardC; c.beginPath();
  c.moveTo(hx-hw*0.27,hy+hh*0.6); c.quadraticCurveTo(hx,hy+hh*0.56,hx+hw*0.27,hy+hh*0.6);
  c.quadraticCurveTo(hx+hw*0.14,hy+hh*0.73,hx,hy+hh*0.69);
  c.quadraticCurveTo(hx-hw*0.14,hy+hh*0.73,hx-hw*0.27,hy+hh*0.6); c.closePath(); c.fill();

  // BOCA / sorriso
  if(dead){
    c.fillStyle="#6b4a34"; c.beginPath(); c.ellipse(hx,hy+hh*0.76,hw*0.09,hw*0.07,0,0,7); c.fill();
  } else {
    c.strokeStyle="#8a5438"; c.lineWidth=2.4; c.lineCap="round";
    c.beginPath(); c.arc(hx,hy+hh*0.66,hw*0.17,0.18,Math.PI-0.18); c.stroke();
    c.fillStyle="#fff"; c.fillRect(hx-hw*0.11,hy+hh*0.68,hw*0.22,hh*0.04);
    c.lineWidth=1; c.lineCap="butt";
  }

  // ---------- chapéu / boné ----------
  if(hat==="cap"){
    c.fillStyle="#e11021"; c.beginPath(); c.arc(hx,hy+hh*0.2,hw*0.6,Math.PI,0); c.fill();
    c.fillStyle="#b00d1a"; c.fillRect(hx-hw*0.6,hy+hh*0.16,hw*1.2,hh*0.1);
    c.fillStyle="#c20f1d"; c.beginPath(); c.ellipse(hx+hw*0.42,hy+hh*0.24,hw*0.52,hh*0.1,0,0,Math.PI); c.fill();
    c.fillStyle="#fff"; c.beginPath(); c.arc(hx-hw*0.04,hy+hh*0.02,hw*0.09,0,7); c.fill(); // emblema
  } else if(hat==="panama"){
    c.fillStyle="#efe2bb"; c.beginPath(); c.ellipse(hx,hy+hh*0.2,hw*0.78,hh*0.12,0,0,7); c.fill();
    c.fillStyle="#f5ecce"; c.beginPath(); c.ellipse(hx,hy+hh*0.02,hw*0.46,hh*0.24,0,Math.PI,0); c.fill();
    c.fillRect(hx-hw*0.46,hy,hw*0.92,hh*0.16);
    c.fillStyle="#3a3a40"; c.fillRect(hx-hw*0.46,hy+hh*0.11,hw*0.92,hh*0.05);
  }

  c.restore();
}

function drawParticles(){
  for(const p of particles){ ctx.globalAlpha=Math.max(0,p.life); ctx.fillStyle=p.color; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,7); ctx.fill(); }
  ctx.globalAlpha=1;
}

/* ---- Mapa do Brasil ---- */
/* Contorno do Brasil por coordenadas geográficas reais (lon, lat), sentido
   horário a partir do norte. Projeção simples (equiretangular) no canvas. */
const GEO_BR = [
  [-60.2,5.2],[-59.8,4.6],[-55.9,2.5],[-51.6,4.1],[-50.0,1.8],[-48.5,-0.7],
  [-44.3,-2.5],[-41.8,-2.9],[-38.5,-3.7],[-37.2,-4.9],[-35.2,-5.2],[-34.8,-7.1],
  [-34.9,-8.1],[-35.7,-9.7],[-37.0,-11.0],[-38.5,-13.0],[-39.0,-15.8],[-39.7,-18.0],
  [-40.3,-20.3],[-41.8,-22.0],[-43.2,-23.0],[-45.0,-23.6],[-46.6,-24.0],[-48.5,-25.5],
  [-48.6,-27.6],[-49.7,-29.3],[-51.1,-30.9],[-52.1,-32.0],[-53.4,-33.7],[-55.6,-30.9],
  [-57.6,-30.2],[-56.0,-27.5],[-54.6,-25.6],[-54.3,-24.0],[-55.7,-22.5],[-57.9,-22.1],
  [-57.6,-19.0],[-60.2,-16.3],[-62.6,-13.0],[-65.4,-11.0],[-68.8,-11.0],[-70.6,-9.8],
  [-72.2,-9.5],[-73.8,-7.5],[-72.9,-5.1],[-70.9,-4.4],[-69.4,-1.1],[-69.8,1.1],
  [-67.3,1.9],[-65.5,0.9],[-64.0,1.9],[-62.0,4.1],[-60.7,5.0]
];
function brProj(){
  const LON0=-74.0, LON1=-34.3, LAT0=-33.9, LAT1=5.4;
  const padTop=80, padBot=48;
  const mapH=VIEW_H-padTop-padBot, scale=mapH/(LAT1-LAT0);
  const mapW=(LON1-LON0)*scale, ox=(VIEW_W-mapW)/2, oy=padTop;
  return (lon,lat)=>[ ox+(lon-LON0)*scale, oy+(LAT1-lat)*scale ];
}

let mapNodePx = [];
function drawMap(){
  const g=ctx.createLinearGradient(0,0,0,VIEW_H);
  g.addColorStop(0,"#2a6fb0"); g.addColorStop(1,"#8fd0a0");
  ctx.fillStyle=g; ctx.fillRect(0,0,VIEW_W,VIEW_H);
  // "oceano" + contorno estilizado do Brasil
  ctx.save();
  const P = brProj();
  // sombra do mapa
  ctx.fillStyle="rgba(0,0,0,.12)";
  ctx.beginPath();
  GEO_BR.forEach((p,i)=>{ const [X,Y]=P(p[0],p[1]); i?ctx.lineTo(X+6,Y+8):ctx.moveTo(X+6,Y+8); });
  ctx.closePath(); ctx.fill();
  // terra
  ctx.fillStyle="#f2e6c8";
  ctx.beginPath();
  GEO_BR.forEach((p,i)=>{ const [X,Y]=P(p[0],p[1]); i?ctx.lineTo(X,Y):ctx.moveTo(X,Y); });
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle="#c9b78a"; ctx.lineWidth=4; ctx.lineJoin="round"; ctx.stroke(); ctx.lineWidth=1;
  ctx.restore();

  // caminho entre fases (posições por lon/lat reais)
  mapNodePx = MAPA_NOS.map((n)=>{ const [x,y]=P(n.lon,n.lat); return {x,y}; });
  ctx.strokeStyle="rgba(0,0,0,.25)"; ctx.lineWidth=5; ctx.setLineDash([2,12]); ctx.lineCap="round";
  ctx.beginPath(); mapNodePx.forEach((p,i)=> i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)); ctx.stroke();
  ctx.setLineDash([]); ctx.lineWidth=1;

  // nós
  mapNodePx.forEach((p,i)=>{
    const done=i<completed, current=i===completed, locked=i>completed;
    const pulse=current?1+Math.sin(bgT*0.1)*0.08:1;
    ctx.save(); ctx.translate(p.x,p.y); ctx.scale(pulse,pulse);
    if(current){ ctx.globalAlpha=.4; ctx.fillStyle="#ffd12e"; ctx.beginPath(); ctx.arc(0,0,42,0,7); ctx.fill(); ctx.globalAlpha=1; }
    ctx.fillStyle=locked?"#9a9a9a":(done?"#1f9d55":"#e11021");
    ctx.beginPath(); ctx.arc(0,0,30,0,7); ctx.fill();
    ctx.strokeStyle="#15161a"; ctx.lineWidth=4; ctx.stroke(); ctx.lineWidth=1;
    ctx.fillStyle="#fff"; ctx.font="bold 26px 'Baloo 2'"; ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText(done?"✓":(locked?"🔒":(i+1)), 0, 2);
    ctx.restore();
    // rótulo
    ctx.fillStyle="#15161a"; ctx.font="600 16px 'Fredoka'"; ctx.textAlign="center";
    ctx.fillText("Fase "+(i+1), p.x, p.y+48);
  });
  // bonequinho do Lula em cima do nó atual (estilo mapa do Mario)
  const curIdx = Math.min(completed, mapNodePx.length-1);
  const np = mapNodePx[curIdx];
  if (np) {
    const hero = HEROIS.find(h=>h.id===selectedChar) || HEROIS[0];
    const hop = Math.abs(Math.sin(bgT*0.12))*6;
    drawHero(ctx, np.x, np.y - 30 - 54 - hop, 54, hero.skin, 1, "idle", 0, bgT);
  }
}
function handleMapClick(clientX, clientY){
  const rect=canvas.getBoundingClientRect();
  const sx=VIEW_W/rect.width, sy=VIEW_H/rect.height;
  const mx=(clientX-rect.left)*sx, my=(clientY-rect.top)*sy;
  for(let i=0;i<mapNodePx.length;i++){
    const p=mapNodePx[i], d=Math.hypot(mx-p.x,my-p.y);
    if(d<40 && i<=completed){ sfx("select"); enterLevel(i); return; }
  }
}

/* ============================================================================
 * LOOP
 * ==========================================================================*/
let last=0, acc=0; const STEP=1/60;
function frame(t){
  if(!last)last=t; let dt=(t-last)/1000; last=t; if(dt>0.25)dt=0.25; acc+=dt;
  let guard=0;
  while(acc>=STEP && guard<5){ if(scene===Scene.PLAY) update(); acc-=STEP; guard++; }
  // atualiza boss-bar visível só em play c/ boss ativo
  document.getElementById("boss-bar").classList.toggle("hidden", !(scene===Scene.PLAY && bossActive && boss && boss.alive));
  render();
  requestAnimationFrame(frame);
}

/* ----------------------------- Botões ----------------------------------- */
function bind(id, fn){ const el=document.getElementById(id); if(el) el.addEventListener("click", ()=>{ audio(); fn(); }); }
bind("btn-start", ()=>{ introStep=0; showScene(Scene.INTRO); });
bind("btn-help", ()=>showScene(Scene.HELP));
bind("btn-help-back", ()=>showScene(Scene.MENU));
bind("btn-intro-next", introNext);
bind("btn-intro-skip", ()=>showScene(Scene.CHAR));
bind("btn-char-go", newGame);
bind("btn-missao-go", startLevelPlay);
bind("btn-feito-ok", processDeedQueue);
bind("btn-next", afterFase);
bind("btn-retry", ()=>enterLevel(levelIndex));
bind("btn-menu", ()=>showScene(Scene.MENU));
bind("btn-win-again", ()=>{ newGame(); });
bind("btn-win-menu", ()=>showScene(Scene.MENU));
bind("btn-pause", togglePause);
bind("btn-resume", ()=>showScene(Scene.PLAY));
bind("btn-pause-map", ()=>showScene(Scene.MAP));
bind("btn-pause-menu", ()=>showScene(Scene.MENU));
bind("btn-music", toggleMusic);
document.getElementById("screen-map").addEventListener("click",(e)=>{ if(scene===Scene.MAP) handleMapClick(e.clientX,e.clientY); });

/* ----------------------------- Início ----------------------------------- */
buildCharCards();
loadLevel(0);
showScene(Scene.MENU);
requestAnimationFrame(frame);

/* Hook de teste — só com ?slwtest */
if (typeof location!=="undefined" && location.search.indexOf("slwtest")!==-1){
  window.__SLW={ get scene(){return scene;}, get player(){return player;}, get coins(){return coins;},
    get boss(){return boss;}, get enemies(){return enemies;}, get votos(){return votos;},
    get completed(){return completed;}, get deeds(){return collectedDeeds;},
    setPos(x,y){player.x=x;player.y=y;player.vx=0;player.vy=0;},
    goLevel(i){enterLevel(i);}, startPlay(){startLevelPlay();},
    get camx(){return cam.x;}, kill(){die();},
    bossPos(){return boss?{x:boss.x,y:boss.y}:null;} };
}

})();
