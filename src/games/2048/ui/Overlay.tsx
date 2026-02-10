import React from "react";

type Props = {
    title: string;
    body?: string;
    primaryLabel: string;
    onPrimary: () => void;
    secondaryLabel?: string;
    onSecondary?: () => void;
};

export default function Overlay({
    title,
    body,
    primaryLabel,
    onPrimary,
    secondaryLabel,
    onSecondary,
}: Props) {
    return (
        <div className="t2048-overlay" role="dialog" aria-label={title}>
            <div className="t2048-overlayCard">
                <div className="t2048-overlayTitle">{title}</div>
                {body ? <div className="t2048-overlayBody">{body}</div> : null}

                <div className="t2048-overlayActions">
                    {secondaryLabel && onSecondary ? (
                        <button className="t2048-btn t2048-btn--ghost" onClick={onSecondary}>
                            {secondaryLabel}
                        </button>
                    ) : null}

                    <button className="t2048-btn" onClick={onPrimary}>
                        {primaryLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
