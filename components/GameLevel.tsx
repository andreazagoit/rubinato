'use client';

import { Canvas } from '@react-three/fiber';
import { useKeyboardControls, useTexture } from '@react-three/drei';
import { MapOverlay } from './MapOverlay';
import { useEffect, useState, useMemo, useCallback, useRef, Suspense } from 'react';
import { MapGenerator } from '@/lib/mapGenerator';
import { useGameStore } from '@/lib/store';
import { SettingsPopup } from './SettingsPopup';
import { Grid, Room, RoomType } from '@/lib/types';
import { RoomView } from './RoomView';
import { Player } from './Player';
import { Popup } from './Popup';
import { MobileControls } from './MobileControls';
import { LoadingScreen } from './LoadingScreen';
import { JumpscareOverlay } from './JumpscareOverlay';
import { NearestFilter, RepeatWrapping, Texture as ThreeTexture } from 'three';
import { Texture, ROOM_DEFINITIONS } from '@/lib/roomConfig';

interface GameLevelProps {
    onBackToMenu?: () => void;
    onGameEnd: (result: 'win' | 'lose') => void;
}

const CELL_SIZE = 10;
const CULL_RADIUS = 3; // Render rooms within 3 cells of the player

export function GameLevel({ onBackToMenu, onGameEnd }: GameLevelProps) {
    const [grid, setGrid] = useState<Grid | null>(null);
    const [error, setError] = useState<string | null>(null);

    const {
        isPaused, setPaused,
        activePopup, setActivePopup,
        isJumpscareActive, setJumpscareActive,
        showMap, setShowMap
    } = useGameStore();

    const [playerGridPos, setPlayerGridPos] = useState<{ x: number; y: number }>({ x: 3, y: 0 });
    const [collectedFolders, setCollectedFolders] = useState<Set<string>>(new Set());
    const [startPos, setStartPos] = useState<[number, number, number] | undefined>(undefined);
    const [timeLeft, setTimeLeft] = useState(60); // 1 minute in seconds

    // Countdown Timer Logic
    useEffect(() => {
        if (isPaused || !!activePopup || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [isPaused, activePopup, timeLeft]);

    // Format time for HUD
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Mobile States
    const [isMobile] = useState(() => {
        if (typeof window === 'undefined') return false;
        return ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    });
    const mobileInput = useRef({
        move: { x: 0, y: 0 },
        look: { x: 0, y: 0 }
    });

    // Handle folder collection
    const handleCollectFolder = useCallback((roomId: string) => {
        setCollectedFolders(prev => {
            const next = new Set(prev);
            if (!next.has(roomId)) {
                next.add(roomId);
                console.log(`Collected folder in room ${roomId}. Total: ${next.size}`);
            }
            return next;
        });

        setGrid(prev => {
            if (!prev) return null;
            const newCells = prev.cells.map(row =>
                row.map(room => {
                    if (room && room.id === roomId) {
                        return { ...room, items: room.items.filter(i => i !== 'red_folder') };
                    }
                    return room;
                })
            );
            return { ...prev, cells: newCells };
        });
    }, []);

    // Effect to check for win condition
    useEffect(() => {
        if (collectedFolders.size === 3) {
            onGameEnd('win');
        }
    }, [collectedFolders.size, onGameEnd]);

    useEffect(() => {
        try {
            const generator = new MapGenerator();
            const g = generator.generate();
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setGrid(g);
            let sx = 3, sy = 0;
            for (let y = 0; y < g.height; y++) {
                for (let x = 0; x < g.width; x++) {
                    if (g.cells[y][x]?.type === RoomType.START) {
                        sx = x; sy = y;
                    }
                }
            }
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPlayerGridPos({ x: sx, y: sy });
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setStartPos([sx * CELL_SIZE, 1.7, -sy * CELL_SIZE]);

        } catch (e: unknown) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setError(e instanceof Error ? e.message : "Unknown error");
        }
    }, [setGrid, setPlayerGridPos, setStartPos, setError]);

    const handlePositionChange = useCallback((pos: { x: number; y: number; z: number }) => {
        const gridX = Math.round(pos.x / CELL_SIZE);
        const gridY = Math.round(-pos.z / CELL_SIZE);

        setPlayerGridPos(prev => {
            if (prev.x !== gridX || prev.y !== gridY) {
                return { x: gridX, y: gridY };
            }
            return prev;
        });
    }, []);

    const allRooms = useMemo(() => {
        if (!grid) return [];
        return grid.cells.flat().filter(r => r !== null) as Room[];
    }, [grid]);

    // Proximity Culling Logic
    const visibleRooms = useMemo(() => {
        return allRooms.filter(room => {
            const dx = Math.abs(room.coordinates.x - playerGridPos.x);
            const dy = Math.abs(room.coordinates.y - playerGridPos.y);
            return dx <= CULL_RADIUS && dy <= CULL_RADIUS;
        });
    }, [allRooms, playerGridPos]);

    // Handle Jumpscare and Fail sequence
    const hasTriggeredEnd = useRef(false);
    useEffect(() => {
        if (timeLeft === 0 && activePopup !== 'fail' && !hasTriggeredEnd.current) {
            hasTriggeredEnd.current = true;
            const sequence = async () => {
                // 1. Play sound immediately (1s before image)
                const thunder = new Audio('/thunder.mp3');
                thunder.volume = 1.0;
                thunder.play().catch(() => { });

                // 2. Wait 1 second (suspense)
                await new Promise(r => setTimeout(r, 1000));

                // 3. Jumpscare Image (0.5 seconds)
                setJumpscareActive(true);
                await new Promise(r => setTimeout(r, 500));
                setJumpscareActive(false);

                // 4. Final black screen delay (0.5 seconds)
                await new Promise(r => setTimeout(r, 500));

                // 5. Trigger Game End - LOSE
                onGameEnd('lose');
            };
            sequence();
        }
    }, [timeLeft, setJumpscareActive, activePopup, onGameEnd]);

    useEffect(() => {
        if ((activePopup || isPaused) && typeof document !== 'undefined' && document.exitPointerLock) {
            document.exitPointerLock();
        }
    }, [activePopup, isPaused]);

    const [sub] = useKeyboardControls();

    useEffect(() => {
        return sub(
            (state: { map?: boolean }) => !!state.map,
            (pressed: boolean) => {
                if (pressed && !activePopup && !isPaused) {
                    setShowMap(!showMap);
                }
            }
        );
    }, [showMap, setShowMap, sub, activePopup, isPaused]);

    const resumeGame = useCallback(() => {
        setActivePopup(null);
        setPaused(false);
        setShowMap(false);
        const canvas = document.querySelector('canvas');
        if (canvas && canvas.requestPointerLock) {
            canvas.requestPointerLock();
        }
    }, [setActivePopup, setPaused, setShowMap]);

    if (error) {
        return <div className="text-red-500 font-bold p-10 font-mono tracking-tighter uppercase underline decoration-double">
            SYSTEM_FLAW: {error}
        </div>;
    }

    if (!grid || !startPos) {
        return <div className="text-white p-10 font-mono animate-pulse">GENERATING_LUNACY...</div>;
    }

    return (
        <div className="w-full h-screen bg-black overflow-hidden relative">
            <LoadingScreen />

            <Canvas shadows>
                <Suspense fallback={null}>
                    <GameContent
                        startPos={startPos}
                        isPaused={isPaused || !!activePopup || showMap}
                        setPaused={setPaused}
                        handlePositionChange={handlePositionChange}
                        mobileInput={mobileInput}
                        grid={grid}
                        visibleRooms={visibleRooms}
                        handleCollectFolder={handleCollectFolder}
                    />
                </Suspense>
            </Canvas>

            {/* HUD */}
            {!activePopup && !isPaused && (
                <div className="absolute top-4 left-4 md:top-10 md:left-10 flex flex-col gap-4 z-30">
                    <div className="text-white font-mono bg-black/40 p-4 border-l-4 border-red-600 backdrop-blur-sm animate-pulse">
                        <div className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Cartelline Raccolte</div>
                        <div className="text-3xl font-black flex items-center gap-2">
                            <span className="text-red-500">{collectedFolders.size}</span>
                            <span className="text-zinc-600">/</span>
                            <span>3</span>
                        </div>
                    </div>

                    <div
                        className="text-white font-mono bg-black/40 p-4 border-l-4 border-yellow-500 backdrop-blur-sm"
                        style={{
                            opacity: Math.max(0, Math.min(1, (timeLeft - 30) / 10)),
                            transition: 'opacity 1s linear'
                        }}
                    >
                        <div className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Tempo Rimanente</div>
                        <div className="text-4xl font-black text-yellow-500">{formatTime(timeLeft)}</div>
                    </div>
                </div>
            )}

            {!activePopup && !isPaused && !isMobile && (
                <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-difference z-20" />
            )}

            {isPaused && !activePopup && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-50">
                    <div className="text-center space-y-8 animate-in fade-in zoom-in duration-300">
                        <h2 className="text-6xl font-black text-red-600 tracking-tighter uppercase italic">PAUSED</h2>
                        <div className="flex flex-col gap-4">
                            <button onClick={resumeGame} className="px-12 py-4 bg-zinc-100 text-black font-black uppercase hover:bg-white transition-colors tracking-widest text-lg">Resume</button>
                            <button onClick={onBackToMenu} className="px-12 py-4 border-2 border-zinc-500 text-zinc-500 font-black uppercase hover:border-white hover:text-white transition-all tracking-widest">Back to Menu</button>
                        </div>
                    </div>
                </div>
            )}

            {showMap && grid && <MapOverlay grid={grid} playerPos={playerGridPos} />}
            {activePopup === 'settings' && <SettingsPopup />}
            {isJumpscareActive && <JumpscareOverlay />}

            {activePopup === 'intro' && (
                <Popup
                    title="Missione: Er progetto cartellina rossa "
                    text="La cavallona ha rivelato il tradimento con Grace a David. Devi correre nello studio a cercare le cartelline rosse che ha su di te prima che ti distrugga"
                    buttonText="Continua"
                    onClose={resumeGame}
                    onButtonClick={resumeGame}
                    isClosable={true}
                />
            )}

            {activePopup === 'fail' && (
                <Popup
                    title="SEI STATO RUBINATO"
                    text="Hai esaurito il tempo. David ti ha trovato e non ha avuto pietà."
                    buttonText="Riprova"
                    onButtonClick={() => window.location.reload()}
                    isClosable={false}
                />
            )}

            {activePopup === 'end' && (
                <Popup
                    title="MISSIONE COMPIUTA"
                    text="Per ora sei salvo, ma adesso inizia la fuga. C'é solo una certezza. gli squali stanno arrivà!"
                    buttonText="Torna al Menu"
                    onButtonClick={onBackToMenu}
                    isClosable={false}
                />
            )}

            {isMobile && !isPaused && !activePopup && (
                <MobileControls
                    onMove={(x, y) => { mobileInput.current.move = { x, y }; }}
                    onLook={(dx, dy) => { mobileInput.current.look.x += dx; mobileInput.current.look.y += dy; }}
                    onInteract={() => {
                        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e', code: 'KeyE' }));
                        setTimeout(() => window.dispatchEvent(new KeyboardEvent('keyup', { key: 'e', code: 'KeyE' })), 100);
                    }}
                />
            )}

            <div className="hidden portrait:flex md:hidden fixed inset-0 z-[60] bg-black items-center justify-center flex-col gap-6 text-center p-8">
                <div className="w-16 h-16 border-4 border-red-600 rounded-lg animate-pulse rotate-90 flex items-center justify-center">
                    <div className="w-1 h-12 bg-red-600/50" />
                </div>
                <h2 className="text-red-600 font-black text-3xl uppercase tracking-widest">Ruota il Dispositivo</h2>
                <p className="text-zinc-400 font-mono text-sm">L&apos;esperienza richiede la visuale orizzontale.</p>
            </div>
        </div>
    );
}

// Sub-component to handle texture loading and 3D content
function GameContent({
    startPos, isPaused, setPaused, handlePositionChange, mobileInput,
    grid, visibleRooms, handleCollectFolder
}: {
    startPos: [number, number, number] | undefined;
    isPaused: boolean;
    setPaused: (p: boolean) => void;
    handlePositionChange: (p: { x: number, y: number, z: number }) => void;
    mobileInput: React.MutableRefObject<{
        move: { x: number, y: number },
        look: { x: number, y: number }
    }>;
    grid: Grid | null;
    visibleRooms: Room[];
    handleCollectFolder: (id: string) => void;
}) {
    const textures = useTexture({
        [Texture.FLOOR_WOOD_DARK]: Texture.FLOOR_WOOD_DARK,
        [Texture.FLOOR_ASPHALT]: Texture.FLOOR_ASPHALT,
        [Texture.WALL_CONCRETE_DARK]: Texture.WALL_CONCRETE_DARK,
        [Texture.WALL_CONCRETE_PANEL]: Texture.WALL_CONCRETE_PANEL,
        [Texture.WALL_BRUTALIST_DARK]: Texture.WALL_BRUTALIST_DARK,
        [Texture.CEILING_CONCRETE_DARK]: Texture.CEILING_CONCRETE_DARK,
        [Texture.CEILING_INDUSTRIAL_DARK]: Texture.CEILING_INDUSTRIAL_DARK
    });

    // Configure textures
    useMemo(() => {
        Object.values(textures).forEach(t => {
            if (t instanceof ThreeTexture) {
                t.magFilter = NearestFilter;
                t.minFilter = NearestFilter;
                t.wrapS = RepeatWrapping;
                t.wrapT = RepeatWrapping;
                t.repeat.set(4, 4);
            }
        });
    }, [textures]);

    return (
        <>
            <Player
                position={startPos}
                isPaused={isPaused}
                onLock={() => setPaused(false)}
                onUnlock={() => setPaused(true)}
                onPositionChange={({ x, y, z }: { x: number, y: number, z: number }) => handlePositionChange({ x, y, z })}
                mobileInput={mobileInput}
                grid={grid}
                cellSize={CELL_SIZE}
            />

            <ambientLight intensity={0.01} />
            <fog attach="fog" args={['#000000', 3, 20]} />

            <group>
                {visibleRooms.map((room: Room) => {
                    const style = ROOM_DEFINITIONS[room.type] || ROOM_DEFINITIONS.NORMAL;

                    const texMap = textures as Record<string, ThreeTexture>;
                    const roomTextures = {
                        floor: style.floor ? texMap[style.floor] : undefined,
                        wall: style.wall ? texMap[style.wall] : undefined,
                        ceiling: style.ceiling ? texMap[style.ceiling] : undefined
                    };

                    return (
                        <RoomView
                            key={room.id}
                            room={room}
                            cellSize={CELL_SIZE}
                            showCeiling={true}
                            onCollectFolder={handleCollectFolder}
                            textures={roomTextures}
                        />
                    );
                })}
            </group>

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[35, -0.2, -35]}>
                <planeGeometry args={[200, 200]} />
                <meshStandardMaterial color="#0a0a0a" />
            </mesh>
        </>
    );
}
