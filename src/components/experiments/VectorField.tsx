import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';

const MAX_SEGMENTS = 5000;
const SEGMENTS_PER_FRAME = 6;
const LINE_LIFE = 60; // How many frames line segment lives

interface Segment {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
    thickness: number;
}

export const VectorField: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { theme } = useTheme();
    const [isInteracting, setIsInteracting] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const pointerPos = useRef({ x: 0, y: 0 });
    const segments = useRef<Segment[]>([]);
    const animationFrameId = useRef<number>(0);
    const time = useRef<number>(0);

    // Theme-based colors
    const colors = theme === 'dark'
        ? ['rgba(242, 242, 242, 0.4)', 'rgba(229, 229, 229, 0.3)', 'rgba(255, 95, 31, 0.5)']
        : ['rgba(23, 23, 23, 0.4)', 'rgba(38, 38, 38, 0.3)', 'rgba(255, 95, 31, 0.5)'];

    const initSegment = useCallback((s: Segment, x: number, y: number) => {
        s.x = x + (Math.random() - 0.5) * 5;
        s.y = y + (Math.random() - 0.5) * 5;
        s.vx = 0;
        s.vy = 0;
        s.life = LINE_LIFE + Math.random() * 40;
        s.thickness = Math.random() * 0.8 + 0.3;
        // Rare accent glint (1/20)
        s.color = Math.random() > 0.95 ? colors[2] : colors[Math.floor(Math.random() * 2)];
        return s;
    }, [colors]);

    const spawnSegments = useCallback((x: number, y: number) => {
        for (let i = 0; i < SEGMENTS_PER_FRAME; i++) {
            if (segments.current.length < MAX_SEGMENTS) {
                segments.current.push(initSegment({} as Segment, x, y));
            } else {
                // Recycle oldest
                const s = segments.current.shift()!;
                segments.current.push(initSegment(s, x, y));
            }
        }
    }, [initSegment]);

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
            time.current += 0.002; // Slow field evolution

            // Trailing effect
            const bg = theme === 'dark' ? '10, 10, 10' : '255, 255, 255';
            ctx.fillStyle = `rgba(${bg}, 0.08)`;
            ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

            if (isInteracting) {
                spawnSegments(pointerPos.current.x, pointerPos.current.y);
            }

            for (let i = 0; i < segments.current.length; i++) {
                const s = segments.current[i];

                // Vector Field Logic
                const freq = 0.0015;
                const angle = Math.sin(s.x * freq + time.current) * 2 +
                    Math.cos(s.y * freq - time.current * 0.8) * 2;

                s.vx = Math.cos(angle) * 1.5;
                s.vy = Math.sin(angle) * 1.5;

                // Physics
                const prevX = s.x;
                const prevY = s.y;
                s.x += s.vx;
                s.y += s.vy;
                s.life--;

                if (s.life <= 0) {
                    segments.current.splice(i, 1);
                    i--;
                    continue;
                }

                // Render stroke
                const alpha = Math.min(1, s.life / 20);
                ctx.beginPath();
                ctx.moveTo(prevX, prevY);
                ctx.lineTo(s.x, s.y);
                ctx.strokeStyle = s.color;
                ctx.lineWidth = s.thickness;
                ctx.globalAlpha = alpha;
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
    }, [theme, isInteracting, spawnSegments]);

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
            className="fixed inset-0 z-0 select-none touch-none overflow-hidden"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
        >
            <canvas ref={canvasRef} className="block h-full w-full" />

            {/* Instruction Overlay */}
            <div className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${hasInteracted ? 'opacity-0' : 'opacity-100'
                }`}>
                <div className="rounded-full border border-foreground/10 bg-background/50 px-8 py-4 backdrop-blur-md">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40 italic">
                        Tap / Click and drag to draw the field
                    </p>
                </div>
            </div>
        </div>
    );
};
