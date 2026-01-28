'use client';

import { useProgress } from '@react-three/drei';
import { useEffect, useState } from 'react';

export function LoadingScreen() {
    const { progress, active } = useProgress();
    const [visible, setVisible] = useState(true);

    // Keep visible for a tiny bit after active becomes false to avoid jarring transition
    useEffect(() => {
        if (!active) {
            const timer = setTimeout(() => {
                setVisible(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [active]);

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 transition-opacity duration-500">
            {/* Dark industrial background detail */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,_#ffffff11_0%,_transparent_70%)]" />
                <div className="absolute top-0 left-0 w-full h-px bg-white/20" />
                <div className="absolute bottom-0 left-0 w-full h-px bg-white/20" />
            </div>

            <div className="max-w-md w-full space-y-8 relative">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-600 animate-pulse" />
                    <h2 className="text-zinc-500 font-mono text-sm tracking-[0.3em] uppercase">
                        Syncing_Dimension
                    </h2>
                </div>

                {/* Main Progress Area */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <span className="text-white font-black text-5xl tracking-tighter uppercase italic">
                            Loading
                        </span>
                        <span className="text-red-600 font-mono text-xl font-bold">
                            {Math.round(progress)}%
                        </span>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="relative h-1 w-full bg-zinc-900 overflow-hidden">
                        {/* Shimmer effect */}
                        <div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent animate-shimmer"
                            style={{ backgroundSize: '200% 100%' }}
                        />
                        {/* Actual Bar */}
                        <div
                            className="absolute top-0 left-0 h-full bg-red-600 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Status Log */}
                <div className="font-mono text-[10px] text-zinc-600 space-y-1">
                    <p>{active ? 'FETCHING_ASSETS...' : 'STABILIZING_GRID...'}</p>
                    <p className="opacity-50">LOCATION: BUILDING_C_ZONE_{Math.floor(progress / 10)}</p>
                </div>
            </div>

            {/* Rotating system detail */}
            <div className="absolute bottom-12 right-12 w-12 h-12 border border-zinc-900 flex items-center justify-center">
                <div className="w-6 h-6 border-t border-r border-red-900 rounded-full animate-spin" />
            </div>
        </div>
    );
}
