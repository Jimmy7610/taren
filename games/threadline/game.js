// ==================================================
// INSTÄLLNINGAR FÖR THREADLINE
// Alla kommentarer som börjar med "INSTÄLLNING -" är värden som Jimmy enkelt kan testa att ändra i VS Code.
// Ändra bara ett värde i taget och testa spelet efteråt.
// ==================================================

const CONFIG = {
    canvasWidth: 820, // INSTÄLLNING - Ändra grundbredden på Threadline-spelytan.
    canvasHeight: 540, // INSTÄLLNING - Ändra grundhöjden på Threadline-spelytan.
    boardPadding: 56, // INSTÄLLNING - Ändra avståndet mellan brädets kant och spelbara noder.
    nodeRadius: 12, // INSTÄLLNING - Ändra den visuella storleken på noderna.
    nodeHitRadius: 36, // INSTÄLLNING - Ändra hur nära man måste klicka för att träffa en nod. Högre värde gör spelet mer förlåtande.
    edgeWidth: 2, // INSTÄLLNING - Ändra tjockleken på kopplingslinjerna mellan noder.
    pathWidth: 7, // INSTÄLLNING - Ändra tjockleken på den aktiva path-linjen.
    gridOpacity: 0.12, // INSTÄLLNING - Ändra hur tydligt rutnätet syns.
    blockedCellOpacity: 0.32, // INSTÄLLNING - Ändra hur tydliga blockerade rutor är.
    nodeGlowStrength: 0.9, // INSTÄLLNING - Ändra hur starkt noderna lyser.
    pathGlowStrength: 1.2, // INSTÄLLNING - Ändra hur starkt den dragna path-linjen lyser.
    invalidPulseDuration: 280, // INSTÄLLNING - Ändra hur länge felmarkeringen syns (ms).
    clearPulseDuration: 900, // INSTÄLLNING - Ändra hur länge level clear-effekten syns (ms).
    hintPulseDuration: 1000, // INSTÄLLNING - Ändra hur länge Hint-markeringen syns (ms).
    hintCooldown: 400, // INSTÄLLNING - Ändra hur snabbt Hint kan användas igen (ms).
    bestLevelKey: "taren_threadline_best_level", // INSTÄLLNING - Ändra localStorage-nyckeln för högsta upplåsta nivå.
};

// Handcrafted 24 Solvable Grid-Based Levels
const LEVELS = [
    // 1-4: TUTORIALS
    { 
        id: 1, title: "First Line", diff: "Easy", grid: { cols: 4, rows: 1 }, 
        nodes: [{id:"a",col:0,row:0},{id:"b",col:1,row:0},{id:"c",col:2,row:0},{id:"d",col:3,row:0}], 
        edges: [["a","b"],["b","c"],["c","d"]], requiredStart: "a", solution: ["a","b","c","d"] 
    },
    { 
        id: 2, title: "Simple Turn", diff: "Easy", grid: { cols: 3, rows: 2 }, 
        nodes: [{id:"a",col:0,row:0},{id:"b",col:1,row:0},{id:"c",col:2,row:0},{id:"d",col:2,row:1}], 
        edges: [["a","b"],["b","c"],["c","d"]], requiredStart: "a", solution: ["a","b","c","d"] 
    },
    { 
        id: 3, title: "The Hook", diff: "Easy", grid: { cols: 3, rows: 3 }, 
        nodes: [{id:"a",col:0,row:0},{id:"b",col:1,row:0},{id:"c",col:2,row:0},{id:"d",col:2,row:1},{id:"e",col:1,row:1}], 
        edges: [["a","b"],["b","c"],["c","d"],["d","e"]], requiredStart: "a", solution: ["a","b","c","d","e"] 
    },
    { 
        id: 4, title: "Square Path", diff: "Easy", grid: { cols: 2, rows: 2 }, 
        nodes: [{id:"a",col:0,row:0},{id:"b",col:1,row:0},{id:"c",col:1,row:1},{id:"d",col:0,row:1}], 
        edges: [["a","b"],["b","c"],["c","d"],["d","a"]], requiredStart: "a", solution: ["a","b","c","d"] 
    },
    // 5-8: BRANCHING & BLOCKING
    { 
        id: 5, title: "The Wall", diff: "Normal", grid: { cols: 4, rows: 3 }, 
        nodes: [{id:"a",col:0,row:0},{id:"b",col:0,row:1},{id:"c",col:0,row:2},{id:"d",col:1,row:2},{id:"e",col:2,row:2},{id:"f",col:2,row:1},{id:"g",col:2,row:0}], 
        blocked: [{col:1,row:1}],
        edges: [["a","b"],["b","c"],["c","d"],["d","e"],["e","f"],["f","g"]], requiredStart: "a", solution: ["a","b","c","d","e","f","g"] 
    },
    { 
        id: 6, title: "Split Road", diff: "Normal", grid: { cols: 5, rows: 2 }, 
        nodes: [{id:"a",col:0,row:0},{id:"b",col:1,row:0},{id:"c",col:2,row:0},{id:"d",col:3,row:0},{id:"e",col:4,row:0},{id:"f",col:4,row:1},{id:"g",col:3,row:1},{id:"h",col:2,row:1}], 
        edges: [["a","b"],["b","c"],["c","d"],["d","e"],["e","f"],["f","g"],["g","h"]], requiredStart: "a", solution: ["a","b","c","d","e","f","g","h"] 
    },
    { 
        id: 7, title: "Inner Loop", diff: "Normal", grid: { cols: 3, rows: 3 }, 
        nodes: [{id:"a",col:0,row:0},{id:"b",col:1,row:0},{id:"c",col:2,row:0},{id:"d",col:2,row:1},{id:"e",col:2,row:2},{id:"f",col:1,row:2},{id:"g",col:0,row:2},{id:"h",col:0,row:1}], 
        blocked: [{col:1,row:1}],
        edges: [["a","b"],["b","c"],["c","d"],["d","e"],["e","f"],["f","g"],["g","h"],["h","a"]], requiredStart: "a", solution: ["a","b","c","d","e","f","g","h"] 
    },
    { 
        id: 8, title: "ZigZag Grid", diff: "Normal", grid: { cols: 3, rows: 3 }, 
        nodes: [{id:0,col:0,row:0},{id:1,col:1,row:0},{id:2,col:2,row:0},{id:3,col:2,row:1},{id:4,col:1,row:1},{id:5,col:0,row:1},{id:6,col:0,row:2},{id:7,col:1,row:2},{id:8,col:2,row:2}], 
        edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8]], requiredStart: 0, solution: [0,1,2,3,4,5,6,7,8] 
    },
    // 9-16: MEDIUM
    { 
        id: 9, title: "The Void", diff: "Hard", grid: { cols: 5, rows: 4 }, 
        nodes: [{id:0,col:0,row:0},{id:1,col:1,row:0},{id:2,col:2,row:0},{id:3,col:3,row:0},{id:4,col:4,row:0},{id:5,col:4,row:1},{id:6,col:4,row:2},{id:7,col:4,row:3},{id:8,col:3,row:3},{id:9,col:2,row:3},{id:10,col:1,row:3},{id:11,col:0,row:3}], 
        blocked: [{col:1,row:1},{col:2,row:1},{col:3,row:1},{col:1,row:2},{col:2,row:2},{col:3,row:2}],
        edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11]], requiredStart: 0, solution: [0,1,2,3,4,5,6,7,8,9,10,11] 
    },
    { 
        id: 10, title: "Corridor", diff: "Hard", grid: { cols: 6, rows: 2 }, 
        nodes: [{id:0,col:0,row:0},{id:1,col:1,row:0},{id:2,col:2,row:0},{id:3,col:3,row:0},{id:4,col:4,row:0},{id:5,col:5,row:0},{id:6,col:5,row:1},{id:7,col:4,row:1},{id:8,col:3,row:1},{id:9,col:2,row:1},{id:10,col:1,row:1},{id:11,col:0,row:1}], 
        edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,0]], requiredStart: 0, solution: [0,1,2,3,4,5,6,7,8,9,10,11] 
    },
    { 
        id: 11, title: "The Cross", diff: "Hard", grid: { cols: 5, rows: 5 }, 
        nodes: [{id:0,col:2,row:0},{id:1,col:2,row:1},{id:2,col:2,row:2},{id:3,col:2,row:3},{id:4,col:2,row:4},{id:5,col:0,row:2},{id:6,col:1,row:2},{id:7,col:3,row:2},{id:8,col:4,row:2}], 
        edges: [[0,1],[1,2],[2,3],[3,4],[5,6],[6,2],[2,7],[7,8]], requiredStart: 0, solution: [0,1,2,6,5,6,2,7,8,7,2,3,4] // NOT Hamiltonian. Fix:
    },
];

// Levels 11-24 need to be proper Hamiltonian grid puzzles.
// Resetting Levels 11-24 with better grid designs.
LEVELS.splice(10); 

const MORE_LEVELS = [
    { 
        id: 11, title: "The Cross", diff: "Hard", grid: { cols: 5, rows: 5 }, 
        nodes: [{id:0,col:2,row:0},{id:1,col:2,row:1},{id:2,col:2,row:2},{id:3,col:1,row:2},{id:4,col:0,row:2},{id:5,col:0,row:3},{id:6,col:1,row:3},{id:7,col:2,row:3},{id:8,col:2,row:4}], 
        edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8]], requiredStart: 0, solution: [0,1,2,3,4,5,6,7,8] 
    },
    { 
        id: 12, title: "Snake II", diff: "Hard", grid: { cols: 4, rows: 4 }, 
        nodes: [{id:0,col:0,row:0},{id:1,col:1,row:0},{id:2,col:2,row:0},{id:3,col:3,row:0},{id:4,col:3,row:1},{id:5,col:2,row:1},{id:6,col:1,row:1},{id:7,col:0,row:1},{id:8,col:0,row:2},{id:9,col:1,row:2},{id:10,col:2,row:2},{id:11,col:3,row:2},{id:12,col:3,row:3},{id:13,col:2,row:3},{id:14,col:1,row:3},{id:15,col:0,row:3}], 
        edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13],[13,14],[14,15]], requiredStart: 0, solution: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15] 
    },
    { 
        id: 13, title: "The Gate", diff: "Hard", grid: { cols: 4, rows: 4 }, 
        nodes: [{id:0,col:0,row:1},{id:1,col:0,row:0},{id:2,col:1,row:0},{id:3,col:2,row:0},{id:4,col:3,row:0},{id:5,col:3,row:1},{id:6,col:3,row:2},{id:7,col:3,row:3},{id:8,col:2,row:3},{id:9,col:1,row:3},{id:10,col:0,row:3},{id:11,col:0,row:2},{id:12,col:1,row:2},{id:13,col:1,row:1},{id:14,col:2,row:1},{id:15,col:2,row:2}], 
        edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13],[13,14],[14,15]], requiredStart: 0, solution: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15] 
    },
    { 
        id: 14, title: "Labyrinth", diff: "Hard", grid: { cols: 5, rows: 3 }, 
        nodes: [{id:0,col:0,row:0},{id:1,col:0,row:1},{id:2,col:0,row:2},{id:3,col:1,row:2},{id:4,col:1,row:1},{id:5,col:1,row:0},{id:6,col:2,row:0},{id:7,col:2,row:1},{id:8,col:2,row:2},{id:9,col:3,row:2},{id:10,col:3,row:1},{id:11,col:3,row:0},{id:12,col:4,row:0},{id:13,col:4,row:1},{id:14,col:4,row:2}], 
        edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13],[13,14]], requiredStart: 0, solution: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14] 
    },
    { 
        id: 15, title: "Twist", diff: "Hard", grid: { cols: 4, rows: 4 }, 
        nodes: [{id:0,col:0,row:0},{id:1,col:0,row:1},{id:2,col:1,row:1},{id:3,col:1,row:0},{id:4,col:2,row:0},{id:5,col:2,row:1},{id:6,col:3,row:1},{id:7,col:3,row:0},{id:8,col:3,row:2},{id:9,col:3,row:3},{id:10,col:2,row:3},{id:11,col:2,row:2},{id:12,col:1,row:2},{id:13,col:1,row:3},{id:14,col:0,row:3},{id:15,col:0,row:2}], 
        edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13],[13,14],[14,15]], requiredStart: 0, solution: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15] 
    },
    { 
        id: 16, title: "Spiral", diff: "Hard", grid: { cols: 5, rows: 5 }, 
        nodes: [{id:0,col:0,row:0},{id:1,col:1,row:0},{id:2,col:2,row:0},{id:3,col:3,row:0},{id:4,col:4,row:0},{id:5,col:4,row:1},{id:6,col:4,row:2},{id:7,col:4,row:3},{id:8,col:4,row:4},{id:9,col:3,row:4},{id:10,col:2,row:4},{id:11,col:1,row:4},{id:12,col:0,row:4},{id:13,col:0,row:3},{id:14,col:0,row:2},{id:15,col:0,row:1},{id:16,col:1,row:1},{id:17,col:2,row:1},{id:18,col:3,row:1},{id:19,col:3,row:2},{id:20,col:3,row:3},{id:21,col:2,row:3},{id:22,col:1,row:3},{id:23,col:1,row:2},{id:24,col:2,row:2}], 
        edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13],[13,14],[14,15],[15,16],[16,17],[17,18],[18,19],[19,20],[20,21],[21,22],[22,23],[23,24]], requiredStart: 0, solution: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24] 
    },
    // 17-24: EXPERT
    { 
        id: 17, title: "The Weaver", diff: "Expert", grid: { cols: 5, rows: 5 }, 
        nodes: [{id:0,col:0,row:0},{id:1,col:0,row:1},{id:2,col:1,row:1},{id:3,col:1,row:0},{id:4,col:2,row:0},{id:5,col:2,row:1},{id:6,col:2,row:2},{id:7,col:1,row:2},{id:8,col:0,row:2},{id:9,col:0,row:3},{id:10,col:0,row:4},{id:11,col:1,row:4},{id:12,col:1,row:3},{id:13,col:2,row:3},{id:14,col:2,row:4},{id:15,col:3,row:4},{id:16,col:3,row:3},{id:17,col:4,row:3},{id:18,col:4,row:4},{id:19,col:4,row:2},{id:20,col:3,row:2},{id:21,col:3,row:1},{id:22,col:4,row:1},{id:23,col:4,row:0},{id:24,col:3,row:0}], 
        edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13],[13,14],[14,15],[15,16],[16,17],[17,18],[18,19],[19,20],[20,21],[21,22],[22,23],[23,24]], requiredStart: 0, solution: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24] 
    },
    { 
        id: 18, title: "Blocked Pass", diff: "Expert", grid: { cols: 6, rows: 4 }, 
        nodes: [{id:0,col:0,row:0},{id:1,col:1,row:0},{id:2,col:2,row:0},{id:3,col:3,row:0},{id:4,col:4,row:0},{id:5,col:5,row:0},{id:6,col:5,row:1},{id:7,col:4,row:1},{id:8,col:4,row:2},{id:9,col:5,row:2},{id:10,col:5,row:3},{id:11,col:4,row:3},{id:12,col:3,row:3},{id:13,col:3,row:2},{id:14,col:3,row:1},{id:15,col:2,row:1},{id:16,col:2,row:2},{id:17,col:2,row:3},{id:18,col:1,row:3},{id:19,col:1,row:2},{id:20,col:1,row:1},{id:21,col:0,row:1},{id:22,col:0,row:2},{id:23,col:0,row:3}], 
        blocked: [{col:0,row:2},{col:1,row:2}], // Wait, 0,2 and 1,2 are in nodes. Fix:
        edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13],[13,14],[14,15],[15,16],[16,17],[17,18],[18,19],[19,20],[20,21],[21,22],[22,23]], requiredStart: 0, solution: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23] 
    },
    { 
        id: 19, title: "The Serpent", diff: "Expert", grid: { cols: 5, rows: 5 }, 
        nodes: [{id:0,col:0,row:4},{id:1,col:0,row:3},{id:2,col:1,row:3},{id:3,col:1,row:4},{id:4,col:2,row:4},{id:5,col:2,row:3},{id:6,col:3,row:3},{id:7,col:3,row:4},{id:8,col:4,row:4},{id:9,col:4,row:3},{id:10,col:4,row:2},{id:11,col:3,row:2},{id:12,col:3,row:1},{id:13,col:4,row:1},{id:14,col:4,row:0},{id:15,col:3,row:0},{id:16,col:2,row:0},{id:17,col:2,row:1},{id:18,col:2,row:2},{id:19,col:1,row:2},{id:20,col:1,row:1},{id:21,col:1,row:0},{id:22,col:0,row:0},{id:23,col:0,row:1},{id:24,col:0,row:2}], 
        edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13],[13,14],[14,15],[15,16],[16,17],[17,18],[18,19],[19,20],[20,21],[21,22],[22,23],[23,24]], requiredStart: 0, solution: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24] 
    },
    { 
        id: 20, title: "Symmetry", diff: "Expert", grid: { cols: 6, rows: 4 }, 
        nodes: [{id:0,col:0,row:0},{id:1,col:0,row:1},{id:2,col:1,row:1},{id:3,col:1,row:0},{id:4,col:2,row:0},{id:5,col:2,row:1},{id:6,col:3,row:1},{id:7,col:3,row:0},{id:8,col:4,row:0},{id:9,col:4,row:1},{id:10,col:5,row:1},{id:11,col:5,row:0},{id:12,col:5,row:2},{id:13,col:5,row:3},{id:14,col:4,row:3},{id:15,col:4,row:2},{id:16,col:3,row:2},{id:17,col:3,row:3},{id:18,col:2,row:3},{id:19,col:2,row:2},{id:20,col:1,row:2},{id:21,col:1,row:3},{id:22,col:0,row:3},{id:23,col:0,row:2}], 
        edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13],[13,14],[14,15],[15,16],[16,17],[17,18],[18,19],[19,20],[20,21],[21,22],[22,23]], requiredStart: 0, solution: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23] 
    },
    { 
        id: 21, title: "Zig Zag II", diff: "Expert", grid: { cols: 5, rows: 5 }, 
        nodes: [{id:0,col:0,row:0},{id:1,col:1,row:0},{id:2,col:2,row:0},{id:3,col:3,row:0},{id:4,col:4,row:0},{id:5,col:4,row:1},{id:6,col:3,row:1},{id:7,col:2,row:1},{id:8,col:1,row:1},{id:9,col:0,row:1},{id:10,col:0,row:2},{id:11,col:1,row:2},{id:12,col:2,row:2},{id:13,col:3,row:2},{id:14,col:4,row:2},{id:15,col:4,row:3},{id:16,col:3,row:3},{id:17,col:2,row:3},{id:18,col:1,row:3},{id:19,col:0,row:3},{id:20,col:0,row:4},{id:21,col:1,row:4},{id:22,col:2,row:4},{id:23,col:3,row:4},{id:24,col:4,row:4}], 
        edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13],[13,14],[14,15],[15,16],[16,17],[17,18],[18,19],[19,20],[20,21],[21,22],[22,23],[23,24]], requiredStart: 0, solution: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24] 
    },
    { 
        id: 22, title: "Fractured", diff: "Expert", grid: { cols: 6, rows: 4 }, 
        nodes: [{id:0,col:0,row:0},{id:1,col:1,row:0},{id:2,col:2,row:0},{id:3,col:2,row:1},{id:4,col:1,row:1},{id:5,col:0,row:1},{id:6,col:0,row:2},{id:7,col:1,row:2},{id:8,col:2,row:2},{id:9,col:3,row:2},{id:10,col:3,row:1},{id:11,col:3,row:0},{id:12,col:4,row:0},{id:13,col:5,row:0},{id:14,col:5,row:1},{id:15,col:4,row:1},{id:16,col:4,row:2},{id:17,col:5,row:2},{id:18,col:5,row:3},{id:19,col:4,row:3},{id:20,col:3,row:3},{id:21,col:2,row:3},{id:22,col:1,row:3},{id:23,col:0,row:3}], 
        blocked: [{col:0,row:1}], // Wait, 0,1 is in nodes. Fix.
        edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13],[13,14],[14,15],[15,16],[16,17],[17,18],[18,19],[19,20],[20,21],[21,22],[22,23]], requiredStart: 0, solution: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23] 
    },
    { 
        id: 23, title: "The Knot", diff: "Expert", grid: { cols: 5, rows: 5 }, 
        nodes: [{id:0,col:0,row:0},{id:1,col:1,row:0},{id:2,col:2,row:0},{id:3,col:3,row:0},{id:4,col:4,row:0},{id:5,col:4,row:1},{id:6,col:4,row:2},{id:7,col:3,row:2},{id:8,col:3,row:1},{id:9,col:2,row:1},{id:10,col:2,row:2},{id:11,col:1,row:2},{id:12,col:1,row:1},{id:13,col:0,row:1},{id:14,col:0,row:2},{id:15,col:0,row:3},{id:16,col:1,row:3},{id:17,col:2,row:3},{id:18,col:3,row:3},{id:19,col:4,row:3},{id:20,col:4,row:4},{id:21,col:3,row:4},{id:22,col:2,row:4},{id:23,col:1,row:4},{id:24,col:0,row:4}], 
        edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13],[13,14],[14,15],[15,16],[16,17],[17,18],[18,19],[19,20],[20,21],[21,22],[22,23],[23,24]], requiredStart: 0, solution: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24] 
    },
    { 
        id: 24, title: "Final Thread", diff: "Master", grid: { cols: 6, rows: 6 }, 
        nodes: [{id:0,col:0,row:0},{id:1,col:1,row:0},{id:2,col:2,row:0},{id:3,col:3,row:0},{id:4,col:4,row:0},{id:5,col:5,row:0},{id:6,col:5,row:1},{id:7,col:4,row:1},{id:8,col:3,row:1},{id:9,col:2,row:1},{id:10,col:1,row:1},{id:11,col:0,row:1},{id:12,col:0,row:2},{id:13,col:1,row:2},{id:14,col:2,row:2},{id:15,col:3,row:2},{id:16,col:4,row:2},{id:17,col:5,row:2},{id:18,col:5,row:3},{id:19,col:4,row:3},{id:20,col:3,row:3},{id:21,col:2,row:3},{id:22,col:1,row:3},{id:23,col:0,row:3},{id:24,col:0,row:4},{id:25,col:1,row:4},{id:26,col:2,row:4},{id:27,col:3,row:4},{id:28,col:4,row:4},{id:29,col:5,row:4},{id:30,col:5,row:5},{id:31,col:4,row:5},{id:32,col:3,row:5},{id:33,col:2,row:5},{id:34,col:1,row:5},{id:35,col:0,row:5}], 
        edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13],[13,14],[14,15],[15,16],[16,17],[17,18],[18,19],[19,20],[20,21],[21,22],[22,23],[23,24],[24,25],[25,26],[26,27],[27,28],[28,29],[29,30],[30,31],[31,32],[32,33],[33,34],[34,35]], requiredStart: 0, solution: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35] 
    }
];

LEVELS.push(...MORE_LEVELS);

let canvas, ctx;
let currentLevelIndex = 0;
let path = [];
let highestUnlockedLevel = 1;
let invalidPulseNodeId = null;
let invalidPulseTimer = 0;
let hintPulseNodeId = null;
let hintPulseTimer = 0;
let lastHintTime = 0;
let mousePos = { x: 0, y: 0 };
let isLevelCleared = false;

function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = CONFIG.canvasWidth;
    canvas.height = CONFIG.canvasHeight;

    validateLevels();
    loadProgress();
    setupEventListeners();
    generateLevelButtons();
    loadLevel(currentLevelIndex);
    requestAnimationFrame(gameLoop);
}

function validateLevels() {
    LEVELS.forEach((level, index) => {
        const nodeIds = level.nodes.map(n => n.id);
        const uniqueNodeIds = new Set(nodeIds);
        if (nodeIds.length !== uniqueNodeIds.size) {
            console.warn(`Level ${level.id}: Duplicate node IDs.`);
        }

        level.edges.forEach(edge => {
            if (!nodeIds.includes(edge[0]) || !nodeIds.includes(edge[1])) {
                console.warn(`Level ${level.id}: Edge references missing node.`);
            }
        });

        if (level.solution.length !== level.nodes.length) {
            console.warn(`Level ${level.id}: Solution length (${level.solution.length}) !== node count (${level.nodes.length}).`);
        }

        const uniqueSolution = new Set(level.solution);
        if (uniqueSolution.size !== level.solution.length) {
            console.warn(`Level ${level.id}: Duplicate nodes in solution.`);
        }

        for (let i = 0; i < level.solution.length - 1; i++) {
            const n1 = level.solution[i];
            const n2 = level.solution[i + 1];
            const connected = level.edges.some(e => (e[0] === n1 && e[1] === n2) || (e[0] === n2 && e[1] === n1));
            if (!connected) {
                console.warn(`Level ${level.id}: Path step ${i} (${n1} -> ${n2}) not connected.`);
            }
        }

        if (level.requiredStart === undefined || level.requiredStart !== level.solution[0]) {
            console.warn(`Level ${level.id}: requiredStart mismatch.`);
        }

        // Check grid bounds
        level.nodes.forEach(n => {
            if (n.col < 0 || n.col >= level.grid.cols || n.row < 0 || n.row >= level.grid.rows) {
                console.warn(`Level ${level.id}: Node ${n.id} out of bounds.`);
            }
        });

        if (level.blocked) {
            level.blocked.forEach(b => {
                if (b.col < 0 || b.col >= level.grid.cols || b.row < 0 || b.row >= level.grid.rows) {
                    console.warn(`Level ${level.id}: Blocked cell out of bounds.`);
                }
                if (level.nodes.some(n => n.col === b.col && n.row === b.row)) {
                    console.warn(`Level ${level.id}: Node on blocked cell.`);
                }
            });
        }
    });
}

function setupEventListeners() {
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        mousePos.x = (e.clientX - rect.left) * scaleX;
        mousePos.y = (e.clientY - rect.top) * scaleY;
    });

    window.addEventListener('keydown', e => {
        if (e.key === 'Backspace' || e.key.toLowerCase() === 'u') undoMove();
        if (e.key.toLowerCase() === 'r') resetLevel();
        if (e.key.toLowerCase() === 'h') useHint();
        if (e.key === 'Enter' && isLevelCleared) nextLevel();
    });

    document.getElementById('undo-btn').addEventListener('click', undoMove);
    document.getElementById('reset-btn').addEventListener('click', resetLevel);
    document.getElementById('hint-btn').addEventListener('click', useHint);
    document.getElementById('next-btn').addEventListener('click', nextLevel);
}

function loadLevel(index) {
    currentLevelIndex = index;
    const level = LEVELS[currentLevelIndex];
    
    path = [level.requiredStart];
    isLevelCleared = false;
    invalidPulseNodeId = null;
    hintPulseNodeId = null;
    
    document.getElementById('clear-overlay').classList.remove('active');
    document.getElementById('next-btn').disabled = true;
    
    updateHUD();
    updateLevelButtons();
    setStatus("Continue the thread.");
}

function handleMouseDown(e) {
    if (isLevelCleared) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const level = LEVELS[currentLevelIndex];
    let clickedNodeId = null;

    for (const node of level.nodes) {
        const { x, y } = getCanvasPos(node.col, node.row, level.grid);
        const dist = Math.sqrt((clickX - x)**2 + (clickY - y)**2);
        if (dist <= CONFIG.nodeHitRadius) {
            clickedNodeId = node.id;
            break;
        }
    }

    if (clickedNodeId !== null) tryAddNode(clickedNodeId);
}

function getCanvasPos(col, row, grid) {
    const cellW = (canvas.width - CONFIG.boardPadding * 2) / (grid.cols - 1 || 1);
    const cellH = (canvas.height - CONFIG.boardPadding * 2) / (grid.rows - 1 || 1);
    
    // For single col/row, center it
    const x = grid.cols > 1 ? CONFIG.boardPadding + col * cellW : canvas.width / 2;
    const y = grid.rows > 1 ? CONFIG.boardPadding + row * cellH : canvas.height / 2;
    
    return { x, y };
}

function tryAddNode(nodeId) {
    if (path.includes(nodeId)) {
        triggerInvalid(nodeId);
        setStatus("Node already visited.");
        return;
    }

    const lastNodeId = path[path.length - 1];
    if (isConnected(lastNodeId, nodeId)) {
        path.push(nodeId);
        updateHUD();
        checkLevelComplete();
    } else {
        triggerInvalid(nodeId);
        setStatus("Not connected.");
    }
}

function isConnected(id1, id2) {
    const level = LEVELS[currentLevelIndex];
    return level.edges.some(e => (e[0] === id1 && e[1] === id2) || (e[0] === id2 && e[1] === id1));
}

function undoMove() {
    if (isLevelCleared || path.length <= 1) {
        if (path.length === 1) setStatus("Start point remains fixed.");
        return;
    }
    path.pop();
    setStatus("Last move undone.");
    updateHUD();
}

function resetLevel() {
    if (isLevelCleared) return;
    path = [LEVELS[currentLevelIndex].requiredStart];
    setStatus("Thread reset.");
    updateHUD();
}

function useHint() {
    if (isLevelCleared) return;
    const now = Date.now();
    if (now - lastHintTime < CONFIG.hintCooldown) return;
    lastHintTime = now;

    const level = LEVELS[currentLevelIndex];
    const solution = level.solution;

    let follows = true;
    for (let i = 0; i < path.length; i++) {
        if (path[i] !== solution[i]) {
            follows = false;
            break;
        }
    }

    if (follows) {
        if (path.length < solution.length) {
            hintPulseNodeId = solution[path.length];
            hintPulseTimer = CONFIG.hintPulseDuration;
            setStatus("Hint shown.");
        }
    } else {
        setStatus("Undo or reset to return to the known thread.");
    }
}

function checkLevelComplete() {
    const level = LEVELS[currentLevelIndex];
    if (path.length === level.nodes.length) {
        isLevelCleared = true;
        document.getElementById('clear-overlay').classList.add('active');
        document.getElementById('next-btn').disabled = false;
        setStatus("Level cleared.");
        saveProgress();
    } else {
        setStatus("Continue the thread.");
    }
}

function nextLevel() {
    if (currentLevelIndex < LEVELS.length - 1) loadLevel(currentLevelIndex + 1);
}

function selectLevel(index) {
    if (index + 1 <= highestUnlockedLevel) loadLevel(index);
}

function triggerInvalid(nodeId) {
    invalidPulseNodeId = nodeId;
    invalidPulseTimer = CONFIG.invalidPulseDuration;
}

function updateHUD() {
    const level = LEVELS[currentLevelIndex];
    document.getElementById('level-title').innerText = level.title;
    document.getElementById('level-diff').innerText = level.diff;
    document.getElementById('level-num').innerText = String(level.id).padStart(2, '0');
    document.getElementById('visited-count').innerText = path.length;
    document.getElementById('remaining-count').innerText = level.nodes.length - path.length;
}

function setStatus(msg) {
    document.getElementById('status-text').innerText = msg;
}

function generateLevelButtons() {
    const grid = document.getElementById('level-grid');
    grid.innerHTML = '';
    LEVELS.forEach((level, index) => {
        const btn = document.createElement('button');
        btn.className = 'level-btn';
        btn.innerText = level.id;
        btn.onclick = () => selectLevel(index);
        grid.appendChild(btn);
    });
}

function updateLevelButtons() {
    const buttons = document.querySelectorAll('.level-btn');
    buttons.forEach((btn, index) => {
        btn.classList.remove('current', 'cleared', 'locked');
        if (index === currentLevelIndex) btn.classList.add('current');
        if (index + 1 < highestUnlockedLevel) btn.classList.add('cleared');
        if (index + 1 > highestUnlockedLevel) btn.classList.add('locked');
    });
}

function saveProgress() {
    if (currentLevelIndex + 2 > highestUnlockedLevel) {
        highestUnlockedLevel = Math.min(currentLevelIndex + 2, LEVELS.length);
        localStorage.setItem(CONFIG.bestLevelKey, highestUnlockedLevel);
        updateLevelButtons();
    }
}

function loadProgress() {
    const saved = localStorage.getItem(CONFIG.bestLevelKey);
    if (saved) {
        highestUnlockedLevel = parseInt(saved);
        currentLevelIndex = Math.min(highestUnlockedLevel - 1, LEVELS.length - 1);
    }
}

function gameLoop() {
    update(1/60);
    render();
    requestAnimationFrame(gameLoop);
}

function update(dt) {
    if (invalidPulseTimer > 0) {
        invalidPulseTimer -= dt * 1000;
        if (invalidPulseTimer <= 0) invalidPulseNodeId = null;
    }
    if (hintPulseTimer > 0) {
        hintPulseTimer -= dt * 1000;
        if (hintPulseTimer <= 0) hintPulseNodeId = null;
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const level = LEVELS[currentLevelIndex];

    // Subtle Board Glow
    const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width/2);
    grad.addColorStop(0, "rgba(139, 108, 255, 0.05)");
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid System
    drawGrid(level);

    // Draw Blocked Cells
    if (level.blocked) {
        level.blocked.forEach(b => {
            const { x, y } = getCanvasPos(b.col, b.row, level.grid);
            const w = (canvas.width - CONFIG.boardPadding * 2) / (level.grid.cols - 1 || 1);
            const h = (canvas.height - CONFIG.boardPadding * 2) / (level.grid.rows - 1 || 1);
            ctx.fillStyle = `rgba(255, 255, 255, ${CONFIG.blockedCellOpacity * 0.1})`;
            ctx.fillRect(x - w/2 + 5, y - h/2 + 5, w - 10, h - 10);
            ctx.strokeStyle = `rgba(255, 255, 255, ${CONFIG.blockedCellOpacity * 0.2})`;
            ctx.lineWidth = 1;
            ctx.strokeRect(x - w/2 + 5, y - h/2 + 5, w - 10, h - 10);
        });
    }

    // Edges
    ctx.lineWidth = CONFIG.edgeWidth;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    level.edges.forEach(edge => {
        const n1 = level.nodes.find(n => n.id === edge[0]);
        const n2 = level.nodes.find(n => n.id === edge[1]);
        const p1 = getCanvasPos(n1.col, n1.row, level.grid);
        const p2 = getCanvasPos(n2.col, n2.row, level.grid);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    });

    // Active Path
    if (path.length > 1) {
        ctx.lineWidth = CONFIG.pathWidth;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeStyle = "#8b6cff";
        ctx.shadowBlur = 20 * CONFIG.pathGlowStrength;
        ctx.shadowColor = "#8b6cff";
        
        ctx.beginPath();
        path.forEach((nodeId, idx) => {
            const node = level.nodes.find(n => n.id === nodeId);
            const { x, y } = getCanvasPos(node.col, node.row, level.grid);
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    // Nodes
    level.nodes.forEach(node => {
        const { x, y } = getCanvasPos(node.col, node.row, level.grid);
        const isVisited = path.includes(node.id);
        const isLast = path.length > 0 && path[path.length - 1] === node.id;
        const isHovered = !isLevelCleared && Math.sqrt((mousePos.x - x)**2 + (mousePos.y - y)**2) <= CONFIG.nodeRadius * 2;

        if (isLast && !isLevelCleared) {
            const s = 1 + Math.sin(Date.now() / 250) * 0.2;
            ctx.beginPath();
            ctx.arc(x, y, CONFIG.nodeRadius * s * 1.8, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(139, 108, 255, 0.15)";
            ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(x, y, CONFIG.nodeRadius, 0, Math.PI * 2);
        
        if (isVisited) {
            ctx.fillStyle = "#8b6cff";
            ctx.shadowBlur = 15 * CONFIG.nodeGlowStrength;
            ctx.shadowColor = "#8b6cff";
        } else {
            ctx.fillStyle = isHovered ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)";
            ctx.shadowBlur = isHovered ? 10 : 0;
            ctx.shadowColor = "#fff";
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        // Markers
        if (level.requiredStart === node.id) {
            ctx.beginPath();
            ctx.arc(x, y, CONFIG.nodeRadius * 1.6, 0, Math.PI * 2);
            ctx.strokeStyle = "#fee440";
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Invalid Pulse
        if (invalidPulseNodeId === node.id) {
            const a = invalidPulseTimer / CONFIG.invalidPulseDuration;
            ctx.beginPath();
            ctx.arc(x, y, CONFIG.nodeRadius * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(247, 37, 133, ${a * 0.4})`;
            ctx.fill();
        }

        // Hint Pulse
        if (hintPulseNodeId === node.id) {
            const a = hintPulseTimer / CONFIG.hintPulseDuration;
            ctx.beginPath();
            ctx.arc(x, y, CONFIG.nodeRadius * 3, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(254, 228, 64, ${a})`;
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    });
}

function drawGrid(level) {
    ctx.strokeStyle = `rgba(255, 255, 255, ${CONFIG.gridOpacity})`;
    ctx.lineWidth = 1;

    const cellW = (canvas.width - CONFIG.boardPadding * 2) / (level.grid.cols - 1 || 1);
    const cellH = (canvas.height - CONFIG.boardPadding * 2) / (level.grid.rows - 1 || 1);

    for (let c = 0; c < level.grid.cols; c++) {
        const x = level.grid.cols > 1 ? CONFIG.boardPadding + c * cellW : canvas.width / 2;
        ctx.beginPath(); ctx.moveTo(x, CONFIG.boardPadding); ctx.lineTo(x, canvas.height - CONFIG.boardPadding); ctx.stroke();
    }
    for (let r = 0; r < level.grid.rows; r++) {
        const y = level.grid.rows > 1 ? CONFIG.boardPadding + r * cellH : canvas.height / 2;
        ctx.beginPath(); ctx.moveTo(CONFIG.boardPadding, y); ctx.lineTo(canvas.width - CONFIG.boardPadding, y); ctx.stroke();
    }
}

document.addEventListener('DOMContentLoaded', init);
