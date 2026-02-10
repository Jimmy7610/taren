import React, { useEffect, useRef, useState } from "react";

import "./styles/base.css";
import "./styles/tiles.css";
import "./styles/animations.css";

import HeroArt from "./ui/HeroArt";
import Board from "./ui/Board";
import StartScreen from "./ui/StartScreen";
import { createEmptyGrid4, spawnInitialTwoTiles, type Grid4 } from "./logic/spawn";

export default function App() {
    const [hasStarted, setHasStarted] = useState(false);
    const [grid, setGrid] = useState<Grid4>(() => createEmptyGrid4());

    // Guard against double-trigger
    const startedRef = useRef(false);

    const start = () => {
        if (startedRef.current) return;
        startedRef.current = true;

        setGrid(prev => spawnInitialTwoTiles(prev));
        setHasStarted(true);
    };

    useEffect(() => {
        const onKeyDown = () => start();
        const onPointerDown = () => start();

        window.addEventListener("keydown", onKeyDown, { passive: true });
        window.addEventListener("pointerdown", onPointerDown, { passive: true });

        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("pointerdown", onPointerDown);
        };
    }, []);

    return (
        <div className="t2048-root">
            <HeroArt />

            {!hasStarted ? (
                <StartScreen title="2048" subtitle="Press any key / tap to start" />
            ) : null}

            <Board grid={grid} />
        </div>
    );
}
