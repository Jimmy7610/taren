import React from "react";

type Props = {
    title: string;
    subtitle: string;
    onStart?: () => void;
};

/**
 * StartScreen — tappable overlay that starts the game.
 * Uses onClick + onTouchEnd (iOS Safari needs both for reliable trigger).
 * The entire overlay surface is the tap target.
 */
export default function StartScreen({ title, subtitle, onStart }: Props) {
    const handleTap = (e: React.SyntheticEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onStart?.();
    };

    return (
        <div
            className="t2048-startOverlay"
            role="button"
            tabIndex={0}
            aria-label={`${title} — ${subtitle}`}
            onClick={handleTap}
            onTouchEnd={handleTap}
        >
            <div className="t2048-startCard">
                <div className="t2048-startTitle">{title}</div>
                <div className="t2048-startSubtitle">{subtitle}</div>
            </div>
        </div>
    );
}
