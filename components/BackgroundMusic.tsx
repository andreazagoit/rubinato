'use client';

import { useEffect, useRef, useState } from 'react';

interface BackgroundMusicProps {
    src?: string;
    volume?: number;
}

export function BackgroundMusic({ src = "/music.mp3", volume = 0.05 }: BackgroundMusicProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    useEffect(() => {
        const attemptPlay = () => {
            if (audioRef.current) {
                // If the source changes, we need to reload and play
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
    }, [isPlaying, src]); // Re-run when src changes

    return (
        <audio
            ref={audioRef}
            src={src}
            loop
            preload="auto"
            style={{ display: 'none' }}
        />
    );
}
