// ==================================================
// INSTÄLLNINGAR FÖR PULSE DUEL
// Alla kommentarer som börjar med "INSTÄLLNING -" är värden som Jimmy enkelt kan testa att ändra i VS Code.
// Ändra bara ett värde i taget och testa spelet efteråt.
// ==================================================

const CONFIG = {
    canvasWidth: 760,         // INSTÄLLNING - Grundbredden på Pulse Duel-spelytan.
    canvasHeight: 480,        // INSTÄLLNING - Grundhöjden på Pulse Duel-spelytan.
    targetScore: 7,           // INSTÄLLNING - Hur många poäng som krävs för att vinna.
    paddleWidth: 12,          // INSTÄLLNING - Paddelns bredd.
    paddleHeight: 92,         // INSTÄLLNING - Paddelns höjd.
    playerSpeed: 560,         // INSTÄLLNING - Spelarens paddelhastighet med tangentbord (px/s).
    ballSpeed: 380,           // INSTÄLLNING - Bollens grundhastighet (px/s).
    maxBallSpeed: 750,        // INSTÄLLNING - Högsta möjliga bollhastighet.
    speedIncrease: 1.05,      // INSTÄLLNING - Hastighetsökning vid varje paddelträff.
    ballRadius: 8,            // INSTÄLLNING - Storleken på pulsen (bollen).
    paddleMargin: 20,         // INSTÄLLNING - Avstånd från vägg till paddel.
    bestScoreKey: "taren_pulse_duel_best_result", // INSTÄLLNING - localStorage-nyckel för bästa resultat.
};

const DIFFICULTIES = {
    calm: { label: "Calm", aiSpeed: 0.08, aiMistake: 0.12 },
    focus: { label: "Focus", aiSpeed: 0.12, aiMistake: 0.06 },
    sharp: { label: "Sharp", aiSpeed: 0.18, aiMistake: 0.02 }
};

class PulseDuel {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.difficulty = 'calm';
        this.playerScore = 0;
        this.aiScore = 0;
        this.bestResult = localStorage.getItem(CONFIG.bestScoreKey) || "--";
        
        this.paused = false;
        this.running = false;
        this.roundActive = false;
        
        this.playerY = 0;
        this.aiY = 0;
        this.ball = { x: 0, y: 0, vx: 0, vy: 0, speed: 0 };
        
        this.keys = {};
        this.lastTime = 0;
        
        this.init();
    }

    init() {
        this.canvas.width = CONFIG.canvasWidth;
        this.canvas.height = CONFIG.canvasHeight;
        
        this.playerY = (this.canvas.height - CONFIG.paddleHeight) / 2;
        this.aiY = (this.canvas.height - CONFIG.paddleHeight) / 2;
        
        document.getElementById('best-result').textContent = this.bestResult;
        document.getElementById('target-score').textContent = CONFIG.targetScore;
        
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space') {
                if (!this.running) this.reset();
                else if (!this.roundActive) this.launchBall();
            }
            if (e.key.toLowerCase() === 'p') this.togglePause();
        });
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
        
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const root = document.documentElement;
            const mouseY = e.clientY - rect.top - root.scrollTop;
            this.playerY = mouseY - CONFIG.paddleHeight / 2;
        });

        this.setDifficulty(this.difficulty);
        requestAnimationFrame((t) => this.loop(t));
    }

    setDifficulty(key) {
        this.difficulty = key;
        document.querySelectorAll('.game-controls .btn').forEach(btn => {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
        });
        document.getElementById(`btn-${key}`).classList.add('btn-primary');
        document.getElementById(`btn-${key}`).classList.remove('btn-secondary');
    }

    reset() {
        this.playerScore = 0;
        this.aiScore = 0;
        this.running = true;
        this.roundActive = false;
        this.paused = false;
        this.updateHUD();
        
        document.getElementById('game-start').classList.add('hidden');
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('game-pause').classList.add('hidden');
        
        this.launchBall();
    }

    launchBall() {
        this.roundActive = true;
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.speed = CONFIG.ballSpeed;
        
        const angle = (Math.random() * Math.PI / 2) - Math.PI / 4; // -45 to 45 deg
        const dir = Math.random() > 0.5 ? 1 : -1;
        this.ball.vx = dir * Math.cos(angle) * this.ball.speed;
        this.ball.vy = Math.sin(angle) * this.ball.speed;
    }

    togglePause() {
        if (!this.running) return;
        this.paused = !this.paused;
        document.getElementById('game-pause').classList.toggle('hidden', !this.paused);
        document.getElementById('pause-btn').textContent = this.paused ? "Resume" : "Pause";
    }

    update(dt) {
        if (!this.running || this.paused || !this.roundActive) return;

        // Player Movement (Keyboard fallback)
        if (this.keys['ArrowUp'] || this.keys['KeyW']) this.playerY -= CONFIG.playerSpeed * dt;
        if (this.keys['ArrowDown'] || this.keys['KeyS']) this.playerY += CONFIG.playerSpeed * dt;
        
        // Clamp Player
        this.playerY = Math.max(0, Math.min(this.canvas.height - CONFIG.paddleHeight, this.playerY));

        // AI Movement
        const diff = DIFFICULTIES[this.difficulty];
        const aiTarget = this.ball.y - CONFIG.paddleHeight / 2;
        // Simple easing for AI
        const error = (Math.random() - 0.5) * 100 * diff.aiMistake;
        this.aiY += (aiTarget + error - this.aiY) * diff.aiSpeed;
        this.aiY = Math.max(0, Math.min(this.canvas.height - CONFIG.paddleHeight, this.aiY));

        // Ball Movement
        this.ball.x += this.ball.vx * dt;
        this.ball.y += this.ball.vy * dt;

        // Wall Collision
        if (this.ball.y - CONFIG.ballRadius < 0) {
            this.ball.y = CONFIG.ballRadius;
            this.ball.vy *= -1;
        }
        if (this.ball.y + CONFIG.ballRadius > this.canvas.height) {
            this.ball.y = this.canvas.height - CONFIG.ballRadius;
            this.ball.vy *= -1;
        }

        // Paddle Collision (Player)
        if (this.ball.vx < 0 && 
            this.ball.x - CONFIG.ballRadius < CONFIG.paddleMargin + CONFIG.paddleWidth &&
            this.ball.x - CONFIG.ballRadius > CONFIG.paddleMargin &&
            this.ball.y > this.playerY && this.ball.y < this.playerY + CONFIG.paddleHeight) {
            
            this.ball.vx *= -1;
            this.ball.x = CONFIG.paddleMargin + CONFIG.paddleWidth + CONFIG.ballRadius;
            
            // Influence vy based on where it hit
            const hitPos = (this.ball.y - (this.playerY + CONFIG.paddleHeight/2)) / (CONFIG.paddleHeight/2);
            this.ball.vy += hitPos * 200;
            
            this.accelerateBall();
        }

        // Paddle Collision (AI)
        if (this.ball.vx > 0 && 
            this.ball.x + CONFIG.ballRadius > this.canvas.width - CONFIG.paddleMargin - CONFIG.paddleWidth &&
            this.ball.x + CONFIG.ballRadius < this.canvas.width - CONFIG.paddleMargin &&
            this.ball.y > this.aiY && this.ball.y < this.aiY + CONFIG.paddleHeight) {
            
            this.ball.vx *= -1;
            this.ball.x = this.canvas.width - CONFIG.paddleMargin - CONFIG.paddleWidth - CONFIG.ballRadius;
            
            const hitPos = (this.ball.y - (this.aiY + CONFIG.paddleHeight/2)) / (CONFIG.paddleHeight/2);
            this.ball.vy += hitPos * 200;
            
            this.accelerateBall();
        }

        // Out of bounds
        if (this.ball.x < 0) {
            this.aiScore++;
            this.endRound();
        } else if (this.ball.x > this.canvas.width) {
            this.playerScore++;
            this.endRound();
        }
    }

    accelerateBall() {
        this.ball.speed = Math.min(CONFIG.maxBallSpeed, this.ball.speed * CONFIG.speedIncrease);
        const currentSpeed = Math.sqrt(this.ball.vx ** 2 + this.ball.vy ** 2);
        const ratio = this.ball.speed / currentSpeed;
        this.ball.vx *= ratio;
        this.ball.vy *= ratio;
    }

    endRound() {
        this.roundActive = false;
        this.updateHUD();
        if (this.playerScore >= CONFIG.targetScore || this.aiScore >= CONFIG.targetScore) {
            this.gameOver();
        } else {
            setTimeout(() => {
                if (this.running && !this.paused) this.launchBall();
            }, 1000);
        }
    }

    gameOver() {
        this.running = false;
        const victory = this.playerScore >= CONFIG.targetScore;
        const result = `${this.playerScore} - ${this.aiScore}`;
        
        if (victory) {
            this.bestResult = result;
            localStorage.setItem(CONFIG.bestScoreKey, result);
            document.getElementById('best-result').textContent = result;
        }

        document.getElementById('result-title').textContent = victory ? "Victory" : "Defeat";
        document.getElementById('final-result').textContent = `Final Score: ${result}`;
        document.getElementById('game-over').classList.remove('hidden');
    }

    updateHUD() {
        document.getElementById('player-score').textContent = this.playerScore;
        document.getElementById('ai-score').textContent = this.aiScore;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Center line
        this.ctx.setLineDash([10, 15]);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Paddles
        this.ctx.fillStyle = victory = (this.playerScore >= CONFIG.targetScore) ? CONFIG.pulseCyan : 'white';
        // Player
        this.ctx.fillStyle = '#4cc9f0';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#4cc9f0';
        this.ctx.fillRect(CONFIG.paddleMargin, this.playerY, CONFIG.paddleWidth, CONFIG.paddleHeight);
        
        // AI
        this.ctx.fillStyle = '#8b6cff';
        this.ctx.shadowColor = '#8b6cff';
        this.ctx.fillRect(this.canvas.width - CONFIG.paddleMargin - CONFIG.paddleWidth, this.aiY, CONFIG.paddleWidth, CONFIG.paddleHeight);
        
        // Ball
        if (this.roundActive) {
            this.ctx.fillStyle = 'white';
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = 'white';
            this.ctx.beginPath();
            this.ctx.arc(this.ball.x, this.ball.y, CONFIG.ballRadius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.shadowBlur = 0;
    }

    loop(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        this.update(dt);
        this.draw();

        requestAnimationFrame((t) => this.loop(t));
    }
}

const game = new PulseDuel();
