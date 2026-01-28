'use client';

import { useRef, useState } from 'react';

interface MobileControlsProps {
    onMove: (x: number, y: number) => void;
    onLook: (dx: number, dy: number) => void;
    onInteract: () => void;
}

export function MobileControls({ onMove, onLook, onInteract }: MobileControlsProps) {
    const [joystickActive, setJoystickActive] = useState(false);
    const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
    const touchStartPos = useRef({ x: 0, y: 0 });

    const lookTouchId = useRef<number | null>(null);
    const lastLookPos = useRef({ x: 0, y: 0 });

    // Handle Joystick Touch
    const handleJoystickStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        touchStartPos.current = { x: touch.clientX, y: touch.clientY };
        setJoystickActive(true);
        setJoystickPos({ x: 0, y: 0 });
    };

    const handleJoystickMove = (e: React.TouchEvent) => {
        if (!joystickActive) return;
        const touch = e.touches[0];

        let dx = touch.clientX - touchStartPos.current.x;
        let dy = touch.clientY - touchStartPos.current.y;

        // Clamp magnitude
        const maxDist = 50;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > maxDist) {
            const ratio = maxDist / dist;
            dx *= ratio;
            dy *= ratio;
        }

        setJoystickPos({ x: dx, y: dy });

        // Normalized output -1 to 1
        // x is left/right (strafe), y is up/down (forward/back)
        // In game: y < 0 is forward. 
        onMove(dx / maxDist, dy / maxDist);
    };

    const handleJoystickEnd = () => {
        setJoystickActive(false);
        setJoystickPos({ x: 0, y: 0 });
        onMove(0, 0);
    };

    // Handle Look Touch (Right side of screen)
    const handleLookStart = (e: React.TouchEvent) => {
        // Find a touch that isn't the joystick touch
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            // Simple heuristic: if touch is on right half of screen
            if (touch.clientX > window.innerWidth / 2) {
                lookTouchId.current = touch.identifier;
                lastLookPos.current = { x: touch.clientX, y: touch.clientY };
                break;
            }
        }
    };

    const handleLookMove = (e: React.TouchEvent) => {
        if (lookTouchId.current === null) return;

        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            if (touch.identifier === lookTouchId.current) {
                const dx = touch.clientX - lastLookPos.current.x;
                const dy = touch.clientY - lastLookPos.current.y;

                onLook(dx, dy);

                lastLookPos.current = { x: touch.clientX, y: touch.clientY };
                break;
            }
        }
    };

    const handleLookEnd = (e: React.TouchEvent) => {
        if (lookTouchId.current === null) return;

        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === lookTouchId.current) {
                lookTouchId.current = null;
                break;
            }
        }
    };

    return (
        <div className="absolute inset-0 z-40 pointer-events-none select-none touch-none">
            {/* Left Joystick Zone */}
            <div
                className="absolute bottom-10 left-10 w-40 h-40 pointer-events-auto bg-white/10 rounded-full backdrop-blur-[4px] border border-white/30 touch-none"
                onTouchStart={handleJoystickStart}
                onTouchMove={handleJoystickMove}
                onTouchEnd={handleJoystickEnd}
            >
                {/* Knob */}
                <div
                    className="absolute top-1/2 left-1/2 w-16 h-16 bg-white/40 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg backdrop-blur-sm border border-white/50"
                    style={{
                        transform: `translate(calc(-50% + ${joystickPos.x}px), calc(-50% + ${joystickPos.y}px))`
                    }}
                />
            </div>

            {/* Right Look Zone (Invisible but clickable) */}
            <div
                className="absolute inset-y-0 right-0 w-1/2 pointer-events-auto"
                onTouchStart={handleLookStart}
                onTouchMove={handleLookMove}
                onTouchEnd={handleLookEnd}
            />

            {/* Interact Button */}
            <button
                className="absolute bottom-20 right-10 w-20 h-20 bg-red-600/80 rounded-full border-4 border-red-900 shadow-xl active:scale-95 pointer-events-auto flex items-center justify-center text-white font-black text-2xl"
                onClick={onInteract}
                onTouchStart={(e) => { e.stopPropagation(); }} // prevent looking logic
            >
                E
            </button>
        </div>
    );
}
