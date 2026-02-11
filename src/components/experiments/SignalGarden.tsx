import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';

const MAX_NODES = 12;
const PULSE_SPEED = 1.2;
const NODE_LIFE = 600; // Frames

interface PulseNode {
    x: number;
    y: number;
    age: number;
    maxAge: number;
    pulses: number[]; // Radii of active pulses
    intensity: number;
}

export const SignalGarden: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { theme } = useTheme();
    const [isInteracting, setIsInteracting] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const pointerPos = useRef({ x: 0, y: 0 });
    const nodes = useRef<PulseNode[]>([]);
    const animationFrameId = useRef<number>(0);
    const frameCount = useRef(0);

    const colors = theme === 'dark'
        ? { stroke: 'rgba(242, 242, 242, 0.2)', glint: 'rgba(255, 95, 31, 0.4)' }
        : { stroke: 'rgba(23, 23, 23, 0.2)', glint: 'rgba(255, 95, 31, 0.4)' };

    const createNode = useCallback((x: number, y: number): PulseNode => {
        return {
            x,
            y,
            age: 0,
            maxAge: NODE_LIFE,
            pulses: [0],
            intensity: 1.0
        };
    }, []);

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
            frameCount.current++;
            // Soft clear
            const bg = theme === 'dark' ? '10, 10, 10' : '255, 255, 255';
            ctx.fillStyle = `rgb(${bg})`;
            ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

            // Update nodes
            for (let i = 0; i < nodes.current.length; i++) {
                const node = nodes.current[i];
                node.age++;

                // Sustain logic: if interacting near node, boost its life
                if (isInteracting) {
                    const dx = pointerPos.current.x - node.x;
                    const dy = pointerPos.current.y - node.y;
                    if (dx * dx + dy * dy < 2500) {
                        node.age = Math.max(0, node.age - 2);
                        node.intensity = Math.min(1.5, node.intensity + 0.01);
                    }
                }

                // Add pulse
                if (frameCount.current % 60 === 0) {
                    node.pulses.push(0);
                }

                // Update pulses
                for (let j = 0; j < node.pulses.length; j++) {
                    node.pulses[j] += PULSE_SPEED * node.intensity;
                    if (node.pulses[j] > 400) {
                        node.pulses.splice(j, 1);
                        j--;
                    }
                }

                if (node.age > node.maxAge) {
                    nodes.current.splice(i, 1);
                    i--;
                    continue;
                }

                // Render rings
                const lifeAlpha = 1 - (node.age / node.maxAge);
                ctx.lineWidth = 1;

                node.pulses.forEach(radius => {
                    const ringAlpha = (1 - (radius / 400)) * lifeAlpha * 0.5 * node.intensity;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
                    ctx.strokeStyle = colors.stroke;
                    ctx.globalAlpha = ringAlpha;
                    ctx.stroke();

                    // Subtle geometric details
                    if (radius > 50 && radius < 200 && frameCount.current % 2 === 0) {
                        ctx.beginPath();
                        const pAngle = (frameCount.current * 0.01) % (Math.PI * 2);
                        ctx.arc(node.x + Math.cos(pAngle) * radius, node.y + Math.sin(pAngle) * radius, 1, 0, Math.PI * 2);
                        ctx.fillStyle = colors.glint;
                        ctx.fill();
                    }
                });
            }
            ctx.globalAlpha = 1;

            animationFrameId.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId.current);
        };
    }, [theme, isInteracting, colors]);

    const handlePointerDown = (e: React.PointerEvent) => {
        setIsInteracting(true);
        setHasInteracted(true);
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            pointerPos.current = { x, y };

            // Add node
            if (nodes.current.length >= MAX_NODES) {
                nodes.current.shift();
            }
            nodes.current.push(createNode(x, y));
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
                        Tap to plant a pulse. Hold to sustain.
                    </p>
                </div>
            </div>
        </div>
    );
};
