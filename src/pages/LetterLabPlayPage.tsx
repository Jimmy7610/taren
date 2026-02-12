import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Settings, Languages, Baby, ArrowLeft, X, Check, Lock, MousePointer2, Sparkles } from 'lucide-react';
import { strings } from '../constants/strings';

// --- Types ---
type Language = 'EN' | 'SV';
type GameState = 'IDLE' | 'PLAYING';

interface LetterTileData {
    id: string;
    char: string;
}

interface PhysicsState {
    x: number;
    y: number;
    vx: number;
    vy: number;
    rotation: number;
}

// --- Constants ---
const LETTERS_EN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LETTERS_SV = "ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ";

const DICTIONARY_EN = ["CAT", "DOG", "SUN", "MOON", "BIRD", "FISH", "TREE", "BOOK", "PLAY", "LOVE", "KIDS", "STAR", "BALL", "CAKE", "MILK"];
const DICTIONARY_SV = ["HEJ", "SOL", "MÅNE", "BOK", "FISK", "HUND", "KATT", "FÅGEL", "GÅVA", "LEKA", "BARN", "STJÄRNA", "BOLL", "KAKA", "MJÖLK"];

// --- i18n Strings ---
const STRINGS = {
    EN: {
        buildWordTitle: "BUILD A WORD",
        hint: "Tap a letter → tap the rail to place it.",
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
        helpPick: "1. Pick",
        helpBuild: "2. Build",
        helpText: "Tap a letter to grab it.",
        c1: "Tap a letter to pick",
        c2: "Tap rail to drop",
        c3: "Form valid words",
        r1: "Letters appear. Find connections. Lock the sequence.",
        parentTitle: "Parent Control",
        activeLang: "Active Language",
        customWords: "Custom Words",
        parentHint: "Parent Mode allows customization of the dictionary.",
        add: "Add",
        addWord: "Add word...",
        parentCheck: "Parent Check",
        cancel: "Cancel"
    },
    SV: {
        buildWordTitle: "BYGG ETT ORD",
        hint: "Tryck på en bokstav → tryck på raden för att placera den.",
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
        helpPick: "1. Välj",
        helpBuild: "2. Bygg",
        helpText: "Tryck på en bokstav för att ta den.",
        c1: "Tryck på en bokstav för att välja",
        c2: "Tryck på raden för att släppa",
        c3: "Skapa giltiga ord",
        r1: "Bokstäver visas. Hitta samband. Lås sekvensen.",
        parentTitle: "Föräldrakontroll",
        activeLang: "Aktivt Språk",
        customWords: "Egna Ord",
        parentHint: "Föräldraläget låter dig anpassa ordlistan.",
        add: "Lägg till",
        addWord: "Lägg till ord...",
        parentCheck: "Föräldrakontroll",
        cancel: "Avbryt"
    }
};

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

    // Onboarding state
    const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('taren:kids:letter-lab:onboardDismissed'));

    // Game Objects
    const [tiles, setTiles] = useState<LetterTileData[]>([]);
    const [railLetters, setRailLetters] = useState<LetterTileData[]>([]);
    const [pickedTileId, setPickedTileId] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'error' | 'success' | 'info' | null }>({ text: '', type: null });

    // Overlays
    const [showParentCheck, setShowParentCheck] = useState(false);
    const [showParentPanel, setShowParentPanel] = useState(false);
    const [mathQuestion, setMathQuestion] = useState({ a: 0, b: 0, sum: 0 });
    const [mathInput, setMathInput] = useState('');
    const [parentCheckError, setParentCheckError] = useState(false);

    // Physics & SIM State (Mutable refs for performance)
    const simulationData = useRef<Map<string, PhysicsState>>(new Map());
    const tileElements = useRef<Map<string, HTMLButtonElement>>(new Map());
    const requestRef = useRef<number>();
    const lastTimeRef = useRef<number>(0);
    const boardRef = useRef<HTMLDivElement>(null);
    const boardSize = useRef({ width: 0, height: 0 });

    // 2. PHYSICS ENGINE (Direct DOM Updates)
    const t = STRINGS[language];

    const updatePhysics = useCallback((time: number) => {
        if (gameState !== 'PLAYING' || document.hidden || !boardRef.current) {
            lastTimeRef.current = time;
            requestRef.current = requestAnimationFrame(updatePhysics);
            return;
        }

        // Measure board if not yet measured
        if (boardSize.current.width === 0) {
            const rect = boardRef.current.getBoundingClientRect();
            boardSize.current = { width: rect.width, height: rect.height };
        }

        const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
        lastTimeRef.current = time;

        const { width, height } = boardSize.current;

        simulationData.current.forEach((physics, id) => {
            if (id === pickedTileId) return;

            let { x, y, rotation } = physics;

            // Integrity check
            if (isNaN(x)) x = width / 2; if (isNaN(y)) y = height / 2;

            // DRIFT REMOVED - tiles are now static
            // x += vx * dt * 100; 
            // y += vy * dt * 100;

            // Still allow a tiny rotation for life if vx was > 0, 
            // but we'll just use a constant slow rotation or none.
            // rotation += physics.vx * 20 * dt;

            // Direct DOM update
            const el = tileElements.current.get(id);
            if (el) {
                el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${rotation}deg)`;
            }
        });

        requestRef.current = requestAnimationFrame(updatePhysics);
    }, [gameState, pickedTileId]);

    useEffect(() => {
        const handleResize = () => {
            if (boardRef.current) {
                const rect = boardRef.current.getBoundingClientRect();
                boardSize.current = { width: rect.width, height: rect.height };
            }
        };
        window.addEventListener('resize', handleResize);
        lastTimeRef.current = performance.now();
        requestRef.current = requestAnimationFrame(updatePhysics);
        return () => {
            window.removeEventListener('resize', handleResize);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [updatePhysics]);

    // Handle visibility pause
    useEffect(() => {
        const handleVisibility = () => { if (document.hidden) lastTimeRef.current = performance.now(); };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, []);

    // 3. GAME LOGIC
    // Save preferences
    useEffect(() => { localStorage.setItem('kids_lang', language); }, [language]);
    useEffect(() => { localStorage.setItem('kids_best_session', bestSession.toString()); }, [bestSession]);
    useEffect(() => { localStorage.setItem('kids_words_en', JSON.stringify(customWords.EN)); }, [customWords.EN]);
    useEffect(() => { localStorage.setItem('kids_words_sv', JSON.stringify(customWords.SV)); }, [customWords.SV]);

    const spawnTile = useCallback(() => {
        if (!boardRef.current) return;
        const id = crypto.randomUUID();
        const char = getRandomChar(language);
        const { width, height } = boardRef.current.getBoundingClientRect();

        simulationData.current.set(id, {
            x: width * 0.2 + Math.random() * (width * 0.6),
            y: height * 0.2 + Math.random() * (height * 0.6),
            vx: 0, // NO DRIFT
            vy: 0,
            rotation: (Math.random() - 0.5) * 15 // Subtle static tilt
        });

        setTiles(prev => [...prev, { id, char }]);
    }, [language]);

    const startGame = () => {
        if (!boardRef.current) return;
        const rect = boardRef.current.getBoundingClientRect();
        boardSize.current = { width: rect.width, height: rect.height };

        setGameState('PLAYING');
        setWordsBuilt(0);
        setRailLetters([]);
        setPickedTileId(null);
        simulationData.current.clear();
        tileElements.current.clear();

        const ids: LetterTileData[] = [];
        for (let i = 0; i < 8; i++) {
            const id = crypto.randomUUID();
            const char = getRandomChar(language);
            simulationData.current.set(id, {
                x: rect.width * 0.2 + Math.random() * (rect.width * 0.6) + (i * 2),
                y: rect.height * 0.2 + Math.random() * (rect.height * 0.6) + (i * 2),
                vx: 0, // NO DRIFT
                vy: 0,
                rotation: (Math.random() - 0.5) * 15
            });
            ids.push({ id, char });
        }
        setTiles(ids);
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

            // Onboarding dismissal on first success
            if (showOnboarding) {
                setShowOnboarding(false);
                localStorage.setItem('taren:kids:letter-lab:onboardDismissed', '1');
            }

            setTimeout(() => {
                setRailLetters([]);
                setStatusMessage({ text: '', type: null });
                for (let i = 0; i < currentWord.length; i++) spawnTile();
            }, 800);
        } else {
            // Invalid word feedback
            setStatusMessage({ text: 'NOT A WORD', type: 'error' });
            setTimeout(() => setStatusMessage({ text: '', type: null }), 1000);
        }
    }, [railLetters, language, customWords, bestSession, spawnTile, showOnboarding]);

    const handlePickTile = (id: string) => {
        setPickedTileId(prev => prev === id ? null : id);

        // Onboarding dismissal on first pick
        if (showOnboarding && !pickedTileId) {
            // We don't dismiss yet, maybe after placement is better
        }
    };

    const handleRailClick = () => {
        if (!pickedTileId) return;

        const tile = tiles.find(t => t.id === pickedTileId);
        if (tile) {
            setRailLetters(prev => [...prev, tile]);
            setTiles(prev => prev.filter(t => t.id !== pickedTileId));
            simulationData.current.delete(pickedTileId);
            tileElements.current.delete(pickedTileId);
            setPickedTileId(null);

            // Onboarding dismissal on first placement
            if (showOnboarding) {
                setShowOnboarding(false);
                localStorage.setItem('taren:kids:letter-lab:onboardDismissed', '1');
            }
        }
    };

    const removeFromRail = (index: number) => {
        const tile = railLetters[index];
        setRailLetters(prev => prev.filter((_, i) => i !== index));

        const id = tile.id;
        const { width, height } = boardSize.current;
        simulationData.current.set(id, {
            x: width / 2 + (Math.random() - 0.5) * 100,
            y: height / 3 + (Math.random() - 0.5) * 100,
            vx: 0,
            vy: 0,
            rotation: (Math.random() - 0.5) * 10
        });
        setTiles(prev => [...prev, tile]);
    };

    // 4. PARENT MODE
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

    // 5. RENDER
    return (
        <div className="relative flex h-[calc(100vh-64px)] w-full overflow-hidden bg-background text-foreground select-none">
            {/* LEFT Panel (Scoreboard) */}
            <aside className="w-64 border-r border-foreground/5 bg-foreground/[0.02] flex flex-col p-8 pt-20 z-20">
                <div className="mb-12">
                    <h3 className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] mb-4">{t.wordsBuilt}</h3>
                    <div className="text-5xl font-mono font-bold tabular-nums text-foreground" key={wordsBuilt}>
                        {wordsBuilt.toString().padStart(3, '0')}
                    </div>
                </div>
                <div className="mt-auto pt-8 border-t border-foreground/5">
                    <h3 className="text-[10px] font-bold text-foreground/20 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                        <Trophy className="h-3 w-3" /> {t.bestSession}
                    </h3>
                    <div className="text-xl font-mono font-bold text-foreground/30">
                        {bestSession.toString().padStart(3, '0')}
                    </div>
                </div>
            </aside>

            {/* CENTER Board Area (Constrained like Hexline) */}
            <main className="flex-1 relative flex items-center justify-center p-4 lg:p-8 overflow-hidden z-10">
                <div
                    ref={boardRef}
                    className="relative w-full h-full max-w-[900px] max-h-[560px] aspect-[16/10] bg-foreground/[0.01] rounded-3xl border border-foreground/5 shadow-2xl overflow-hidden"
                >
                    {/* Status Message Overlay (Centered in Board) */}
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
                        {statusMessage.text && (
                            <div className={`px-6 py-2 rounded-full text-xs font-black tracking-[0.4em] uppercase shadow-2xl animate-in zoom-in slide-in-from-top-4 duration-300 ${statusMessage.type === 'success' ? 'bg-accent text-background border-glow' : 'bg-red-500/90 text-white animate-shake'
                                }`}>
                                {statusMessage.text === 'LOCKED' ? t.locked : statusMessage.text === 'NOT A WORD' ? t.notAWord : statusMessage.text}
                            </div>
                        )}
                    </div>

                    <div className="h-full flex flex-col items-center p-8">
                        {/* Rail Area */}
                        <div className="mt-4 w-full max-w-xl text-center">
                            {/* Goal Header */}
                            <div className="mb-4">
                                <h2 className="text-[10px] font-black tracking-[0.4em] uppercase text-foreground/40 mb-1">{t.buildWordTitle}</h2>
                                <p className="text-[9px] font-bold tracking-[0.1em] text-foreground/20 uppercase italic">
                                    {pickedTileId ? (language === 'EN' ? 'Tap the rail to drop' : 'Tryck på raden för att släppa') : t.hint}
                                </p>
                            </div>

                            <button
                                onClick={handleRailClick}
                                className={`w-full h-24 flex items-center justify-center gap-2 border-b-2 border-foreground/5 relative group/rail transition-colors ${pickedTileId ? 'border-accent/40 bg-accent/[0.02]' : 'hover:bg-foreground/[0.01]'}`}
                            >
                                {railLetters.length === 0 && !pickedTileId && (
                                    <span className="text-[10px] font-bold text-foreground/5 uppercase tracking-[0.6em] group-hover/rail:text-foreground/10 transition-colors">
                                        {t.emptyRail}
                                    </span>
                                )}
                                {railLetters.map((tile, i) => (
                                    <div
                                        key={`${tile.id}-${i}`}
                                        onClick={(e) => { e.stopPropagation(); removeFromRail(i); }}
                                        className="w-14 h-14 rounded-xl bg-foreground text-background font-mono text-2xl font-bold flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 animate-in slide-in-from-bottom-2"
                                    >
                                        {tile.char}
                                    </div>
                                ))}
                                {/* Ghost Slot */}
                                {pickedTileId && (
                                    <div className="w-14 h-14 rounded-xl border-2 border-dashed border-accent/40 flex items-center justify-center font-mono text-2xl font-bold text-accent/40 animate-pulse">
                                        {tiles.find(t => t.id === pickedTileId)?.char}
                                    </div>
                                )}
                                <div className={`absolute -bottom-1 left-0 right-0 h-1 transition-colors ${pickedTileId ? 'bg-accent' : 'bg-foreground/5'}`} />
                            </button>

                            {/* Current Word Preview */}
                            <div className="mt-4 h-4 flex items-center justify-center gap-4 text-[10px] font-black tracking-[0.4em] uppercase">
                                {railLetters.length > 0 && (
                                    <>
                                        <span className="text-foreground/20">{t.currentWord}</span>
                                        <span className="text-foreground/60">{railLetters.map(t => t.char).join(' ')}</span>
                                        <button
                                            onClick={validateWord}
                                            className="ml-4 px-4 py-1 rounded-full bg-foreground/5 hover:bg-accent hover:text-background transition-all text-[8px] tracking-[0.2em]"
                                        >
                                            {t.checkWord}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Play Board */}
                        <div className="flex-1 w-full relative mt-8">
                            {tiles.map(tile => (
                                <button
                                    key={tile.id}
                                    ref={el => { if (el) tileElements.current.set(tile.id, el); }}
                                    onClick={() => handlePickTile(tile.id)}
                                    className={`letter-tile absolute w-14 h-14 rounded-2xl flex items-center justify-center font-mono text-2xl font-black transition-all duration-300 ${pickedTileId === tile.id
                                        ? 'bg-accent text-background scale-125 z-50 shadow-[0_0_30px_rgba(255,165,0,0.4)] ring-4 ring-accent/20 rotate-0'
                                        : 'bg-foreground/[0.05] text-foreground/60 border border-foreground/10 hover:bg-foreground/[0.08] hover:text-foreground active:scale-95'
                                        }`}
                                >
                                    {tile.char}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Start Overlay */}
                    {gameState === 'IDLE' && (
                        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-500">
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
                                        {t.tapToStart}
                                    </p>
                                </div>
                            </button>
                        </div>
                    )}

                    {/* Onboarding Overlay (Subtle) */}
                    {gameState === 'PLAYING' && showOnboarding && (
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                            <div className="bg-foreground/5 backdrop-blur-xl border border-foreground/10 rounded-2xl p-6 shadow-2xl flex items-center gap-6">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="p-3 rounded-full bg-accent/10 text-accent">
                                        <MousePointer2 className="h-5 w-5" />
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/40">{t.helpPick}</span>
                                </div>
                                <div className="h-4 w-px bg-foreground/10" />
                                <div className="flex flex-col items-center gap-2">
                                    <div className="p-3 rounded-full bg-purple-500/10 text-purple-500">
                                        <Sparkles className="h-5 w-5" />
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/40">{t.helpBuild}</span>
                                </div>
                                <div className="ml-4 max-w-[120px]">
                                    <p className="text-[10px] font-medium leading-relaxed text-foreground/60 italic">
                                        "{t.helpText}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* RIGHT Panel (Controls) */}
            <aside className="w-64 border-l border-foreground/5 bg-foreground/[0.02] flex flex-col p-8 pt-20 z-20">
                <div className="mb-12">
                    <h3 className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Settings className="h-3 w-3" /> {t.controls}
                    </h3>
                    <ul className="space-y-3 text-[10px] font-medium text-foreground/60 tracking-wider">
                        <li className="flex items-center gap-2"><Check className="h-3 w-3 text-accent" /> {t.c1}</li>
                        <li className="flex items-center gap-2"><Check className="h-3 w-3 text-accent" /> {t.c2}</li>
                        <li className="flex items-center gap-2"><Check className="h-3 w-3 text-accent" /> {t.c3}</li>
                    </ul>
                </div>

                <div className="mb-12">
                    <h3 className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        {t.rules}
                    </h3>
                    <p className="text-[10px] italic leading-relaxed text-foreground/30">
                        {t.r1}
                    </p>
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
                                    className={`flex-1 py-2 rounded border text-[10px] font-bold transition-all ${language === lang
                                            ? 'border-accent bg-accent/5 text-accent'
                                            : 'border-foreground/10 text-foreground/30 hover:border-foreground/20'
                                        }`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={openParentCheck}
                        className="w-full py-3 rounded-lg border border-foreground/5 bg-foreground/[0.05] hover:bg-foreground/[0.08] transition-all flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/40 hover:text-foreground"
                    >
                        <Lock className="h-3 w-3" /> {t.parentMode}
                    </button>

                    <Link
                        to="/kids"
                        className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/20 hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-3 w-3" /> {t.exit}
                    </Link>
                </div>
            </aside>

            {/* Overlays */}
            {showParentCheck && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className={`p-12 text-center transition-transform ${parentCheckError ? 'animate-shake' : ''}`}>
                        <h3 className="text-sm font-bold tracking-[0.4em] uppercase mb-8 text-foreground/40">{t.parentCheck}</h3>
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
                            {t.cancel}
                        </button>
                    </div>
                </div>
            )}

            {showParentPanel && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-background/98 backdrop-blur-2xl animate-in zoom-in duration-500">
                    <div className="max-w-xl w-full p-12 overflow-y-auto max-h-[80vh]">
                        <div className="flex items-center justify-between mb-12">
                            <h3 className="text-sm font-black tracking-[0.4em] uppercase">{t.parentTitle}</h3>
                            <button onClick={() => setShowParentPanel(false)}>
                                <X className="h-5 w-5 text-foreground/40 hover:text-foreground" />
                            </button>
                        </div>

                        {/* Language */}
                        <section className="mb-12">
                            <h4 className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-6">{t.activeLang}</h4>
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
                            <h4 className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-6">{t.customWords} ({language})</h4>
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
                                    <p className="text-[10px] italic text-foreground/20">{language === 'EN' ? 'No custom words added.' : 'Inga egna ord tillagda.'}</p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    id="addWordInput"
                                    type="text"
                                    placeholder={t.addWord}
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
                                    {t.add}
                                </button>
                            </div>
                        </section>

                        <div className="text-[10px] leading-relaxed text-foreground/20 italic">
                            {t.parentHint}
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
                .animate-shake {
                    animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
                }
                .border-glow {
                    box-shadow: 0 0 20px rgba(255,165,0,0.4);
                }
            `}</style>
        </div>
    );
};
