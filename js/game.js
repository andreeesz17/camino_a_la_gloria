const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Carga de Recursos Gráficos
const assets = {
    bg: new Image(),
    ball: new Image()
};
assets.bg.src = 'assets/stadium_background.png';
assets.ball.src = 'assets/soccer_ball.png'; // Imagen del balón premium generada

// Elementos de la UI
const screens = {
    start: document.getElementById('startScreen'),
    tournament: document.getElementById('tournamentScreen'),
    matchVictory: document.getElementById('matchVictoryScreen'),
    gameOver: document.getElementById('gameOverScreen'),
    champion: document.getElementById('championScreen'),
    scoreboard: document.getElementById('scoreboard')
};

let selectedTeamIdx = 3; // Argentina por defecto
const ui = {
    scoreLeft: document.getElementById('score-left'),
    scoreRight: document.getElementById('score-right'),
    time: document.getElementById('game-time'),
    goalMsg: document.getElementById('goal-message'),
    teamSelect: { get value() { return selectedTeamIdx; } },
    playerTeamName: document.getElementById('playerTeamName'),
    opponentTeamName: document.getElementById('opponentTeamName'),
    victoryScoreText: document.getElementById('victoryScoreText'),
    defeatScoreText: document.getElementById('defeatScoreText'),
    championTeamName: document.getElementById('championTeamName'),
    phaseText: document.getElementById('tournamentPhaseText'),
    teamLeftBox: document.getElementById('team-left-box'),
    teamRightBox: document.getElementById('team-right-box'),
    soundToggleBtn: document.getElementById('soundToggleBtn'),
    pauseBtn: document.getElementById('pauseBtn')
};

// Equipos con personalización completa, stats y flags vectoriales (Fase 1)
const TEAMS = [
    { id: 'USA', name: 'Estados Unidos', primary: '#1e293b', secondary: '#ef4444', detail: '#ffffff', skin: '#fcd34d', hair: '#f59e0b', facialHair: 'stubble', headsetColor: '#ef4444', stats: { speed: 80, kick: 82, jump: 85 } },
    { id: 'MEX', name: 'México', primary: '#15803d', secondary: '#ffffff', detail: '#b91c1c', skin: '#d9a066', hair: '#171717', facialHair: 'beard', headsetColor: '#15803d', stats: { speed: 85, kick: 80, jump: 82 } },
    { id: 'CAN', name: 'Canadá', primary: '#dc2626', secondary: '#ffffff', detail: '#ef4444', skin: '#ffebd5', hair: '#451a03', facialHair: 'none', headsetColor: '#ffffff', stats: { speed: 78, kick: 88, jump: 84 } },
    { id: 'ARG', name: 'Argentina', primary: '#7dd3fc', secondary: '#ffffff', detail: '#0f172a', skin: '#ffdbac', hair: '#1e293b', facialHair: 'beard', headsetColor: '#7dd3fc', stats: { speed: 92, kick: 90, jump: 88 } },
    { id: 'FRA', name: 'Francia', primary: '#1d4ed8', secondary: '#ffffff', detail: '#e11d48', skin: '#f5cac3', hair: '#3b2314', facialHair: 'stubble', headsetColor: '#e11d48', stats: { speed: 95, kick: 85, jump: 90 } },
    { id: 'BRA', name: 'Brasil', primary: '#fbbf24', secondary: '#16a34a', detail: '#1d4ed8', skin: '#d9a066', hair: '#0a0f1d', facialHair: 'none', headsetColor: '#1d4ed8', stats: { speed: 90, kick: 92, jump: 85 } },
    { id: 'ECU', name: 'Ecuador', primary: '#fbbf24', secondary: '#1d4ed8', detail: '#dc2626', skin: '#c68642', hair: '#000000', facialHair: 'beard', headsetColor: '#dc2626', stats: { speed: 88, kick: 80, jump: 92 } },
    { id: 'ESP', name: 'España', primary: '#dc2626', secondary: '#facc15', detail: '#3f3f46', skin: '#ffdbac', hair: '#3f3f46', facialHair: 'beard', headsetColor: '#facc15', stats: { speed: 82, kick: 85, jump: 80 } },
    { id: 'GER', name: 'Alemania', primary: '#ffffff', secondary: '#0f172a', detail: '#dc2626', skin: '#fef08a', hair: '#f59e0b', facialHair: 'stubble', headsetColor: '#0f172a', stats: { speed: 80, kick: 94, jump: 82 } },
    { id: 'JPN', name: 'Japón', primary: '#1e3a8a', secondary: '#ffffff', detail: '#dc2626', skin: '#ffebd5', hair: '#0a0f1d', facialHair: 'none', headsetColor: '#dc2626', stats: { speed: 94, kick: 78, jump: 86 } }
];

// Generar visualmente las tarjetas de selección
const cardsGrid = document.getElementById('team-cards-grid');
if (cardsGrid) {
    TEAMS.forEach((team, idx) => {
        const card = document.createElement('div');
        card.className = `team-card ${idx === selectedTeamIdx ? 'selected' : ''}`;
        card.dataset.index = idx;
        
        card.innerHTML = `
            <div class="flag-icon flag-${team.id} shadow-sm"></div>
            <span>${team.id}</span>
        `;
        
        card.addEventListener('click', () => {
            document.querySelectorAll('.team-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedTeamIdx = idx;
            updatePreviewUI(team);
        });
        
        cardsGrid.appendChild(card);
    });
}

function updatePreviewUI(team) {
    const pName = document.getElementById('preview-team-name');
    const pBadge = document.getElementById('preview-team-badge');
    const spVal = document.getElementById('stat-speed-val');
    const spBar = document.getElementById('stat-speed-bar');
    const kcVal = document.getElementById('stat-kick-val');
    const kcBar = document.getElementById('stat-kick-bar');
    const jmVal = document.getElementById('stat-jump-val');
    const jmBar = document.getElementById('stat-jump-bar');
    
    if (pName) pName.innerText = team.name;
    if (pBadge) pBadge.innerText = `DORSAL 10 - ${team.id === 'ARG' || team.id === 'BRA' || team.id === 'FRA' ? 'ESTRELLA' : 'LÍDER'}`;
    
    if (spVal && spBar) {
        spVal.innerText = `${team.stats.speed}%`;
        spBar.style.width = `${team.stats.speed}%`;
    }
    if (kcVal && kcBar) {
        kcVal.innerText = `${team.stats.kick}%`;
        kcBar.style.width = `${team.stats.kick}%`;
    }
    if (jmVal && jmBar) {
        jmVal.innerText = `${team.stats.jump}%`;
        jmBar.style.width = `${team.stats.jump}%`;
    }
}

// Bucle de Vista Previa del Jugador en Menú
let previewAnimId;
function startPreviewLoop() {
    const pCanvas = document.getElementById('previewCanvas');
    const pCtx = pCanvas ? pCanvas.getContext('2d') : null;
    if (!pCtx || !pCanvas) return;

    function renderPreview(time) {
        if (gameState !== 'MENU') {
            previewAnimId = requestAnimationFrame(renderPreview);
            return;
        }
        pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
        
        const team = TEAMS[selectedTeamIdx];
        const centerX = pCanvas.width / 2;
        const centerY = pCanvas.height * 0.72;
        
        const bop = Math.sin(time * 0.005) * 2.8;
        const headW = 48;
        const headH = 56;
        const headY = centerY - headH * 0.45 + bop;
        
        // --- Dibujar Sombra ---
        pCtx.fillStyle = 'rgba(15, 23, 42, 0.35)';
        pCtx.beginPath();
        pCtx.ellipse(centerX, centerY + 2, headW * 0.7, 4, 0, 0, Math.PI * 2);
        pCtx.fill();

        // --- Dibujar Camiseta/Cuerpo ---
        pCtx.save();
        pCtx.translate(centerX, headY + headH * 0.52);
        pCtx.fillStyle = team.primary;
        pCtx.strokeStyle = '#0f172a';
        pCtx.lineWidth = 2;
        pCtx.beginPath();
        pCtx.roundRect(-16, 0, 32, 14, [4, 4, 2, 2]);
        pCtx.fill();
        pCtx.stroke();
        
        // Detalles de jersey
        pCtx.strokeStyle = team.secondary;
        pCtx.lineWidth = 1.5;
        pCtx.beginPath();
        pCtx.moveTo(-12, 2);
        pCtx.lineTo(-12, 12);
        pCtx.moveTo(12, 2);
        pCtx.lineTo(12, 12);
        pCtx.stroke();
        
        // Cuello
        pCtx.fillStyle = team.detail || '#ffffff';
        pCtx.beginPath();
        pCtx.moveTo(-6, 0);
        pCtx.lineTo(6, 0);
        pCtx.lineTo(0, 4);
        pCtx.closePath();
        pCtx.fill();
        pCtx.stroke();
        pCtx.restore();

        // --- Dibujar Cabeza ---
        pCtx.save();
        pCtx.translate(centerX, headY);
        pCtx.fillStyle = team.skin;
        pCtx.strokeStyle = '#0f172a';
        pCtx.lineWidth = 2.5;
        pCtx.beginPath();
        pCtx.ellipse(0, 0, headW * 0.5, headH * 0.5, 0, 0, Math.PI * 2);
        pCtx.fill();
        pCtx.stroke();

        // --- Cabello ---
        pCtx.fillStyle = team.hair;
        pCtx.beginPath();
        pCtx.ellipse(0, -headH * 0.15, headW * 0.51, headH * 0.4, 0, Math.PI, 0);
        pCtx.fill();
        pCtx.beginPath();
        pCtx.moveTo(-headW * 0.5, -headH * 0.1);
        pCtx.quadraticCurveTo(-headW * 0.3, -headH * 0.5, 0, -headH * 0.55);
        pCtx.quadraticCurveTo(headW * 0.3, -headH * 0.5, headW * 0.5, -headH * 0.1);
        pCtx.lineTo(headW * 0.2, -headH * 0.25);
        pCtx.lineTo(-headW * 0.1, -headH * 0.2);
        pCtx.closePath();
        pCtx.fill();
        pCtx.stroke();

        // --- Barba ---
        if (team.facialHair === 'beard') {
            pCtx.fillStyle = team.hair;
            pCtx.beginPath();
            pCtx.ellipse(4, headH * 0.24, headW * 0.41, headH * 0.26, 0, 0, Math.PI);
            pCtx.fill();
            pCtx.stroke();
        } else if (team.facialHair === 'stubble') {
            pCtx.fillStyle = 'rgba(15, 23, 42, 0.2)';
            pCtx.beginPath();
            pCtx.ellipse(4, headH * 0.24, headW * 0.41, headH * 0.26, 0, 0, Math.PI);
            pCtx.fill();
        }

        // --- Auriculares Gamer ---
        pCtx.strokeStyle = team.headsetColor;
        pCtx.lineWidth = 5;
        pCtx.beginPath();
        pCtx.arc(0, -5, headW * 0.49, Math.PI * 1.15, Math.PI * 1.85);
        pCtx.stroke();
        
        // Auricular Copa
        pCtx.fillStyle = '#1e293b';
        pCtx.strokeStyle = '#0f172a';
        pCtx.lineWidth = 2;
        pCtx.beginPath();
        pCtx.roundRect(-headW * 0.51 - 3, -10, 6, 18, 3);
        pCtx.roundRect(headW * 0.51 - 3, -10, 6, 18, 3);
        pCtx.fill();
        pCtx.stroke();
        pCtx.fillStyle = team.headsetColor;
        pCtx.beginPath();
        pCtx.roundRect(-headW * 0.51 - 1, -8, 4, 14, 2);
        pCtx.roundRect(headW * 0.51 - 3, -8, 4, 14, 2);
        pCtx.fill();
        pCtx.stroke();

        // --- Ojos Atentos ---
        pCtx.fillStyle = '#ffffff';
        pCtx.beginPath();
        pCtx.ellipse(8, -3, 5, 5, 0, 0, Math.PI * 2);
        pCtx.fill();
        pCtx.stroke();
        pCtx.fillStyle = team.detail !== '#ffffff' ? team.detail : '#0284c7';
        pCtx.beginPath();
        pCtx.arc(8, -3, 2.5, 0, Math.PI * 2);
        pCtx.fill();
        pCtx.fillStyle = '#0f172a';
        pCtx.beginPath();
        pCtx.arc(8, -3, 1.2, 0, Math.PI * 2);
        pCtx.fill();
        
        // Ceja
        pCtx.strokeStyle = team.hair;
        pCtx.lineWidth = 3;
        pCtx.beginPath();
        pCtx.moveTo(2, -9);
        pCtx.lineTo(14, -10);
        pCtx.stroke();

        // --- Boca Sonriente ---
        pCtx.strokeStyle = '#0f172a';
        pCtx.lineWidth = 2;
        pCtx.beginPath();
        pCtx.arc(8, 12, 3.5, 0, Math.PI);
        pCtx.stroke();

        pCtx.restore();
        previewAnimId = requestAnimationFrame(renderPreview);
    }
    
    if (previewAnimId) cancelAnimationFrame(previewAnimId);
    previewAnimId = requestAnimationFrame(renderPreview);
}
setTimeout(startPreviewLoop, 100);

let tournament = {
    playerTeam: null,
    phase: 0, 
    opponents: [], 
    currentOpponent: null,
    isPlaying: false
};

function resizeCanvas() {
    canvas.width = 1100;
    canvas.height = 600;
    updateGoalPositions();
}
// Inicialización única de resolución lógica
resizeCanvas();

// Opciones globales del partido (Selección manual y Dificultad)
let currentDifficulty = 'medium';
let currentWeather = 'sunny';
let goalFlashAlpha = 0;

// Configuraciones de IA por dificultad
const DIFFICULTY_CONFIGS = {
    easy: { diffCoeff: 0.45, reactDelay: 0.28, jumpChance: 0.35, speedScale: 0.85 },
    medium: { diffCoeff: 0.70, reactDelay: 0.20, jumpChance: 0.65, speedScale: 1.0 },
    hard: { diffCoeff: 0.90, reactDelay: 0.12, jumpChance: 0.85, speedScale: 1.15 },
    extreme: { diffCoeff: 1.10, reactDelay: 0.05, jumpChance: 0.98, speedScale: 1.35 }
};

// Historial y métricas de estadísticas de partido
let matchStats = {
    possessionTimeLeft: 0,
    possessionTimeRight: 0,
    shotsLeft: 0,
    shotsRight: 0,
    shotsOnTargetLeft: 0,
    shotsOnTargetRight: 0
};

// --- IMPLEMENTACIÓN DEL OBJECT POOL PARA RENDIMIENTO ---
const MAX_PARTICLES = 300;
const particlePool = Array.from({ length: MAX_PARTICLES }, () => ({
    active: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    life: 0,
    size: 0,
    color: '#fff',
    rot: 0,
    rotSpd: 0,
    isHeart: false,
    isWeather: false,
    weatherType: ''
}));

function spawnParticle(properties) {
    const p = particlePool.find(item => !item.active);
    if (p) {
        p.active = true;
        p.x = properties.x || 0;
        p.y = properties.y || 0;
        p.vx = properties.vx || 0;
        p.vy = properties.vy || 0;
        p.life = properties.life || 1.0;
        p.size = properties.size || 5;
        p.color = properties.color || '#fff';
        p.rot = properties.rot || 0;
        p.rotSpd = properties.rotSpd || 0;
        p.isHeart = properties.isHeart || false;
        p.isWeather = properties.isWeather || false;
        p.weatherType = properties.weatherType || '';
    }
}

// Parámetros de física
let gameState = 'MENU'; 
let animationId, lastTime = 0, gameTime = 0, timeRemaining = 60;
let scores = { left: 0, right: 0 };

let cameraShakeX = 0, cameraShakeY = 0, shakeAmount = 0;
let hitStopFrames = 0;
let entities = { particles: [], shockwaves: [], powerups: [] };

const GRAVITY = 3400; 
let GROUND_OFFSET = 96; 

const P_ACCEL = 4500;
const P_FRICTION = 0.82;
let JUMP_FORCE = -1280; 

const B_ELASTICITY = 0.82;
const B_FRICTION = 0.993;

let KICK_X = 1200;
let KICK_Y = -920;

let goalWidth = 180; 
let goalHeight = 150; 

let powerupSpawnTimer = 8; 

// Límites físicos de los travesaños
const goals = {
    left: { x: 0, y: 0, w: 0, h: 10 },
    right: { x: 0, y: 0, w: 0, h: 10 }
};

function updateGoalPositions() {
    GROUND_OFFSET = canvas.height * 0.16; 
    goalWidth = canvas.width * 0.135;    
    goalHeight = canvas.height * 0.234;  

    const groundY = canvas.height - GROUND_OFFSET;
    JUMP_FORCE = -Math.sqrt(2 * GRAVITY * (canvas.height * 0.45)); 
    KICK_X = canvas.width * 1.05;
    KICK_Y = -canvas.height * 1.45;

    goals.left.x = 0;
    goals.left.y = groundY - goalHeight;
    goals.left.w = goalWidth;
    
    goals.right.x = canvas.width - goalWidth;
    goals.right.y = groundY - goalHeight;
    goals.right.w = goalWidth;
}


const keys = { left: false, right: false, up: false, kick: false };

const setKey = (code, val) => {
    if (['ArrowLeft', 'KeyA'].includes(code)) keys.left = val;
    if (['ArrowRight', 'KeyD'].includes(code)) keys.right = val;
    if (['ArrowUp', 'KeyW'].includes(code)) keys.up = val;
    if (['Space', 'KeyK'].includes(code)) keys.kick = val;
};
window.addEventListener('keydown', e => setKey(e.code, true));
window.addEventListener('keyup', e => setKey(e.code, false));

const bindTouch = (id, key) => {
    const btn = document.getElementById(id);
    btn.addEventListener('touchstart', e => {
        e.preventDefault();
        keys[key] = true;
        sounds.init(); 
        sounds.startAmbient();
    });
    btn.addEventListener('touchend', e => {
        e.preventDefault();
        keys[key] = false;
    });
};
bindTouch('btn-left', 'left');
bindTouch('btn-right', 'right');
bindTouch('btn-jump', 'up');
bindTouch('btn-kick', 'kick');

function shakeScreen(amount) {
    shakeAmount = amount;
}

// Power-Up Item
class PowerUp {
    constructor() {
        this.x = canvas.width * 0.25 + Math.random() * canvas.width * 0.5;
        this.y = -50;
        this.vy = 125; 
        this.radius = 22;
        
        const types = ['freeze', 'bigball', 'smallball', 'speed'];
        this.type = types[Math.floor(Math.random() * types.length)];
        this.pulse = 0;
    }

    update(dt) {
        this.y += this.vy * dt;
        this.pulse += dt * 5;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        const bounce = Math.sin(this.pulse) * 4;
        ctx.translate(0, bounce);

        const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, this.radius);
        let color = '#38bdf8';
        if (this.type === 'freeze') color = '#a5f3fc';
        if (this.type === 'bigball') color = '#22c55e';
        if (this.type === 'smallball') color = '#ef4444';
        if (this.type === 'speed') color = '#eab308';

        grad.addColorStop(0, 'rgba(255,255,255,0.8)');
        grad.addColorStop(0.5, color + '55');
        grad.addColorStop(1, color);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 20px Fredoka';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let icon = '❓';
        if (this.type === 'freeze') icon = '❄️';
        if (this.type === 'bigball') icon = '🟢';
        if (this.type === 'smallball') icon = '🔴';
        if (this.type === 'speed') icon = '⚡';
        ctx.fillText(icon, 0, 1);

        ctx.restore();
    }
}

// Clase de Balón
class Ball {
    constructor() {
        this.baseRadius = 34;
        this.radius = this.baseRadius;
        this.reset();
        this.trail = [];
        this.fireShot = false;
        this.fireColor = '#ff4500';
    }

    reset() {
        this.x = canvas.width / 2;
        this.y = canvas.height * 0.35;
        this.vx = 0;
        this.vy = 0;
        this.rotation = 0;
        this.trail = [];
        this.fireShot = false;
        this.radius = this.baseRadius;
    }

    update(dt) {
        this.vy += GRAVITY * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        this.vx *= B_FRICTION;
        if (this.y < canvas.height - GROUND_OFFSET) this.vy *= 0.995;

        this.rotation += this.vx * dt * 0.12;

        if (Math.abs(this.vx) > 300 || Math.abs(this.vy) > 300) {
            this.trail.unshift({ x: this.x, y: this.y, rot: this.rotation, r: this.radius });
            if (this.trail.length > 10) this.trail.pop();
            
            if (Math.abs(this.vx) > 750) {
                this.fireShot = true;
                spawnParticle({
                    x: this.x + (Math.random() - 0.5) * this.radius,
                    y: this.y + (Math.random() - 0.5) * this.radius,
                    vx: -this.vx * 0.18 + (Math.random() - 0.5) * 60,
                    vy: -this.vy * 0.18 + (Math.random() - 0.5) * 60,
                    life: 0.42,
                    size: Math.random() * 7 + 3,
                    color: this.fireColor
                });
            } else {
                this.fireShot = false;
            }
        } else {
            this.trail.pop();
            this.fireShot = false;
        }

        const groundY = canvas.height - GROUND_OFFSET;
        if (this.y + this.radius > groundY) {
            this.y = groundY - this.radius;
            if (this.vy > 40) {
                this.vy = -this.vy * B_ELASTICITY;
                if (this.vy < -160) {
                    createDust(this.x, groundY);
                    sounds.playBounce();
                }
            } else {
                this.vy = 0;
            }
        }

        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx = -this.vx * B_ELASTICITY;
            sounds.playBounce();
        }
        if (this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius;
            this.vx = -this.vx * B_ELASTICITY;
            sounds.playBounce();
        }
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.vy = -this.vy * B_ELASTICITY;
            sounds.playBounce();
        }
    }

    draw() {
        this.trail.forEach((t, i) => {
            const alpha = 1 - (i / this.trail.length);
            const scale = 1 - (i * 0.04);
            ctx.save();
            ctx.translate(t.x, t.y);
            ctx.rotate(t.rot);
            ctx.scale(scale, scale);
            ctx.globalAlpha = alpha * 0.35;
            
            if (this.fireShot) {
                ctx.fillStyle = this.fireColor;
                ctx.beginPath();
                ctx.arc(0, 0, t.r * 1.15, 0, Math.PI * 2);
                ctx.fill();
            } else {
                this.drawBallShape(t.r);
            }
            ctx.restore();
        });

        ctx.save();
        ctx.translate(this.x, this.y);

        // Halo de energía del torneo (Tournament dynamic glow / centerpiece aura)
        const ballGlow = ctx.createRadialGradient(0, 0, this.radius * 0.8, 0, 0, this.radius * 1.6);
        ballGlow.addColorStop(0, 'rgba(251, 191, 36, 0.55)'); // Amarillo/Oro
        ballGlow.addColorStop(0.4, 'rgba(2, 132, 199, 0.25)'); // Azul neón
        ballGlow.addColorStop(1, 'rgba(2, 132, 199, 0)');
        ctx.fillStyle = ballGlow;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 1.6, 0, Math.PI * 2);
        ctx.fill();

        // Sombra suave con degradado radial (Fase 2)
        const groundY = canvas.height - GROUND_OFFSET;
        const dist = groundY - this.y;
        const shadowScale = Math.max(0.2, 1 - dist / 280);
        const shadowAlpha = Math.max(0, 0.52 - dist / 280);
        
        ctx.save();
        const shadowGrad = ctx.createRadialGradient(0, dist, 2, 0, dist, this.radius * 1.35 * shadowScale);
        shadowGrad.addColorStop(0, `rgba(11, 15, 25, ${shadowAlpha})`);
        shadowGrad.addColorStop(0.5, `rgba(11, 15, 25, ${shadowAlpha * 0.4})`);
        shadowGrad.addColorStop(1, 'rgba(11, 15, 25, 0)');
        
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.ellipse(0, dist, this.radius * 1.35 * shadowScale, this.radius * 0.42 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.rotate(this.rotation);
        
        // Carga y renderizado del Balón Premium subido
        if (assets.ball.complete && assets.ball.naturalWidth !== 0) {
            ctx.drawImage(assets.ball, -this.radius, -this.radius, this.radius * 2, this.radius * 2);
        } else {
            this.drawBallShape(this.radius);
        }

        // Restaura la rotación del balón para dibujar el brillo especular estático (Specular Stadium Lights)
        ctx.rotate(-this.rotation);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.ellipse(-this.radius * 0.3, -this.radius * 0.3, this.radius * 0.28, this.radius * 0.18, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawBallShape(r) {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = '#f8fafc';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#0f172a';
        ctx.stroke();

        ctx.fillStyle = '#334155';
        const drawP = (x, y, pr) => {
            ctx.beginPath();
            ctx.arc(x, y, pr, 0, Math.PI * 2);
            ctx.fill();
        };

        drawP(0, 0, r * 0.33);
        for (let i = 0; i < 5; i++) {
            let ang = (i * Math.PI * 2 / 5);
            let dist = r * 0.72;
            drawP(Math.cos(ang) * dist, Math.sin(ang) * dist, r * 0.22);
        }
    }
}

function adjustColorBrightness(hex, percent) {
    let num = parseInt(hex.replace("#",""), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        G = (num >> 8 & 0x00FF) + amt,
        B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R<255?R<0?0:R:255)*0x10000 + (G<255?G<0?0:G:255)*0x100 + (B<255?B<0?0:B:255)).toString(16).slice(1);
}

// Clase de Jugador Cabezón
class Player {
    constructor(isLeft, team) {
        this.isLeft = isLeft;
        this.team = team;
        
        this.headW = 72;
        this.headH = 85;
        this.shoeW = 47; 
        this.shoeH = 28; 
        this.bodyW = 50;
        
        this.reset();

        this.idleTimer = Math.random() * 50;
        this.blinkTimer = 0;
        this.emotion = 'normal';
        this.aiTimer = 0;
        
        this.frozenTimer = 0;
        this.speedTimer = 0;
    }

    reset() {
        this.x = this.isLeft ? canvas.width * 0.25 : canvas.width * 0.75;
        this.y = canvas.height - GROUND_OFFSET - this.headH * 1.5;
        this.vx = 0;
        this.vy = 0;
        this.isGrounded = false;
        
        this.kickTimer = 0;
        this.shoeAngle = 0; 
        
        this.emotion = 'normal';
        this.frozenTimer = 0;
        this.speedTimer = 0;
    }

    get headR() {
        return (this.headW + this.headH) / 4;
    }

    update(dt, ball) {
        // Lógica del estado INTRO (los jugadores entran trotando a la cancha)
        if (gameState === 'INTRO') {
            const targetX = this.isLeft ? canvas.width * 0.25 : canvas.width * 0.75;
            this.x += (targetX - this.x) * dt * 3.8;
            this.vy += GRAVITY * dt;
            const floorY = canvas.height - GROUND_OFFSET - this.headH - 18;
            if (this.y > floorY) {
                this.y = floorY;
                this.vy = 0;
                this.isGrounded = true;
            }
            // Animar bop de trote
            this.idleTimer += dt * 18;
            return;
        }

        // Lógica de emociones dinámicas y celebración durante el juego
        if (gameState === 'PLAYING') {
            if (this.frozenTimer > 0) {
                this.emotion = 'sad';
            } else if (this.kickTimer > 0 || !this.isGrounded) {
                this.emotion = 'intense';
            } else {
                const dx = ball.x - this.x;
                const dy = ball.y - this.y;
                const dist = Math.hypot(dx, dy);
                const isCloseToOwnGoal = this.isLeft ? (ball.x < goalWidth * 1.5) : (ball.x > canvas.width - goalWidth * 1.5);
                if (dist < 190 || isCloseToOwnGoal) {
                    this.emotion = 'alert';
                } else {
                    this.emotion = 'normal';
                }
            }
        } else if (gameState === 'GOAL' || gameState === 'CELEBRATION' || gameState === 'CHAMPION' || gameState === 'GAMEOVER') {
            // Saltos continuos del ganador en celebraciones
            if (this.emotion === 'happy' && this.isGrounded && Math.random() < 0.22) {
                this.vy = JUMP_FORCE * 0.7;
                this.isGrounded = false;
                createDust(this.x, canvas.height - GROUND_OFFSET);
            }
        }

        // Colisión sólida con postes verticales delanteros (Fase 2 crítica)
        const postLeftX = goalWidth;
        const postRightX = canvas.width - goalWidth;
        if (this.y + this.headH + 18 > canvas.height - GROUND_OFFSET - goalHeight) {
            // Portería Izquierda (Poste vertical frontal)
            if (this.x - this.headW * 0.55 < postLeftX && this.x > postLeftX - 15) {
                this.x = postLeftX + this.headW * 0.55;
                this.vx = 0;
            }
            // Portería Derecha (Poste vertical frontal)
            if (this.x + this.headW * 0.55 > postRightX && this.x < postRightX + 15) {
                this.x = postRightX - this.headW * 0.55;
                this.vx = 0;
            }
        }

        if (this.frozenTimer > 0) {
            this.frozenTimer -= dt;
            this.vx = 0;
            if (this.frozenTimer <= 0) this.emotion = 'normal';
        }
        if (this.speedTimer > 0) this.speedTimer -= dt;

        this.vy += GRAVITY * dt;
        this.idleTimer += dt * 10;
        this.blinkTimer -= dt;
        if (this.blinkTimer < 0) this.blinkTimer = Math.random() * 4 + 1.2;

        let ax = 0;

        if (this.frozenTimer <= 0) {
            const speedMultiplier = this.speedTimer > 0 ? 1.55 : 1.0;
            if (this.isLeft) {
                if (keys.left) ax = -P_ACCEL * speedMultiplier;
                if (keys.right) ax = P_ACCEL * speedMultiplier;
                if (keys.up && this.isGrounded) {
                    this.vy = JUMP_FORCE;
                    this.isGrounded = false;
                    createDust(this.x, canvas.height - GROUND_OFFSET);
                }
                if (keys.kick && this.kickTimer <= 0) {
                    this.kickTimer = 0.3;
                    sounds.playKick();
                }
            } else {
                this.updateAI(dt, ball, speedMultiplier);
            }
        }

        this.vx += ax * dt;
        this.vx *= P_FRICTION;

        const maxSpd = this.speedTimer > 0 ? 800 : 550;
        if (this.vx > maxSpd) this.vx = maxSpd;
        if (this.vx < -maxSpd) this.vx = -maxSpd;

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        const facing = this.isLeft ? 1 : -1;
        if (this.kickTimer > 0) {
            this.kickTimer -= dt;
            const progress = 1 - (this.kickTimer / 0.3);
            if (progress < 0.25) {
                this.shoeAngle = -Math.PI/6 * facing * (progress / 0.25);
            } else if (progress < 0.7) {
                const swingProgress = (progress - 0.25) / 0.45;
                this.shoeAngle = (-Math.PI/6 + (Math.PI / 1.45) * swingProgress) * facing;
            } else {
                const returnProgress = (progress - 0.7) / 0.3;
                this.shoeAngle = (Math.PI / 2 * (1 - returnProgress)) * facing;
            }
        } else {
            this.shoeAngle = 0;
        }

        const floorY = canvas.height - GROUND_OFFSET - this.headH - 18;
        this.isGrounded = false;
        
        if (this.y > floorY) {
            this.y = floorY;
            this.vy = 0;
            this.isGrounded = true;
        }

        // Desprender partículas de césped por fricción al frenar/deslizarse a alta velocidad en el suelo (Fase 2)
        if (Math.abs(this.vx) > 300 && this.isGrounded && Math.random() < 0.28) {
            spawnParticle({
                x: this.x + (Math.random() - 0.5) * 20,
                y: canvas.height - GROUND_OFFSET,
                vx: -this.vx * 0.15 + (Math.random() - 0.5) * 30,
                vy: -Math.random() * 80 - 20,
                life: 0.6,
                size: Math.random() * 3 + 1.5,
                color: Math.random() > 0.5 ? '#166534' : '#15803d',
                rot: Math.random() * Math.PI,
                rotSpd: (Math.random() - 0.5) * 5
            });
        }

        const checkGoalLedge = (goal) => {
            if (this.vy >= 0 && 
                this.x + this.headW * 0.7 > goal.x && 
                this.x - this.headW * 0.7 < goal.x + goal.w &&
                this.y + this.headH + 18 >= goal.y &&
                this.y + this.headH - 10 <= goal.y) {
                this.y = goal.y - this.headH - 18;
                this.vy = 0;
                this.isGrounded = true;
            }
        };
        checkGoalLedge(goals.left);
        checkGoalLedge(goals.right);

        const r = this.headW;
        if (this.x - r < 0) this.x = r;
        if (this.x + r > canvas.width) this.x = canvas.width - r;

        if (this.emotion === 'happy' && Math.random() < 0.25) {
            spawnParticle({
                x: this.x + (Math.random() - 0.5) * 60,
                y: this.y + (Math.random() - 0.5) * 60,
                vx: (Math.random() - 0.5) * 60,
                vy: -Math.random() * 90 - 50,
                life: 0.7,
                size: Math.random() * 4 + 2,
                color: '#eab308' 
            });
        } else if (this.emotion === 'sad' && Math.random() < 0.15) {
            spawnParticle({
                x: this.x + (this.isLeft ? 15 : -15),
                y: this.y - 15,
                vx: (this.isLeft ? 1 : -1) * (10 + Math.random() * 15),
                vy: -20 - Math.random() * 30,
                life: 0.55,
                size: Math.random() * 3.5 + 2,
                color: '#38bdf8' 
            });
        }
    }

    updateAI(dt, ball, speedMultiplier) {
        const config = DIFFICULTY_CONFIGS[currentDifficulty] || DIFFICULTY_CONFIGS.medium;
        this.aiTimer -= dt;
        
        let targetVx = 0;
        const dx = ball.x - this.x;

        if (this.aiTimer <= 0) {
            this.aiTimer = config.reactDelay + Math.random() * 0.05; 
        }

        // LÓGICA DE DECISIONES DE LA IA
        const followThreshold = currentDifficulty === 'easy' ? canvas.width * 0.22 : canvas.width * 0.35;
        const isBallThreat = ball.vx < -200 && ball.x < this.x && ball.x > followThreshold;

        if (isBallThreat && currentDifficulty !== 'easy') {
            // REPLIEGUE DEFENSIVO: Si hay tiro rápido rival, correr al arco a tapar
            const retreatX = canvas.width - goalWidth - 45;
            const rDx = retreatX - this.x;
            if (Math.abs(rDx) > 15) {
                targetVx = Math.sign(rDx) * P_ACCEL * config.speedScale * 0.14;
            }
        } else if (ball.x > followThreshold) {
            // SEGUIR EL BALÓN CON FILTRO DE ZONA MUERTA (Evita jittering)
            if (Math.abs(dx) > 20) {
                targetVx = Math.sign(dx) * P_ACCEL * config.speedScale * 0.13;
            }

            // INTERCEPTACIÓN AÉREA Y CÁLCULO DE PARÁBOLA
            const ballIsHighAndFalling = ball.vy > 0 && ball.y < this.y - 40 && Math.abs(dx) < 160;
            const standardJump = ball.y < this.y - 75 && Math.abs(dx) < 130;
            
            if ((standardJump || (ballIsHighAndFalling && currentDifficulty !== 'easy')) && this.isGrounded) {
                if (Math.random() < config.jumpChance) {
                    this.vy = JUMP_FORCE;
                    this.isGrounded = false;
                    createDust(this.x, canvas.height - GROUND_OFFSET);
                }
            }

            // KICK INTELIGENTE
            if (Math.abs(dx) < 95 && Math.abs(ball.y - this.y) < 110 && this.kickTimer <= 0) {
                if (Math.random() < config.diffCoeff) {
                    this.kickTimer = 0.3;
                    sounds.playKick();
                }
            }
        } else {
            // VOLVER A POSICIÓN DE GUARDIA
            const homeX = canvas.width * 0.76;
            const hDx = homeX - this.x;
            if (Math.abs(hDx) > 25) {
                targetVx = Math.sign(hDx) * P_ACCEL * 0.15 * config.speedScale;
            }
        }

        // Aplicar interpolación (Lerp) para evitar jittering y hacer movimiento humano
        const lerpSpeed = currentDifficulty === 'easy' ? 4 : (currentDifficulty === 'medium' ? 6 : 9);
        this.vx += (targetVx * speedMultiplier - this.vx) * dt * lerpSpeed;
    }

    draw() {
        // --- SOMBRA EN EL SUELO DIFUSA (Fase 2) ---
        ctx.save();
        const groundY = canvas.height - GROUND_OFFSET;
        const playerBottom = this.y + this.headH + 18;
        const distToGround = Math.max(0, groundY - playerBottom);
        const shadowScale = Math.max(0.2, 1 - distToGround / 250);
        
        // Crear gradiente radial para sombra difusa y suave
        const shadowGrad = ctx.createRadialGradient(
            this.x, groundY, 2,
            this.x, groundY, this.headW * 1.15 * shadowScale
        );
        const shadowAlpha = 0.48 * shadowScale;
        shadowGrad.addColorStop(0, `rgba(11, 15, 25, ${shadowAlpha})`);
        shadowGrad.addColorStop(0.5, `rgba(11, 15, 25, ${shadowAlpha * 0.45})`);
        shadowGrad.addColorStop(1, 'rgba(11, 15, 25, 0)');
        
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.ellipse(this.x, groundY, this.headW * 1.15 * shadowScale, 9 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.translate(this.x, this.y);

        const facing = this.isLeft ? 1 : -1;

        // Balanceo al estar quieto (idle bop)
        const bop = this.isGrounded && Math.abs(this.vx) < 40 ? Math.sin(this.idleTimer) * 3 : 0;
        ctx.translate(0, bop);

        // Rotación de celebración o frustración caricaturesca
        let bodyRot = 0;
        if (this.emotion === 'happy') {
            bodyRot = Math.sin(this.idleTimer * 0.8) * 0.15; // Baile alegre
        } else if (this.emotion === 'sad') {
            bodyRot = 0.22 * facing; // Cabeza gacha hacia el suelo
        }
        ctx.rotate(bodyRot);

        // --- EFECTOS DE ENERGÍA Y ESTELA (Hero / Arcade motion streaks) ---
        if (Math.abs(this.vx) > 120) {
            ctx.save();
            ctx.strokeStyle = this.team.primary + '66'; 
            ctx.lineWidth = 3.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            const trailDir = this.vx > 0 ? -1 : 1;
            // Líneas de velocidad dinámicas
            ctx.moveTo(trailDir * this.headW * 1.15, -12);
            ctx.lineTo(trailDir * this.headW * 1.8, -12);
            ctx.moveTo(trailDir * this.headW * 1.05, 12);
            ctx.lineTo(trailDir * this.headW * 1.6, 12);
            ctx.stroke();
            ctx.restore();
        }

        // Chispas de campeonato flotando alrededor del héroe
        ctx.save();
        ctx.fillStyle = 'rgba(251, 191, 36, 0.75)'; // Color oro
        const timeFactor = this.idleTimer * 0.15;
        for (let i = 0; i < 3; i++) {
            const sparkX = Math.sin(timeFactor + i * 2.2) * this.headW * 1.12;
            const sparkY = -this.headH * 0.4 + Math.cos(timeFactor + i * 1.8) * this.headH * 0.85;
            ctx.beginPath();
            ctx.arc(sparkX, sparkY, 1.9, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        // --- CAMISETA (Jersey Detallado con pliegues, escudo y dorsal - Dibujado detrás de la cabeza) ---
        ctx.save();
        ctx.translate(0, this.headH * 0.9);
        
        // Cuerpo / Tronco del Jersey
        const jerseyGrad = ctx.createLinearGradient(-this.bodyW/2, 0, this.bodyW/2, 0);
        jerseyGrad.addColorStop(0, this.team.primary);
        jerseyGrad.addColorStop(0.5, adjustColorBrightness(this.team.primary, 15));
        jerseyGrad.addColorStop(1, adjustColorBrightness(this.team.primary, -20));

        ctx.fillStyle = jerseyGrad;
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(-this.bodyW / 2, 0, this.bodyW, 22, [8, 8, 4, 4]);
        ctx.fill();
        ctx.stroke();

        // Pliegues realistas de tela (fabric folds)
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.16)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-this.bodyW/2 + 6, 4);
        ctx.quadraticCurveTo(-2, 10, -4, 20);
        ctx.moveTo(this.bodyW/2 - 6, 6);
        ctx.quadraticCurveTo(2, 12, 1, 20);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.beginPath();
        ctx.moveTo(-this.bodyW/2 + 8, 4);
        ctx.quadraticCurveTo(0, 9, -2, 20);
        ctx.stroke();

        // Cuello del Jersey (V-neck o redondo)
        ctx.fillStyle = this.team.detail || '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(10, 0);
        ctx.lineTo(0, 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Rayas deportivas / Detalles del jersey
        ctx.strokeStyle = this.team.secondary;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-this.bodyW/2 + 3, 6);
        ctx.lineTo(-this.bodyW/2 + 3, 20);
        ctx.moveTo(this.bodyW/2 - 3, 6);
        ctx.lineTo(this.bodyW/2 - 3, 20);
        ctx.stroke();

        // Dorsal / Número del Jersey
        ctx.fillStyle = this.team.secondary;
        ctx.font = 'bold 9.5px "Fredoka", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.isLeft ? '10' : '7', 4.5 * facing, 13);

        // Emblema del Equipo sutil (Escudo deportivo)
        ctx.fillStyle = this.team.detail || '#ffffff';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-7 * facing - 2, 7);
        ctx.lineTo(-7 * facing + 2, 7);
        ctx.lineTo(-7 * facing + 3, 10);
        ctx.lineTo(-7 * facing, 13);
        ctx.lineTo(-7 * facing - 3, 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();

        // --- DEGRADADO DE PIEL Y SOMBREADO ---
        // Sombra propia de la cabeza (esfera)
        const skinGrad = ctx.createRadialGradient(
            10 * facing, -12, 10,
            0, 0, this.headH
        );
        skinGrad.addColorStop(0, this.team.skin);
        skinGrad.addColorStop(1, adjustColorBrightness(this.team.skin, -25));

        // --- CABEZA BASE ---
        ctx.fillStyle = skinGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.headW, this.headH, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#0f172a';
        ctx.stroke();

        // Reflejo de luz del estadio (Dynamic Lighting) en el perfil superior de la cara
        const lightGrad = ctx.createLinearGradient(0, -this.headH, 15 * facing, -5);
        lightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
        lightGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
        lightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = lightGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.headW - 2.5, this.headH - 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Gotas de sudor de esfuerzo (Pro arcade aesthetics)
        ctx.fillStyle = 'rgba(165, 243, 252, 0.75)';
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.5)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(-15 * facing, -20, 1.8, 0, Math.PI * 2);
        ctx.arc(-5 * facing, -28, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Rubor o sombra suave en la mejilla
        ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
        ctx.beginPath();
        ctx.ellipse(18 * facing, 10, 10, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // --- CABELLO (Vector moderno con volumen y brillos) ---
        ctx.fillStyle = this.team.hair;
        ctx.save();
        
        // Base trasera del cabello
        ctx.beginPath();
        ctx.ellipse(0, -this.headH * 0.2, this.headW * 1.02, this.headH * 0.82, 0, Math.PI, 0);
        ctx.fill();
        
        // Puntas/Mechones delanteros
        ctx.beginPath();
        ctx.moveTo(-this.headW, -this.headH * 0.1);
        ctx.quadraticCurveTo(-this.headW * 0.9, -this.headH * 0.6, -this.headW * 0.6, -this.headH * 0.85);
        ctx.quadraticCurveTo(-this.headW * 0.3, -this.headH * 1.05, 0, -this.headH * 1.1);
        ctx.quadraticCurveTo(this.headW * 0.4, -this.headH * 1.0, this.headW * 0.7, -this.headH * 0.8);
        ctx.quadraticCurveTo(this.headW * 0.9, -this.headH * 0.5, this.headW, -this.headH * 0.15);
        // Mechones modernos sobre la frente
        ctx.lineTo(this.headW * 0.5, -this.headH * 0.45);
        ctx.lineTo(this.headW * 0.2, -this.headH * 0.6);
        ctx.lineTo(-this.headW * 0.1, -this.headH * 0.4);
        ctx.lineTo(-this.headW * 0.4, -this.headH * 0.55);
        ctx.closePath();
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#0f172a';
        ctx.stroke();

        // Brillo del cabello
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.ellipse(-5 * facing, -this.headH * 0.8, this.headW * 0.4, this.headH * 0.08, Math.PI / 12 * facing, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // --- BARBA / ESTILO FACIAL ---
        if (this.team.facialHair !== 'none') {
            ctx.save();
            if (this.team.facialHair === 'beard') {
                ctx.fillStyle = this.team.hair;
                ctx.beginPath();
                ctx.ellipse(8 * facing, this.headH * 0.48, this.headW * 0.82, this.headH * 0.52, 0, 0, Math.PI);
                ctx.fill();
                ctx.lineWidth = 3;
                ctx.strokeStyle = '#0f172a';
                ctx.stroke();
            } else if (this.team.facialHair === 'stubble') {
                // Sombra de barba corta suave (5 o'clock shadow)
                const stubbleGrad = ctx.createRadialGradient(
                    8 * facing, this.headH * 0.45, 5,
                    8 * facing, this.headH * 0.48, this.headW * 0.85
                );
                stubbleGrad.addColorStop(0, 'rgba(15, 23, 42, 0.35)');
                stubbleGrad.addColorStop(0.75, 'rgba(15, 23, 42, 0.12)');
                stubbleGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
                ctx.fillStyle = stubbleGrad;
                ctx.beginPath();
                ctx.ellipse(8 * facing, this.headH * 0.48, this.headW * 0.82, this.headH * 0.52, 0, 0, Math.PI);
                ctx.fill();
            }
            ctx.restore();
        }

        // --- AURICULARES (Headset gamer / e-sports premium) ---
        ctx.save();
        // Diadema
        ctx.strokeStyle = this.team.headsetColor;
        ctx.lineWidth = 9;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(0, -10, this.headW * 0.98, Math.PI * 1.15, Math.PI * 1.85); 
        ctx.stroke();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, -10, this.headW * 0.98 + 4.5, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, -10, this.headW * 0.98 - 4.5, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();

        // Copa del auricular
        ctx.translate(-this.headW * 1.02 * facing, -12);
        ctx.rotate(-Math.PI/12 * facing);

        // Almohadilla negra exterior
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(-7, -18, 14, 36, 6);
        ctx.fill();
        ctx.stroke();

        // Carcasa principal (Color del equipo)
        ctx.fillStyle = this.team.headsetColor;
        ctx.beginPath();
        ctx.roundRect(-3, -14, 12, 28, 4);
        ctx.fill();
        ctx.stroke();

        // Detalle de rejilla / brillo
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.3;
        ctx.fillRect(1, -10, 3, 20);
        ctx.globalAlpha = 1.0;

        // Micrófono del Headset
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(3, 4);
        ctx.quadraticCurveTo(15 * facing, 18, 26 * facing, 16);
        ctx.stroke();
        
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(26 * facing, 16, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // --- OJOS Y CEJAS DINÁMICOS (Fútbol arcade profesional) ---
        ctx.save();
        const eyeX = this.headW * 0.43 * facing;
        const eyeY = -this.headH * 0.07;
        const coreIrisColor = this.team.detail && this.team.detail !== '#ffffff' ? this.team.detail : '#0284c7';

        if (this.emotion === 'happy') {
            // Ojos felices cerrados en arco sonriente (^ ^)
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 5.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(eyeX, eyeY + 4, 10, Math.PI, 0, true);
            ctx.stroke();

            // Cejas felices elevadas
            ctx.lineWidth = 5.8;
            ctx.strokeStyle = this.team.hair;
            ctx.beginPath();
            ctx.arc(eyeX, eyeY - 9, 11, Math.PI * 1.15, Math.PI * 1.85);
            ctx.stroke();
        } else if (this.emotion === 'sad') {
            // Ojos caídos de tristeza
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 4.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(eyeX - 11 * facing, eyeY + 5);
            ctx.quadraticCurveTo(eyeX, eyeY - 3, eyeX + 11 * facing, eyeY + 3);
            ctx.stroke();

            // Cejas preocupadas (inclinadas hacia arriba en el centro)
            ctx.lineWidth = 5.8;
            ctx.strokeStyle = this.team.hair;
            ctx.beginPath();
            ctx.moveTo(eyeX - 15 * facing, eyeY - 15);
            ctx.lineTo(eyeX + 13 * facing, eyeY - 8);
            ctx.stroke();
        } else if (this.emotion === 'alert') {
            // Ojos sorprendidos y abiertos
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(eyeX, eyeY, 13, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#0f172a';
            ctx.stroke();

            // Iris pequeño de alerta
            ctx.fillStyle = coreIrisColor;
            ctx.beginPath();
            ctx.arc(eyeX + 1 * facing, eyeY, 4.5, 0, Math.PI * 2);
            ctx.fill();

            // Pupila pequeña
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(eyeX + 1.5 * facing, eyeY, 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Cejas muy elevadas
            ctx.lineWidth = 5.8;
            ctx.strokeStyle = this.team.hair;
            ctx.beginPath();
            ctx.moveTo(eyeX - 16 * facing, eyeY - 21);
            ctx.quadraticCurveTo(eyeX, eyeY - 24, eyeX + 14 * facing, eyeY - 21);
            ctx.stroke();
        } else {
            // normal o intense: Ojos determinados competitivos
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(eyeX - 14 * facing, eyeY - 1);
            ctx.quadraticCurveTo(eyeX - 3 * facing, eyeY - 8, eyeX + 14 * facing, eyeY - 5);
            ctx.quadraticCurveTo(eyeX + 8 * facing, eyeY + 11, eyeX - 9 * facing, eyeY + 8);
            ctx.closePath();
            ctx.fill();
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#0f172a';
            ctx.stroke();

            // Iris
            const irisGrad = ctx.createRadialGradient(eyeX + 2 * facing, eyeY + 1, 1, eyeX + 3 * facing, eyeY + 1.5, 8);
            irisGrad.addColorStop(0, adjustColorBrightness(coreIrisColor, 40));
            irisGrad.addColorStop(1, coreIrisColor);
            ctx.fillStyle = irisGrad;
            ctx.beginPath();
            ctx.ellipse(eyeX + 3 * facing, eyeY + 1.5, 8.5, 8.5, 0, 0, Math.PI * 2);
            ctx.fill();

            // Pupila
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.ellipse(eyeX + 3.5 * facing, eyeY + 1.5, 4.8, 4.8, 0, 0, Math.PI * 2);
            ctx.fill();

            // Destellos
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(eyeX + 1.5 * facing, eyeY - 1.0, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(eyeX + 6.0 * facing, eyeY + 3.5, 1.2, 0, Math.PI * 2);
            ctx.fill();

            // Cejas
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 8.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(eyeX - 19 * facing, eyeY - 11);
            ctx.lineTo(eyeX + 16 * facing, eyeY - 15);
            ctx.stroke();

            ctx.strokeStyle = this.team.hair;
            ctx.lineWidth = 5.8;
            ctx.beginPath();
            ctx.moveTo(eyeX - 18 * facing, eyeY - 11);
            ctx.lineTo(eyeX + 15 * facing, eyeY - 15);
            ctx.stroke();
            
            // Arrugas de ceño
            ctx.strokeStyle = 'rgba(15, 23, 42, 0.45)';
            ctx.lineWidth = 2.8;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(eyeX - 19 * facing, eyeY - 19);
            ctx.lineTo(eyeX - 9 * facing, eyeY - 16);
            ctx.stroke();
        }
        ctx.restore();

        // --- BOCA ---
        ctx.save();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        const mouthX = this.headW * 0.43 * facing;
        const mouthY = this.headH * 0.32;
        
        if (this.emotion === 'happy') {
            ctx.fillStyle = '#dc2626';
            ctx.beginPath();
            ctx.ellipse(mouthX, mouthY + 1, 12, 16, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // Dientes superiores
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(mouthX, mouthY - 9, 8, 4, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.emotion === 'intense') {
            // Boca apretando dientes
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.roundRect(mouthX - 8 * facing, mouthY - 3, 16, 8, 3);
            ctx.fill();
            ctx.stroke();
        } else if (this.emotion === 'sad') {
            // Boca triste
            ctx.beginPath();
            ctx.arc(mouthX, mouthY + 7, 8, Math.PI, 0, false);
            ctx.stroke();
        } else if (this.emotion === 'alert') {
            // Boca de sorpresa redonda
            ctx.fillStyle = '#7f1d1d';
            ctx.beginPath();
            ctx.arc(mouthX, mouthY + 4, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        } else {
            // Boca normal
            ctx.beginPath();
            ctx.moveTo(mouthX - 8 * facing, mouthY);
            ctx.lineTo(mouthX + 6 * facing, mouthY - 1);
            ctx.stroke();
        }
        ctx.restore();

        // --- EFECTO HELADO (Power-Up Congelar) ---
        if (this.frozenTimer > 0) {
            ctx.fillStyle = 'rgba(165, 243, 252, 0.48)';
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.roundRect(-this.headW - 6, -this.headH - 6, this.headW * 2 + 12, this.headH * 2 + 28, 14);
            ctx.fill();
            ctx.stroke();
            
            // Destello de hielo
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(-this.headW + 10, -this.headH + 10);
            ctx.lineTo(-this.headW + 18, -this.headH + 10);
            ctx.lineTo(-this.headW + 10, -this.headH + 18);
            ctx.fill();
        }

        ctx.restore(); // Termina transformaciones de la cabeza/cuerpo

        // --- BOTAS DE FÚTBOL MODERNAS ---
        let shoeBaseX = this.x + 10 * facing;
        let shoeBaseY = this.y + this.headH + 15;

        ctx.save();
        ctx.translate(shoeBaseX, shoeBaseY);
        ctx.rotate(this.shoeAngle);

        // Degradado de la bota
        const bootGrad = ctx.createLinearGradient(-this.shoeW * 0.7 * facing, 0, this.shoeW * 0.9 * facing, 0);
        bootGrad.addColorStop(0, this.team.secondary);
        bootGrad.addColorStop(0.5, adjustColorBrightness(this.team.secondary, 20));
        bootGrad.addColorStop(1, adjustColorBrightness(this.team.secondary, -35));

        // Cuerpo de la bota aerodinámica
        ctx.fillStyle = bootGrad;
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-this.shoeW * 0.7 * facing, -this.shoeH * 0.55);
        ctx.quadraticCurveTo(-this.shoeW * 0.25 * facing, -this.shoeH * 0.75, 0, -this.shoeH * 0.45);
        ctx.quadraticCurveTo(this.shoeW * 0.65 * facing, -this.shoeH * 0.55, this.shoeW * 0.95 * facing, 0); 
        ctx.quadraticCurveTo(this.shoeW * 0.65 * facing, this.shoeH * 0.65, 0, this.shoeH * 0.6); 
        ctx.quadraticCurveTo(-this.shoeW * 0.65 * facing, this.shoeH * 0.6, -this.shoeW * 0.75 * facing, 0); 
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Talón metálico de rendimiento (Metallic heel cup)
        ctx.fillStyle = this.team.detail || '#ffffff';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(-this.shoeW * 0.52 * facing, -this.shoeH * 0.1, this.shoeW * 0.2, this.shoeH * 0.35, Math.PI / 6 * facing, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Brillo satinado/brillante sobre la puntera
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.beginPath();
        ctx.ellipse(this.shoeW * 0.45 * facing, -this.shoeH * 0.2, this.shoeW * 0.3, this.shoeH * 0.15, -Math.PI / 12 * facing, 0, Math.PI * 2);
        ctx.fill();

        // Rayas modernas estilo Adidas/Nike en los costados
        ctx.strokeStyle = this.team.primary;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-this.shoeW * 0.15 * facing, -this.shoeH * 0.35);
        ctx.lineTo(this.shoeW * 0.1 * facing, 0);
        ctx.moveTo(-this.shoeW * 0.3 * facing, -this.shoeH * 0.3);
        ctx.lineTo(-this.shoeW * 0.05 * facing, 0.05);
        ctx.stroke();

        // Cordones blancos detallados
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-this.shoeW * 0.25 * facing, -this.shoeH * 0.52);
        ctx.lineTo(-this.shoeW * 0.1 * facing, -this.shoeH * 0.42);
        ctx.moveTo(-this.shoeW * 0.35 * facing, -this.shoeH * 0.45);
        ctx.lineTo(-this.shoeW * 0.2 * facing, -this.shoeH * 0.35);
        ctx.stroke();

        // Tacos de la bota (Tapones profesionales alineados con la suela curva)
        ctx.fillStyle = this.team.detail && this.team.detail !== '#ffffff' ? this.team.detail : '#fbbf24'; // Color llamativo
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1;
        const studHeight = 5.5;
        const studWidth = 3.5;
        
        // Array de coordenadas X y Y personalizadas para que sigan la curva inferior del botín
        const studs = [
            { x: -this.shoeW * 0.32, y: this.shoeH * 0.46 },
            { x: -this.shoeW * 0.08, y: this.shoeH * 0.58 },
            { x: this.shoeW * 0.18, y: this.shoeH * 0.55 },
            { x: this.shoeW * 0.42, y: this.shoeH * 0.36 }
        ];
        
        studs.forEach(stud => {
            ctx.beginPath();
            ctx.roundRect(stud.x * facing - studWidth/2, stud.y, studWidth, studHeight, [0, 0, 1.5, 1.5]);
            ctx.fill();
            ctx.stroke();
        });

        // Detalle de la suela de color
        ctx.fillStyle = this.team.primary;
        ctx.beginPath();
        ctx.ellipse(0, 0.5, this.shoeW * 0.42, this.shoeH * 0.28, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

function createDust(x, y) {
    for (let i = 0; i < 6; i++) {
        spawnParticle({
            x: x + (Math.random() - 0.5) * 20,
            y: y,
            vx: (Math.random() - 0.5) * 90,
            vy: -Math.random() * 100 - 30,
            life: 0.75,
            size: Math.random() * 5.5 + 3,
            color: 'rgba(255,255,255,0.4)'
        });
    }
}

function createShockwave(x, y, color) {
    entities.shockwaves.push({ x: x, y: y, radius: 8, maxRadius: 95, color: color, alpha: 1 });
}

function createKickSparks(x, y) {
    for (let i = 0; i < 15; i++) {
        spawnParticle({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 450,
            vy: -Math.random() * 450,
            life: 0.65,
            size: Math.random() * 5 + 2,
            color: Math.random() > 0.5 ? '#ffffff' : '#eab308'
        });
    }
}

function createConfetti(x, y, team) {
    const colors = [team.primary, team.secondary, team.detail, '#fbbf24', '#ffffff'];
    for (let i = 0; i < 70; i++) {
        spawnParticle({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 600,
            vy: -Math.random() * 550 - 150,
            life: 2.0,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            rot: Math.random() * Math.PI,
            rotSpd: (Math.random() - 0.5) * 9
        });
    }
}

function drawEnvironment() {
    const w = canvas.width;
    const h = canvas.height;

    // Dibujar el fondo del estadio del Mundial 2026 subido por el usuario
    if (assets.bg.complete && assets.bg.naturalWidth !== 0) {
        ctx.drawImage(assets.bg, 0, 0, w, h);
        
        // --- ATENUAR FONDO / OSCURECER LOGO Y LUCES (Fase 7) ---
        ctx.fillStyle = 'rgba(11, 15, 25, 0.58)'; // Máscara de oscurecimiento incrementada
        ctx.fillRect(0, 0, w, h);
        
        // Degradado superior para aplacar reflectores brillantes
        const vignette = ctx.createLinearGradient(0, 0, 0, h);
        vignette.addColorStop(0, 'rgba(11, 15, 25, 0.75)');
        vignette.addColorStop(0.35, 'rgba(11, 15, 25, 0.18)');
        vignette.addColorStop(0.85, 'rgba(0, 0, 0, 0.05)');
        vignette.addColorStop(1, 'rgba(0, 0, 0, 0.38)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, w, h);
    } else {
        let sky = ctx.createLinearGradient(0, 0, 0, h);
        sky.addColorStop(0, '#090d16');
        sky.addColorStop(1, '#1e293b');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h);
    }

    // --- EFECTO DE CLIMA NOCTURNO (Estrellas e iluminación azul noche) ---
    if (currentWeather === 'night') {
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.45)'; // Capa azul noche adicional
        ctx.fillRect(0, 0, w, h);
        
        // Dibujar estrellas titilantes
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 40; i++) {
            const starX = (i * 27) % w;
            const starY = (i * 13) % (h * 0.38);
            const twinkle = Math.sin((Date.now() * 0.003) + i) * 0.4 + 0.6;
            ctx.globalAlpha = twinkle * 0.8;
            ctx.fillRect(starX, starY, 1.8, 1.8);
        }
        ctx.restore();
    }

    const groundY = h - GROUND_OFFSET;

    // --- PARCHE PARA OCULTAR ARCOS DEL FONDO (Fases 1 y 7) ---
    ctx.save();
    const leftPatchGrad = ctx.createLinearGradient(0, groundY - goalHeight, goalWidth + 15, groundY);
    leftPatchGrad.addColorStop(0, '#14532d'); 
    leftPatchGrad.addColorStop(0.5, '#166534'); 
    leftPatchGrad.addColorStop(1, '#15803d'); 
    ctx.fillStyle = leftPatchGrad;
    ctx.fillRect(0, groundY - goalHeight - 5, goalWidth + 15, goalHeight + 5);

    const rightPatchGrad = ctx.createLinearGradient(w - goalWidth - 15, groundY - goalHeight, w, groundY);
    rightPatchGrad.addColorStop(0, '#15803d');
    rightPatchGrad.addColorStop(0.5, '#166534');
    rightPatchGrad.addColorStop(1, '#14532d');
    ctx.fillStyle = rightPatchGrad;
    ctx.fillRect(w - goalWidth - 15, groundY - goalHeight - 5, goalWidth + 15, goalHeight + 5);
    ctx.restore();

    // --- CÉSPED PROFESIONAL CON FRANJAS VERTICALES ALTERNADAS (Fase 2) ---
    ctx.save();
    const stripesCount = 18;
    const stripeWidth = w / stripesCount;
    for (let i = 0; i < stripesCount; i++) {
        // Alternar verde oscuro con verde brillante
        ctx.fillStyle = (i % 2 === 0) ? '#15753b' : '#1b8b4a'; 
        ctx.fillRect(i * stripeWidth, groundY, stripeWidth, GROUND_OFFSET);
    }
    
    // Línea de banda superior del césped
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fillRect(0, groundY, w, 3);
    ctx.restore();

    // --- ILUMINACIÓN VOLUMÉTRICA DEL ESTADIO (Fase 2) ---
    ctx.save();
    // Iluminación cenital
    const zenithGrad = ctx.createLinearGradient(0, 0, 0, groundY);
    zenithGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    zenithGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.02)');
    zenithGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = zenithGrad;
    ctx.fillRect(0, 0, w, groundY);

    // Focos de reflectores laterales / centrales
    const leftLight = ctx.createRadialGradient(0, 0, 20, 0, 0, w * 0.45);
    leftLight.addColorStop(0, 'rgba(56, 189, 248, 0.16)'); // Azul neón izquierdo
    leftLight.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = leftLight;
    ctx.beginPath();
    ctx.arc(0, 0, w * 0.45, 0, Math.PI * 2);
    ctx.fill();

    const rightLight = ctx.createRadialGradient(w, 0, 20, w, 0, w * 0.45);
    rightLight.addColorStop(0, 'rgba(251, 191, 36, 0.12)'); // Oro neón derecho
    rightLight.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = rightLight;
    ctx.beginPath();
    ctx.arc(w, 0, w * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // --- RENDERIZADO DE PORTERÍAS REALES INDEPENDIENTES ---
    
    // 1. PORTERÍA IZQUIERDA
    ctx.save();
    const lg = goals.left;
    
    // Cálculo de la deformación de la red izquierda al recibir impacto
    let netDeformL = 0;
    if (ball && ball.x < lg.w && ball.y > lg.y && ball.y < groundY) {
        netDeformL = Math.min(30, (lg.w - ball.x) * 0.45);
    }

    // Malla/Red (Líneas diagonales curvas)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.lineWidth = 1.2;
    for (let offset = 15; offset < lg.w; offset += 15) {
        ctx.beginPath();
        ctx.moveTo(offset, lg.y);
        ctx.quadraticCurveTo(-netDeformL, (lg.y + groundY)/2, 0, lg.y + (lg.w - offset) * 0.85);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(offset, groundY);
        ctx.quadraticCurveTo(-netDeformL, (lg.y + groundY)/2, 0, groundY - offset * 0.85);
        ctx.stroke();
    }
    
    // Estructura de soporte trasera (Color rojo deportivo)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, lg.y);
    ctx.lineTo(lg.w - 10, lg.y);
    ctx.stroke();

    // Poste vertical frontal e-sports (Blanco metálico con brillo)
    const leftPostGrad = ctx.createLinearGradient(lg.w - 10, lg.y, lg.w, lg.y);
    leftPostGrad.addColorStop(0, '#e2e8f0');
    leftPostGrad.addColorStop(0.5, '#ffffff');
    leftPostGrad.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = leftPostGrad;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(lg.w - 10, lg.y, 10, groundY - lg.y, [2, 2, 0, 0]);
    ctx.fill();
    ctx.stroke();

    // Travesaño superior frontal
    const leftBarGrad = ctx.createLinearGradient(0, lg.y, lg.w - 10, lg.y);
    leftBarGrad.addColorStop(0, '#cbd5e1');
    leftBarGrad.addColorStop(1, '#ffffff');
    ctx.fillStyle = leftBarGrad;
    ctx.beginPath();
    ctx.roundRect(0, lg.y, lg.w - 10, 10, [2, 2, 2, 2]);
    ctx.fill();
    ctx.stroke();

    // Base del arco y poste trasero
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, lg.y);
    ctx.lineTo(0, groundY);
    ctx.lineTo(lg.w - 10, groundY);
    ctx.stroke();
    ctx.restore();

    // 2. PORTERÍA DERECHA
    ctx.save();
    const rg = goals.right;

    // Cálculo de la deformación moderada de la red al recibir impacto
    let netDeformR = 0;
    if (ball && ball.x > rg.x && ball.y > rg.y && ball.y < groundY) {
        netDeformR = Math.min(30, (ball.x - rg.x) * 0.45);
    }

    // Malla/Red (Líneas diagonales que se curvan elásticamente con el impacto)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.lineWidth = 1.2;
    for (let offset = 15; offset < rg.w; offset += 15) {
        ctx.beginPath();
        ctx.moveTo(w - offset, rg.y);
        ctx.quadraticCurveTo(w + netDeformR, (rg.y + groundY)/2, w, rg.y + (rg.w - offset) * 0.85);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(w - offset, groundY);
        ctx.quadraticCurveTo(w + netDeformR, (rg.y + groundY)/2, w, groundY - offset * 0.85);
        ctx.stroke();
    }

    // Estructura de soporte trasera (Color verde deportivo)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(w, rg.y);
    ctx.lineTo(rg.x + 10, rg.y);
    ctx.stroke();

    // Poste vertical frontal e-sports (Blanco metálico con brillo)
    const rightPostGrad = ctx.createLinearGradient(rg.x, rg.y, rg.x + 10, rg.y);
    rightPostGrad.addColorStop(0, '#e2e8f0');
    rightPostGrad.addColorStop(0.5, '#ffffff');
    rightPostGrad.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = rightPostGrad;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(rg.x, rg.y, 10, groundY - rg.y, [2, 2, 0, 0]);
    ctx.fill();
    ctx.stroke();

    // Travesaño superior frontal
    const rightBarGrad = ctx.createLinearGradient(rg.x + 10, rg.y, w, rg.y);
    rightBarGrad.addColorStop(0, '#ffffff');
    rightBarGrad.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = rightBarGrad;
    ctx.beginPath();
    ctx.roundRect(rg.x + 10, rg.y, rg.w - 10, 10, [2, 2, 2, 2]);
    ctx.fill();
    ctx.stroke();

    // Base del arco y poste trasero
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w, rg.y);
    ctx.lineTo(w, groundY);
    ctx.lineTo(rg.x + 10, groundY);
    ctx.stroke();
    ctx.restore();
}

// Colisiones físicas sólidas para postes verticales y travesaños
function checkInteractions(dt) {
    const players = [p1, p2];

    players.forEach(p => {
        const dx = ball.x - p.x;
        const dy = ball.y - p.y;
        const dist = Math.hypot(dx, dy);
        const minDist = ball.radius + p.headR;

        if (dist < minDist) {
            const nx = dx / dist;
            const ny = dy / dist;
            
            // Resolver penetración inmediatamente para evitar solapamiento
            ball.x = p.x + nx * minDist;
            ball.y = p.y + ny * minDist;

            const rvx = ball.vx - p.vx;
            const rvy = ball.vy - p.vy;
            const velNormal = rvx * nx + rvy * ny;

            if (velNormal < 0) {
                ball.vx -= (1 + B_ELASTICITY) * velNormal * nx;
                ball.vy -= (1 + B_ELASTICITY) * velNormal * ny;
                // Impulso controlado
                ball.vx += p.vx * 0.35;
                sounds.playBounce();
            }
        }

        const facing = p.isLeft ? 1 : -1;
        const shoeBaseX = p.x + 10 * facing;
        const shoeBaseY = p.y + p.headH + 15;
        
        const shoeX = shoeBaseX + Math.cos(p.shoeAngle) * (p.shoeW * 0.6) * facing;
        const shoeY = shoeBaseY + Math.sin(p.shoeAngle) * (p.shoeW * 0.6);

        const sDx = ball.x - shoeX;
        const sDy = ball.y - shoeY;
        const sDist = Math.hypot(sDx, sDy);
        const sMinDist = ball.radius + p.shoeH;

        if (sDist < sMinDist) {
            const snx = sDx / sDist;
            const sny = sDy / sDist;

            ball.x = shoeX + snx * sMinDist;
            ball.y = shoeY + sny * sMinDist;

            if (p.kickTimer > 0) {
                ball.vx = facing * KICK_X * (0.9 + Math.random() * 0.2);
                ball.vy = KICK_Y * (0.8 + Math.random() * 0.3);
                
                ball.fireColor = p.team.primary;

                // Registro de estadísticas de tiro
                if (p.isLeft) {
                    matchStats.shotsLeft++;
                    if (ball.vx > 0) matchStats.shotsOnTargetLeft++;
                } else {
                    matchStats.shotsRight++;
                    if (ball.vx < 0) matchStats.shotsOnTargetRight++;
                }

                p.kickTimer = 0; 
                shakeScreen(18);
                hitStopFrames = 3;
                createShockwave(ball.x, ball.y, p.team.primary);
                createKickSparks(ball.x, ball.y);
                
                // Desprender partículas de césped al patear (Fase 2)
                const groundY = canvas.height - GROUND_OFFSET;
                createGrassKickParticles(ball.x, groundY);
                
                sounds.playPowerKick();
            } else {
                const rvx = ball.vx - p.vx;
                const rvy = ball.vy - p.vy;
                const velNormal = rvx * snx + rvy * sny;
                if (velNormal < 0) {
                    ball.vx -= (1 + 0.5) * velNormal * snx;
                    ball.vy -= (1 + 0.5) * velNormal * sny;
                    // Impulso de patada controlado
                    ball.vx += p.vx * 0.2;
                    sounds.playBounce();
                }
            }
        }
    });

    // Colisión física completa con travesaño y postes del arco
    const checkGoalCollision = (goal, isLeft) => {
        // 1. Colisión con el travesaño horizontal superior (rebote)
        if (ball.x + ball.radius > goal.x && 
            ball.x - ball.radius < goal.x + goal.w &&
            ball.y + ball.radius >= goal.y &&
            ball.y - ball.radius <= goal.y + goal.h) {
            
            const overlapX = Math.min(ball.x + ball.radius - goal.x, goal.x + goal.w - (ball.x - ball.radius));
            const overlapY = Math.min(ball.y + ball.radius - goal.y, goal.y + goal.h - (ball.y - ball.radius));

            if (overlapY < overlapX) {
                if (ball.vy > 0) {
                    ball.y = goal.y - ball.radius;
                    ball.vy = -ball.vy * B_ELASTICITY;
                } else {
                    ball.y = goal.y + goal.h + ball.radius;
                    ball.vy = -ball.vy * B_ELASTICITY;
                }
            } else {
                if (ball.vx > 0) {
                    ball.x = goal.x - ball.radius;
                    ball.vx = -ball.vx * B_ELASTICITY;
                } else {
                    ball.x = goal.x + goal.w + ball.radius;
                    ball.vx = -ball.vx * B_ELASTICITY;
                }
            }
            sounds.playBounce();
        }

        // 2. Colisión física sólida con el poste vertical frontal del arco (rebota el balón al impactar el palo vertical)
        const postFrontX = isLeft ? goal.w - 10 : goal.x;
        const groundY = canvas.height - GROUND_OFFSET;
        
        if (ball.x + ball.radius > postFrontX && 
            ball.x - ball.radius < postFrontX + 10 &&
            ball.y + ball.radius > goal.y && 
            ball.y - ball.radius < groundY) {
            
            // Rebotar balón horizontalmente en el palo
            if (ball.x < postFrontX + 5) {
                ball.x = postFrontX - ball.radius;
                ball.vx = -Math.abs(ball.vx) * B_ELASTICITY;
            } else {
                ball.x = postFrontX + 10 + ball.radius;
                ball.vx = Math.abs(ball.vx) * B_ELASTICITY;
            }
            sounds.playBounce();
        }
    };
    checkGoalCollision(goals.left, true);
    checkGoalCollision(goals.right, false);

    // Burbujas
    entities.powerups.forEach((pu, idx) => {
        const dx = ball.x - pu.x;
        const dy = ball.y - pu.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist < ball.radius + pu.radius) {
            activatePowerUp(pu.type);
            createShockwave(pu.x, pu.y, '#ffffff');
            entities.powerups.splice(idx, 1); 
            sounds.playGoal(); 
        }
    });

    // Goles
    const groundY = canvas.height - GROUND_OFFSET;
    if (ball.y > groundY - goalHeight + 15) {
        if (ball.x < goalWidth - 12) return scoreGoal('right');
        if (ball.x > canvas.width - goalWidth + 12) return scoreGoal('left');
    }
}

function activatePowerUp(type) {
    if (type === 'freeze') {
        p2.frozenTimer = 4.0; 
        p2.emotion = 'sad';
    } else if (type === 'bigball') {
        ball.radius = 42;
        setTimeout(() => ball.radius = ball.baseRadius, 6000);
    } else if (type === 'smallball') {
        ball.radius = 12;
        setTimeout(() => ball.radius = ball.baseRadius, 6000);
    } else if (type === 'speed') {
        p1.speedTimer = 6.0; 
        p1.emotion = 'happy';
    }
}

function scoreGoal(scorer) {
    if (gameState !== 'PLAYING') return;
    gameState = 'GOAL';

    goalFlashAlpha = 0.45; // Activar destello de estadio moderado (Fase 2)
    shakeScreen(24);
    let teamScored = scorer === 'left' ? tournament.playerTeam : tournament.currentOpponent;
    let teamConceded = scorer === 'left' ? p2 : p1;
    let teamWinner = scorer === 'left' ? p1 : p2;

    teamWinner.emotion = 'happy';
    teamWinner.vy = JUMP_FORCE * 0.9;
    teamConceded.emotion = 'sad';

    scores[scorer]++;
    ui.scoreLeft.innerText = scores.left;
    ui.scoreRight.innerText = scores.right;

    // Efecto de pulso neón en el marcador
    const scoreDisplay = document.querySelector('.score-box');
    if (scoreDisplay) {
        scoreDisplay.classList.add('pulse-active');
        setTimeout(() => scoreDisplay.classList.remove('pulse-active'), 500);
    }

    const goalX = scorer === 'left' ? canvas.width - goalWidth / 2 : goalWidth / 2;
    createConfetti(goalX, canvas.height - goalHeight / 2, teamScored);

    ui.goalMsg.style.color = teamScored.primary;
    ui.goalMsg.style.textShadow = `0 10px 0 ${teamScored.detail}, 0 20px 30px rgba(0,0,0,0.8)`;
    ui.goalMsg.innerText = "¡GOOOOOL!";
    ui.goalMsg.classList.add('show');
    
    sounds.playGoal();

    setTimeout(() => {
        ui.goalMsg.classList.remove('show');
        if (timeRemaining > 0) {
            resetPositions();
            gameState = 'PLAYING';
        } else {
            handleMatchEnd();
        }
    }, 2800);
}

let p1, p2, ball;

// Restablecer
function resetPositions() {
    p1.reset();
    p2.reset();
    ball.reset();
}

function showScreen(key) {
    Object.keys(screens).forEach(k => {
        if (k === key) screens[k].classList.remove('hidden');
        else screens[k].classList.add('hidden');
    });
}

// Transición suave de fundido (Fade in / Fade out)
function showScreenWithFade(key, callback) {
    const fadeOverlay = document.getElementById('screen-fade-overlay');
    if (!fadeOverlay) {
        if (key && screens[key]) {
            showScreen(key);
        } else {
            Object.keys(screens).forEach(k => screens[k].classList.add('hidden'));
            if (key === 'gameplay') {
                screens.scoreboard.classList.remove('hidden');
            }
        }
        if (callback) callback();
        return;
    }
    
    fadeOverlay.classList.add('fade-active');
    
    setTimeout(() => {
        if (key && screens[key]) {
            showScreen(key);
        } else {
            Object.keys(screens).forEach(k => screens[k].classList.add('hidden'));
            if (key === 'gameplay') {
                screens.scoreboard.classList.remove('hidden');
            }
        }
        
        if (callback) callback();
        
        setTimeout(() => {
            fadeOverlay.classList.remove('fade-active');
        }, 150);
    }, 350);
}

function startTournament() {
    tournament.playerTeam = TEAMS[ui.teamSelect.value];
    tournament.phase = 0;

    const candidates = TEAMS.filter(t => t.id !== tournament.playerTeam.id);
    candidates.sort(() => Math.random() - 0.5);
    tournament.opponents = [candidates[0], candidates[1], candidates[2]];

    showScreenWithFade('tournament', () => {
        updateTournamentUI();
        sounds.init();
        sounds.startAmbient();
    });
}

function updateTournamentUI() {
    ui.playerTeamName.innerText = tournament.playerTeam.name;
    const opponent = tournament.opponents[tournament.phase];
    tournament.currentOpponent = opponent;
    ui.opponentTeamName.innerText = opponent.name;

    const phases = ["CUARTOS DE FINAL", "SEMIFINALES", "GRAN FINAL"];
    ui.phaseText.innerText = phases[tournament.phase];

    const q1 = document.getElementById('match-q1');
    const q2 = document.getElementById('match-q2');
    const s1 = document.getElementById('match-s1');
    const f1 = document.getElementById('match-final');

    const makeNodeHTML = (teamA, teamB, isActive, isCompleted) => {
        const flagA = teamA ? `<div class="flag-icon flag-${teamA.id} scale-75"></div>` : `<div class="w-6 h-4 bg-slate-800/60 rounded"></div>`;
        const flagB = teamB ? `<div class="flag-icon flag-${teamB.id} scale-75"></div>` : `<div class="w-6 h-4 bg-slate-800/60 rounded"></div>`;
        const nameA = teamA ? teamA.id : 'TBD';
        const nameB = teamB ? teamB.id : 'TBD';
        
        let borderClass = 'border-white/5 bg-slate-950/40 text-gray-400';
        if (isActive) borderClass = 'border-sky-400 bg-sky-950/20 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.25)]';
        if (isCompleted) borderClass = 'border-emerald-500/40 bg-emerald-950/10 text-emerald-400';
        
        return `
            <div class="flex items-center justify-between gap-2.5 p-2 border rounded-xl text-xs font-bold transition-all duration-300 ${borderClass} w-36 sm:w-44">
                <div class="flex items-center gap-1">
                    ${flagA}
                    <span>${nameA}</span>
                </div>
                <span class="text-[8px] text-gray-600 font-black">VS</span>
                <div class="flex items-center gap-1">
                    <span>${nameB}</span>
                    ${flagB}
                </div>
            </div>
        `;
    };

    // Cuartos 1: Jugador vs Primer Rival
    q1.innerHTML = makeNodeHTML(tournament.playerTeam, tournament.opponents[0], tournament.phase === 0, tournament.phase > 0);
    
    // Cuartos 2: CPU vs CPU simulado (Brasil vs Japón por defecto)
    const cpuTeamA = TEAMS.find(t => t.id === 'BRA');
    const cpuTeamB = TEAMS.find(t => t.id === 'JPN');
    q2.innerHTML = makeNodeHTML(cpuTeamA, cpuTeamB, false, tournament.phase > 0);

    // Semis: Ganador Q1 vs Ganador Q2
    const semisOpponent = tournament.opponents[1];
    if (tournament.phase === 0) {
        s1.innerHTML = makeNodeHTML(null, null, false, false);
    } else {
        s1.innerHTML = makeNodeHTML(tournament.playerTeam, semisOpponent, tournament.phase === 1, tournament.phase > 1);
    }

    // Final: Ganador Semis vs Rival Final
    const finalOpponent = tournament.opponents[2];
    if (tournament.phase < 2) {
        f1.innerHTML = makeNodeHTML(null, null, false, false);
    } else {
        f1.innerHTML = makeNodeHTML(tournament.playerTeam, finalOpponent, tournament.phase === 2, false);
    }

    // Dibujar conectores SVG reactivos después del layout
    setTimeout(drawBracketLines, 50);
}

function drawBracketLines() {
    const svg = document.getElementById('bracket-svg');
    if (!svg) return;
    svg.innerHTML = '';

    const q1 = document.getElementById('match-q1');
    const q2 = document.getElementById('match-q2');
    const s1 = document.getElementById('match-s1');
    const final = document.getElementById('match-final');
    const container = document.querySelector('.bracket-container');
    if (!container || !q1 || !q2 || !s1 || !final) return;

    const rectContainer = container.getBoundingClientRect();

    const getAnchorRight = (el) => {
        const r = el.getBoundingClientRect();
        return { x: r.right - rectContainer.left, y: r.top + r.height / 2 - rectContainer.top };
    };

    const getAnchorLeft = (el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left - rectContainer.left, y: r.top + r.height / 2 - rectContainer.top };
    };

    const pQ1 = getAnchorRight(q1);
    const pQ2 = getAnchorRight(q2);
    const pS1_L = getAnchorLeft(s1);
    const pS1_R = getAnchorRight(s1);
    const pFinal = getAnchorLeft(final);

    const createPath = (from, to, active, id) => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const midX = (from.x + to.x) / 2;
        const d = `M ${from.x} ${from.y} L ${midX} ${from.y} L ${midX} ${to.y} L ${to.x} ${to.y}`;
        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('id', id);

        if (active) {
            path.setAttribute('stroke', '#38bdf8'); // Neón azul
            path.setAttribute('stroke-width', '3');
            path.style.filter = 'drop-shadow(0 0 5px #38bdf8)';
            path.setAttribute('stroke-dasharray', '8, 8');
            path.style.animation = 'dashFlow 1.5s linear infinite';
        } else {
            path.setAttribute('stroke', 'rgba(255,255,255,0.08)');
            path.setAttribute('stroke-width', '2');
        }
        svg.appendChild(path);
    };

    // Q1 a S1 (Camino del jugador)
    createPath(pQ1, pS1_L, tournament.phase > 0, 'path-q1-s1');
    // Q2 a S1 (Rival CPU)
    createPath(pQ2, pS1_L, tournament.phase > 0, 'path-q2-s1');
    // S1 a Final (Ruta a la copa)
    createPath(pS1_R, pFinal, tournament.phase > 1, 'path-s1-final');
}

window.addEventListener('resize', drawBracketLines);

function playMatch() {
    showScreenWithFade('gameplay', () => {
        scores = { left: 0, right: 0 };
        ui.scoreLeft.innerText = '0';
        ui.scoreRight.innerText = '0';
        timeRemaining = 60;
        ui.time.innerText = timeRemaining;
        gameTime = 0;
        powerupSpawnTimer = 8;

        ui.teamLeftBox.innerText = tournament.playerTeam.id;
        ui.teamLeftBox.style.background = tournament.playerTeam.primary;
        ui.teamRightBox.innerText = tournament.currentOpponent.id;
        ui.teamRightBox.style.background = tournament.currentOpponent.primary;

        // Configurar banderas vectoriales en el marcador (Fase 1)
        const leftFlag = document.getElementById('team-left-flag');
        const rightFlag = document.getElementById('team-right-flag');
        if (leftFlag) leftFlag.className = `flag-icon flag-${tournament.playerTeam.id} shadow-sm`;
        if (rightFlag) rightFlag.className = `flag-icon flag-${tournament.currentOpponent.id} shadow-sm`;

        resizeCanvas(); 

        // Reiniciar estadísticas del partido
        matchStats = {
            possessionTimeLeft: 0,
            possessionTimeRight: 0,
            shotsLeft: 0,
            shotsRight: 0,
            shotsOnTargetLeft: 0,
            shotsOnTargetRight: 0
        };

        // Desactivar todas las partículas del pool
        particlePool.forEach(p => p.active = false);

        p1 = new Player(true, tournament.playerTeam);
        p2 = new Player(false, tournament.currentOpponent);
        ball = new Ball();
        entities = { particles: [], shockwaves: [], powerups: [] };

        // Colocar jugadores fuera de pantalla para animación de entrada
        p1.x = -120;
        p2.x = 1220;

        // Iniciar en estado INTRO (2 seg regulares, 4 seg en final)
        gameState = 'INTRO';
        introDuration = tournament.phase === 2 ? 4.0 : 2.0;
        introTimer = introDuration;

        sounds.init();
        sounds.startAmbient();

        lastTime = performance.now();
        if (animationId) cancelAnimationFrame(animationId);
        gameLoop(lastTime);
    });
}

function renderMatchStats(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const totalPossessionTime = matchStats.possessionTimeLeft + matchStats.possessionTimeRight || 1;
    const possessionLeft = Math.round((matchStats.possessionTimeLeft / totalPossessionTime) * 100);
    const possessionRight = 100 - possessionLeft;

    let mvpText = "";
    if (scores.left > scores.right) {
        mvpText = `${tournament.playerTeam.name} - No. 10`;
    } else if (scores.right > scores.left) {
        mvpText = `${tournament.currentOpponent.name} - No. 7`;
    } else {
        mvpText = possessionLeft > possessionRight ? `${tournament.playerTeam.name} - No. 10` : `${tournament.currentOpponent.name} - No. 7`;
    }

    container.innerHTML = `
        <div class="stats-panel w-full bg-slate-950/60 p-4 rounded-xl border border-white/10 text-xs mb-2 space-y-2 text-left">
            <div class="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                <span>Métricas</span>
                <span>${tournament.playerTeam.id} vs ${tournament.currentOpponent.id}</span>
            </div>
            <div class="space-y-1">
                <div class="flex justify-between text-[11px] font-bold text-gray-200">
                    <span>Posesión</span>
                    <span>${possessionLeft}% - ${possessionRight}%</span>
                </div>
                <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                    <div class="h-full" style="width: ${possessionLeft}%; background: ${tournament.playerTeam.primary};"></div>
                    <div class="h-full" style="width: ${possessionRight}%; background: ${tournament.currentOpponent.primary};"></div>
                </div>
            </div>
            <div class="flex justify-between text-gray-300">
                <span>Tiros Totales</span>
                <span class="font-bold">${matchStats.shotsLeft} - ${matchStats.shotsRight}</span>
            </div>
            <div class="flex justify-between text-gray-300">
                <span>Tiros al Arco</span>
                <span class="font-bold">${matchStats.shotsOnTargetLeft} - ${matchStats.shotsOnTargetRight}</span>
            </div>
            <div class="flex justify-between text-amber-400 font-bold pt-1 border-t border-white/5">
                <span>🎖️ MVP:</span>
                <span>${mvpText}</span>
            </div>
        </div>
    `;
}

function handleMatchEnd() {
    sounds.playFinalWhistle();
    sounds.fadeOutAmbient(1.2);
    
    const targetKey = scores.left > scores.right ? (tournament.phase === 2 ? 'champion' : 'matchVictory') : 'gameOver';
    
    showScreenWithFade(targetKey, () => {
        screens.scoreboard.classList.add('hidden');
        
        if (scores.left > scores.right) {
            if (tournament.phase === 2) {
                ui.championTeamName.innerText = tournament.playerTeam.name.toUpperCase();
                gameState = 'CHAMPION';
                renderMatchStats('champion-stats-container');
                createConfetti(canvas.width / 2, 0, tournament.playerTeam);
                createConfetti(canvas.width / 4, 0, tournament.playerTeam);
                createConfetti(3 * canvas.width / 4, 0, tournament.playerTeam);
            } else {
                ui.victoryScoreText.innerText = `${tournament.playerTeam.id} ${scores.left} - ${scores.right} ${tournament.currentOpponent.id}`;
                renderMatchStats('victory-stats-container');
                gameState = 'TOURNAMENT';
            }
        } else {
            ui.defeatScoreText.innerText = `${tournament.playerTeam.id} ${scores.left} - ${scores.right} ${tournament.currentOpponent.id}`;
            renderMatchStats('defeat-stats-container');
            gameState = 'GAMEOVER';
        }
    });
}

function nextRound() {
    tournament.phase++;
    showScreenWithFade('tournament', () => {
        updateTournamentUI();
    });
}

document.getElementById('startTournamentBtn').addEventListener('click', startTournament);
document.getElementById('playMatchBtn').addEventListener('click', playMatch);
document.getElementById('nextRoundBtn').addEventListener('click', nextRound);

// Configurar listeners para las pestañas de dificultad y clima (Fase de Estabilización)
const diffTabs = document.querySelectorAll('#difficulty-tabs .tab-btn');
diffTabs.forEach(btn => {
    btn.addEventListener('click', () => {
        diffTabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDifficulty = btn.getAttribute('data-val');
    });
});

const weatherTabs = document.querySelectorAll('#weather-tabs .tab-btn');
weatherTabs.forEach(btn => {
    btn.addEventListener('click', () => {
        weatherTabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentWeather = btn.getAttribute('data-val');
    });
});

const retryHandler = () => {
    sounds.fadeOutAmbient(0.8);
    showScreenWithFade('start', () => {
        gameState = 'MENU';
    });
};
document.getElementById('retryTournamentBtn').addEventListener('click', retryHandler);
document.getElementById('backToStartBtn').addEventListener('click', retryHandler);

ui.soundToggleBtn.addEventListener('click', () => {
    const isMuted = sounds.toggleMute();
    ui.soundToggleBtn.innerText = isMuted ? '🔇' : '🔊';
});
function gameLoop(timestamp) {
    if (gameState === 'PAUSED') {
        animationId = requestAnimationFrame(gameLoop);
        return;
    }

    if (hitStopFrames > 0) {
        hitStopFrames--;
        lastTime = timestamp;
        animationId = requestAnimationFrame(gameLoop);
        return;
    }

    let dt = Math.min((timestamp - lastTime) / 1000, 0.03);
    lastTime = timestamp;

    // LÓGICA DE ACTUALIZACIÓN DEL ESTADO INTRO
    if (gameState === 'INTRO') {
        introTimer -= dt;
        if (introTimer <= 0) {
            gameState = 'PLAYING';
            sounds.playWhistle();
        }
    }

    if (gameState === 'MENU' || gameState === 'TOURNAMENT') {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        drawEnvironment();
        
        if (gameState === 'MENU') {
            drawMenuReflectors(timestamp);
            drawMenuConfetti(dt);
            updateAndDrawMenuParticles(dt);
        }
        
        animationId = requestAnimationFrame(gameLoop);
        return;
    }

    if (gameState === 'PLAYING') {
        gameTime += dt;
        if (gameTime >= 1.0) {
            timeRemaining--;
            ui.time.innerText = timeRemaining;
            gameTime -= 1.0;
            
            powerupSpawnTimer--;
            if (powerupSpawnTimer <= 0) {
                entities.powerups.push(new PowerUp());
                powerupSpawnTimer = 11 + Math.random() * 5; 
            }

            if (timeRemaining <= 0 && gameState !== 'GOAL' && gameState !== 'CELEBRATION' && gameState !== 'TIME_UP') {
                ui.goalMsg.innerText = "¡FIN DEL PARTIDO!";
                ui.goalMsg.style.color = "#ffffff";
                ui.goalMsg.style.textShadow = "0 10px 0 #0f172a, 0 20px 30px rgba(0,0,0,0.8)";
                ui.goalMsg.classList.add('show');
                gameState = 'CELEBRATION';

                // Activar emociones finales según quién vaya ganando
                if (scores.left > scores.right) {
                    p1.emotion = 'happy';
                    p2.emotion = 'sad';
                } else if (scores.right > scores.left) {
                    p2.emotion = 'happy';
                    p1.emotion = 'sad';
                } else {
                    p1.emotion = 'sad';
                    p2.emotion = 'sad';
                }

                setTimeout(() => {
                    ui.goalMsg.classList.remove('show');
                    handleMatchEnd();
                }, 3500); // 3.5 segundos de celebración interactiva en cancha
            }
        }

        // Lógica de Posesión de Balón (Estadísticas en tiempo real)
        const distLeft = Math.hypot(ball.x - p1.x, ball.y - p1.y);
        const distRight = Math.hypot(ball.x - p2.x, ball.y - p2.y);
        if (distLeft < distRight) {
            matchStats.possessionTimeLeft += dt;
        } else {
            matchStats.possessionTimeRight += dt;
        }

        // Actualizar barra de posesión LED neón del marcador (Fase 1)
        const totalPoss = matchStats.possessionTimeLeft + matchStats.possessionTimeRight || 1;
        const pctLeft = Math.round((matchStats.possessionTimeLeft / totalPoss) * 100);
        const barLeft = document.getElementById('possession-bar-left');
        const barRight = document.getElementById('possession-bar-right');
        if (barLeft && barRight) {
            barLeft.style.width = `${pctLeft}%`;
            barLeft.style.background = tournament.playerTeam.primary;
            barRight.style.width = `${100 - pctLeft}%`;
            barRight.style.background = tournament.currentOpponent.primary;
        }
    }

    // --- GENERAR EFECTOS CLIMÁTICOS DE FORMA OPTIMIZADA (Object Pool) ---
    if (gameState === 'PLAYING' || gameState === 'GOAL' || gameState === 'CELEBRATION' || gameState === 'INTRO') {
        if (currentWeather === 'rain') {
            for (let i = 0; i < 2; i++) {
                spawnParticle({
                    x: Math.random() * canvas.width,
                    y: -10,
                    vx: -40 - Math.random() * 20,
                    vy: 550 + Math.random() * 80,
                    life: 1.2,
                    size: 1.5 + Math.random() * 1.5,
                    color: 'rgba(56, 189, 248, 0.45)',
                    isWeather: true,
                    weatherType: 'rain'
                });
            }
        } else if (currentWeather === 'snow') {
            if (Math.random() < 0.45) {
                spawnParticle({
                    x: Math.random() * canvas.width,
                    y: -10,
                    vx: Math.sin(timestamp * 0.002) * 18,
                    vy: 60 + Math.random() * 30,
                    life: 8.0,
                    size: 2.0 + Math.random() * 3.0,
                    color: '#ffffff',
                    isWeather: true,
                    weatherType: 'snow'
                });
            }
        }
    }

    // --- GENERAR FUEGOS ARTIFICIALES EN LA PANTALLA DE CAMPEÓN ---
    if (gameState === 'CHAMPION' && Math.random() < 0.08) {
        const fwX = Math.random() * canvas.width;
        const fwY = Math.random() * canvas.height * 0.45;
        const colors = ['#f43f5e', '#38bdf8', '#fbbf24', '#a78bfa', '#34d399'];
        const fwColor = colors[Math.floor(Math.random() * colors.length)];
        for (let j = 0; j < 18; j++) {
            const ang = (j * Math.PI * 2) / 18;
            const spd = 120 + Math.random() * 80;
            spawnParticle({
                x: fwX,
                y: fwY,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                life: 1.0 + Math.random() * 0.4,
                size: 2.5 + Math.random() * 2,
                color: fwColor
            });
        }
    }

    if (gameState === 'PLAYING' || gameState === 'GOAL' || gameState === 'CELEBRATION' || gameState === 'TIME_UP' || gameState === 'INTRO') {
        p1.update(dt, ball);
        p2.update(dt, ball);
        ball.update(dt);
        
        entities.powerups.forEach(pu => pu.update(dt));
        entities.powerups = entities.powerups.filter(pu => pu.y < canvas.height);

        if (gameState === 'PLAYING') checkInteractions(dt);
    }

    // Actualizar partículas (Object Pool)
    const groundY = canvas.height - GROUND_OFFSET;
    particlePool.forEach(p => {
        if (!p.active) return;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.isWeather) {
            if (p.y >= groundY) {
                p.active = false;
                if (p.weatherType === 'rain' && Math.random() < 0.35) {
                    // Splash
                    for (let j = 0; j < 2; j++) {
                        spawnParticle({
                            x: p.x,
                            y: groundY - 1,
                            vx: (Math.random() - 0.5) * 50,
                            vy: -Math.random() * 40 - 20,
                            life: 0.15,
                            size: 1,
                            color: 'rgba(56, 189, 248, 0.4)'
                        });
                    }
                }
            }
        } else {
            p.vy += (p.isHeart ? -180 : GRAVITY * 0.38) * dt; 
            if (p.rot !== undefined) p.rot += p.rotSpd * dt;
        }
        p.life -= dt;
        if (p.life <= 0) p.active = false;
    });

    // Ondas
    entities.shockwaves.forEach(sw => {
        sw.radius += 650 * dt;
        sw.alpha -= 2.6 * dt;
    });
    entities.shockwaves = entities.shockwaves.filter(sw => sw.alpha > 0);

    // --- SISTEMA DE LIMPIEZA INMUNE A ARTEFACTOS DE CÁMARA ( setTransform ) ---
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    ctx.save();
    
    // Zoom de la cámara dinámico y centrado de acción (Fase 6 y Gol Zoom)
    let zoomFactor = 1.16;
    let camTranslateX = -canvas.width * 0.07;
    let camTranslateY = -canvas.height * 0.04;

    if (gameState === 'GOAL') {
        // Zoom dinámico centrado en el balón/portería durante el gol
        zoomFactor = 1.35;
        // Suavizar la cámara hacia la posición del balón
        const ballTargetX = ball.x;
        const ballTargetY = ball.y;
        camTranslateX = -(ballTargetX * zoomFactor - canvas.width / 2) / zoomFactor;
        camTranslateY = -(ballTargetY * zoomFactor - canvas.height / 2) / zoomFactor;
        
        // Mantener dentro de márgenes del Canvas
        camTranslateX = Math.max(-canvas.width * 0.35, Math.min(0, camTranslateX));
        camTranslateY = Math.max(-canvas.height * 0.2, Math.min(0, camTranslateY));
    }
    ctx.scale(zoomFactor, zoomFactor);
    ctx.translate(camTranslateX, camTranslateY); // Recorta cielo y centra el césped

    if (shakeAmount > 0) {
        cameraShakeX = (Math.random() - 0.5) * shakeAmount;
        cameraShakeY = (Math.random() - 0.5) * shakeAmount;
        ctx.translate(cameraShakeX, cameraShakeY);
        shakeAmount *= 0.88;
        if (shakeAmount < 0.45) shakeAmount = 0;
    }

    drawEnvironment();

    p2.draw();
    p1.draw();
    ball.draw();
    
    // Dibujar pedestal de trofeo en el centro si es campeón
    if (gameState === 'CHAMPION') {
        const centerX = canvas.width / 2;
        const trophyY = groundY - 45;
        
        // Pedestal dorado
        ctx.save();
        ctx.fillStyle = '#d97706';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(centerX - 45, trophyY, 90, 45, [8, 8, 0, 0]);
        ctx.fill();
        ctx.stroke();
        
        // Brillo del trofeo
        const aura = ctx.createRadialGradient(centerX, trophyY - 50, 10, centerX, trophyY - 50, 75);
        aura.addColorStop(0, 'rgba(251, 191, 36, 0.65)');
        aura.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(centerX, trophyY - 50, 75, 0, Math.PI * 2);
        ctx.fill();
        
        // Renderizar trofeo oficial
        const cupImg = document.querySelector('#championScreen img');
        if (cupImg && cupImg.complete) {
            ctx.drawImage(cupImg, centerX - 25, trophyY - 95, 50, 95);
        }
        ctx.restore();
    }
    
    entities.powerups.forEach(pu => pu.draw());

    // Ondas
    entities.shockwaves.forEach(sw => {
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = 5 * sw.alpha;
        ctx.globalAlpha = sw.alpha;
        ctx.stroke();
    });
    ctx.globalAlpha = 1;

    // Partículas (Renderizado optimizado del Object Pool)
    particlePool.forEach(p => {
        if (!p.active) return;
        ctx.globalAlpha = Math.max(0, p.life);
        if (p.isHeart) {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.bezierCurveTo(p.x - p.size/2, p.y - p.size/2, p.x - p.size, p.y + p.size/3, p.x, p.y + p.size);
            ctx.bezierCurveTo(p.x + p.size, p.y + p.size/3, p.x + p.size/2, p.y - p.size/2, p.x, p.y);
            ctx.fill();
        } else {
            ctx.fillStyle = p.color;
            if (p.rot !== undefined && p.rot !== 0) {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                ctx.restore();
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    });
    ctx.globalAlpha = 1;

    // Dibujar tarjeta neón de Intro de Partido
    if (gameState === 'INTRO') {
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 15;
        
        const cardW = 460;
        const cardH = 120;
        const cardX = canvas.width / 2 - cardW / 2;
        const cardY = canvas.height * 0.22;
        
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 16);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset
        
        // Texto de copa
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 12px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText(tournament.phase === 2 ? '🏆 LA GRAN FINAL MUNDIAL 🏆' : '🏆 COPA DEL MUNDO 2026 🏆', canvas.width / 2, cardY + 26);
        
        // Equipos
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Fredoka';
        ctx.fillText(`${tournament.playerTeam.name.toUpperCase()}  VS  ${tournament.currentOpponent.name.toUpperCase()}`, canvas.width / 2, cardY + 65);
        
        // Detalles
        ctx.fillStyle = '#a5f3fc';
        ctx.font = 'bold 11px Outfit';
        const diffText = currentDifficulty === 'easy' ? 'FÁCIL' : currentDifficulty === 'medium' ? 'MEDIO' : currentDifficulty === 'hard' ? 'DIFÍCIL' : 'EXTREMO';
        const weatherText = currentWeather === 'sunny' ? 'SOLEADO' : currentWeather === 'night' ? 'NOCHE' : currentWeather === 'rain' ? 'LLUVIA' : 'NIEVE';
        ctx.fillText(`DIFICULTAD: ${diffText}  |  CLIMA: ${weatherText}`, canvas.width / 2, cardY + 95);
        
        ctx.restore();
    }

    ctx.restore();

    // --- DESTELLO GOL DE ESTADIO DE FASE 2 (Fuera del zoom para abarcar todo el canvas) ---
    if (goalFlashAlpha > 0) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0); 
        ctx.fillStyle = `rgba(255, 255, 255, ${goalFlashAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        goalFlashAlpha -= dt * 3.5; // Se apaga rápido
    }

    animationId = requestAnimationFrame(gameLoop);
}

// --- FUNCIONES AUXILIARES DE FASE 1: MENÚ PRINCIPAL DINÁMICO ---
function drawMenuReflectors(timestamp) {
    ctx.save();
    const w = canvas.width;
    const h = canvas.height;
    
    // Foco 1: Izquierdo (Barre el cielo de color azul neón)
    const angle1 = Math.sin(timestamp * 0.0004) * 0.35 + Math.PI * 0.22;
    const grad1 = ctx.createRadialGradient(0, h, 10, Math.cos(angle1) * w, Math.sin(angle1) * h, w * 0.85);
    grad1.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
    grad1.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = grad1;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.arc(0, h, w, angle1 - 0.22, angle1 + 0.22);
    ctx.closePath();
    ctx.fill();

    // Foco 2: Derecho (Barre el cielo de color oro neón)
    const angle2 = Math.cos(timestamp * 0.0005) * 0.35 + Math.PI * 0.78;
    const grad2 = ctx.createRadialGradient(w, h, 10, Math.cos(angle2) * w, Math.sin(angle2) * h, w * 0.85);
    grad2.addColorStop(0, 'rgba(251, 191, 36, 0.18)');
    grad2.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = grad2;
    ctx.beginPath();
    ctx.moveTo(w, h);
    ctx.arc(w, h, w, angle2 - 0.22, angle2 + 0.22);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function drawMenuConfetti(dt) {
    if (Math.random() < 0.075) {
        const colors = ['#f43f5e', '#38bdf8', '#fbbf24', '#a78bfa', '#34d399'];
        spawnParticle({
            x: Math.random() * canvas.width,
            y: -10,
            vx: (Math.random() - 0.5) * 45,
            vy: 35 + Math.random() * 25,
            life: 8.0,
            size: Math.random() * 4 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            rot: Math.random() * Math.PI,
            rotSpd: (Math.random() - 0.5) * 3
        });
    }
}

function updateAndDrawMenuParticles(dt) {
    ctx.save();
    particlePool.forEach(p => {
        if (!p.active) return;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += GRAVITY * 0.18 * dt; // Gravedad suave para el confeti
        if (p.rot !== undefined) p.rot += p.rotSpd * dt;
        p.life -= dt;
        if (p.life <= 0) p.active = false;
        
        if (p.active) {
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            if (p.rot !== undefined && p.rot !== 0) {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                ctx.restore();
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    });
    ctx.globalAlpha = 1.0;
    ctx.restore();
}

function createGrassKickParticles(x, y) {
    for (let i = 0; i < 12; i++) {
        spawnParticle({
            x: x + (Math.random() - 0.5) * 15,
            y: y,
            vx: (Math.random() - 0.5) * 220,
            vy: -Math.random() * 260 - 80,
            life: 0.85,
            size: Math.random() * 3.5 + 2,
            color: Math.random() > 0.5 ? '#15803d' : '#22c55e', 
            rot: Math.random() * Math.PI,
            rotSpd: (Math.random() - 0.5) * 12
        });
    }
}

requestAnimationFrame(gameLoop);
