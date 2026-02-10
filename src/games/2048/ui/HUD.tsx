import React from "react";
import { RotateCcw } from "lucide-react";

type Props = {
    score: number;
    bestScore: number;
    onRestart: () => void;
};

export default function HUD({ score, bestScore, onRestart }: Props) {
    return (
        <div className="t2048-hud">
            <div className="t2048-hud__stats">
                <div className="t2048-stats-box">
                    <div className="t2048-stats-label">Score</div>
                    <div className="t2048-stats-value">{score}</div>
                </div>
                <div className="t2048-stats-box">
                    <div className="t2048-stats-label">Best</div>
                    <div className="t2048-stats-value">{bestScore}</div>
                </div>
            </div>

            <button
                className="t2048-hud-restart"
                onClick={onRestart}
                title="Restart Experiment"
            >
                <RotateCcw className="h-4 w-4" />
            </button>
        </div>
    );
}
