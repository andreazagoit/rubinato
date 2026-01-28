'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import './FloorShader'; // Ensure material is extended

interface FloorProps {
    cellSize: number;
    color: string;
}

export function Floor({ cellSize, color }: FloorProps) {
    const materialRef = useRef<any>(null);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uTime = state.clock.getElapsedTime();
        }
    });

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
            <planeGeometry args={[cellSize, cellSize]} />
            <floorShaderMaterial
                ref={materialRef}
                transparent
            />
            <Edges color={color} />
        </mesh>
    );
}
