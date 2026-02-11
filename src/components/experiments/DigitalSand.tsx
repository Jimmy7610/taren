import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';

const MAX_PARTICLES = 5000;
const SPAWN_RATE = 12; // Increased for richer flow

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
    color: string;
    glint: boolean;
}

export const DigitalSand: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { theme } = useTheme();
    const [isInteracting, setIsInteracting] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const pointerPos = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
    const lastPointerPos = useRef({ x: 0, y: 0 });
    const particles = useRef<Particle[]>([]);
    const animationFrameId = useRef<number>(0);
    const time = useRef<number>(0);

    // Theme-based colors
    const colors = theme === 'dark'
        ? ['#f2f2f2', '#e5e5e5', '#a3a3a3', '#ff5f1f'] // dark mode: off-whites + subtle accent
        : ['#171717', '#262626', '#525252', '#ff5f1f']; // light mode: charcoals + subtle accent

    const initParticle = useCallback((p: Particle, x: number, y: number) => {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.5 + 0.2;
        p.x = x + (Math.random() - 0.5) * 10;
        p.y = y + (Math.random() - 0.5) * 10;

        // Blend pointer velocity into initial trajectory
        p.vx = Math.cos(angle) * speed + pointerPos.current.vx * 0.1;
        p.vy = Math.sin(angle) * speed + pointerPos.current.vy * 0.1 - 0.5;

        p.maxLife = Math.random() * 150 + 150;
        p.life = p.maxLife;
        p.size = Math.random() * 1.8 + 0.4;

        const rand = Math.random();
        p.glint = rand > 0.98;
        p.color = p.glint ? colors[3] : colors[Math.floor(Math.random() * 3)];

        return p;
    }, [colors]);

    const spawnParticles = useCallback((x: number, y: number) => {
        for (let i = 0; i < SPAWN_RATE; i++) {
            if (particles.current.length < MAX_PARTICLES) {
                particles.current.push(initParticle({} as Particle, x, y));
            } else {
                // Recycle oldest (front of array)
                const p = particles.current.shift()!;
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
            time.current += 0.005;

            // Trailing effect: Draw transparent rect instead of clearing
            const bg = theme === 'dark' ? '10, 10, 10' : '255, 255, 255';
            ctx.fillStyle = `rgba(${bg}, 0.12)`;
            ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

            if (isInteracting) {
                spawnParticles(pointerPos.current.x, pointerPos.current.y);
            }

            // Update & Draw
            for (let i = 0; i < particles.current.length; i++) {
                const p = particles.current[i];

                // Low-frequency flow field (pseudo-noise)
                const freq = 0.002;
                const angle = Math.sin(p.x * freq + time.current) * Math.cos(p.y * freq - time.current) * Math.PI * 2;

                p.vx += Math.cos(angle) * 0.02;
                p.vy += Math.sin(angle) * 0.02 + 0.04; // gravity + flow

                // Interaction drift
                const dx = p.x - pointerPos.current.x;
                const dy = p.y - pointerPos.current.y;
                const distSq = dx * dx + dy * dy;
                if (distSq < 150 * 150) {
                    const dist = Math.sqrt(distSq);
                    const force = (1 - dist / 150) * 0.05;
                    p.vx += dx * force * 0.1;
                    p.vy += dy * force * 0.1;
                }

                // Damping
                p.vx *= 0.99;
                p.vy *= 0.99;

                p.x += p.vx;
                p.y += p.vy;
                p.life--;

                if (p.life <= 0) {
                    particles.current.splice(i, 1);
                    i--;
                    continue;
                }

                // Draw
                const alpha = Math.min(1, p.life / 60);
                ctx.globalAlpha = alpha;
                ctx.fillStyle = p.color;

                if (p.glint) {
                    ctx.shadowBlur = 4;
                    ctx.shadowColor = p.color;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();

                if (p.glint) {
                    ctx.shadowBlur = 0;
                }
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
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            lastPointerPos.current = { x, y };
            pointerPos.current = { x, y, vx: 0, vy: 0 };
        }
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const vx = x - lastPointerPos.current.x;
            const vy = y - lastPointerPos.current.y;

            pointerPos.current.x = x;
            pointerPos.current.y = y;
            pointerPos.current.vx = vx;
            pointerPos.current.vy = vy;

            lastPointerPos.current = { x, y };
        }
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
