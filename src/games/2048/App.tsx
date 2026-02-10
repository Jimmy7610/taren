import React, { useEffect, useRef, useState, useCallback } from "react";

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
import { AudioEngine, loadMute, saveMute } from "./audio/audio";
import { sfxMove, sfxMerge, sfxGameOver, sfxWin } from "./audio/sfx";

type Props = {
    onScoreChange?: (score: number) => void;
    onBestScoreChange?: (best: number) => void;
    onMuteChange?: (muted: boolean) => void;
};

export default function App({ onScoreChange, onBestScoreChange, onMuteChange }: Props) {
    const [hasStarted, setHasStarted] = useState(false);
    const [grid, setGrid] = useState<Grid4>(() => createEmptyGrid4());
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(() => loadBestScore());
    const [hasWon, setHasWon] = useState(false);
    const [showWinOverlay, setShowWinOverlay] = useState(false);
    const [isGameEnded, setIsGameEnded] = useState(false);
    const [isMuted, setIsMuted] = useState(() => loadMute());

    // Animation metadata
    const [lastSpawnPos, setLastSpawnPos] = useState<{ r: number; c: number } | null>(null);
    const [lastMergePositions, setLastMergePositions] = useState<Array<{ r: number; c: number }>>([]);
    const [noMovePulse, setNoMovePulse] = useState(false);

    // Movement feedback
    const [lastMoveDir, setLastMoveDir] = useState<Direction | null>(null);
    const [movePulse, setMovePulse] = useState(0);

    // Refs
    const startedRef = useRef(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const boardRef = useRef<HTMLDivElement>(null);
    const pulseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef(new AudioEngine(loadMute()));

    // Sync score/best/mute to parent shell
    useEffect(() => { onScoreChange?.(score); }, [score, onScoreChange]);
    useEffect(() => { onBestScoreChange?.(bestScore); }, [bestScore, onBestScoreChange]);
    useEffect(() => { onMuteChange?.(isMuted); }, [isMuted, onMuteChange]);

    // Expose toggle for mute
    const toggleMute = useCallback(() => {
        setIsMuted(prev => {
            const next = !prev;
            audioRef.current.setMuted(next);
            saveMute(next);
            return next;
        });
    }, []);

    // Expose toggleMute via a ref callback on the root element
    useEffect(() => {
        const el = rootRef.current;
        if (el) {
            (el as unknown as { __toggleMute: () => void }).__toggleMute = toggleMute;
            (el as unknown as { __isMuted: boolean }).__isMuted = isMuted;
        }
    }, [toggleMute, isMuted]);

    const start = useCallback(async () => {
        if (startedRef.current) return;
        startedRef.current = true;

        // Unlock audio on first user gesture (critical for iOS)
        await audioRef.current.unlock();

        const res = spawnInitialTwoTiles(createEmptyGrid4());
        setGrid(res.grid);
        setLastSpawnPos(res.pos);
        setHasStarted(true);
        setScore(0);
        setHasWon(false);
        setShowWinOverlay(false);
        setIsGameEnded(false);
    }, []);

    const restart = useCallback(async () => {
        startedRef.current = false;
        await audioRef.current.unlock();
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
                setLastMergePositions(result.mergedPositions);
                setLastMoveDir(dir);
                setMovePulse(p => p + 1);

                // SFX
                sfxMove(audioRef.current);
                if (result.gained > 0) {
                    sfxMerge(audioRef.current, result.gained);
                }

                const newScore = score + result.gained;
                setScore(newScore);

                if (newScore > bestScore) {
                    setBestScore(newScore);
                    saveBestScore(newScore);
                }

                const spawnRes = spawnOneTile(result.grid);
                setLastSpawnPos(spawnRes.pos);

                if (!hasWon && has2048(spawnRes.grid)) {
                    setHasWon(true);
                    setShowWinOverlay(true);
                    sfxWin(audioRef.current);
                }

                if (isGameOver(spawnRes.grid)) {
                    setIsGameEnded(true);
                    sfxGameOver(audioRef.current);
                }

                return spawnRes.grid;
            } else {
                triggerNoMoveFeedback();
                return prev;
            }
        });
    }, [score, bestScore, hasWon, isGameEnded, showWinOverlay, triggerNoMoveFeedback]);

    // Keyboard input
    useEffect(() => {
        const GAME_KEYS = new Set([
            "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
            "w", "W", "a", "A", "s", "S", "d", "D", " "
        ]);

        const onKeyDown = (e: KeyboardEvent) => {
            if (GAME_KEYS.has(e.key)) {
                e.preventDefault();
            }

            if (!startedRef.current) {
                start();
                return;
            }
            if (isGameEnded || showWinOverlay) return;

            switch (e.key) {
                case "ArrowUp": case "w": case "W":
                    handleMove("up"); break;
                case "ArrowDown": case "s": case "S":
                    handleMove("down"); break;
                case "ArrowLeft": case "a": case "A":
                    handleMove("left"); break;
                case "ArrowRight": case "d": case "D":
                    handleMove("right"); break;
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => { window.removeEventListener("keydown", onKeyDown); };
    }, [start, handleMove, isGameEnded, showWinOverlay]);

    // Tap-to-start: pointer + touch (iOS needs touchstart for reliable gesture detection)
    useEffect(() => {
        const onTapStart = () => {
            if (!startedRef.current) start();
        };

        window.addEventListener("pointerdown", onTapStart, { passive: true });
        window.addEventListener("touchstart", onTapStart, { passive: true });

        return () => {
            window.removeEventListener("pointerdown", onTapStart);
            window.removeEventListener("touchstart", onTapStart);
        };
    }, [start]);

    // Swipe on the board surface (robust dual pointer+touch handler)
    useEffect(() => {
        const el = boardRef.current;
        if (!el) return;

        const cleanup = attachSwipe(el, handleMove, { deadzonePx: 20 });
        return cleanup;
    }, [handleMove]);

    return (
        <div className="t2048-root" ref={rootRef}>
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
                    body={`Final score: ${score}`}
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
                boardRef={boardRef}
            />
        </div>
    );
}
