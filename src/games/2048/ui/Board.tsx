import React from "react";
import type { Grid4 } from "../logic/spawn";

type Props = {
    grid: Grid4;
    lastSpawnPos?: { r: number; c: number } | null;
    lastMergePositions?: Array<{ r: number; c: number }>;
    noMove?: boolean;
};

export default function Board({ grid, lastSpawnPos, lastMergePositions = [], noMove }: Props) {
    const isMerged = (r: number, c: number) =>
        lastMergePositions.some(pos => pos.r === r && pos.c === c);

    const isSpawn = (r: number, c: number) =>
        lastSpawnPos?.r === r && lastSpawnPos?.c === c;

    return (
        <div className={`t2048-boardShell`}>
            <div className={`t2048-board ${noMove ? "t2048-board--noMove" : ""}`}>
                {grid.flatMap((row, r) =>
                    row.map((value, c) => {
                        const key = `${r}-${c}`;

                        let anim: string | undefined = undefined;
                        if (isMerged(r, c)) anim = "merge";
                        else if (isSpawn(r, c)) anim = "spawn";

                        return (
                            <div className="t2048-cell" key={key}>
                                {value !== null ? (
                                    <div
                                        className="t2048-tile"
                                        data-value={value}
                                        data-anim={anim}
                                    >
                                        {value}
                                    </div>
                                ) : null}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
