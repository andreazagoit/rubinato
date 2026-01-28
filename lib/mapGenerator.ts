import { Grid, Room, RoomType, Rarity, Direction, BoundaryType } from './types';

function generateId(): string {
    return Math.random().toString(36).substring(2, 15);
}

const WIDTH = 7;
const HEIGHT = 10;
const BUILDING_START_Y = 3;

// Check if a coordinate is within the valid map bounds
export function isValid(x: number, y: number): boolean {
    if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return false;

    // Start Zone (Bottom 3 rows): Only middle 3 columns (2,3,4)
    if (y < BUILDING_START_Y) {
        return x >= 2 && x <= 4;
    }

    // Building Zone (Top 7 rows): All columns
    return true;
}

// Objective room definitions
const OBJECTIVE_NAMES = ['Archivio', 'Laboratorio', 'Ufficio del Direttore'];

export class MapGenerator {
    grid: Grid;

    constructor() {
        this.grid = {
            width: WIDTH,
            height: HEIGHT,
            cells: Array(HEIGHT).fill(null).map(() => Array(WIDTH).fill(null))
        };
    }

    // Helper to create a room and set initial boundaries to WALL
    private createRoom(x: number, y: number, type: RoomType, name: string): void {
        const newRoom: Room = {
            id: generateId(),
            coordinates: { x, y },
            type: type,
            templateId: type.toLowerCase(),
            name,
            rarity: Rarity.COMMON,
            n: BoundaryType.WALL,
            s: BoundaryType.WALL,
            e: BoundaryType.WALL,
            w: BoundaryType.WALL,
            rotation: 0,
            theme: 'default',
            staticObjects: [],
            interactables: [],
            items: [],
            events: [],
            state: { isVisited: false, isLocked: false }
        };
        this.grid.cells[y][x] = newRoom;
    }

    generate(): Grid {
        // STEP 1: Create the grid structure
        this.grid.cells = Array(HEIGHT).fill(null).map(() => Array(WIDTH).fill(null));

        // --- PART A: BUILDING GENERATION (Procedural, y >= 3) ---

        // Choose 3 random positions for objectives in the building area
        const objectiveData: { x: number; y: number; openDir: Direction }[] = [];
        const usedPositions = new Set<string>();

        // We MUST reserve entrance from Start Zone (3, 3) to prevent blocking
        usedPositions.add(`3,${BUILDING_START_Y}`);

        for (let i = 0; i < 3; i++) {
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 200) {
                attempts++;
                const x = Math.floor(Math.random() * WIDTH);
                // Random Y between 3 and 9
                const y = Math.floor(Math.random() * (HEIGHT - BUILDING_START_Y)) + BUILDING_START_Y;

                const key = `${x},${y}`;
                if (usedPositions.has(key)) continue;

                // Simple check for valid neighbors for opening
                const directions: Direction[] = ['N', 'S', 'E', 'W'];
                const validDirs = directions.filter(d => {
                    let nx = x, ny = y;
                    if (d === 'N') ny--; // Up (North)
                    if (d === 'S') ny++; // Down (South)
                    if (d === 'E') nx++;
                    if (d === 'W') nx--;
                    // Must be valid AND inside building zone (y >= 3)
                    return isValid(nx, ny) && ny >= BUILDING_START_Y;
                });

                if (validDirs.length === 0) continue;

                const openDir = validDirs[Math.floor(Math.random() * validDirs.length)];
                usedPositions.add(key);
                objectiveData.push({ x, y, openDir });
                placed = true;
            }
        }

        // Fill Building Rooms
        for (let y = BUILDING_START_Y; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                let roomType = RoomType.NORMAL;
                let name = 'Corridoio';

                const objIndex = objectiveData.findIndex(o => o.x === x && o.y === y);
                if (objIndex !== -1) {
                    roomType = RoomType.OBJECTIVE;
                    name = OBJECTIVE_NAMES[objIndex];
                }

                this.createRoom(x, y, roomType, name);
            }
        }

        // --- PART B: START ZONE GENERATION (Fixed, y < 3) ---
        // Fill fixed area cells
        for (let y = 0; y < BUILDING_START_Y; y++) {
            for (let x = 2; x <= 4; x++) {
                let roomType = RoomType.PARKING;
                let name = 'Parcheggio Esterno';

                if (x === 3 && y === 1) { // Center of 3x3
                    roomType = RoomType.START;
                    name = 'Punto di Inizio';
                }

                this.createRoom(x, y, roomType, name);
            }
        }


        // --- STEP 3: CALCULATE EXITS (Connectivity) ---
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                const room = this.grid.cells[y][x];
                if (!room) continue;

                const exits: Direction[] = []; // This variable is declared but never used.

                if (room.type === RoomType.OBJECTIVE) {
                    const objData = objectiveData.find(o => o.x === x && o.y === y)!;
                    exits.push(objData.openDir);
                } else {
                    // Start Zone Internal Logic: Open Plan (Connect to all valid neighbors in Zone)
                    if (y < BUILDING_START_Y) {
                        // Connect to all valid neighbors
                        const directions: Direction[] = ['N', 'S', 'E', 'W'];
                        for (const dir of directions) {
                            let nx = x, ny = y;
                            if (dir === 'N') ny--;
                            if (dir === 'S') ny++;
                            if (dir === 'E') nx++;
                            if (dir === 'W') nx--;

                            if (isValid(nx, ny)) {
                                // Special Case: Connecting to Building
                                // If I am at (3,2) (Top Center of Start) and move North (y=1... wait N is y-1 in my loop above)

                                // Let's standardise Direction again.
                                // My loop above: N = y-1. S = y+1.
                                // Building is at y=3. Start is y=0,1,2.
                                // To go from Start (y=2) to Building (y=3), I must increase Y.
                                // So I must go SOUTH (S = y+1).

                                // !!! CONFLICT ALERT !!!
                                // Standard 2D Grid: (0,0) is Top-Left. 
                                // Building is "Top 7 rows" usually implies y=0..6.
                                // But here I defined Start Zone (Bottom 3 rows) as y < 3.
                                // Wait.
                                // If Start is "Bottom", usually Bottom is High Y.
                                // But I defined Start as y=0,1,2. That is TOP of Array.
                                // And Building y=3..9. That is BOTTOM of Array.

                                // In 3D:
                                // gridY = -pos.z / CELL_SIZE.
                                // If player moves "Forward/North" (Negative Z), gridY INCREASES?
                                // Let's check GameLevel.tsx:
                                // setStartPos([sx * CELL_SIZE, 1.7, -sy * CELL_SIZE]);
                                // If sy = 1 (Start), Z = -10.
                                // If player moves North (-Z), Z becomes -20.
                                // -(-20)/10 = 2. So gridY INCREASES as you go North.

                                // SO:
                                // North (Forward) = Increasing Grid Y.
                                // South (Backward) = Decreasing Grid Y.

                                // My Array Layout:
                                // Start Zone: y=0,1,2.
                                // Building: y=3..9.

                                // If I am at Start (y=1) and walk North (+Y), I go to y=2.
                                // If I walk North again (+Y), I go to y=3 (Building).
                                // So Start IS South of Building in Grid Y terms. 
                                // (0 is South-most, 9 is North-most).

                                // Conclusion:
                                // N = y + 1.
                                // S = y - 1.

                                // Let's FIX all loops to respect N=y+1.

                                // 1. Objectives Neighbor Check loop:
                                // if (d === 'N') ny++; // N is +1
                                // if (d === 'S') ny--; // S is -1

                                // 2. Connectivity Loop:
                                // if (dir === 'N') ny++;
                                // if (dir === 'S') ny--;
                            }
                        }
                    } else {
                        // Building Logic
                    }
                }
            }
        }

        // Rewriting Logic with Corrected Direction
        return this.generateCorrected();
    }

    generateCorrected(): Grid {
        this.grid.cells = Array(HEIGHT).fill(null).map(() => Array(WIDTH).fill(null));

        // N = y+1, S = y-1, E = x+1, W = x-1
        // Start (y=0..2) is SOUTH. Building (y=3..9) is NORTH.

        // 1. Create all rooms first with default WALL boundaries
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                let type = RoomType.EMPTY;
                let name = 'Vuoto';

                if (y < BUILDING_START_Y) {
                    if (x >= 2 && x <= 4) {
                        type = RoomType.PARKING;
                        name = 'Parcheggio Esterno';
                        if (x === 3 && y === 1) {
                            type = RoomType.START;
                            name = 'Punto di Inizio';
                        }
                    }
                } else {
                    type = RoomType.NORMAL;
                    name = 'Corridoio';
                }

                this.createRoom(x, y, type, name);
            }
        }

        // 2. Define Objectives in Building
        const objectiveData: { x: number; y: number; openDir: Direction }[] = [];
        const usedPositions = new Set<string>();
        usedPositions.add(`3,${BUILDING_START_Y}`); // Entrance reserved

        for (let i = 0; i < 3; i++) {
            let placed = false;
            let attempts = 0;
            while (!placed && attempts < 200) {
                attempts++;
                const x = Math.floor(Math.random() * WIDTH);
                const y = Math.floor(Math.random() * (HEIGHT - BUILDING_START_Y)) + BUILDING_START_Y;
                if (usedPositions.has(`${x},${y}`)) continue;

                const directions: Direction[] = ['N', 'S', 'E', 'W'];
                const validDirs = directions.filter(d => {
                    let nx = x, ny = y;
                    if (d === 'N') ny++; if (d === 'S') ny--; if (d === 'E') nx++; if (d === 'W') nx--;
                    return isValid(nx, ny) && ny >= BUILDING_START_Y;
                });

                if (validDirs.length > 0) {
                    const room = this.grid.cells[y][x]!;
                    room.type = RoomType.OBJECTIVE;
                    room.name = OBJECTIVE_NAMES[objectiveData.length];
                    room.items = ['red_folder'];
                    const openDir = validDirs[Math.floor(Math.random() * validDirs.length)];
                    objectiveData.push({ x, y, openDir });
                    usedPositions.add(`${x},${y}`);
                    placed = true;
                }
            }
        }

        // 3. Set Boundaries
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                const room = this.grid.cells[y][x];
                if (!room) continue;

                if (room.type === RoomType.EMPTY) {
                    room.n = room.s = room.e = room.w = BoundaryType.NULL;
                    continue;
                }

                if (y < BUILDING_START_Y) {
                    // --- STATIC START/PARKING ZONE ---
                    room.s = (y === 0) ? BoundaryType.WALL : BoundaryType.NULL;
                    room.w = (x === 2) ? BoundaryType.WALL : BoundaryType.NULL;
                    room.e = (x === 4) ? BoundaryType.WALL : BoundaryType.NULL;

                    if (y === BUILDING_START_Y - 1) { // Row 2
                        room.n = (x === 3) ? BoundaryType.DOOR : BoundaryType.WALL;
                    } else {
                        room.n = BoundaryType.NULL;
                    }
                } else {
                    // --- PROCEDURAL BUILDING ZONE ---

                    // A. Force Outer Walls
                    room.n = (y === HEIGHT - 1) ? BoundaryType.WALL : BoundaryType.DOOR;
                    room.s = (y === BUILDING_START_Y) ? (x === 3 ? BoundaryType.DOOR : BoundaryType.WALL) : BoundaryType.DOOR;
                    room.w = (x === 0) ? BoundaryType.WALL : BoundaryType.DOOR;
                    room.e = (x === WIDTH - 1) ? BoundaryType.WALL : BoundaryType.DOOR;

                    // B. Random Internal Walls (if not already set as outer wall)
                    const WALL_CHANCE = 0.3;
                    if (room.n === BoundaryType.DOOR && y < HEIGHT - 1) {
                        if (Math.random() < WALL_CHANCE) room.n = BoundaryType.WALL;
                    }
                    if (room.s === BoundaryType.DOOR && y > BUILDING_START_Y) {
                        // We check neighbor's N because consistency is key
                        const southNeighbor = this.grid.cells[y - 1][x];
                        if (southNeighbor && southNeighbor.n !== undefined) {
                            room.s = southNeighbor.n;
                        } else {
                            if (Math.random() < WALL_CHANCE) room.s = BoundaryType.WALL;
                        }
                    }
                    if (room.e === BoundaryType.DOOR && x < WIDTH - 1) {
                        if (Math.random() < WALL_CHANCE) room.e = BoundaryType.WALL;
                    }
                    if (room.w === BoundaryType.DOOR && x > 0) {
                        const westNeighbor = this.grid.cells[y][x - 1];
                        if (westNeighbor && westNeighbor.e !== undefined) {
                            room.w = westNeighbor.e;
                        } else {
                            if (Math.random() < WALL_CHANCE) room.w = BoundaryType.WALL;
                        }
                    }

                    // C. Objective Room Constraints (Override)
                    // Objectives must have EXACTLY one DOOR
                    if (room.type === RoomType.OBJECTIVE) {
                        const obj = objectiveData.find(o => o.x === x && o.y === y)!;
                        room.n = (obj.openDir === 'N') ? BoundaryType.DOOR : BoundaryType.WALL;
                        room.s = (obj.openDir === 'S') ? BoundaryType.DOOR : BoundaryType.WALL;
                        room.e = (obj.openDir === 'E') ? BoundaryType.DOOR : BoundaryType.WALL;
                        room.w = (obj.openDir === 'W') ? BoundaryType.DOOR : BoundaryType.WALL;
                    }

                    // D. Fix neighbor blocking (If my neighbor is an objective, I must respect its wall)
                    const enforceNeighborWalls = (nx: number, ny: number, mySide: 'n' | 's' | 'e' | 'w', neighborSide: Direction) => {
                        if (!isValid(nx, ny) || ny < BUILDING_START_Y) return;
                        const neighbor = this.grid.cells[ny][nx];
                        if (neighbor?.type === RoomType.OBJECTIVE) {
                            const obj = objectiveData.find(o => o.x === nx && o.y === ny)!;
                            if (obj.openDir !== this.getReciprocal(neighborSide)) {
                                // Neighbor side facing me is a wall
                                room[mySide] = BoundaryType.WALL;
                            } else {
                                // Neighbor side facing me is a DOOR
                                room[mySide] = BoundaryType.DOOR;
                            }
                        }
                    };

                    enforceNeighborWalls(x, y + 1, 'n', 'N');
                    enforceNeighborWalls(x, y - 1, 's', 'S');
                    enforceNeighborWalls(x + 1, y, 'e', 'E');
                    enforceNeighborWalls(x - 1, y, 'w', 'W');
                }
            }
        }

        // 4. Guarantee Connectivity
        this.ensureReachability();

        return this.grid;
    }

    private ensureReachability() {
        const startX = 3;
        const startY = 0;

        const getReachable = () => {
            const visited = new Set<string>();
            const queue: [number, number][] = [[startX, startY]];
            visited.add(`${startX},${startY}`);

            let head = 0;
            while (head < queue.length) {
                const [x, y] = queue[head++];
                const room = this.grid.cells[y][x];
                if (!room) continue;

                const check = (nx: number, ny: number, boundary: BoundaryType) => {
                    if (isValid(nx, ny) && boundary !== BoundaryType.WALL) {
                        const key = `${nx},${ny}`;
                        if (!visited.has(key)) {
                            visited.add(key);
                            queue.push([nx, ny]);
                        }
                    }
                };

                check(x, y + 1, room.n);
                check(x, y - 1, room.s);
                check(x + 1, y, room.e);
                check(x - 1, y, room.w);
            }
            return visited;
        };

        let reachable = getReachable();
        const allValidRooms: { x: number, y: number }[] = [];
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                if (isValid(x, y) && this.grid.cells[y][x]?.type !== RoomType.EMPTY) {
                    allValidRooms.push({ x, y });
                }
            }
        }

        // Keep carving until all valid rooms are reachable
        let attempts = 0;
        while (reachable.size < allValidRooms.length && attempts < 100) {
            attempts++;
            // Find an unreachable room that has a reachable neighbor
            let carved = false;
            for (const roomPos of allValidRooms) {
                if (reachable.has(`${roomPos.x},${roomPos.y}`)) continue;

                const neighbors = [
                    { x: roomPos.x, y: roomPos.y + 1, mySide: 'n' as const, neighborSide: 's' as const },
                    { x: roomPos.x, y: roomPos.y - 1, mySide: 's' as const, neighborSide: 'n' as const },
                    { x: roomPos.x + 1, y: roomPos.y, mySide: 'e' as const, neighborSide: 'w' as const },
                    { x: roomPos.x - 1, y: roomPos.y, mySide: 'w' as const, neighborSide: 'e' as const },
                ];

                for (const n of neighbors) {
                    if (isValid(n.x, n.y) && reachable.has(`${n.x},${n.y}`)) {
                        // Carve a door!
                        const myRoom = this.grid.cells[roomPos.y][roomPos.x]!;
                        const neighborRoom = this.grid.cells[n.y][n.x]!;

                        // IMPORTANT: Don't carve into Objective rooms except through their designated door
                        // Actually, if we are unreachable, we MUST carve. objectiveData handles the "only one door" rule normally.
                        // But for simplicity here, we just set both to DOOR.
                        myRoom[n.mySide] = BoundaryType.DOOR;
                        neighborRoom[n.neighborSide] = BoundaryType.DOOR;

                        carved = true;
                        break;
                    }
                }
                if (carved) break;
            }

            if (!carved) break; // Should not happen if map is contiguous
            reachable = getReachable();
        }
    }

    private getReciprocal(dir: Direction): Direction {
        if (dir === 'N') return 'S';
        if (dir === 'S') return 'N';
        if (dir === 'E') return 'W';
        return 'E';
    }
}
