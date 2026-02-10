import type { CellValue, Grid4 } from "./spawn";

export type Direction = "up" | "down" | "left" | "right";

export type MoveResult = {
    grid: Grid4;
    gained: number;
    changed: boolean;
    mergedPositions: Array<{ r: number; c: number }>;
};

function compressAndMerge(values: number[]): { out: number[]; gained: number; mergedIndices: number[] } {
    const out: number[] = [];
    const mergedIndices: number[] = [];
    let gained = 0;

    for (let i = 0; i < values.length; i++) {
        const v = values[i];
        const next = values[i + 1];

        if (next !== undefined && next === v) {
            const merged = v + next;
            out.push(merged);
            mergedIndices.push(out.length - 1);
            gained += merged;
            i++;
        } else {
            out.push(v);
        }
    }

    return { out, gained, mergedIndices };
}

function createEmpty(): Grid4 {
    return Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => null));
}

function padTo4(nums: number[]): CellValue[] {
    const out: CellValue[] = nums.slice(0, 4);
    while (out.length < 4) out.push(null);
    return out;
}

function gridsEqual(a: Grid4, b: Grid4): boolean {
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (a[r][c] !== b[r][c]) return false;
        }
    }
    return true;
}

export function moveGrid(grid: Grid4, dir: Direction): MoveResult {
    const next = createEmpty();
    const mergedPositions: Array<{ r: number; c: number }> = [];
    let gainedTotal = 0;

    if (dir === "left" || dir === "right") {
        for (let r = 0; r < 4; r++) {
            const row = grid[r].filter(v => v !== null) as number[];
            const ordered = dir === "left" ? row : row.slice().reverse();
            const { out, gained, mergedIndices } = compressAndMerge(ordered);
            gainedTotal += gained;

            const padded = padTo4(out);
            const finalRow = dir === "left" ? padded : padded.slice().reverse();
            next[r] = finalRow;

            // Map merged indices back to grid coordinates
            mergedIndices.forEach(idx => {
                const c = dir === "left" ? idx : 3 - idx;
                mergedPositions.push({ r, c });
            });
        }
    } else {
        for (let c = 0; c < 4; c++) {
            const col: number[] = [];
            for (let r = 0; r < 4; r++) {
                const v = grid[r][c];
                if (v !== null) col.push(v);
            }
            const ordered = dir === "up" ? col : col.slice().reverse();
            const { out, gained, mergedIndices } = compressAndMerge(ordered);
            gainedTotal += gained;

            const padded = padTo4(out);
            const finalCol = dir === "up" ? padded : padded.slice().reverse();
            for (let r = 0; r < 4; r++) {
                next[r][c] = finalCol[r];
            }

            // Map merged indices back to grid coordinates
            mergedIndices.forEach(idx => {
                const r = dir === "up" ? idx : 3 - idx;
                mergedPositions.push({ r, c });
            });
        }
    }

    const changed = !gridsEqual(grid, next);
    return { grid: next, gained: gainedTotal, changed, mergedPositions };
}
