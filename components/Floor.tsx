import { Texture } from 'three';

interface FloorProps {
    cellSize: number;
    color: string;
    texture?: Texture;
}

export function Floor({ cellSize, color, texture }: FloorProps) {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
            <planeGeometry args={[cellSize, cellSize]} />
            <meshStandardMaterial
                map={texture}
                color={texture ? "#ffffff" : color}
            />
        </mesh>
    );
}
