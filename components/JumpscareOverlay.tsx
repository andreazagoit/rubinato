'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { useGameStore } from '@/lib/store';

export function JumpscareOverlay() {
    const { isJumpscareActive } = useGameStore();

    if (!isJumpscareActive) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden">
            <div className="relative w-full h-full animate-jumpscare">
                <Image
                    src="/jump_scare_1.png"
                    alt="JUMPSCARE"
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            {/* Red flash overlay */}
            <div className="absolute inset-0 bg-red-600/20 mix-blend-overlay animate-pulse pointer-events-none" />

            <style jsx global>{`
                @keyframes jumpscare {
                    0% { transform: scale(0.8) rotate(-2deg); filter: brightness(2); }
                    25% { transform: scale(1.2) rotate(2deg); filter: brightness(1); }
                    50% { transform: scale(1.1) rotate(-1deg); filter: brightness(3); }
                    75% { transform: scale(1.3) rotate(1deg); filter: contrast(2); }
                    100% { transform: scale(1.2) rotate(0deg); filter: brightness(1); }
                }
                .animate-jumpscare {
                    animation: jumpscare 0.1s infinite;
                }
            `}</style>
        </div>
    );
}
