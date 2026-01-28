'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, KeyboardControls } from '@react-three/drei';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { MapGenerator } from '@/lib/mapGenerator';
import { Grid, Room, RoomType } from '@/lib/types';
import { RoomView } from './RoomView';
import { Player } from './Player';
import { Popup } from './Popup';

interface GameLevelProps {
    mode?: 'FPS' | 'ORBIT';
    onBackToMenu?: () => void;
}

const CELL_SIZE = 10;

type PopupType = 'intro' | 'end' | null;

export function GameLevel({ mode = 'FPS', onBackToMenu }: GameLevelProps) {
    const [grid, setGrid] = useState<Grid | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [playerGridPos, setPlayerGridPos] = useState<{ x: number; y: number }>({ x: 3, y: 0 });
    const [collectedFolders, setCollectedFolders] = useState<Set<string>>(new Set());
    const [activePopup, setActivePopup] = useState<PopupType>('intro');

    const [startPos, setStartPos] = useState<[number, number, number] | null>(null);

    // Handle folder collection
    const handleCollectFolder = useCallback((roomId: string) => {
        setCollectedFolders(prev => {
            const next = new Set(prev);
            if (!next.has(roomId)) {
                next.add(roomId);
                console.log(`Collected folder in room ${roomId}. Total: ${next.size}`);
                if (next.size === 3) {
                    setActivePopup('end');
                }
            }
            return next;
        });

        // Update grid state to remove folder from room
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

    useEffect(() => {
        const generator = new MapGenerator();
        try {
            const g = generator.generate();
            setGrid(g);
            let sx = 3, sy = 0;
            for (let y = 0; y < g.height; y++) {
                for (let x = 0; x < g.width; x++) {
                    if (g.cells[y][x]?.type === RoomType.START) {
                        sx = x; sy = y;
                    }
                }
            }
            setPlayerGridPos({ x: sx, y: sy });
            // World Z is -y * CELL_SIZE. X is x * CELL_SIZE.
            setStartPos([sx * CELL_SIZE, 1.7, -sy * CELL_SIZE]);

        } catch (e: any) {
            setError(e.message);
        }
    }, []);

    // Handle player position change - convert world coords to grid coords
    const handlePositionChange = useCallback((pos: { x: number; y: number; z: number }) => {
        const gridX = Math.round(pos.x / CELL_SIZE);
        const gridY = Math.round(-pos.z / CELL_SIZE); // -Z is +Y in grid
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

    // Filter visible rooms: current room + adjacent rooms (max 5 rooms)
    const visibleRooms = useMemo(() => {
        if (mode === 'ORBIT') return allRooms; // Show all in map view

        return allRooms.filter(room => {
            const dx = Math.abs(room.coordinates.x - playerGridPos.x);
            const dy = Math.abs(room.coordinates.y - playerGridPos.y);
            // Current room or directly adjacent (N, S, E, W)
            return (dx === 0 && dy === 0) || (dx + dy === 1);
        });
    }, [allRooms, playerGridPos, mode]);

    // Force unlock pointer when popup or pause is active
    useEffect(() => {
        if (activePopup || isPaused) {
            document.exitPointerLock();
        }
    }, [activePopup, isPaused]);

    // Helper to resume game and request pointer lock
    const resumeGame = useCallback(() => {
        setActivePopup(null);
        setIsPaused(false);

        // Synchronous request to satisfy user gesture requirement
        const canvas = document.querySelector('canvas');
        if (canvas) {
            canvas.requestPointerLock();
        }
    }, []);

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
            <KeyboardControls
                map={[
                    { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
                    { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
                    { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
                    { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
                    { name: 'interact', keys: ['e', 'E'] },
                ]}
            >
                <Canvas shadows>
                    {mode === 'FPS' ? (
                        <Player
                            position={startPos}
                            isPaused={isPaused || !!activePopup}
                            onLock={() => setIsPaused(false)}
                            onUnlock={() => setIsPaused(true)}
                            onPositionChange={handlePositionChange}
                        />
                    ) : (
                        <>
                            <PerspectiveCamera makeDefault position={[35, 80, 40]} fov={50} />
                            <OrbitControls target={[35, 0, -35]} makeDefault />
                        </>
                    )}

                    {/* Horror atmosphere: almost pitch black, flashlight is the only light */}
                    <ambientLight intensity={mode === 'FPS' ? 0.01 : 1.2} />
                    {mode === 'ORBIT' && (
                        <directionalLight position={[10, 50, 20]} intensity={1.5} castShadow />
                    )}

                    {/* Fog for horror atmosphere in FPS mode */}
                    {mode === 'FPS' && <fog attach="fog" args={['#000000', 3, 20]} />}

                    <group>
                        {visibleRooms.map(room => (
                            <RoomView
                                key={room.id}
                                room={room}
                                cellSize={CELL_SIZE}
                                showCeiling={mode === 'FPS'}
                                onCollectFolder={handleCollectFolder}
                            />
                        ))}
                    </group>

                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[35, -0.2, -35]}>
                        <planeGeometry args={[200, 200]} />
                        <meshStandardMaterial color="#0a0a0a" />
                    </mesh>
                </Canvas>

                {/* Gameplay elements */}
                {mode === 'FPS' && !activePopup && !isPaused && (
                    <>
                        {/* Crosshair */}
                        <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-difference" />

                        {/* Folder Counter */}
                        <div className="absolute bottom-10 left-10 text-white font-mono bg-black/40 p-4 border-l-4 border-red-600 backdrop-blur-sm animate-pulse">
                            <div className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Cartelline Raccolte</div>
                            <div className="text-3xl font-black flex items-center gap-2">
                                <span className="text-red-500">{collectedFolders.size}</span>
                                <span className="text-zinc-600">/</span>
                                <span>3</span>
                            </div>
                        </div>
                    </>
                )}

                {/* Pause / Info UI */}
                {isPaused && mode === 'FPS' && !activePopup && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-50">
                        <div className="text-center space-y-8 animate-in fade-in zoom-in duration-300">
                            <h2 className="text-6xl font-black text-red-600 tracking-tighter uppercase italic">PAUSED</h2>
                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={resumeGame}
                                    className="px-12 py-4 bg-zinc-100 text-black font-black uppercase hover:bg-white transition-colors tracking-widest text-lg"
                                >
                                    Resume
                                </button>
                                <button
                                    onClick={onBackToMenu}
                                    className="px-12 py-4 border-2 border-zinc-500 text-zinc-500 font-black uppercase hover:border-white hover:text-white transition-all tracking-widest"
                                >
                                    Back to Menu
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </KeyboardControls>

            {/* Popups */}
            {activePopup === 'intro' && (
                <Popup
                    title="Missione: Recupero Dati"
                    text="Lui lo sa. David sa tutto. Ti intrufoli a casa sua per recuperare le cartelline prima di essere rubinato."
                    buttonText="Inizia Infiltrazione"
                    onClose={resumeGame}
                    onButtonClick={resumeGame}
                    isClosable={true}
                />
            )}

            {activePopup === 'end' && (
                <Popup
                    title="MISSIONE COMPIUTA"
                    text="Hai recuperato tutte le cartelline. Le prove sono nelle tue mani. Ora devi solo sparire nel nulla prima che se ne accorga."
                    buttonText="Torna al Menu"
                    onButtonClick={onBackToMenu}
                    isClosable={false}
                />
            )}

            {/* Static UI for non-FPS mode or debug info */}
            {mode === 'ORBIT' && (
                <div className="absolute top-5 left-5 text-white bg-black/80 p-6 border border-zinc-800 rounded shadow-2xl backdrop-blur-sm">
                    <h1 className="text-2xl font-black uppercase tracking-tighter text-red-600 mb-2">Architect View</h1>
                    <p className="text-zinc-400 text-sm mb-4">Observe the madness from safety.</p>
                    <div className="space-y-1 text-xs font-mono">
                        <div className="flex justify-between gap-4">
                            <span className="text-zinc-500">GRID_SIZE</span>
                            <span>7 x 7</span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-zinc-500">OBJECTIVES</span>
                            <span className="text-red-500">4 LOCATED</span>
                        </div>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 w-full py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition-colors uppercase text-xs"
                    >
                        Re-construct Map
                    </button>
                </div>
            )}
        </div>
    );
}
