import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, useKeyboardControls } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import { Vector3, SpotLight as ThreeSpotLight } from 'three';
import { Grid, BoundaryType } from '@/lib/types';

const SPEED = 5;
const PLAYER_RADIUS = 1.2; // Increased size
const DOOR_WIDTH = 3.0; // Half width effectively 1.5

interface PlayerProps {
    position?: [number, number, number];
    isPaused?: boolean;
    onLock?: () => void;
    onUnlock?: () => void;
    onPositionChange?: (pos: { x: number; y: number; z: number }) => void;
    mobileInput?: React.MutableRefObject<{
        move: { x: number, y: number },
        look: { x: number, y: number }
    }>;
    grid?: Grid | null;
    cellSize?: number;
}

export function Player({
    position = [0, 2, 0],
    isPaused = false,
    onLock,
    onUnlock,
    onPositionChange,
    mobileInput,
    grid,
    cellSize = 10
}: PlayerProps) {
    const { camera } = useThree();
    const [, get] = useKeyboardControls();
    const spotlightRef = useRef<ThreeSpotLight>(null);

    // Initial Spawn
    useEffect(() => {
        camera.position.set(...position);
        // eslint-disable-next-line react-hooks/immutability
        camera.rotation.order = 'YXZ';
    }, [position, camera]);

    useFrame((_, delta) => {
        // Update spotlight to follow camera
        if (spotlightRef.current) {
            spotlightRef.current.position.copy(camera.position);
            const target = new Vector3();
            camera.getWorldDirection(target);
            target.multiplyScalar(10).add(camera.position);
            spotlightRef.current.target.position.copy(target);
            spotlightRef.current.target.updateMatrixWorld();
        }

        if (isPaused) return;

        // --- LOOK LOGIC (Mobile) ---
        if (mobileInput && (mobileInput.current.look.x !== 0 || mobileInput.current.look.y !== 0)) {
            const sensitivity = 0.005;

            // Yaw (Y axis) - straightforward
            // eslint-disable-next-line react-hooks/immutability
            camera.rotation.y -= mobileInput.current.look.x * sensitivity;

            // Pitch (X axis) - clamped
            // eslint-disable-next-line react-hooks/immutability
            camera.rotation.x -= mobileInput.current.look.y * sensitivity;
            // eslint-disable-next-line react-hooks/immutability
            camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));

            // Force zero roll
            // eslint-disable-next-line react-hooks/immutability
            camera.rotation.z = 0;

            // Reset delta
            // eslint-disable-next-line react-hooks/immutability
            mobileInput.current.look = { x: 0, y: 0 };
        }

        const { forward, backward, left, right } = get();

        // 1. Get Forward Vector (Flattened to stay on ground)
        const forwardVec = new Vector3();
        camera.getWorldDirection(forwardVec);
        forwardVec.y = 0;
        forwardVec.normalize();

        // 2. Get Right Vector
        const rightVec = new Vector3();
        rightVec.crossVectors(forwardVec, new Vector3(0, 1, 0)).normalize();

        const moveVec = new Vector3();

        // Keyboard Input
        if (forward) moveVec.add(forwardVec);
        if (backward) moveVec.sub(forwardVec);
        if (right) moveVec.add(rightVec);
        if (left) moveVec.sub(rightVec);

        // Mobile Input
        if (mobileInput) {
            // y is forward/back axis. Negative y is "up" on screen -> Forward
            if (mobileInput.current.move.y < 0) moveVec.add(forwardVec.clone().multiplyScalar(Math.abs(mobileInput.current.move.y)));
            if (mobileInput.current.move.y > 0) moveVec.sub(forwardVec.clone().multiplyScalar(mobileInput.current.move.y));

            // x is strafe. Positive x is right.
            if (mobileInput.current.move.x > 0) moveVec.add(rightVec.clone().multiplyScalar(mobileInput.current.move.x));
            if (mobileInput.current.move.x < 0) moveVec.sub(rightVec.clone().multiplyScalar(Math.abs(mobileInput.current.move.x)));
        }

        if (moveVec.length() > 0) {
            moveVec.normalize().multiplyScalar(SPEED * delta);

            // --- COLLISION LOGIC ---
            const currentPos = camera.position.clone();
            const candidatePos = currentPos.clone().add(moveVec);

            if (grid) {
                // Note: Rooms are at (cx * 10, -, -cy * 10). 
                const gx = Math.round(candidatePos.x / cellSize);
                const gy = Math.round(-candidatePos.z / cellSize);

                const room = grid.cells[gy]?.[gx];

                if (room) {
                    // Calculate local position within the room (0,0 is center)
                    const roomCenterX = gx * cellSize;
                    const roomCenterZ = -gy * cellSize;

                    const lx = candidatePos.x - roomCenterX;
                    const lz = candidatePos.z - roomCenterZ;

                    const halfSize = cellSize / 2;
                    const boundary = halfSize - PLAYER_RADIUS;

                    // WEST WALL (-X)
                    if (lx < -boundary) {
                        if (room.w === BoundaryType.WALL || (room.w === BoundaryType.DOOR && Math.abs(lz) > DOOR_WIDTH / 2)) {
                            candidatePos.x = roomCenterX - boundary;
                        }
                    }
                    // EAST WALL (+X)
                    else if (lx > boundary) {
                        if (room.e === BoundaryType.WALL || (room.e === BoundaryType.DOOR && Math.abs(lz) > DOOR_WIDTH / 2)) {
                            candidatePos.x = roomCenterX + boundary;
                        }
                    }

                    // NORTH WALL (-Z direction for world)
                    if (lz < -boundary) {
                        if (room.n === BoundaryType.WALL || (room.n === BoundaryType.DOOR && Math.abs(lx) > DOOR_WIDTH / 2)) {
                            candidatePos.z = roomCenterZ - boundary;
                        }
                    }
                    // SOUTH WALL (+Z direction)
                    else if (lz > boundary) {
                        if (room.s === BoundaryType.WALL || (room.s === BoundaryType.DOOR && Math.abs(lx) > DOOR_WIDTH / 2)) {
                            candidatePos.z = roomCenterZ + boundary;
                        }
                    }
                }
            } else {
                // Fallback if no grid (shouldn't happen in game)
                // Just apply movement
            }

            camera.position.copy(candidatePos);

            // Report position change for room culling
            if (onPositionChange) {
                onPositionChange({
                    x: camera.position.x,
                    y: camera.position.y,
                    z: camera.position.z
                });
            }
        }
    });

    return (
        <>
            <PointerLockControls
                onLock={onLock}
                onUnlock={onUnlock}
            />
            {/* Flashlight - SpotLight following camera direction */}
            <spotLight
                ref={spotlightRef}
                intensity={40}
                angle={0.6}
                penumbra={0.4}
                distance={35}
                color="#fffae0"
                castShadow
            />
        </>
    );
}
