'use client';

import { useEffect, useRef, useState } from 'react';

export function BackgroundMusic() {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const attemptPlay = () => {
            if (audioRef.current) {
                audioRef.current.play()
                    .then(() => {
                        setIsPlaying(true);
                    })
                    .catch(e => {
                        console.log("Audio autoplay blocked, waiting for interaction", e);
                    });
            }
        };

        // Attempt immediately
        attemptPlay();

        // Also attach to document click to bypass strict autoplay policies
        const handleInteraction = () => {
            if (!isPlaying && audioRef.current) {
                attemptPlay();
            }
        };

        document.addEventListener('click', handleInteraction);
        document.addEventListener('keydown', handleInteraction);
        document.addEventListener('touchstart', handleInteraction);

        return () => {
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('keydown', handleInteraction);
            document.removeEventListener('touchstart', handleInteraction);
        };
    }, [isPlaying]);

    return (
        <audio
            ref={audioRef}
            src="/music.mp3"
            loop
            preload="auto"
            style={{ display: 'none' }}
        />
    );
}
