import React, { useEffect, useRef, useState, useCallback } from "react";
import ReactDOM from "react-dom";

import "./styles/base.css";
import "./styles/tiles.css";
import "./styles/animations.css";

import Board from "./ui/Board";
import StartScreen from "./ui/StartScreen";
import Overlay from "./ui/Overlay";
import { createEmptyGrid4, spawnInitialTwoTiles, spawnOneTile, type Grid4 } from "./logic/spawn";
import { moveGrid, type Direction } from "./logic/move";
import { attachSwipe } from "./input/touch";
import { has2048, isGameOver } from "./logic/status";
import { loadBestScore, saveBestScore } from "./logic/storage";

export default function App() {
    const [hasStarted, setHasStarted] = useState(false);
    const [grid, setGrid] = useState<Grid4>(() => createEmptyGrid4());
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(() => loadBestScore());
    const [hasWon, setHasWon] = useState(false);
    const [showWinOverlay, setShowWinOverlay] = useState(false);
    const [isGameEnded, setIsGameEnded] = useState(false);

    // Animation metadata
    const [lastSpawnPos, setLastSpawnPos] = useState<{ r: number; c: number } | null>(null);
    const [lastMergePositions, setLastMergePositions] = useState<Array<{ r: number; c: number }>>([]);
    const [noMovePulse, setNoMovePulse] = useState(false);

    // Movement feedback: directional nudge on the board
    const [lastMoveDir, setLastMoveDir] = useState<Direction | null>(null);
    const [movePulse, setMovePulse] = useState(0);

    // Guard against double-trigger
    const startedRef = useRef(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const pulseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Lock page scroll while 2048 is mounted
    useEffect(() => {
        document.body.classList.add("taren-game-locked-scroll");
        return () => {
            document.body.classList.remove("taren-game-locked-scroll");
        };
    }, []);

    const start = useCallback(() => {
        if (startedRef.current) return;
        startedRef.current = true;

        const res = spawnInitialTwoTiles(createEmptyGrid4());
        setGrid(res.grid);
        setLastSpawnPos(res.pos);
        setHasStarted(true);
        setScore(0);
        setHasWon(false);
        setShowWinOverlay(false);
        setIsGameEnded(false);
    }, []);

    const restart = useCallback(() => {
        startedRef.current = false;
        setHasStarted(false);
        setGrid(createEmptyGrid4());
        setScore(0);
        setLastSpawnPos(null);
        setLastMergePositions([]);
        setLastMoveDir(null);
        setMovePulse(0);
        setHasWon(false);
        setShowWinOverlay(false);
        setIsGameEnded(false);
    }, []);

    const triggerNoMoveFeedback = useCallback(() => {
        setNoMovePulse(true);
        if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
        pulseTimeoutRef.current = setTimeout(() => setNoMovePulse(false), 150);
    }, []);

    const handleMove = useCallback((dir: Direction) => {
        if (!startedRef.current || isGameEnded || showWinOverlay) return;

        setGrid(prev => {
            const result = moveGrid(prev, dir);
            if (result.changed) {
                // Clear previous animations
                setLastMergePositions(result.mergedPositions);

                // Movement feedback: directional nudge
                setLastMoveDir(dir);
                setMovePulse(p => p + 1);

                const newScore = score + result.gained;
                setScore(newScore);

                if (newScore > bestScore) {
                    setBestScore(newScore);
                    saveBestScore(newScore);
                }

                const spawnRes = spawnOneTile(result.grid);
                setLastSpawnPos(spawnRes.pos);

                // Detect Win (exactly once per session)
                if (!hasWon && has2048(spawnRes.grid)) {
                    setHasWon(true);
                    setShowWinOverlay(true);
                }

                // Detect Game Over
                if (isGameOver(spawnRes.grid)) {
                    setIsGameEnded(true);
                }

                return spawnRes.grid;
            } else {
                triggerNoMoveFeedback();
                return prev;
            }
        });
    }, [score, bestScore, hasWon, isGameEnded, showWinOverlay, triggerNoMoveFeedback]);

    useEffect(() => {
        const GAME_KEYS = new Set([
            "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
            "w", "W", "a", "A", "s", "S", "d", "D", " "
        ]);

        const onKeyDown = (e: KeyboardEvent) => {
            // Prevent scroll for game keys
            if (GAME_KEYS.has(e.key)) {
                e.preventDefault();
            }

            if (!startedRef.current) {
                start();
                return;
            }
            if (isGameEnded || showWinOverlay) return;

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
    }, [start, handleMove, isGameEnded, showWinOverlay]);

    // Portal: inject score blocks into the page header
    const headerPortal = document.getElementById("t2048-header-scores");

    return (
        <div className="t2048-root" ref={rootRef}>
            {/* Score/Best portal into page header */}
            {headerPortal && ReactDOM.createPortal(
                <>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-[0.2em] mb-0.5">Score</span>
                        <span className="text-xl font-mono font-bold tabular-nums text-[#EDEDED]">
                            {score.toString().padStart(4, '0')}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-[0.2em] mb-0.5">Best</span>
                        <span className="text-xl font-mono font-bold tabular-nums text-[#8A8A8A]">
                            {bestScore.toString().padStart(4, '0')}
                        </span>
                    </div>
                </>,
                headerPortal
            )}

            {!hasStarted ? (
                <StartScreen title="2048" subtitle="Press any key / tap to start" />
            ) : null}

            {showWinOverlay ? (
                <Overlay
                    title="Experiment Success"
                    body="Target value 2048 reached."
                    primaryLabel="Continue"
                    onPrimary={() => setShowWinOverlay(false)}
                    secondaryLabel="Restart"
                    onSecondary={restart}
                />
            ) : null}

            {isGameEnded ? (
                <Overlay
                    title="Game Over"
                    body={`Grid lock detected. Final score: ${score}`}
                    primaryLabel="Try Again"
                    onPrimary={restart}
                />
            ) : null}

            <Board
                grid={grid}
                lastSpawnPos={lastSpawnPos}
                lastMergePositions={lastMergePositions}
                noMove={noMovePulse}
                moveDir={lastMoveDir}
                movePulse={movePulse}
            />
        </div>
    );
}
