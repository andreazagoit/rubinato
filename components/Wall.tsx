import { useMemo } from 'react';

interface WallProps {
    width?: number; // Usually cellSize, e.g., 10
    height?: number; // e.g., 4
    thickness?: number; // e.g., 0.5
    hasDoor?: boolean;
    doorWidth?: number; // e.g., 3
    doorHeight?: number; // e.g., 3
    color?: string;
}

export function Wall({
    width = 10,
    height = 4,
    thickness = 0.5,
    hasDoor = false,
    doorWidth = 4,
    doorHeight = 3,
    color = "#374151"
}: WallProps) {

    if (!hasDoor) {
        return (
            <mesh position={[0, height / 2, 0]}>
                <boxGeometry args={[width, height, thickness]} />
                <meshStandardMaterial color={color} />
            </mesh>
        );
    }

    // Door Logic: 3 parts (Left, Right, Top)
    const sideWidth = (width - doorWidth) / 2;
    // Ensure door isn't wider than wall
    if (sideWidth < 0) return null;

    const headerHeight = height - doorHeight;

    return (
        <group>
            {/* Left Panel */}
            <mesh position={[-(width / 2) + (sideWidth / 2), height / 2, 0]}>
                <boxGeometry args={[sideWidth, height, thickness]} />
                <meshStandardMaterial color={color} />
            </mesh>

            {/* Right Panel */}
            <mesh position={[(width / 2) - (sideWidth / 2), height / 2, 0]}>
                <boxGeometry args={[sideWidth, height, thickness]} />
                <meshStandardMaterial color={color} />
            </mesh>

            {/* Header Panel (Above Door) */}
            {headerHeight > 0 && (
                <mesh position={[0, doorHeight + (headerHeight / 2), 0]}>
                    <boxGeometry args={[doorWidth, headerHeight, thickness]} />
                    <meshStandardMaterial color={color} />
                </mesh>
            )}
        </group>
    );
}
