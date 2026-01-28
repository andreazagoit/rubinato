'use client';

import { Room, RoomType } from '@/lib/types';
import { Wall } from './Wall';
import { Floor } from './Floor';
import { Folder } from './Folder';
import { DoubleSide, Texture as ThreeTexture } from 'three';
import { ROOM_DEFINITIONS } from '@/lib/roomConfig';
import { BoundaryType } from '@/lib/types';

interface RoomViewProps {
    room: Room;
    cellSize?: number;
    showCeiling?: boolean;
    onCollectFolder?: (roomId: string) => void;
    textures: {
        floor?: ThreeTexture;
        wall?: ThreeTexture;
        ceiling?: ThreeTexture;
    };
}

export function RoomView({ room, cellSize = 10, showCeiling = true, onCollectFolder, textures }: RoomViewProps) {
    const style = ROOM_DEFINITIONS[room.type] || ROOM_DEFINITIONS.NORMAL;

    // Border color from config
    const borderColor = style.color;

    const wallThickness = 0.5;
    const wallHeight = 4;
    const halfSize = cellSize / 2;
    const wallOffset = halfSize - wallThickness / 2;

    const finalPosition: [number, number, number] = [
        room.coordinates.x * cellSize,
        0,
        -room.coordinates.y * cellSize
    ];

    return (
        <group position={finalPosition}>
            {/* Floor with Texture */}
            {style.floor && (
                <Floor cellSize={cellSize} color={borderColor} texture={textures.floor} />
            )}

            {/* Ceiling with Texture */}
            {showCeiling && style.ceiling && (
                <mesh position={[0, wallHeight, 0]} rotation={[Math.PI, 0, 0]}>
                    <boxGeometry args={[cellSize, 0.3, cellSize]} />
                    <meshStandardMaterial
                        map={textures.ceiling}
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

            {room.items?.includes('red_folder') && (
                <Folder
                    onCollect={() => onCollectFolder?.(room.id)}
                    position={[0, 1.05, 0]}
                />
            )}

            {/* Walls - based on n, s, e, w boundaries */}

            {/* North wall (Z = -offset) */}
            {room.n !== BoundaryType.NULL && style.wall && (
                <group position={[0, 0, -wallOffset]}>
                    <Wall
                        width={cellSize}
                        height={wallHeight}
                        thickness={wallThickness}
                        hasDoor={room.n === BoundaryType.DOOR}
                        texture={textures.wall}
                    />
                </group>
            )}

            {/* South wall (Z = +offset) */}
            {room.s !== BoundaryType.NULL && style.wall && (
                <group position={[0, 0, wallOffset]} rotation={[0, Math.PI, 0]}>
                    <Wall
                        width={cellSize}
                        height={wallHeight}
                        thickness={wallThickness}
                        hasDoor={room.s === BoundaryType.DOOR}
                        texture={textures.wall}
                    />
                </group>
            )}

            {/* East wall (X = +offset) */}
            {room.e !== BoundaryType.NULL && style.wall && (
                <group position={[wallOffset, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
                    <Wall
                        width={cellSize}
                        height={wallHeight}
                        thickness={wallThickness}
                        hasDoor={room.e === BoundaryType.DOOR}
                        texture={textures.wall}
                    />
                </group>
            )}

            {/* West wall (X = -offset) */}
            {room.w !== BoundaryType.NULL && style.wall && (
                <group position={[-wallOffset, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                    <Wall
                        width={cellSize}
                        height={wallHeight}
                        thickness={wallThickness}
                        hasDoor={room.w === BoundaryType.DOOR}
                        texture={textures.wall}
                    />
                </group>
            )}
        </group>
    );
}
