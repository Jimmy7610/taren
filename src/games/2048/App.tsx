import React, { useEffect, useRef, useState, useCallback } from "react";

import "./styles/base.css";
import "./styles/tiles.css";
import "./styles/animations.css";

import HeroArt from "./ui/HeroArt";
import Board from "./ui/Board";
import StartScreen from "./ui/StartScreen";
import HUD from "./ui/HUD";
import { createEmptyGrid4, spawnInitialTwoTiles, spawnOneTile, type Grid4 } from "./logic/spawn";
import { moveGrid, type Direction } from "./logic/move";
import { attachSwipe } from "./input/touch";

export default function App() {
    const [hasStarted, setHasStarted] = useState(false);
    const [grid, setGrid] = useState<Grid4>(() => createEmptyGrid4());
    const [score, setScore] = useState(0);

    // Guard against double-trigger
    const startedRef = useRef(false);
    const rootRef = useRef<HTMLDivElement>(null);

    const start = useCallback(() => {
        if (startedRef.current) return;
        startedRef.current = true;

        setGrid(prev => spawnInitialTwoTiles(prev));
        setHasStarted(true);
    }, []);

    const handleMove = useCallback((dir: Direction) => {
        if (!startedRef.current) return;

        setGrid(prev => {
            const result = moveGrid(prev, dir);
            if (result.changed) {
                setScore(s => s + result.gained);
                return spawnOneTile(result.grid);
            }
            return prev;
        });
    }, []);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (!startedRef.current) {
                start();
                return;
            }

            switch (e.key) {
                case "ArrowUp":
                case "w":
                case "W":
                    handleMove("up");
                    break;
                case "ArrowDown":
                case "s":
                case "S":
                    handleMove("down");
                    break;
                case "ArrowLeft":
                case "a":
                case "A":
                    handleMove("left");
                    break;
                case "ArrowRight":
                case "d":
                case "D":
                    handleMove("right");
                    break;
            }
        };

        const onPointerDown = () => {
            if (!startedRef.current) start();
        };

        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("pointerdown", onPointerDown);

        let cleanupSwipe: (() => void) | undefined;
        if (rootRef.current) {
            cleanupSwipe = attachSwipe(rootRef.current, handleMove);
        }

        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("pointerdown", onPointerDown);
            if (cleanupSwipe) cleanupSwipe();
        };
    }, [start, handleMove]);

    return (
        <div className="t2048-root" ref={rootRef}>
            <HeroArt />
            <HUD score={score} />

            {!hasStarted ? (
                <StartScreen title="2048" subtitle="Press any key / tap to start" />
            ) : null}

            <Board grid={grid} />
        </div>
    );
}
