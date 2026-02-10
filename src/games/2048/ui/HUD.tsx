import React from "react";

type Props = {
    score: number;
};

export default function HUD({ score }: Props) {
    return (
        <div className="t2048-hud" aria-label="Score">
            <div className="t2048-hud__label">Score</div>
            <div className="t2048-hud__value">{score}</div>
        </div>
    );
}
