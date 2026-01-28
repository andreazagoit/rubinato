'use client';

import { useState } from "react";
import { GameLevel } from "@/components/GameLevel";
import Link from "next/link";
import Image from "next/image";
import coverImg from "./cover.png";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BackgroundMusic } from "@/components/BackgroundMusic";
import { useGameStore } from "@/lib/store";
import { SettingsPopup } from "@/components/SettingsPopup";

import { KeyboardControls } from "@react-three/drei";

const KEY_MAP = [
    { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
    { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
    { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
    { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
    { name: 'interact', keys: ['e', 'E'] },
    { name: 'map', keys: ['m', 'M'] },
];

export default function Page() {
    const [view, setView] = useState<'MENU' | 'GAME'>('MENU');
    const { activePopup, setActivePopup, resetGameState } = useGameStore();

    return (
        <ErrorBoundary>
            <BackgroundMusic />

            {activePopup === 'settings' && <SettingsPopup />}

            {view === 'GAME' && (
                <KeyboardControls map={KEY_MAP}>
                    <GameLevel onBackToMenu={() => setView('MENU')} />
                </KeyboardControls>
            )}

            {view === 'MENU' && (
                <div className="relative w-full h-screen overflow-hidden bg-black text-white font-sans selection:bg-red-500/30">
                    {/* Background Cover Image */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src={coverImg}
                            alt="Antigravity Cover"
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-transparent to-transparent" />
                    </div>

                    {/* Buttons - Responsive Position */}
                    {/* Mobile: Bottom Center. Desktop: Right Center */}
                    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 md:bottom-auto md:top-1/2 md:left-auto md:right-24 md:translate-x-0 md:-translate-y-1/2 w-full max-w-sm flex flex-col gap-4 z-10 px-6 md:px-0">
                        <button
                            onClick={() => {
                                resetGameState();
                                setView('GAME');
                            }}
                            className="w-full py-5 bg-red-600 text-white text-xl font-black uppercase tracking-widest hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-900/50 clip-path-button text-center md:text-right md:pr-8"
                        >
                            Inizia Gioco
                        </button>

                        <button
                            onClick={() => setActivePopup('settings')}
                            className="w-full py-4 border-2 md:border-2 md:border-r-4 md:border-transparent md:border-l-0 border-white/20 text-white/80 font-black uppercase tracking-widest hover:border-white hover:text-white hover:bg-white/10 md:hover:border-red-600 md:hover:bg-black/50 transition-all backdrop-blur-sm text-center md:text-right md:pr-6"
                        >
                            Impostazioni
                        </button>
                    </div>

                    {/* Version/System Info - Bottom Right (Desktop) / Bottom Center (Mobile) */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 md:left-auto md:right-12 md:translate-x-0 text-[10px] font-mono text-zinc-500 z-10 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                        SYSTEM_7x7_STABLE
                    </div>
                </div>
            )}
        </ErrorBoundary>
    );
}