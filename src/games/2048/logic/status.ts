import type { Grid4 } from "./spawn";

export function has2048(grid: Grid4): boolean {
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (grid[r][c] === 2048) return true;
        }
    }
    return false;
}

export function hasAnyMoves(grid: Grid4): boolean {
    // Any empty cell => move exists
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (grid[r][c] === null) return true;
        }
    }
    // Any adjacent equal => merge exists
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            const v = grid[r][c];
            if (v === null) continue;
            if (c < 3 && grid[r][c + 1] === v) return true;
            if (r < 3 && grid[r + 1][c] === v) return true;
        }
    }
    return false;
}

export function isGameOver(grid: Grid4): boolean {
    return !hasAnyMoves(grid);
}
