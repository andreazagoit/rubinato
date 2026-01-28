'use client';

import { Text, useKeyboardControls, Billboard } from '@react-three/drei';
import { useState, useEffect, Suspense } from 'react';

interface FolderProps {
    onCollect: () => void;
    position?: [number, number, number];
}

function FolderPrompt() {
    return (
        <Billboard position={[0, 0.6, 0]}>
            <Text
                fontSize={0.12}
                color="white"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.01}
                outlineColor="black"
            >
                PREMI [E] PER RACCOGLIERE
            </Text>
        </Billboard>
    );
}

export function Folder({ onCollect, position = [0, 0.5, 0] }: FolderProps) {
    const [hovered, setHovered] = useState(false);
    const [subscribeKeys] = useKeyboardControls();

    // Interaction logic
    useEffect(() => {
        return subscribeKeys(
            (state: { interact?: boolean }) => !!state?.interact,
            (pressed) => {
                if (pressed && hovered) {
                    onCollect();
                }
            }
        );
    }, [hovered, onCollect, subscribeKeys]);

    return (
        <group position={position}>
            {/* The Folder Group */}
            <group
                onPointerOver={(e) => {
                    e.stopPropagation();
                    setHovered(true);
                }}
                onPointerOut={(e) => {
                    e.stopPropagation();
                    setHovered(false);
                }}
            >
                {/* The Folder visual */}
                <mesh castShadow receiveShadow>
                    <boxGeometry args={[0.4, 0.05, 0.6]} />
                    <meshStandardMaterial color={hovered ? "#ff4444" : "#aa0000"} />
                </mesh>

                {/* Label detail */}
                <mesh position={[0, 0.03, 0]} castShadow>
                    <boxGeometry args={[0.2, 0.01, 0.1]} />
                    <meshStandardMaterial color="#ffffff" />
                </mesh>

                {/* Prompt Text - Focused Suspense to prevent global flicker */}
                {hovered && (
                    <Suspense fallback={null}>
                        <FolderPrompt />
                    </Suspense>
                )}

                {/* Subtle glow if hovered */}
                {hovered && (
                    <pointLight
                        position={[0, 0.2, 0]}
                        color="#ff0000"
                        intensity={1}
                        distance={3}
                    />
                )}
            </group>
        </group>
    );
}
