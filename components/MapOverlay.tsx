'use client';

import { useMemo } from 'react';
import { Grid, BoundaryType } from '@/lib/types';
import { ROOM_DEFINITIONS } from '@/lib/roomConfig';
import { useGameStore } from '@/lib/store';

interface MapOverlayProps {
    grid: Grid;
    playerPos: { x: number; y: number };
}

export function MapOverlay({ grid, playerPos }: MapOverlayProps) {
    const { setShowMap } = useGameStore();

    // Calculate grid layout
    const cells = useMemo(() => {
        const rows = [];
        // Map grid is y=0 at bottom (south), y=height-1 at top (north)
        // But for display we typically want North at top
        for (let y = grid.height - 1; y >= 0; y--) {
            const row = [];
            for (let x = 0; x < grid.width; x++) {
                row.push(grid.cells[y][x]);
            }
            rows.push(row);
        }
        return rows;
    }, [grid]);

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl aspect-[7/10] bg-zinc-900 border-2 border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-black/20">
                    <h2 className="text-xl font-black text-red-600 uppercase tracking-tighter italic">
                        Planimetria Edificio
                    </h2>
                    <button
                        onClick={() => setShowMap(false)}
                        className="text-zinc-500 hover:text-white font-mono text-sm tracking-widest uppercase border border-zinc-800 px-3 py-1 rounded transition-colors"
                    >
                        Chiudi [ESC / M]
                    </button>
                </div>

                {/* Grid Container */}
                <div className="flex-1 p-4 flex items-center justify-center overflow-auto">
                    <div
                        className="grid gap-1"
                        style={{
                            gridTemplateColumns: `repeat(${grid.width}, 1fr)`,
                            width: '100%',
                            maxWidth: '500px'
                        }}
                    >
                        {cells.flat().map((room, i) => {
                            const gridX = i % grid.width;
                            const gridY = grid.height - 1 - Math.floor(i / grid.width);
                            const isPlayer = playerPos.x === gridX && playerPos.y === gridY;

                            if (!room) {
                                return <div key={i} className="aspect-square bg-transparent" />;
                            }

                            const def = ROOM_DEFINITIONS[room.type] || ROOM_DEFINITIONS.NORMAL;

                            return (
                                <div
                                    key={room.id}
                                    className={`relative aspect-square transition-all duration-300 flex flex-col items-center justify-center group overflow-hidden ${isPlayer ? 'ring-2 ring-white/50 scale-105 z-10 shadow-lg shadow-white/20' : ''
                                        }`}
                                    style={{
                                        backgroundColor: def.color,
                                        borderTop: room.n === BoundaryType.WALL ? '2px solid rgba(0,0,0,0.8)' : room.n === BoundaryType.DOOR ? '2px dashed rgba(255,255,255,0.3)' : 'none',
                                        borderBottom: room.s === BoundaryType.WALL ? '2px solid rgba(0,0,0,0.8)' : room.s === BoundaryType.DOOR ? '2px dashed rgba(255,255,255,0.3)' : 'none',
                                        borderRight: room.e === BoundaryType.WALL ? '2px solid rgba(0,0,0,0.8)' : room.e === BoundaryType.DOOR ? '2px dashed rgba(255,255,255,0.3)' : 'none',
                                        borderLeft: room.w === BoundaryType.WALL ? '2px solid rgba(0,0,0,0.8)' : room.w === BoundaryType.DOOR ? '2px dashed rgba(255,255,255,0.3)' : 'none',
                                    }}
                                >
                                    {/* Scanline Effect */}
                                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%] opacity-20" />

                                    {/* Player Marker - Enhanced Pulsing Circle */}
                                    {isPlayer && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="w-4 h-4 bg-white/40 rounded-full animate-ping absolute" />
                                            <div className="w-3 h-3 border-2 border-white rounded-full animate-pulse absolute" />
                                            <div className="w-1.5 h-1.5 bg-white rounded-full absolute shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                                        </div>
                                    )}

                                    {/* Hover info */}
                                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <span className="text-[8px] font-mono text-white tracking-widest uppercase">
                                            {room.type}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Legend */}
                <div className="p-4 border-t border-zinc-800 bg-black/40 flex flex-wrap gap-4 justify-center text-[10px] font-mono uppercase tracking-widest italic">
                    <div className="flex items-center gap-2">
                        <div className="relative w-4 h-4 flex items-center justify-center">
                            <div className="w-full h-full bg-white/30 rounded-full animate-ping absolute" />
                            <div className="w-2 h-2 bg-white rounded-full relative" />
                        </div>
                        <span className="text-white">Posizione Corrente</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-dashed border-white/30" />
                        <span className="text-zinc-400">Porta / Corridoio</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-black/80" />
                        <span className="text-zinc-400">Muro Solido</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
