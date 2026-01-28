'use client';

import { useEffect } from 'react';

interface PopupProps {
    title?: string;
    text: string;
    isClosable?: boolean;
    onClose?: () => void;
    buttonText?: string;
    onButtonClick?: () => void;
}

export function Popup({
    title,
    text,
    isClosable = true,
    onClose,
    buttonText,
    onButtonClick
}: PopupProps) {

    // Handle ESC key to close if closable
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isClosable && onClose) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isClosable, onClose]);

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
            <div className="max-w-xl w-full bg-zinc-950 border-2 border-red-950 p-8 md:p-12 relative shadow-[0_0_50px_rgba(153,0,0,0.2)]">
                {/* Decoration corners */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-600" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-600" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-600" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-600" />

                <div className="space-y-6">
                    {title && (
                        <h2 className="text-red-600 text-3xl font-black uppercase tracking-tighter italic">
                            {title}
                        </h2>
                    )}

                    <p className="text-zinc-300 text-lg md:text-xl font-mono leading-relaxed">
                        {text}
                    </p>

                    <div className="pt-6 flex flex-col gap-4">
                        {(buttonText || onButtonClick) && (
                            <button
                                onClick={onButtonClick}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 uppercase tracking-widest transition-all shadow-[0_4px_20px_rgba(220,38,38,0.3)] active:scale-95"
                            >
                                {buttonText || 'Continua'}
                            </button>
                        )}

                        {isClosable && onClose && (
                            <button
                                onClick={onClose}
                                className="text-zinc-500 hover:text-white text-xs uppercase tracking-widest font-bold transition-colors"
                            >
                                Premi ESC o clicca qui per chiudere
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
