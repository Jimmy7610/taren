import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Settings, Baby, ArrowLeft, X, Check, Lock, MousePointer2, Sparkles } from 'lucide-react';

// @ts-ignore
import wordsEnRaw from '../kids/letter-lab/words/words_en.txt?raw';
// @ts-ignore
import wordsSvRaw from '../kids/letter-lab/words/words_sv.txt?raw';

// --- Types ---
type Language = 'EN' | 'SV';
type GameState = 'IDLE' | 'PLAYING';

interface LetterTileData {
    id: string;
    char: string;
    x: number;
    y: number;
    rotation: number;
    isDragging?: boolean;
}

// --- Constants ---
const LETTERS_EN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LETTERS_SV = "ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ";

const DICTIONARY_EN = wordsEnRaw.split(/\r?\n/).map((w: string) => w.trim().toUpperCase()).filter(Boolean);
const DICTIONARY_SV = wordsSvRaw.split(/\r?\n/).map((w: string) => w.trim().toUpperCase()).filter(Boolean);

const ARENA_WIDTH = 1000;
const ARENA_HEIGHT = 625; // 16:10 ratio
const TRAY_Y_START = 380;
const TRAY_GAP_Y = 70;

// --- i18n Strings ---
const STRINGS = {
    EN: {
        buildWordTitle: "BUILD A WORD",
        hint: "Drag letters up to the rail.",
        emptyRail: "EMPTY RAIL",
        controls: "CONTROLS",
        rules: "RULES",
        parentMode: "PARENT MODE",
        exit: "EXIT LAB",
        wordsBuilt: "Words Built",
        bestSession: "Best Session",
        currentWord: "Current:",
        checkWord: "Check Word",
        tapToStart: "Tap to Start",
        locked: "LOCKED",
        notAWord: "NOT A WORD",
        helpPick: "1. Drag",
        helpBuild: "2. Build",
        helpText: "Drag a letter to the rail.",
        c1: "Drag a letter to choose",
        c2: "Drop on rail to place",
        c3: "Form valid words",
        r1: "Pick letters from the tray. Arrange them on the rail.",
        parentTitle: "Parent Control",
        activeLang: "Active Language",
        customWords: "Custom Words",
        parentHint: "Parent Mode allows customization of the dictionary.",
        add: "Add",
        addWord: "Add word...",
        parentCheck: "Parent Check",
        cancel: "Cancel",
        wordList: "WORD LIBRARY",
        includedWords: "Included Words"
    },
    SV: {
        buildWordTitle: "BYGG ETT ORD",
        hint: "Dra upp bokstäver till raden.",
        emptyRail: "TOM RAD",
        controls: "KONTROLLER",
        rules: "REGLER",
        parentMode: "FÖRÄLDRA-LÄGE",
        exit: "LÄMNA LABB",
        wordsBuilt: "Byggda Ord",
        bestSession: "Bästa Session",
        currentWord: "Nuvarande:",
        checkWord: "Kontrollera",
        tapToStart: "Tryck för att Starta",
        locked: "LÅST",
        notAWord: "EJ ETT ORD",
        helpPick: "1. Dra",
        helpBuild: "2. Build",
        helpText: "Dra en bokstav till raden.",
        c1: "Dra en bokstav för att välja",
        c2: "Släpp på raden för att placera",
        c3: "Skapa giltiga ord",
        r1: "Välj bokstäver från brickan. Ordna dem på raden.",
        parentTitle: "Föräldrakontroll",
        activeLang: "Aktivt Språk",
        customWords: "Egna Ord",
        parentHint: "Föräldraläget låter dig anpassa ordlistan.",
        add: "Lägg till",
        addWord: "Lägg till ord...",
        parentCheck: "Föräldrakontroll",
        cancel: "Avbryt",
        wordList: "ORDLISTA",
        includedWords: "Inkluderade Ord"
    }
};

const getRandomChar = (lang: Language) => {
    const chars = lang === 'EN' ? LETTERS_EN : LETTERS_SV;
    return chars[Math.floor(Math.random() * chars.length)];
};

export const LetterLabPlayPage: React.FC = () => {
    // 1. STATE & STORAGE
    const [gameState, setGameState] = useState<GameState>('IDLE');
    const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('kids_lang') as Language) || 'EN');

    // Prevent body scroll
    useEffect(() => {
        const originalStyle = document.body.style.overflow;
        const originalHeight = document.body.style.height;
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100dvh';
        return () => {
            document.body.style.overflow = originalStyle;
            document.body.style.height = originalHeight;
        };
    }, []);
    const [wordsBuilt, setWordsBuilt] = useState(0);
    const [bestSession, setBestSession] = useState(() => Number(localStorage.getItem('kids_best_session')) || 0);
    const [customWords, setCustomWords] = useState<Record<Language, string[]>>(() => {
        const en = JSON.parse(localStorage.getItem('kids_words_en') || '[]');
        const sv = JSON.parse(localStorage.getItem('kids_words_sv') || '[]');
        return { EN: en, SV: sv };
    });

    const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('taren:kids:letter-lab:onboardDismissed'));
    const [tiles, setTiles] = useState<LetterTileData[]>([]);
    const [railLetters, setRailLetters] = useState<LetterTileData[]>([]);
    const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'error' | 'success' | 'info' | null }>({ text: '', type: null });

    // Dragging State
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const dragOffset = useRef({ x: 0, y: 0 });
    const boardRef = useRef<HTMLDivElement>(null);

    // Overlays
    const [showParentCheck, setShowParentCheck] = useState(false);
    const [showParentPanel, setShowParentPanel] = useState(false);
    const [mathQuestion, setMathQuestion] = useState({ a: 0, b: 0, sum: 0 });
    const [mathInput, setMathInput] = useState('');
    const [parentCheckError, setParentCheckError] = useState(false);

    const t = STRINGS[language];

    // Word sorting and memoization
    const sortedBaseWords = useMemo(() => {
        const dict = language === 'EN' ? DICTIONARY_EN : DICTIONARY_SV;
        return [...dict].sort((a, b) => a.localeCompare(b, language === 'SV' ? 'sv' : 'en'));
    }, [language]);

    const sortedCustomWords = useMemo(() => {
        return [...customWords[language]].sort((a, b) => a.localeCompare(b, language === 'SV' ? 'sv' : 'en'));
    }, [customWords, language]);

    // 2. TRAY LOGIC
    const getTrayPosition = useCallback((index: number, total: number) => {
        const lettersPerRow = Math.ceil(total / 2);
        const rowIndex = Math.floor(index / lettersPerRow);
        const colIndex = index % lettersPerRow;

        const spacing = 90;
        const rowWidth = (lettersPerRow - 1) * spacing;
        const startX = ARENA_WIDTH / 2 - rowWidth / 2;

        return {
            x: startX + colIndex * spacing,
            y: TRAY_Y_START + rowIndex * TRAY_GAP_Y
        };
    }, []);

    const startGame = () => {
        setGameState('PLAYING');
        setWordsBuilt(0);
        setRailLetters([]);
        setDraggingId(null);

        const initialTiles: LetterTileData[] = [];
        for (let i = 0; i < 8; i++) {
            const pos = getTrayPosition(i, 8);
            initialTiles.push({
                id: crypto.randomUUID(),
                char: getRandomChar(language),
                x: pos.x,
                y: pos.y,
                rotation: (Math.random() - 0.5) * 10
            });
        }
        setTiles(initialTiles);
    };

    // 3. DRAG & DROP
    const handlePointerDown = (e: React.PointerEvent, tile: LetterTileData) => {
        if (gameState !== 'PLAYING') return;
        setDraggingId(tile.id);

        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left - rect.width / 2,
            y: e.clientY - rect.top - rect.height / 2
        };

        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent, id: string) => {
        if (draggingId !== id || !boardRef.current) return;

        const boardRect = boardRef.current.getBoundingClientRect();
        const scaleX = ARENA_WIDTH / boardRect.width;
        const scaleY = ARENA_HEIGHT / boardRect.height;

        const x = (e.clientX - boardRect.left) * scaleX - dragOffset.current.x;
        const y = (e.clientY - boardRect.top) * scaleY - dragOffset.current.y;

        setTiles(prev => prev.map(t => t.id === id ? { ...t, x, y, isDragging: true } : t));
    };

    const handlePointerUp = (e: React.PointerEvent, id: string) => {
        if (draggingId !== id) return;
        setDraggingId(null);

        const tile = tiles.find(t => t.id === id);
        if (!tile) return;

        // Hit test for rail area (Simplified: upper central portion)
        // Hit test for rail area (Simplified: upper central portion)
        const isOnRail = tile.y < ARENA_HEIGHT * 0.45 && tile.y > 60;

        if (isOnRail) {
            setRailLetters(prev => [...prev, { ...tile, isDragging: false }]);
            setTiles(prev => prev.filter(t => t.id !== id));

            // Re-spawn a new letter in a hidden state then animate in
            setTimeout(() => {
                const char = getRandomChar(language);
                const newId = crypto.randomUUID();
                setTiles(prev => [...prev, {
                    id: newId,
                    char,
                    x: ARENA_WIDTH / 2,
                    y: ARENA_HEIGHT + 100,
                    rotation: (Math.random() - 0.5) * 10
                }]);
            }, 300);

            if (showOnboarding) {
                setShowOnboarding(false);
                localStorage.setItem('taren:kids:letter-lab:onboardDismissed', '1');
            }
        } else {
            // Force snap back will happen in Tray Effect
            setTiles(prev => prev.map(t => t.id === id ? { ...t, isDragging: false } : t));
        }
    };

    // Keep tray sorted and positioned
    useEffect(() => {
        if (gameState !== 'PLAYING') return;
        setTiles(prev => prev.map((t, i) => {
            if (t.isDragging) return t;
            const pos = getTrayPosition(i, prev.length);
            // Only update if significantly different to avoid state loops, 
            // but for simple drag back it's fine.
            if (Math.abs(t.x - pos.x) < 1 && Math.abs(t.y - pos.y) < 1) return t;
            return { ...t, x: pos.x, y: pos.y };
        }));
    }, [tiles.length, gameState, getTrayPosition]);

    const removeFromRail = (index: number) => {
        const tile = railLetters[index];
        setRailLetters(prev => prev.filter((_, i) => i !== index));
        setTiles(prev => [...prev, { ...tile, y: ARENA_HEIGHT + 100 }]); // Animate in from bottom
    };

    const validateWord = useCallback(() => {
        const currentWord = railLetters.map(t => t.char).join('');
        if (currentWord.length < 2) return;

        const dict = language === 'EN' ? DICTIONARY_EN : DICTIONARY_SV;
        const custom = language === 'EN' ? customWords.EN : customWords.SV;
        const fullDict = [...dict, ...custom].map(w => w.toUpperCase());

        if (fullDict.includes(currentWord)) {
            setStatusMessage({ text: 'LOCKED', type: 'success' });
            setWordsBuilt(prev => {
                const updated = prev + 1;
                if (updated > bestSession) setBestSession(updated);
                return updated;
            });

            setTimeout(() => {
                setRailLetters([]);
                setStatusMessage({ text: '', type: null });
            }, 800);
        } else {
            setStatusMessage({ text: 'NOT A WORD', type: 'error' });
            setTimeout(() => setStatusMessage({ text: '', type: null }), 1000);
        }
    }, [railLetters, language, customWords, bestSession]);

    // 4. PERSISTENCE
    useEffect(() => { localStorage.setItem('kids_lang', language); }, [language]);
    useEffect(() => { localStorage.setItem('kids_best_session', bestSession.toString()); }, [bestSession]);
    useEffect(() => { localStorage.setItem('kids_words_en', JSON.stringify(customWords.EN)); }, [customWords.EN]);
    useEffect(() => { localStorage.setItem('kids_words_sv', JSON.stringify(customWords.SV)); }, [customWords.SV]);

    // 5. PARENT MODE
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
        setCustomWords(prev => ({ ...prev, [language]: [...prev[language], sanitized] }));
    };

    const removeCustomWord = (word: string) => {
        setCustomWords(prev => ({ ...prev, [language]: prev[language].filter(w => w !== word) }));
    };

    // 6. RENDER
    return (
        <div className="relative flex h-[calc(100vh-64px)] min-h-0 w-full overflow-hidden bg-background text-foreground select-none">
            {/* LEFT Panel */}
            <aside className="w-64 border-r border-foreground/5 bg-foreground/[0.02] flex flex-col p-8 pt-12 z-20 overflow-hidden -translate-y-6">
                <div className="mb-12">
                    <h3 className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] mb-4">{t.wordsBuilt}</h3>
                    <div className="text-5xl font-mono font-bold tabular-nums text-foreground">{wordsBuilt.toString().padStart(3, '0')}</div>
                </div>
                <div className="mt-auto pt-8 border-t border-foreground/5">
                    <h3 className="text-[10px] font-bold text-foreground/20 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                        <Trophy className="h-3 w-3" /> {t.bestSession}
                    </h3>
                    <div className="text-xl font-mono font-bold text-foreground/30">{bestSession.toString().padStart(3, '0')}</div>
                </div>
            </aside>

            {/* CENTER Arena */}
            <main className="flex-1 relative flex items-center justify-center p-4 lg:p-8 overflow-hidden z-10 -translate-y-12">
                <div
                    ref={boardRef}
                    className="relative w-full h-full max-w-[1000px] max-h-[560px] aspect-[16/10] bg-foreground/[0.01] rounded-3xl border border-foreground/5 shadow-2xl overflow-hidden"
                >
                    {/* Status Message Overlay */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] pointer-events-none">
                        {statusMessage.text && (
                            <div className={`px-12 py-4 rounded-full text-2xl font-black tracking-[0.4em] uppercase shadow-2xl animate-in zoom-in duration-300 ${statusMessage.type === 'success' ? 'bg-accent text-background border-glow' : 'bg-red-500 text-white animate-shake'}`}>
                                {statusMessage.text === 'LOCKED' ? t.locked : statusMessage.text === 'NOT A WORD' ? t.notAWord : statusMessage.text}
                            </div>
                        )}
                    </div>

                    <div className="h-full flex flex-col items-center">
                        {/* Rail Area */}
                        <div className="mt-12 w-full max-w-xl text-center">
                            <div className="mb-6">
                                <h2 className="text-[10px] font-black tracking-[0.4em] uppercase text-foreground/40 mb-2">{t.buildWordTitle}</h2>
                                <p className="text-[11px] font-bold tracking-[0.1em] text-foreground/20 uppercase italic">{t.hint}</p>
                            </div>

                            <div className="w-full h-24 flex items-center justify-center gap-2 border-b-2 border-foreground/5 relative">
                                {railLetters.length === 0 && (
                                    <span className="text-[10px] font-bold text-foreground/5 uppercase tracking-[0.6em]">{t.emptyRail}</span>
                                )}
                                {railLetters.map((tile, i) => (
                                    <div
                                        key={`${tile.id}-${i}`}
                                        onClick={() => removeFromRail(i)}
                                        className="w-14 h-14 rounded-xl bg-foreground text-background font-mono text-2xl font-bold flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 animate-in zoom-in cursor-pointer"
                                    >
                                        {tile.char}
                                    </div>
                                ))}
                                <div className="absolute -bottom-1 left-0 right-0 h-1 bg-foreground/5" />
                            </div>

                            {/* Word Preview & Validation */}
                            <div className="mt-6 h-6 flex items-center justify-center gap-6 text-[10px] font-black tracking-[0.4em] uppercase">
                                {railLetters.length > 0 && (
                                    <>
                                        <span className="text-foreground/20">{t.currentWord}</span>
                                        <span className="text-foreground/60">{railLetters.map(t => t.char).join(' ')}</span>
                                        <button onClick={validateWord} className="px-6 py-2 rounded-full bg-foreground/5 hover:bg-accent hover:text-background transition-all text-[9px] tracking-[0.2em] font-black">
                                            {t.checkWord}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tiles (Tray + Draggable Area) */}
                    {tiles.map(tile => (
                        <button
                            key={tile.id}
                            onPointerDown={(e) => handlePointerDown(e, tile)}
                            onPointerMove={(e) => handlePointerMove(e, tile.id)}
                            onPointerUp={(e) => handlePointerUp(e, tile.id)}
                            className={`letter-tile absolute w-16 h-16 rounded-2xl flex items-center justify-center font-mono text-3xl font-black transition-all ${tile.isDragging
                                ? 'z-50 scale-110 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] bg-accent text-background ring-4 ring-accent/20 cursor-grabbing duration-0'
                                : 'bg-foreground/[0.04] text-foreground/60 border border-foreground/10 hover:bg-foreground/[0.08] hover:text-foreground active:scale-95 cursor-grab duration-500 ease-out'
                                }`}
                            style={{
                                left: `${(tile.x / ARENA_WIDTH) * 100}%`,
                                top: `${(tile.y / ARENA_HEIGHT) * 100}%`,
                                transform: `translate(-50%, -50%) rotate(${tile.isDragging ? 0 : tile.rotation}deg)`
                            }}
                        >
                            {tile.char}
                        </button>
                    ))}

                    {/* Start Overlay */}
                    {gameState === 'IDLE' && (
                        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-500">
                            <button onClick={startGame} className="group flex flex-col items-center gap-6 p-12 transition-all hover:scale-105">
                                <div className="relative">
                                    <div className="absolute inset-0 blur-3xl bg-accent/20 rounded-full group-hover:bg-accent/30 transition-colors" />
                                    <Baby className="h-20 w-20 text-foreground relative z-10" />
                                </div>
                                <div className="text-center">
                                    <h2 className="text-3xl font-bold tracking-[0.3em] uppercase mb-2">Letter Lab</h2>
                                    <p className="text-[11px] font-black tracking-[0.5em] uppercase text-foreground/40 group-hover:text-accent group-hover:tracking-[0.8em] transition-all duration-700">
                                        {t.tapToStart}
                                    </p>
                                </div>
                            </button>
                        </div>
                    )}

                    {/* Onboarding */}
                    {gameState === 'PLAYING' && showOnboarding && (
                        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                            <div className="bg-foreground/5 backdrop-blur-xl border border-foreground/10 rounded-2xl p-6 flex items-center gap-6 shadow-2xl">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="p-3 rounded-full bg-accent/10 text-accent"><MousePointer2 className="h-5 w-5" /></div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/40">{t.helpPick}</span>
                                </div>
                                <div className="h-4 w-px bg-foreground/10" />
                                <div className="flex flex-col items-center gap-2">
                                    <div className="p-3 rounded-full bg-purple-500/10 text-purple-500"><Sparkles className="h-5 w-5" /></div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/40">{t.helpBuild}</span>
                                </div>
                                <div className="ml-4 max-w-[140px]">
                                    <p className="text-[10px] font-medium leading-relaxed text-foreground/60 italic">"{t.helpText}"</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* RIGHT Panel */}
            <aside className="w-64 border-l border-foreground/5 bg-foreground/[0.02] flex flex-col p-8 pt-12 z-20 overflow-hidden -translate-y-6">
                <div className="mb-12">
                    <h3 className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Settings className="h-3 w-3" /> {t.controls}</h3>
                    <ul className="space-y-3 text-[10px] font-medium text-foreground/60 tracking-wider">
                        <li className="flex items-center gap-2"><Check className="h-3 w-3 text-accent" /> {t.c1}</li>
                        <li className="flex items-center gap-2"><Check className="h-3 w-3 text-accent" /> {t.c2}</li>
                        <li className="flex items-center gap-2"><Check className="h-3 w-3 text-accent" /> {t.c3}</li>
                    </ul>
                </div>
                <div className="mb-12">
                    <h3 className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] mb-4">{t.rules}</h3>
                    <p className="text-[10px] italic leading-relaxed text-foreground/30">{t.r1}</p>
                </div>
                <div className="mt-auto space-y-6">
                    <div>
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-foreground/20 mb-3">
                            <span>{language === 'EN' ? 'Language' : 'Språk'}</span>
                            <span className="text-accent">{language}</span>
                        </div>
                        <div className="flex gap-2">
                            {(['EN', 'SV'] as Language[]).map(lang => (
                                <button
                                    key={lang}
                                    onClick={() => setLanguage(lang)}
                                    className={`flex-1 py-2 rounded border text-[10px] font-bold transition-all ${language === lang ? 'border-accent bg-accent/5 text-accent' : 'border-foreground/10 text-foreground/30 hover:border-foreground/20'}`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button onClick={openParentCheck} className="w-full py-3 rounded-lg border border-foreground/5 bg-foreground/[0.05] hover:bg-foreground/[0.08] transition-all flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/40 hover:text-foreground">
                        <Lock className="h-3 w-3" /> {t.parentMode}
                    </button>
                    <Link to="/kids" className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/20 hover:text-foreground transition-colors">
                        <ArrowLeft className="h-3 w-3" /> {t.exit}
                    </Link>
                </div>
            </aside>

            {/* Overlays */}
            {showParentCheck && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className={`p-12 text-center transition-transform ${parentCheckError ? 'animate-shake' : ''}`}>
                        <h3 className="text-sm font-bold tracking-[0.4em] uppercase mb-8 text-foreground/40">{t.parentCheck}</h3>
                        <div className="text-4xl font-mono font-bold mb-8">{mathQuestion.a} + {mathQuestion.b} = ?</div>
                        <div className="flex gap-4 justify-center">
                            <input type="number" value={mathInput} onChange={(e) => setMathInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && verifyParent()} className="w-24 bg-foreground/5 border-b-2 border-accent text-center text-2xl font-mono focus:outline-none" autoFocus />
                            <button onClick={verifyParent} className="h-10 w-10 rounded-full bg-accent text-background flex items-center justify-center"><Check className="h-5 w-5" /></button>
                        </div>
                        <button onClick={() => setShowParentCheck(false)} className="mt-12 text-[10px] font-bold uppercase tracking-widest text-foreground/20 hover:text-foreground">{t.cancel}</button>
                    </div>
                </div>
            )}
            {showParentPanel && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-background/98 backdrop-blur-2xl animate-in zoom-in duration-500">
                    <div className="max-w-xl w-full p-12 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between mb-8 flex-shrink-0">
                            <h3 className="text-sm font-black tracking-[0.4em] uppercase">{t.parentTitle}</h3>
                            <button onClick={() => setShowParentPanel(false)}><X className="h-5 w-5 text-foreground/40 hover:text-foreground" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-6 space-y-12 pb-8 scrollbar-hide">
                            <section>
                                <h4 className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-6">{t.activeLang}</h4>
                                <div className="flex gap-4">
                                    {(['EN', 'SV'] as Language[]).map(lang => (
                                        <button
                                            key={lang}
                                            onClick={() => setLanguage(lang)}
                                            className={`px-8 py-3 rounded-xl border-2 transition-all font-bold tracking-widest ${language === lang ? 'border-accent text-accent' : 'border-foreground/5 text-foreground/20'}`}
                                        >
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h4 className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-6">{t.wordList} ({language})</h4>

                                <div className="space-y-10">
                                    {/* Custom Words Section */}
                                    <div>
                                        <h5 className="text-[9px] font-bold text-accent uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <Sparkles className="h-3 w-3" /> {t.customWords}
                                        </h5>
                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                            {sortedCustomWords.map(word => (
                                                <div key={word} className="flex items-center justify-between p-2 px-3 rounded bg-foreground/5 group border border-foreground/5">
                                                    <span className="font-mono text-[10px] font-bold tracking-[0.2em]">{word}</span>
                                                    <button onClick={() => removeCustomWord(word)} className="opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3.5 w-3.5 text-red-500/60 hover:text-red-500" /></button>
                                                </div>
                                            ))}
                                        </div>
                                        {sortedCustomWords.length === 0 && <p className="text-[10px] italic text-foreground/20 mb-4">{language === 'EN' ? 'No custom words added.' : 'Inga egna ord tillagda.'}</p>}

                                        <div className="flex gap-2">
                                            <input id="addWordInput" type="text" placeholder={t.addWord} className="flex-1 bg-foreground/5 rounded px-3 py-2 text-[10px] focus:outline-none focus:ring-1 ring-accent/50" onKeyDown={(e) => e.key === 'Enter' && (addCustomWord((e.target as HTMLInputElement).value), (e.target as HTMLInputElement).value = '')} />
                                            <button onClick={() => { const el = document.getElementById('addWordInput') as HTMLInputElement; addCustomWord(el.value); el.value = ''; }} className="px-5 rounded bg-foreground text-background text-[9px] font-black uppercase tracking-widest">{t.add}</button>
                                        </div>
                                    </div>

                                    {/* Included Words Section */}
                                    <div>
                                        <h5 className="text-[9px] font-bold text-foreground/40 uppercase tracking-[0.2em] mb-4">{t.includedWords}</h5>
                                        <div className="grid grid-cols-3 gap-2 opacity-60">
                                            {sortedBaseWords.map(word => (
                                                <div key={word} className="p-2 rounded bg-foreground/[0.02] border border-foreground/5 text-center">
                                                    <span className="font-mono text-[9px] font-medium tracking-[0.2em] text-foreground/30">{word}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <div className="text-[10px] leading-relaxed text-foreground/20 italic mt-8 border-t border-foreground/5 pt-8">{t.parentHint}</div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .letter-tile {
                    will-change: transform;
                    contain: layout paint;
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-8px); }
                    75% { transform: translateX(8px); }
                }
                .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
                .border-glow { box-shadow: 0 0 20px rgba(255,165,0,0.4); }
            `}</style>
        </div>
    );
};
