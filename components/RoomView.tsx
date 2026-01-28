'use client';

import { useMemo, useEffect } from 'react';
import { Room, RoomType, Direction } from '@/lib/types';
import { Edges, Text, useTexture } from '@react-three/drei';
import { Wall } from './Wall';
import { Floor } from './Floor';
import { Folder } from './Folder';
import { DoubleSide, NearestFilter, RepeatWrapping } from 'three';

interface RoomViewProps {
    room: Room;
    cellSize?: number;
    showCeiling?: boolean;
    onCollectFolder?: (roomId: string) => void;
}

export function RoomView({ room, cellSize = 10, showCeiling = true, onCollectFolder }: RoomViewProps) {
    // Load Textures
    const [floorTex, wallTex, ceilingTex] = useTexture([
        '/textures/floor_wood_dark.png',
        '/textures/wall_concrete_dark.png',
        '/textures/ceiling_concrete_dark.png'
    ]);

    // Configure Textures
    useEffect(() => {
        [floorTex, wallTex, ceilingTex].forEach(t => {
            t.magFilter = NearestFilter;
            t.minFilter = NearestFilter;
            t.wrapS = RepeatWrapping;
            t.wrapT = RepeatWrapping;
            t.repeat.set(4, 4);
            t.needsUpdate = true;
        });
    }, [floorTex, wallTex, ceilingTex]);

    // Border color for room types
    const borderColor = useMemo(() => {
        if (room.type === RoomType.START) return '#4ade80'; // Green
        if (room.type === RoomType.OBJECTIVE) return '#f87171'; // Red
        return '#333333'; // Dark gray for corridors
    }, [room.type]);

    const wallThickness = 0.5;
    const wallHeight = 4;
    const halfSize = cellSize / 2;
    const wallOffset = halfSize - wallThickness / 2;

    // Grid Y increases downward, but 3D Z decreases northward
    // So grid 'N' (y--) = toward +Z = 3D South
    // And grid 'S' (y++) = toward -Z = 3D North
    const hasNorthDoor = room.exits.includes('S'); // Grid S = 3D North
    const hasSouthDoor = room.exits.includes('N'); // Grid N = 3D South
    const hasEastDoor = room.exits.includes('E');
    const hasWestDoor = room.exits.includes('W');

    // Grid Y is -Z in world space
    const finalPosition: [number, number, number] = [
        room.coordinates.x * cellSize,
        0,
        -room.coordinates.y * cellSize
    ];

    return (
        <group position={finalPosition}>
            {/* Floor with Texture */}
            <Floor cellSize={cellSize} color={borderColor} texture={floorTex} />

            {/* Ceiling with Texture */}
            {showCeiling && (
                <mesh position={[0, wallHeight, 0]} rotation={[Math.PI, 0, 0]}>
                    <boxGeometry args={[cellSize, 0.3, cellSize]} />
                    <meshStandardMaterial
                        map={ceilingTex}
                        color="#888888" // Tint it slightly dark
                        side={DoubleSide}
                    />
                </mesh>
            )}

            {/* Objects in Room */}
            {room.type === RoomType.OBJECTIVE && (
                <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.8, 1.0, 0.8]} />
                    <meshStandardMaterial color="#1a1a1a" />
                </mesh>
            )}

            {room.items.includes('red_folder') && (
                <Folder
                    onCollect={() => onCollectFolder?.(room.id)}
                    position={[0, 1.05, 0]}
                />
            )}

            {/* Room Name - Floating */}
            <group position={[0, 2.5, 0]}>
                <Text
                    fontSize={0.8}
                    color="black"
                    anchorX="center"
                    anchorY="middle"
                    fillOpacity={0.5}
                >
                    {room.name}
                </Text>
            </group>

            {/* Walls - door if exit exists, solid wall if no exit */}

            {/* North wall (Z = -offset) */}
            <group position={[0, 0, -wallOffset]}>
                <Wall
                    width={cellSize}
                    height={wallHeight}
                    thickness={wallThickness}
                    hasDoor={hasNorthDoor}
                    texture={wallTex}
                />
            </group>

            {/* South wall (Z = +offset) */}
            <group position={[0, 0, wallOffset]} rotation={[0, Math.PI, 0]}>
                <Wall
                    width={cellSize}
                    height={wallHeight}
                    thickness={wallThickness}
                    hasDoor={hasSouthDoor}
                    texture={wallTex}
                />
            </group>

            {/* East wall (X = +offset) */}
            <group position={[wallOffset, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
                <Wall
                    width={cellSize}
                    height={wallHeight}
                    thickness={wallThickness}
                    hasDoor={hasEastDoor}
                    texture={wallTex}
                />
            </group>

            {/* West wall (X = -offset) */}
            <group position={[-wallOffset, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                <Wall
                    width={cellSize}
                    height={wallHeight}
                    thickness={wallThickness}
                    hasDoor={hasWestDoor}
                    texture={wallTex}
                />
            </group>
        </group>
    );
}
