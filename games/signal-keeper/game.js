const SETTINGS = {
    coreMaxIntegrity: 100, // INSTÄLLNING - Ändra hur mycket liv signal-kärnan har.
    signalBaseSpeed: 0.015, // INSTÄLLNING - Lägre värde gör inkommande signaler långsammare i början.
    spawnIntervalStart: 1600, // INSTÄLLNING - Högre värde gör att signaler kommer mer sällan i början.
    shieldGapSize: 0.95, // INSTÄLLNING - Ändra hur stor öppningen i skölden är. Större värde gör spelet lättare att förstå.
    pulseCooldownMs: 5200, // INSTÄLLNING - Ändra cooldown för pulse shield (ms).
    audioVolume: 0.28, // INSTÄLLNING - Ändra standardvolymen för spelets ljud.
    difficultyRamp: 0.99, // INSTÄLLNING - Hur mycket spawn intervallet minskar (multiplikator).
    minSpawnInterval: 400, // INSTÄLLNING - Lägsta möjliga spawn intervall.
    coreRadius: 1.5, // INSTÄLLNING - Kärnans radie i 3D-scenen.
    shieldRadius: 4.0, // INSTÄLLNING - Sköldens radie.
    mouseAimSmoothing: 1.0, // INSTÄLLNING - 1.0 betyder direkt musstyrning, lägre värde gör skölden mjukare men trögare.
    keyboardTurnSpeed: 0.15, // INSTÄLLNING - Ändra hur snabbt skölden roterar med tangentbord.
    touchAimSmoothing: 1.0, // INSTÄLLNING - 1.0 betyder direkt touchstyrning.
    gapMarkerOpacity: 0.82, // INSTÄLLNING - Ändra hur tydlig markören vid öppningen är.
    aimGuideOpacity: 0.28, // INSTÄLLNING - Ändra hur tydlig siktlinjen mot öppningen är.
    introSafeSignals: 4 // INSTÄLLNING - Antal första signaler som helst ska vara enkla/blå för att lära spelaren.
};

class SignalKeeper {
    constructor() {
        this.state = 'idle'; // idle, playing, gameover
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('signalKeeperBest')) || 0;
        this.integrity = SETTINGS.coreMaxIntegrity;
        this.intensity = 1.0;
        
        this.lastTime = 0;
        this.spawnTimer = 0;
        this.currentSpawnInterval = SETTINGS.spawnIntervalStart;
        
        this.signals = [];
        this.signalsSpawned = 0;
        this.shieldGapAngle = Math.PI / 2; // ONE SOURCE OF TRUTH
        this.targetShieldAngle = Math.PI / 2;
        this.currentSmoothing = 1.0;
        
        this.pulseReady = true;
        this.pulseTimer = 0;
        this.pulseWaves = []; // 2D overlay waves
        
        this.audioCtx = null;
        this.masterGain = null;
        this.isMuted = false;
        
        this.initDOM();
        this.initThree();
        this.initCanvas2D();
        this.initInput();
        
        this.updateHUD();
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    initDOM() {
        this.ui = {
            integrity: document.getElementById('stat-integrity'),
            score: document.getElementById('stat-score'),
            best: document.getElementById('stat-best'),
            intensity: document.getElementById('stat-intensity'),
            status: document.getElementById('game-status'),
            pulseBtn: document.getElementById('btn-pulse'),
            startScreen: document.getElementById('game-start'),
            gameOverScreen: document.getElementById('game-over'),
            finalStats: document.getElementById('final-stats'),
            audioBtn: document.getElementById('btn-audio'),
            volumeControl: document.getElementById('volume-control'),
            volumeSlider: document.getElementById('volumeSlider')
        };
        
        this.ui.best.innerText = this.bestScore;
        
        this.ui.volumeSlider.value = SETTINGS.audioVolume;
        this.ui.volumeSlider.addEventListener('input', (e) => {
            SETTINGS.audioVolume = parseFloat(e.target.value);
            if (this.masterGain && !this.isMuted) {
                this.masterGain.gain.rampToValueAtTime(SETTINGS.audioVolume, this.audioCtx.currentTime + 0.1);
            }
        });
    }

    initThree() {
        const container = document.getElementById('three-container');
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x050507, 0.04);
        
        this.camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
        this.camera.position.set(0, 8, 12);
        this.camera.lookAt(0, 0, 0);
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(this.renderer.domElement);
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x222233);
        this.scene.add(ambientLight);
        
        const coreLight = new THREE.PointLight(0x8b6cff, 2, 20);
        this.scene.add(coreLight);
        
        // Core
        const coreGeo = new THREE.IcosahedronGeometry(SETTINGS.coreRadius, 2);
        const coreMat = new THREE.MeshBasicMaterial({ 
            color: 0x8b6cff, 
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });
        this.coreMesh = new THREE.Mesh(coreGeo, coreMat);
        this.scene.add(this.coreMesh);
        
        // Inner glowing core
        const innerCoreGeo = new THREE.IcosahedronGeometry(SETTINGS.coreRadius * 0.8, 1);
        const innerCoreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.innerCoreMesh = new THREE.Mesh(innerCoreGeo, innerCoreMat);
        this.scene.add(this.innerCoreMesh);
        
        // Shield Ring
        const shieldGeo = new THREE.TorusGeometry(SETTINGS.shieldRadius, 0.1, 8, 64, Math.PI * 2 - SETTINGS.shieldGapSize);
        const shieldMat = new THREE.MeshBasicMaterial({ color: 0x4cc9f0, transparent: true, opacity: 0.5 });
        this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
        this.shieldMesh.rotation.x = Math.PI / 2; // Flat on XZ plane
        this.scene.add(this.shieldMesh);
        
        // Gap Marker Group
        this.gapMarker = new THREE.Group();
        
        const centerGeo = new THREE.SphereGeometry(0.12, 8, 8);
        const centerMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: SETTINGS.gapMarkerOpacity });
        this.gapMarkerCenter = new THREE.Mesh(centerGeo, centerMat);
        this.gapMarkerCenter.position.set(SETTINGS.shieldRadius, 0, 0);
        this.gapMarker.add(this.gapMarkerCenter);
        
        const edgeGeo = new THREE.SphereGeometry(0.2, 8, 8);
        const edgeMat = new THREE.MeshBasicMaterial({ color: 0x4cc9f0, transparent: true, opacity: 0.45 });
        const halfGap = SETTINGS.shieldGapSize / 2;
        
        this.gapEdge1 = new THREE.Mesh(edgeGeo, edgeMat);
        this.gapEdge1.position.set(Math.cos(halfGap) * SETTINGS.shieldRadius, 0, -Math.sin(halfGap) * SETTINGS.shieldRadius);
        this.gapMarker.add(this.gapEdge1);
        
        this.gapEdge2 = new THREE.Mesh(edgeGeo, edgeMat);
        this.gapEdge2.position.set(Math.cos(-halfGap) * SETTINGS.shieldRadius, 0, -Math.sin(-halfGap) * SETTINGS.shieldRadius);
        this.gapMarker.add(this.gapEdge2);
        
        this.scene.add(this.gapMarker);
        
        // Particles group
        this.signalGroup = new THREE.Group();
        this.scene.add(this.signalGroup);
        
        // Resize handler
        window.addEventListener('resize', () => {
            if (!container) return;
            this.camera.aspect = container.clientWidth / container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(container.clientWidth, container.clientHeight);
            this.resizeCanvas2D();
        });
    }

    initCanvas2D() {
        this.canvas2d = document.getElementById('overlay-canvas');
        this.ctx2d = this.canvas2d.getContext('2d');
        this.resizeCanvas2D();
    }

    resizeCanvas2D() {
        const rect = this.canvas2d.parentElement.getBoundingClientRect();
        this.canvas2d.width = rect.width;
        this.canvas2d.height = rect.height;
    }

    initInput() {
        const board = document.querySelector('.signal-keeper-board');
        const canvas = this.renderer.domElement;
        
        this.raycaster = new THREE.Raycaster();
        this.mousePlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // XZ plane
        
        const handlePointer = (e) => {
            if (this.state !== 'playing') return;
            const rect = canvas.getBoundingClientRect();
            
            // Map pointer to screen [-1, 1] for raycaster
            const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            
            this.raycaster.setFromCamera(new THREE.Vector2(nx, ny), this.camera);
            const target = new THREE.Vector3();
            this.raycaster.ray.intersectPlane(this.mousePlane, target);
            
            if (target) {
                // Fully mapped to 3D world angle in XZ plane
                this.targetShieldAngle = Math.atan2(target.z, target.x);
                this.currentSmoothing = e.pointerType === 'mouse' ? SETTINGS.mouseAimSmoothing : SETTINGS.touchAimSmoothing;
            }
        };

        board.addEventListener('pointermove', handlePointer);
        board.addEventListener('pointerdown', handlePointer);
        
        // Mobile touch prevention only on board
        board.addEventListener('touchmove', (e) => {
            if (this.state === 'playing') e.preventDefault();
        }, { passive: false });
        
        // Keyboard
        window.addEventListener('keydown', (e) => {
            if (this.state !== 'playing') return;
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                this.targetShieldAngle -= SETTINGS.keyboardTurnSpeed;
                this.currentSmoothing = 1.0; // Keyboard should feel direct
            }
            if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                this.targetShieldAngle += SETTINGS.keyboardTurnSpeed;
                this.currentSmoothing = 1.0;
            }
            if (e.code === 'Space') {
                e.preventDefault();
                this.triggerPulse();
            }
        });
    }

    initAudio() {
        if (this.audioCtx) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
        
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.value = SETTINGS.audioVolume;
        this.masterGain.connect(this.audioCtx.destination);
        
        // Ambient drone
        this.droneOsc = this.audioCtx.createOscillator();
        this.droneOsc.type = 'sine';
        this.droneOsc.frequency.value = 40;
        
        const droneGain = this.audioCtx.createGain();
        droneGain.gain.value = 0.2;
        
        this.droneOsc.connect(droneGain);
        droneGain.connect(this.masterGain);
        this.droneOsc.start();
    }

    toggleAudio() {
        if (!this.audioCtx) {
            this.initAudio();
            this.ui.audioBtn.innerText = 'Mute';
            this.ui.volumeControl.classList.remove('hidden');
        } else {
            this.isMuted = !this.isMuted;
            this.ui.audioBtn.innerText = this.isMuted ? 'Unmute' : 'Mute';
            this.ui.audioBtn.classList.toggle('active');
            this.masterGain.gain.rampToValueAtTime(this.isMuted ? 0 : SETTINGS.audioVolume, this.audioCtx.currentTime + 0.1);
        }
    }

    playSound(type) {
        if (!this.audioCtx || this.isMuted) return;
        
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        const now = this.audioCtx.currentTime;
        
        if (type === 'good') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.3, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'corrupt_block') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (type === 'damage') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(100, now);
            osc.frequency.exponentialRampToValueAtTime(20, now + 0.5);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.4, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
        } else if (type === 'pulse') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 1.0);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.5, now + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);
            osc.start(now);
            osc.stop(now + 1.0);
        } else if (type === 'rare') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.linearRampToValueAtTime(1200, now + 0.2);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.4, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
            osc.start(now);
            osc.stop(now + 0.6);
        }
    }

    start() {
        this.ui.startScreen.classList.add('hidden');
        this.reset();
    }

    reset() {
        this.state = 'playing';
        this.score = 0;
        this.integrity = SETTINGS.coreMaxIntegrity;
        this.intensity = 1.0;
        this.currentSpawnInterval = SETTINGS.spawnIntervalStart;
        this.signalsSpawned = 0;
        this.pulseReady = true;
        this.pulseTimer = 0;
        this.pulseWaves = [];
        
        this.ui.gameOverScreen.classList.add('hidden');
        this.ui.startScreen.classList.add('hidden');
        this.ui.status.innerText = 'Active';
        this.ui.status.style.color = '#4cc9f0';
        
        // Clear signals
        while(this.signalGroup.children.length > 0){ 
            this.signalGroup.remove(this.signalGroup.children[0]); 
        }
        this.signals = [];
        
        this.updateHUD();
        this.updatePulseButton();
    }

    gameOver() {
        this.state = 'gameover';
        this.ui.status.innerText = 'Compromised';
        this.ui.status.style.color = '#ff4a4a';
        this.ui.gameOverScreen.classList.remove('hidden');
        this.ui.finalStats.innerText = `You survived with a score of ${this.score}`;
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('signalKeeperBest', this.bestScore);
            this.ui.best.innerText = this.bestScore;
        }
        
        this.playSound('damage');
    }

    spawnSignal() {
        this.signalsSpawned++;
        const rand = Math.random();
        let type = 'corrupt'; // 60%
        if (rand > 0.6) type = 'good'; // 35%
        if (rand > 0.95) type = 'rare'; // 5%
        
        // Force good signals during intro to teach the player
        if (this.signalsSpawned <= SETTINGS.introSafeSignals) {
            type = 'good';
        }
        
        let color = 0xff4a4a;
        if (type === 'good') color = 0x4cc9f0;
        if (type === 'rare') color = 0xffb703;
        
        const geo = new THREE.OctahedronGeometry(0.3, 0);
        const mat = new THREE.MeshBasicMaterial({ color });
        const mesh = new THREE.Mesh(geo, mat);
        
        const angle = Math.random() * Math.PI * 2;
        const dist = 15;
        mesh.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
        
        this.signalGroup.add(mesh);
        this.signals.push({ mesh, type, angle, distance: dist });
    }

    triggerPulse() {
        if (!this.pulseReady || this.state !== 'playing') return;
        
        this.pulseReady = false;
        this.pulseTimer = SETTINGS.pulseCooldownMs;
        this.updatePulseButton();
        this.playSound('pulse');
        
        this.pulseWaves.push({ radius: 0, opacity: 1.0 });
        
        // Destroy nearby corrupt signals
        for (let i = this.signals.length - 1; i >= 0; i--) {
            const sig = this.signals[i];
            if (sig.distance < 8 && sig.type !== 'good' && sig.type !== 'rare') {
                this.signalGroup.remove(sig.mesh);
                this.signals.splice(i, 1);
                this.score += 5;
            }
        }
        this.updateHUD();
    }

    updatePulseButton() {
        this.ui.pulseBtn.disabled = !this.pulseReady;
        if (this.pulseReady) {
            this.ui.pulseBtn.innerText = 'Pulse Shield [Space]';
        } else {
            this.ui.pulseBtn.innerText = `Recharging...`;
        }
    }

    updateHUD() {
        this.ui.integrity.innerText = `${Math.max(0, Math.floor(this.integrity))}%`;
        this.ui.score.innerText = this.score;
        this.ui.intensity.innerText = this.intensity.toFixed(1);
        
        if (this.integrity <= 25) {
            this.ui.integrity.style.color = '#ff4a4a';
        } else {
            this.ui.integrity.style.color = 'var(--text)';
        }
    }

    animate(timestamp) {
        requestAnimationFrame(this.animate);
        
        const dt = timestamp - this.lastTime;
        this.lastTime = timestamp;
        if (dt > 100) return; // Ignore large jumps
        
        if (this.state === 'playing') {
            // Pulse cooldown
            if (!this.pulseReady) {
                this.pulseTimer -= dt;
                if (this.pulseTimer <= 0) {
                    this.pulseReady = true;
                    this.updatePulseButton();
                }
            }
            
            // Spawning
            this.spawnTimer += dt;
            if (this.spawnTimer >= this.currentSpawnInterval) {
                this.spawnTimer = 0;
                this.spawnSignal();
                
                // Difficulty ramp
                if (this.currentSpawnInterval > SETTINGS.minSpawnInterval) {
                    this.currentSpawnInterval *= SETTINGS.difficultyRamp;
                    this.intensity = SETTINGS.spawnIntervalStart / this.currentSpawnInterval;
                }
            }
            
            // Smooth shield rotation
            let diff = this.targetShieldAngle - this.shieldGapAngle;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            
            this.shieldGapAngle += diff * this.currentSmoothing;
            
            // Align visually with the shield gap
            const shieldVisualOffset = 0; // INSTÄLLNING - Justera endast om sköldens visuella öppning inte ligger exakt vid muspekaren.
            const gapLocalCenter = (Math.PI * 2 - SETTINGS.shieldGapSize) + (SETTINGS.shieldGapSize / 2);
            this.shieldMesh.rotation.z = -this.shieldGapAngle - gapLocalCenter + shieldVisualOffset;
            
            // Update gap marker group
            this.gapMarker.rotation.y = -this.shieldGapAngle;
            
            // Update signals
            for (let i = this.signals.length - 1; i >= 0; i--) {
                const sig = this.signals[i];
                sig.distance -= SETTINGS.signalBaseSpeed * this.intensity;
                sig.mesh.position.x = Math.cos(sig.angle) * sig.distance;
                sig.mesh.position.z = Math.sin(sig.angle) * sig.distance;
                
                // Rotate mesh for effect
                sig.mesh.rotation.x += 0.05;
                sig.mesh.rotation.y += 0.05;
                
                // Collision with shield
                if (sig.distance <= SETTINGS.shieldRadius + 0.2 && sig.distance >= SETTINGS.shieldRadius - 0.2) {
                    // Check if aligned with gap
                    let angleDiff = sig.angle - this.shieldGapAngle;
                    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                    
                    const inGap = Math.abs(angleDiff) < (SETTINGS.shieldGapSize / 2);
                    
                    if (!inGap) {
                        // Hit shield
                        if (sig.type === 'corrupt') {
                            this.playSound('corrupt_block');
                            this.score += 1;
                        } else if (sig.type === 'good') {
                            // Good signal blocked! Penalty.
                            this.integrity -= 5;
                            this.playSound('damage');
                        } else if (sig.type === 'rare') {
                            // Rare signal blocked! No penalty but missed points.
                        }
                        
                        this.signalGroup.remove(sig.mesh);
                        this.signals.splice(i, 1);
                        this.updateHUD();
                        this.checkGameOver();
                        continue;
                    }
                }
                
                // Reach core
                if (sig.distance <= SETTINGS.coreRadius) {
                    if (sig.type === 'good') {
                        this.score += 10;
                        this.playSound('good');
                    } else if (sig.type === 'rare') {
                        this.score += 50;
                        this.playSound('rare');
                    } else if (sig.type === 'corrupt') {
                        this.integrity -= 15;
                        this.playSound('damage');
                    }
                    
                    this.signalGroup.remove(sig.mesh);
                    this.signals.splice(i, 1);
                    this.updateHUD();
                    this.checkGameOver();
                }
            }
        }
        
        // Ambient animations
        this.coreMesh.rotation.y += 0.005;
        this.coreMesh.rotation.x += 0.002;
        this.innerCoreMesh.rotation.y -= 0.01;
        
        // Render 3D
        this.renderer.render(this.scene, this.camera);
        
        // Render 2D
        this.render2D();
    }
    
    checkGameOver() {
        if (this.integrity <= 0) {
            this.integrity = 0;
            this.gameOver();
        }
    }

    render2D() {
        this.ctx2d.clearRect(0, 0, this.canvas2d.width, this.canvas2d.height);
        
        const cx = this.canvas2d.width / 2;
        const cy = this.canvas2d.height / 2;
        
        // Aim line from core to shield gap
        if (this.state === 'playing') {
            this.ctx2d.beginPath();
            this.ctx2d.moveTo(cx, cy);
            // Project the 3D radius to screen space approximately (assume 35px per unit for 12 unit distance)
            // Just use a fixed visible line length for simplicity
            const lineLen = Math.min(cx, cy) * 0.45;
            this.ctx2d.lineTo(cx + Math.cos(this.targetShieldAngle) * lineLen, cy + Math.sin(this.targetShieldAngle) * lineLen);
            this.ctx2d.strokeStyle = `rgba(255, 255, 255, ${SETTINGS.aimGuideOpacity})`;
            this.ctx2d.lineWidth = 1;
            this.ctx2d.setLineDash([4, 4]);
            this.ctx2d.stroke();
            this.ctx2d.setLineDash([]);
        }
        
        // Pulse waves
        for (let i = this.pulseWaves.length - 1; i >= 0; i--) {
            const w = this.pulseWaves[i];
            w.radius += 15;
            w.opacity -= 0.02;
            
            if (w.opacity <= 0) {
                this.pulseWaves.splice(i, 1);
                continue;
            }
            
            this.ctx2d.beginPath();
            this.ctx2d.arc(cx, cy, w.radius, 0, Math.PI * 2);
            this.ctx2d.strokeStyle = `rgba(76, 201, 240, ${w.opacity})`;
            this.ctx2d.lineWidth = 2;
            this.ctx2d.stroke();
        }
        
        // Subtle scanlines
        this.ctx2d.fillStyle = 'rgba(255, 255, 255, 0.015)';
        for (let y = 0; y < this.canvas2d.height; y += 4) {
            this.ctx2d.fillRect(0, y, this.canvas2d.width, 1);
        }
        
        // Vignette
        const gradient = this.ctx2d.createRadialGradient(cx, cy, this.canvas2d.width * 0.3, cx, cy, this.canvas2d.width * 0.7);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.6)');
        this.ctx2d.fillStyle = gradient;
        this.ctx2d.fillRect(0, 0, this.canvas2d.width, this.canvas2d.height);
    }
}

// Ensure THREE is loaded before initializing
function checkThreeAndInit() {
    if (window.THREE) {
        window.game = new SignalKeeper();
    } else {
        setTimeout(checkThreeAndInit, 100);
    }
}

checkThreeAndInit();
