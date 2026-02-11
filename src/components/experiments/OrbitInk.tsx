import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';

const MAX_PARTICLES = 4000;
const G = 0.5; // Gravitational constant
const DAMPING = 0.99;

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
    size: number;
}

export const OrbitInk: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { theme } = useTheme();
    const [isInteracting, setIsInteracting] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const pointerPos = useRef({ x: 0, y: 0 });
    const particles = useRef<Particle[]>([]);
    const particlePool = useRef<Particle[]>([]);
    const animationFrameId = useRef<number>(0);

    const colors = theme === 'dark'
        ? ['rgba(242, 242, 242, 0.4)', 'rgba(229, 229, 229, 0.2)', 'rgba(255, 95, 31, 0.6)']
        : ['rgba(23, 23, 23, 0.4)', 'rgba(38, 38, 38, 0.2)', 'rgba(255, 95, 31, 0.6)'];

    const getParticle = useCallback((x: number, y: number): Particle => {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 50 + 20;
        const px = x + Math.cos(angle) * dist;
        const py = y + Math.sin(angle) * dist;

        // Tangential velocity for orbit
        const tx = -(py - y) * 0.05;
        const ty = (px - x) * 0.05;

        const p = particlePool.current.pop() || {} as Particle;
        p.x = px;
        p.y = py;
        p.vx = tx + (Math.random() - 0.5) * 0.5;
        p.vy = ty + (Math.random() - 0.5) * 0.5;
        p.maxLife = Math.random() * 200 + 100;
        p.life = p.maxLife;
        p.size = Math.random() * 1.5 + 0.5;
        p.color = Math.random() > 0.98 ? colors[2] : colors[Math.floor(Math.random() * 2)];

        return p;
    }, [colors]);

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
            // Ink trailing effect
            const bg = theme === 'dark' ? '10, 10, 10' : '255, 255, 255';
            ctx.fillStyle = `rgba(${bg}, 0.05)`;
            ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

            if (isInteracting) {
                for (let i = 0; i < 15; i++) {
                    if (particles.current.length < MAX_PARTICLES) {
                        particles.current.push(getParticle(pointerPos.current.x, pointerPos.current.y));
                    }
                }
            }

            for (let i = 0; i < particles.current.length; i++) {
                const p = particles.current[i];

                // Gravity logic
                const dx = pointerPos.current.x - p.x;
                const dy = pointerPos.current.y - p.y;
                const distSq = dx * dx + dy * dy + 100;
                const force = G / distSq;

                p.vx += dx * force;
                p.vy += dy * force;

                p.vx *= DAMPING;
                p.vy *= DAMPING;

                const prevX = p.x;
                const prevY = p.y;
                p.x += p.vx;
                p.y += p.vy;
                p.life--;

                if (p.life <= 0) {
                    particlePool.current.push(particles.current.splice(i, 1)[0]);
                    i--;
                    continue;
                }

                // Render stroke (ink style)
                const alpha = Math.min(1, p.life / 50);
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.moveTo(prevX, prevY);
                ctx.lineTo(p.x, p.y);
                ctx.strokeStyle = p.color;
                ctx.lineWidth = p.size;
                ctx.lineCap = 'round';
                ctx.stroke();
            }
            ctx.globalAlpha = 1;

            animationFrameId.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId.current);
        };
    }, [theme, isInteracting, getParticle]);

    const handlePointerDown = (e: React.PointerEvent) => {
        setIsInteracting(true);
        setHasInteracted(true);
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
            pointerPos.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
            pointerPos.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }
    };

    const handlePointerUp = () => setIsInteracting(false);

    return (
        <div
            className="fixed inset-0 z-0 touch-none select-none overflow-hidden"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
        >
            <canvas ref={canvasRef} className="block h-full w-full" />

            {/* Instruction Overlay */}
            <div className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${hasInteracted ? 'opacity-0' : 'opacity-100'}`}>
                <div className="rounded-full border border-foreground/10 bg-background/50 px-8 py-4 backdrop-blur-md">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40 italic">
                        Drag to seed an orbit
                    </p>
                </div>
            </div>
        </div>
    );
};
