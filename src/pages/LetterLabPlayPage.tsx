import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Settings, Languages, Baby, ArrowLeft, X, Check, Lock } from 'lucide-react';
import { strings } from '../constants/strings';

// --- Types ---
type Language = 'EN' | 'SV';
type GameState = 'IDLE' | 'PLAYING';

interface LetterTile {
    id: string;
    char: string;
    x: number;
    y: number;
    speedX: number;
    speedY: number;
    rotation: number;
}

// --- Constants ---
const LETTERS_EN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LETTERS_SV = "ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ";

const DICTIONARY_EN = ["CAT", "DOG", "SUN", "MOON", "BIRD", "FISH", "TREE", "BOOK", "PLAY", "LOVE", "KIDS", "STAR", "BALL", "CAKE", "MILK"];
const DICTIONARY_SV = ["HEJ", "SOL", "MÅNE", "BOK", "FISK", "HUND", "KATT", "FÅGEL", "GÅVA", "LEKA", "BARN", "STJÄRNA", "BOLL", "KAKA", "MJÖLK"];

// --- Helper Functions ---
const getRandomChar = (lang: Language) => {
    const chars = lang === 'EN' ? LETTERS_EN : LETTERS_SV;
    return chars[Math.floor(Math.random() * chars.length)];
};

// --- Main Component ---
export const LetterLabPlayPage: React.FC = () => {
    // 1. STATE & STORAGE
    const [gameState, setGameState] = useState<GameState>('IDLE');
    const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('kids_lang') as Language) || 'EN');
    const [wordsBuilt, setWordsBuilt] = useState(0);
    const [bestSession, setBestSession] = useState(() => Number(localStorage.getItem('kids_best_session')) || 0);
    const [customWords, setCustomWords] = useState<Record<Language, string[]>>(() => {
        const en = JSON.parse(localStorage.getItem('kids_words_en') || '[]');
        const sv = JSON.parse(localStorage.getItem('kids_words_sv') || '[]');
        return { EN: en, SV: sv };
    });

    // Game Objects
    const [tiles, setTiles] = useState<LetterTile[]>([]);
    const [railLetters, setRailLetters] = useState<LetterTile[]>([]);
    const [draggedTileId, setDraggedTileId] = useState<string | null>(null);
    const [pickedTileId, setPickedTileId] = useState<string | null>(null);

    // Overlays
    const [showParentCheck, setShowParentCheck] = useState(false);
    const [showParentPanel, setShowParentPanel] = useState(false);
    const [mathQuestion, setMathQuestion] = useState({ a: 0, b: 0, sum: 0 });
    const [mathInput, setMathInput] = useState('');
    const [parentCheckError, setParentCheckError] = useState(false);

    // Refs
    const boardRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number>();

    // 2. EFFECTS
    // Save preferences
    useEffect(() => { localStorage.setItem('kids_lang', language); }, [language]);
    useEffect(() => { localStorage.setItem('kids_best_session', bestSession.toString()); }, [bestSession]);
    useEffect(() => { localStorage.setItem('kids_words_en', JSON.stringify(customWords.EN)); }, [customWords.EN]);
    useEffect(() => { localStorage.setItem('kids_words_sv', JSON.stringify(customWords.SV)); }, [customWords.SV]);

    // Animation loop for drifting letters
    const updateTiles = useCallback(() => {
        if (gameState !== 'PLAYING') return;

        setTiles(prev => prev.map(tile => {
            if (tile.id === pickedTileId || tile.id === draggedTileId) return tile;

            let newX = tile.x + tile.speedX;
            let newY = tile.y + tile.speedY;

            // Simple bounce
            let newSpeedX = tile.speedX;
            let newSpeedY = tile.speedY;

            if (newX < 5 || newX > 95) newSpeedX *= -1;
            if (newY < 5 || newY > 95) newSpeedY *= -1;

            return {
                ...tile,
                x: newX,
                y: newY,
                speedX: newSpeedX,
                speedY: newSpeedY,
                rotation: tile.rotation + tile.speedX * 0.1
            };
        }));

        requestRef.current = requestAnimationFrame(updateTiles);
    }, [gameState, pickedTileId, draggedTileId]);

    useEffect(() => {
        if (gameState === 'PLAYING') {
            requestRef.current = requestAnimationFrame(updateTiles);
        }
        return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
    }, [gameState, updateTiles]);

    // Initialize/Spawn tiles
    const spawnTiles = useCallback((count: number) => {
        const newTiles: LetterTile[] = [];
        for (let i = 0; i < count; i++) {
            newTiles.push({
                id: Math.random().toString(36).substr(2, 9),
                char: getRandomChar(language),
                x: 20 + Math.random() * 60,
                y: 20 + Math.random() * 60,
                speedX: (Math.random() - 0.5) * 0.2,
                speedY: (Math.random() - 0.5) * 0.2,
                rotation: Math.random() * 20 - 10
            });
        }
        setTiles(prev => [...prev, ...newTiles]);
    }, [language]);

    // Start Game
    const startGame = () => {
        setGameState('PLAYING');
        setWordsBuilt(0);
        setTiles([]);
        setRailLetters([]);
        spawnTiles(8);
    };

    // 3. HANDLERS
    // Word Validation
    useEffect(() => {
        const currentWord = railLetters.map(t => t.char).join('');
        if (currentWord.length < 2) return;

        const dict = language === 'EN' ? DICTIONARY_EN : DICTIONARY_SV;
        const custom = language === 'EN' ? customWords.EN : customWords.SV;
        const fullDict = [...dict, ...custom].map(w => w.toUpperCase());

        if (fullDict.includes(currentWord)) {
            // Lock success
            setWordsBuilt(prev => {
                const updated = prev + 1;
                if (updated > bestSession) setBestSession(updated);
                return updated;
            });

            // Animation/Clear logic would go here, for now just clear rail after delay
            setTimeout(() => {
                setRailLetters([]);
                spawnTiles(currentWord.length);
            }, 800);
        }
    }, [railLetters, language, customWords, bestSession, spawnTiles]);

    // Tile Interaction
    const handlePickTile = (tile: LetterTile) => {
        if (pickedTileId === tile.id) {
            // Drop in rail?
            setRailLetters(prev => [...prev, tile]);
            setTiles(prev => prev.filter(t => t.id !== tile.id));
            setPickedTileId(null);
        } else {
            setPickedTileId(tile.id);
        }
    };

    const removeFromRail = (index: number) => {
        const tile = railLetters[index];
        setRailLetters(prev => prev.filter((_, i) => i !== index));
        setTiles(prev => [...prev, { ...tile, x: 50, y: 50 }]);
    };

    // Parent Mode
    const openParentCheck = () => {
        const a = 2 + Math.floor(Math.random() * 10);
        const b = 2 + Math.floor(Math.random() * 10);
        setMathQuestion({ a, b, sum: a + b });
        setMathInput('');
        setParentCheckError(false);
        setShowParentCheck(true);
    };

    const verifyParent = () => {
        if (parseInt(mathInput) === mathQuestion.sum) {
            setShowParentCheck(false);
            setShowParentPanel(true);
        } else {
            setParentCheckError(true);
            setTimeout(() => setParentCheckError(false), 500);
        }
    };

    const addCustomWord = (word: string) => {
        const sanitized = word.trim().toUpperCase().replace(/[^A-ZÅÄÖ-]/g, '');
        if (sanitized.length < 2 || sanitized.length > 10) return;
        setCustomWords(prev => ({
            ...prev,
            [language]: [...prev[language], sanitized]
        }));
    };

    const removeCustomWord = (word: string) => {
        setCustomWords(prev => ({
            ...prev,
            [language]: prev[language].filter(w => w !== word)
        }));
    };

    // 4. RENDER
    return (
        <div className="relative flex h-[calc(100vh-64px)] w-full overflow-hidden bg-background text-foreground select-none">
            {/* LEFT Panel (Scoreboard) */}
            <aside className="w-64 border-r border-foreground/5 bg-foreground/[0.02] flex flex-col p-8 group">
                <div className="mb-12">
                    <h3 className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] mb-4">Words Built</h3>
                    <div className="text-5xl font-mono font-bold tabular-nums text-foreground animate-in zoom-in duration-500" key={wordsBuilt}>
                        {wordsBuilt.toString().padStart(3, '0')}
                    </div>
                </div>
                <div className="mt-auto pt-8 border-t border-foreground/5">
                    <h3 className="text-[10px] font-bold text-foreground/20 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                        <Trophy className="h-3 w-3" /> Best Session
                    </h3>
                    <div className="text-xl font-mono font-bold text-foreground/30">
                        {bestSession.toString().padStart(3, '0')}
                    </div>
                </div>
            </aside>

            {/* CENTER Board */}
            <main className="flex-1 relative flex flex-col items-center justify-center p-8 overflow-hidden" ref={boardRef}>
                {/* Word Rail */}
                <div className="w-full max-w-2xl h-32 mb-12 flex items-center justify-center gap-2 border-b-2 border-foreground/5 relative">
                    {railLetters.length === 0 && (
                        <span className="text-sm font-medium text-foreground/10 uppercase tracking-[0.4em] italic">
                            Empty Rail
                        </span>
                    )}
                    {railLetters.map((tile, i) => (
                        <button
                            key={`${tile.id}-${i}`}
                            onClick={() => removeFromRail(i)}
                            className="w-16 h-16 rounded-xl bg-foreground text-background font-mono text-3xl font-bold flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 animate-in slide-in-from-bottom-2"
                        >
                            {tile.char}
                        </button>
                    ))}
                    <div className="absolute -bottom-1 left-0 right-0 h-1 bg-accent/20" />
                </div>

                {/* Drifting Board */}
                <div className="flex-1 w-full relative">
                    {tiles.map(tile => (
                        <button
                            key={tile.id}
                            onClick={() => handlePickTile(tile)}
                            className={`absolute w-14 h-14 rounded-2xl flex items-center justify-center font-mono text-2xl font-black transition-all duration-300 ${pickedTileId === tile.id
                                    ? 'bg-accent text-background scale-125 z-50 ring-4 ring-accent/20'
                                    : 'bg-foreground/[0.05] text-foreground/60 border border-foreground/10 hover:bg-foreground/[0.08] hover:text-foreground'
                                }`}
                            style={{
                                left: `${tile.x}%`,
                                top: `${tile.y}%`,
                                transform: `translate(-50%, -50%) rotate(${tile.rotation}deg)`,
                            }}
                        >
                            {tile.char}
                        </button>
                    ))}
                </div>

                {/* Start Overlay */}
                {gameState === 'IDLE' && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-500">
                        <button
                            onClick={startGame}
                            className="group flex flex-col items-center gap-4 p-12 transition-all hover:scale-105"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 blur-3xl bg-accent/20 rounded-full group-hover:bg-accent/30 transition-colors" />
                                <Baby className="h-16 w-16 text-foreground relative z-10" />
                            </div>
                            <div className="text-center">
                                <h2 className="text-2xl font-bold tracking-[0.3em] uppercase mb-2">Letter Lab</h2>
                                <p className="text-[10px] font-black tracking-[0.5em] uppercase text-foreground/40 group-hover:text-accent group-hover:tracking-[0.8em] transition-all duration-700">
                                    Tap to Start
                                </p>
                            </div>
                        </button>
                    </div>
                )}
            </main>

            {/* RIGHT Panel (Controls) */}
            <aside className="w-64 border-l border-foreground/5 bg-foreground/[0.02] flex flex-col p-8">
                <div className="mb-12">
                    <h3 className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Settings className="h-3 w-3" /> Controls
                    </h3>
                    <ul className="space-y-3 text-[10px] font-medium text-foreground/60 tracking-wider">
                        <li className="flex items-center gap-2"><Check className="h-3 w-3 text-accent" /> Tap a letter to pick</li>
                        <li className="flex items-center gap-2"><Check className="h-3 w-3 text-accent" /> Tap rail to drop</li>
                        <li className="flex items-center gap-2"><Check className="h-3 w-3 text-accent" /> Form valid words</li>
                    </ul>
                </div>

                <div className="mb-12">
                    <h3 className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        Rules
                    </h3>
                    <p className="text-[10px] italic leading-relaxed text-foreground/30">
                        Letters drift. Find connections. Lock the sequence.
                    </p>
                </div>

                <div className="mt-auto space-y-4">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-foreground/20">
                        <span>Language</span>
                        <span className="text-accent">{language}</span>
                    </div>

                    <button
                        onClick={openParentCheck}
                        className="w-full py-3 rounded-lg border border-foreground/5 bg-foreground/[0.05] hover:bg-foreground/[0.08] transition-all flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/40 hover:text-foreground"
                    >
                        <Lock className="h-3 w-3" /> Parent Mode
                    </button>

                    <Link
                        to="/kids"
                        className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/20 hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-3 w-3" /> Exit Lab
                    </Link>
                </div>
            </aside>

            {/* Overlays */}
            {showParentCheck && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className={`p-12 text-center transition-transform ${parentCheckError ? 'animate-shake' : ''}`}>
                        <h3 className="text-sm font-bold tracking-[0.4em] uppercase mb-8 text-foreground/40">Parent Check</h3>
                        <div className="text-4xl font-mono font-bold mb-8">
                            {mathQuestion.a} + {mathQuestion.b} = ?
                        </div>
                        <div className="flex gap-4 justify-center">
                            <input
                                type="number"
                                value={mathInput}
                                onChange={(e) => setMathInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && verifyParent()}
                                className="w-24 bg-foreground/5 border-b-2 border-accent text-center text-2xl font-mono focus:outline-none"
                                autoFocus
                            />
                            <button
                                onClick={verifyParent}
                                className="h-10 w-10 rounded-full bg-accent text-background flex items-center justify-center"
                            >
                                <Check className="h-5 w-5" />
                            </button>
                        </div>
                        <button
                            onClick={() => setShowParentCheck(false)}
                            className="mt-12 text-[10px] font-bold uppercase tracking-widest text-foreground/20 hover:text-foreground"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {showParentPanel && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-background/98 backdrop-blur-2xl animate-in zoom-in duration-500">
                    <div className="max-w-xl w-full p-12 overflow-y-auto max-h-[80vh]">
                        <div className="flex items-center justify-between mb-12">
                            <h3 className="text-sm font-black tracking-[0.4em] uppercase">Parent Control</h3>
                            <button onClick={() => setShowParentPanel(false)}>
                                <X className="h-5 w-5 text-foreground/40 hover:text-foreground" />
                            </button>
                        </div>

                        {/* Language */}
                        <section className="mb-12">
                            <h4 className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-6">Active Language</h4>
                            <div className="flex gap-4">
                                {(['EN', 'SV'] as Language[]).map(lang => (
                                    <button
                                        key={lang}
                                        onClick={() => setLanguage(lang)}
                                        className={`px-8 py-3 rounded-xl border-2 transition-all font-bold tracking-widest ${language === lang ? 'border-accent text-accent' : 'border-foreground/5 text-foreground/20'
                                            }`}
                                    >
                                        {lang}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Custom Words */}
                        <section className="mb-8">
                            <h4 className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-6">Custom Words ({language})</h4>
                            <div className="space-y-2 mb-8 max-h-48 overflow-y-auto pr-4">
                                {customWords[language].map(word => (
                                    <div key={word} className="flex items-center justify-between p-3 rounded-lg bg-foreground/5 group">
                                        <span className="font-mono font-bold tracking-widest">{word}</span>
                                        <button onClick={() => removeCustomWord(word)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X className="h-4 w-4 text-red-500/60 hover:text-red-500" />
                                        </button>
                                    </div>
                                ))}
                                {customWords[language].length === 0 && (
                                    <p className="text-[10px] italic text-foreground/20">No custom words added.</p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    id="addWordInput"
                                    type="text"
                                    placeholder="Add word..."
                                    className="flex-1 bg-foreground/5 rounded-lg px-4 py-3 text-xs focus:outline-none focus:ring-1 ring-accent/50"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            addCustomWord((e.target as HTMLInputElement).value);
                                            (e.target as HTMLInputElement).value = '';
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        const el = document.getElementById('addWordInput') as HTMLInputElement;
                                        addCustomWord(el.value);
                                        el.value = '';
                                    }}
                                    className="px-6 rounded-lg bg-foreground text-background text-[10px] font-black uppercase tracking-widest"
                                >
                                    Add
                                </button>
                            </div>
                        </section>

                        <div className="text-[10px] leading-relaxed text-foreground/20 italic">
                            Parent Mode allows customization of the dictionary. Changes persist in local storage.
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-8px); }
                    75% { transform: translateX(8px); }
                }
                .animate-shake {
                    animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
                }
            `}</style>
        </div>
    );
};
