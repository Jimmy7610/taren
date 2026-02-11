import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
    color: string;
}

const MAX_PARTICLES = 5000;
const SPAWN_RATE = 8; // particles per frame while active

export const DigitalSand: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { theme } = useTheme();
    const [isInteracting, setIsInteracting] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const pointerPos = useRef({ x: 0, y: 0 });
    const particles = useRef<Particle[]>([]);
    const animationFrameId = useRef<number>(0);
    const pool = useRef<Particle[]>([]);

    // Theme-based colors
    const colors = theme === 'dark'
        ? ['#f2f2f2', '#e5e5e5', '#d4d4d4', '#ff5f1f'] // dark mode: off-whites + subtle accent
        : ['#171717', '#262626', '#404040', '#ff5f1f']; // light mode: charcoals + subtle accent

    const initParticle = useCallback((p: Particle, x: number, y: number) => {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 0.5;
        p.x = x;
        p.y = y;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed - 1; // slight initial upward burst
        p.maxLife = Math.random() * 100 + 100;
        p.life = p.maxLife;
        p.size = Math.random() * 1.5 + 0.5;
        // 95% regular, 5% accent
        p.color = Math.random() > 0.95 ? colors[3] : colors[Math.floor(Math.random() * 3)];
        return p;
    }, [colors]);

    const spawnParticles = useCallback((x: number, y: number) => {
        for (let i = 0; i < SPAWN_RATE; i++) {
            let p: Particle;
            if (particles.current.length < MAX_PARTICLES) {
                p = { x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0, size: 0, color: '' };
                particles.current.push(initParticle(p, x, y));
            } else {
                // Recycle oldest
                p = particles.current.shift()!;
                particles.current.push(initParticle(p, x, y));
            }
        }
    }, [initParticle]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        const handleResize = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            ctx.scale(dpr, dpr);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        const animate = () => {
            // Background fill based on theme
            ctx.fillStyle = theme === 'dark' ? '#0a0a0a' : '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (isInteracting) {
                spawnParticles(pointerPos.current.x, pointerPos.current.y);
            }

            // Update & Draw
            for (let i = particles.current.length - 1; i >= 0; i--) {
                const p = particles.current[i];

                // Physics
                p.vy += 0.05; // gravity
                p.x += p.vx;
                p.y += p.vy;
                p.life--;

                // Interaction drift
                if (isInteracting) {
                    const dx = p.x - pointerPos.current.x;
                    const dy = p.y - pointerPos.current.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        p.vx += dx / 1000;
                        p.vy += dy / 1000;
                    }
                }

                if (p.life <= 0) {
                    particles.current.splice(i, 1);
                    continue;
                }

                // Draw
                const alpha = Math.min(1, p.life / 40);
                ctx.globalAlpha = alpha;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;

            animationFrameId.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId.current);
        };
    }, [theme, isInteracting, spawnParticles]);

    const handlePointerDown = (e: React.PointerEvent) => {
        setIsInteracting(true);
        setHasInteracted(true);
        pointerPos.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        pointerPos.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
        setIsInteracting(false);
    };

    return (
        <div
            className="fixed inset-0 z-0 touch-none select-none bg-background cursor-crosshair overflow-hidden"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        >
            <canvas ref={canvasRef} />

            {/* Instruction Overlay */}
            {!hasInteracted && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-pulse">
                    <span className="text-foreground/30 text-xs font-bold uppercase tracking-[0.3em] bg-background/50 backdrop-blur-sm px-6 py-3 rounded-full border border-foreground/5">
                        Tap / Click to pour sand
                    </span>
                </div>
            )}
        </div>
    );
};
