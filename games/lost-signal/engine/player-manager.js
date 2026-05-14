/**
 * Lost Signal - Player Manager
 * Handles Nilo's movement, scaling, and direction.
 */

class PlayerManager {
    constructor(game) {
        this.game = game;
        this.element = document.getElementById('player-nilo');
        this.container = document.getElementById('scene-viewport');
        
        // INSTÄLLNING - Rörelsehastighet (procent per sekund)
        this.moveSpeed = 25; 
        
        // INSTÄLLNING - Skalning baserat på djup (Y-koordinat)
        this.minScale = 0.5;
        this.maxScale = 1.0;
        
        // INSTÄLLNING - Grundhöjd (justeras via CSS max-height, men här för beräkning)
        this.baseHeight = 200; 
        
        this.x = 15;
        this.y = 80;
        this.targetX = 15;
        this.targetY = 80;
        this.facing = 'right';
        this.isMoving = false;
        
        this.init();
    }

    init() {
        // Ladda sparad position
        if (this.game.saveSystem.state.playerPos) {
            this.x = this.game.saveSystem.state.playerPos.x;
            this.y = this.game.saveSystem.state.playerPos.y;
            this.targetX = this.x;
            this.targetY = this.y;
        }

        // Klicka på scenen för att gå
        this.container.addEventListener('click', (e) => {
            if (e.target.id === 'hotspot-layer' || e.target.id === 'scene-container' || e.target.classList.contains('vfx-layer')) {
                const rect = this.container.getBoundingClientRect();
                const clickX = ((e.clientX - rect.left) / rect.width) * 100;
                const clickY = ((e.clientY - rect.top) / rect.height) * 100;
                
                this.moveTo(clickX, clickY);
                
                if (this.game.debugMode) {
                    this.game.updateDebugCoords(clickX, clickY);
                }
            }
        });

        this.updatePlayerSprite();
        this.update();
        this.animate();
    }

    async updatePlayerSprite() {
        const img = document.getElementById('player-img');
        if (!img) return;
        
        // INSTÄLLNING - Använd side-sprite om den finns, annars default
        let spriteBase = 'nilo-idle';
        if (this.facing === 'left' || this.facing === 'right') {
            spriteBase = 'nilo-side-idle';
        }
        
        const webpPath = `assets/characters/${spriteBase}.webp`;
        const pngPath = `assets/characters/${spriteBase}.png`;
        
        // INSTÄLLNING - Försök ladda WEBP, sen PNG som fallback
        try {
            const fullUrl = this.game.getAssetUrl(webpPath);
            if (img.src !== fullUrl) {
                // Testa om bilden finns (för PNG fallback logik)
                const exists = await this.checkAssetExists(fullUrl);
                if (exists) {
                    img.src = fullUrl;
                } else {
                    img.src = this.game.getAssetUrl(pngPath);
                }
                img.style.display = 'block';
            }
        } catch (e) {
            console.warn("Failed to load player sprite, using fallback.");
        }
    }

    async checkAssetExists(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok;
        } catch (e) {
            return false;
        }
    }

    moveTo(x, y) {
        // INSTÄLLNING - Kontrollera om punkten är inom walkArea (trapezoid/rektangel)
        // I Build 002 gör vi en enkel rektangulär clamp om walkArea saknas
        const area = this.game.sceneManager.currentScene.walkArea;
        if (area) {
            // Enkel rektangulär clamp för nu (Build 002)
            const minX = Math.min(...area.map(p => p.x));
            const maxX = Math.max(...area.map(p => p.x));
            const minY = Math.min(...area.map(p => p.y));
            const maxY = Math.max(...area.map(p => p.y));
            
            this.targetX = Math.max(minX, Math.min(maxX, x));
            this.targetY = Math.max(minY, Math.min(maxY, y));
        } else {
            this.targetX = x;
            this.targetY = y;
        }

        this.facing = this.targetX > this.x ? 'right' : 'left';
        this.updatePlayerSprite();
        this.isMoving = true;
    }

    update() {
        if (!this.isMoving) return;

        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 0.5) {
            this.x = this.targetX;
            this.y = this.targetY;
            this.isMoving = false;
            this.game.saveSystem.state.playerPos = { x: this.x, y: this.y };
            this.game.saveSystem.save();
            
            // Callback för hotspots
            if (this.onArrived) {
                this.onArrived();
                this.onArrived = null;
            }
            return;
        }

        // Normalisera och flytta
        const step = this.moveSpeed * (1 / 60); // 60 fps approx
        const vx = (dx / distance) * step;
        const vy = (dy / distance) * step;

        this.x += vx;
        this.y += vy;
    }

    animate() {
        // Uppdatera position och skala
        this.element.style.left = `${this.x}%`;
        this.element.style.top = `${this.y}%`;
        
        // Djup-skalning
        // Antag att horisonten är vid 50% och botten vid 100%
        const scaleRange = this.maxScale - this.minScale;
        const scaleFactor = (this.y - 50) / 50; // 0 vid 50%, 1 vid 100%
        const scale = this.minScale + (scaleFactor * scaleRange);
        
        // Riktning och Skala
        const flip = this.facing === 'left' ? -1 : 1;
        // Vi använder translate(-50%, -100%) för att fötterna (botten av elementet) ska vara vid x,y
        this.element.style.transform = `translate(-50%, -100%) scaleX(${flip}) scale(${scale})`;

        this.update();
        requestAnimationFrame(() => this.animate());
    }
}

export default PlayerManager;
