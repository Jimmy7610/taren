import type { Direction } from "../logic/move";

type Callback = (dir: Direction) => void;

export function attachSwipe(el: HTMLElement, cb: Callback) {
    let startX = 0;
    let startY = 0;
    let active = false;

    const onPointerDown = (e: PointerEvent) => {
        active = true;
        startX = e.clientX;
        startY = e.clientY;
    };

    const onPointerUp = (e: PointerEvent) => {
        if (!active) return;
        active = false;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        const ax = Math.abs(dx);
        const ay = Math.abs(dy);

        // deadzone to prevent micro-swipes
        if (Math.max(ax, ay) < 24) return;

        if (ax > ay) {
            cb(dx > 0 ? "right" : "left");
        } else {
            cb(dy > 0 ? "down" : "up");
        }
    };

    el.addEventListener("pointerdown", onPointerDown, { passive: true });
    el.addEventListener("pointerup", onPointerUp, { passive: true });

    return () => {
        el.removeEventListener("pointerdown", onPointerDown);
        el.removeEventListener("pointerup", onPointerUp);
    };
}
