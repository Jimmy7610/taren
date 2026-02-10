/**
 * TAREN 2048 – Robust gesture handler (Pointer + Touch fallback)
 * Works reliably on iOS Safari + Android Chrome.
 *
 * Key design decisions:
 * - Dual event systems: PointerEvents (modern) + TouchEvents (iOS fallback)
 * - pointercancel / touchcancel handled to avoid stuck state
 * - Deadzone prevents micro-swipes from triggering moves
 * - Attach to the board surface element with CSS touch-action: none
 */
import type { Direction } from "../logic/move";

type SwipeCallback = (dir: Direction) => void;

interface Options {
    deadzonePx?: number;
}

export function attachSwipe(
    el: HTMLElement,
    cb: SwipeCallback,
    opts: Options = {}
): () => void {
    const deadzone = opts.deadzonePx ?? 20;

    let startX = 0;
    let startY = 0;
    let active = false;
    let usedTouch = false; // prevent double-fire from pointer+touch

    const decide = (endX: number, endY: number) => {
        const dx = endX - startX;
        const dy = endY - startY;
        const ax = Math.abs(dx);
        const ay = Math.abs(dy);

        if (Math.max(ax, ay) < deadzone) return;

        if (ax > ay) {
            cb(dx > 0 ? "right" : "left");
        } else {
            cb(dy > 0 ? "down" : "up");
        }
    };

    // ── Pointer events (modern browsers) ──
    const onPointerDown = (e: PointerEvent) => {
        if (usedTouch) return; // touch already handled this gesture
        if (!e.isPrimary) return;
        active = true;
        startX = e.clientX;
        startY = e.clientY;
    };

    const onPointerUp = (e: PointerEvent) => {
        if (!active || usedTouch) return;
        active = false;
        decide(e.clientX, e.clientY);
    };

    const onPointerCancel = () => {
        active = false;
    };

    // ── Touch events (iOS Safari fallback – critical) ──
    const onTouchStart = (e: TouchEvent) => {
        if (e.touches.length !== 1) return;
        usedTouch = true;
        active = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
        // Prevent page scroll / pull-to-refresh while swiping on the board
        if (active && e.cancelable) {
            e.preventDefault();
        }
    };

    const onTouchEnd = (e: TouchEvent) => {
        if (!active) return;
        active = false;

        const t = e.changedTouches[0];
        if (!t) return;
        decide(t.clientX, t.clientY);

        // Reset usedTouch after a small delay so the next gesture can use pointer if needed
        setTimeout(() => { usedTouch = false; }, 50);
    };

    const onTouchCancel = () => {
        active = false;
        setTimeout(() => { usedTouch = false; }, 50);
    };

    // Pointer: passive is fine (we don't need preventDefault on pointer)
    el.addEventListener("pointerdown", onPointerDown, { passive: true });
    el.addEventListener("pointerup", onPointerUp, { passive: true });
    el.addEventListener("pointercancel", onPointerCancel, { passive: true });

    // Touch: touchmove must be NON-passive to call preventDefault (stops scroll)
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchCancel, { passive: true });

    return () => {
        el.removeEventListener("pointerdown", onPointerDown);
        el.removeEventListener("pointerup", onPointerUp);
        el.removeEventListener("pointercancel", onPointerCancel);
        el.removeEventListener("touchstart", onTouchStart);
        el.removeEventListener("touchmove", onTouchMove);
        el.removeEventListener("touchend", onTouchEnd);
        el.removeEventListener("touchcancel", onTouchCancel);
    };
}
