'use client';

import { useGameStore } from '@/lib/store';

export function SettingsPopup() {
    const { setActivePopup } = useGameStore();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
            <div className="w-full max-w-md p-8 border-t-4 border-red-600 bg-zinc-900 shadow-2xl animate-in fade-in zoom-in duration-300">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                    <span className="w-2 h-8 bg-red-600 inline-block" />
                    Impostazioni
                </h2>

                <div className="text-zinc-500 font-mono text-sm uppercase tracking-tight text-center py-10 italic">
                    "Ho fatto questo gioco in un ora, cazzo vuoi, pure le impostazioni??"
                </div>

                {/* Actions */}
                <div className="mt-10 pt-6 border-t border-zinc-800 flex justify-end">
                    <button
                        onClick={() => setActivePopup(null)}
                        className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                    >
                        Chiudi
                    </button>
                </div>
            </div>
        </div>
    );
}
