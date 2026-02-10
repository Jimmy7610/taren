import React from "react";

type Props = {
    title: string;
    subtitle: string;
};

export default function StartScreen({ title, subtitle }: Props) {
    return (
        <div className="t2048-startOverlay" role="dialog" aria-label={title}>
            <div className="t2048-startCard">
                <div className="t2048-startTitle">{title}</div>
                <div className="t2048-startSubtitle">{subtitle}</div>
            </div>
        </div>
    );
}
