export type CellValue = number | null;
export type Grid4 = CellValue[][];

export function createEmptyGrid4(): Grid4 {
    return Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => null));
}

export function randomTileValue(rng: () => number = Math.random): 2 | 4 {
    // 90% => 2, 10% => 4
    return rng() < 0.9 ? 2 : 4;
}

export function listEmptyCells(grid: Grid4): Array<{ r: number; c: number }> {
    const out: Array<{ r: number; c: number }> = [];
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (grid[r][c] === null) out.push({ r, c });
        }
    }
    return out;
}

export function spawnOneTile(grid: Grid4, rng: () => number = Math.random): Grid4 {
    const empties = listEmptyCells(grid);
    if (empties.length === 0) return grid;

    const idx = Math.floor(rng() * empties.length);
    const { r, c } = empties[idx];

    const next = grid.map(row => row.slice());
    next[r][c] = randomTileValue(rng);
    return next;
}

export function spawnInitialTwoTiles(grid: Grid4, rng: () => number = Math.random): Grid4 {
    // Spawn exactly two tiles into empty grid (or any grid with >=2 empties)
    let next = grid;
    next = spawnOneTile(next, rng);
    next = spawnOneTile(next, rng);
    return next;
}
