import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';

interface GameState {
    // UI State (Transient)
    activePopup: 'intro' | 'end' | 'settings' | 'fail' | null;
    setActivePopup: (p: 'intro' | 'end' | 'settings' | 'fail' | null) => void;

    // Gameplay State (Transient for now, could be persisted if needed)
    isPaused: boolean;
    setPaused: (p: boolean) => void;

    showMap: boolean;
    setShowMap: (s: boolean) => void;

    isJumpscareActive: boolean;
    setJumpscareActive: (active: boolean) => void;

    resetGameState: () => void;
}

// Custom Storage adapter for js-cookie
const cookieStorage = {
    getItem: (name: string): string | null => {
        return Cookies.get(name) || null;
    },
    setItem: (name: string, value: string): void => {
        Cookies.set(name, value, { expires: 365, sameSite: 'strict' });
    },
    removeItem: (name: string): void => {
        Cookies.remove(name);
    },
};

export const useGameStore = create<GameState>()(
    persist(
        (set) => ({
            activePopup: 'intro', // Default start
            setActivePopup: (activePopup) => set({ activePopup }),

            isPaused: false,
            setPaused: (isPaused) => set({ isPaused }),

            showMap: false,
            setShowMap: (showMap) => set({ showMap }),

            isJumpscareActive: false,
            setJumpscareActive: (isJumpscareActive) => set({ isJumpscareActive }),

            resetGameState: () => set({
                activePopup: 'intro',
                isPaused: true,
                showMap: false,
                isJumpscareActive: false
            }),
        }),
        {
            name: 'horror-game-state',
            storage: createJSONStorage(() => cookieStorage),
            partialize: (state) => ({}), // No longer persisting anything for now
        }
    )
);

