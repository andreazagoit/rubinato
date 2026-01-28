'use client';

import { useState } from "react";
import { GameLevel } from "@/components/GameLevel";
import Link from "next/link";
import Image from "next/image";
import coverImg from "./cover.png";

export default function Page() {
    const [view, setView] = useState<'MENU' | 'GAME' | 'MAP'>('MENU');

    if (view === 'MAP') {
        return <GameLevel mode="ORBIT" onBackToMenu={() => setView('MENU')} />;
    }

    if (view === 'GAME') {
        return <GameLevel mode="FPS" onBackToMenu={() => setView('MENU')} />;
    }

    return (
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

            {/* Title - Top Center (Removed) */}

            {/* Buttons - Right Side Centered */}
            <div className="absolute top-1/2 right-12 md:right-24 -translate-y-1/2 w-full max-w-sm flex flex-col gap-4 z-10">
                <button
                    onClick={() => setView('GAME')}
                    className="w-full py-5 bg-red-600 text-white text-xl font-black uppercase tracking-widest hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-900/50 clip-path-button text-right pr-8"
                >
                    Inizia Gioco
                </button>

                <button
                    onClick={() => setView('MAP')}
                    className="w-full py-4 border-r-4 border-transparent text-white/80 font-black uppercase tracking-widest hover:border-red-600 hover:text-white hover:bg-black/50 transition-all backdrop-blur-sm text-right pr-6"
                >
                    Vedi Mappa
                </button>
            </div>

        </div>
    );
}