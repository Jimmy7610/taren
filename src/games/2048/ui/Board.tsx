import React from "react";
import type { Grid4 } from "../logic/spawn";

type Props = {
    grid: Grid4;
};

export default function Board({ grid }: Props) {
    return (
        <div className="t2048-boardShell">
            <div className="t2048-board">
                {grid.flatMap((row, r) =>
                    row.map((value, c) => {
                        const key = `${r}-${c}`;
                        return (
                            <div className="t2048-cell" key={key}>
                                {value !== null ? (
                                    <div className="t2048-tile" data-value={value}>
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
