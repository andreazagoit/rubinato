import { Grid, Room, RoomType, Coordinates, Direction, Rarity } from './types';

function generateId(): string {
    return Math.random().toString(36).substring(2, 15);
}

const WIDTH = 7;
const HEIGHT = 7;

// Check if a direction goes outside the map
function isEdge(x: number, y: number, dir: Direction): boolean {
    switch (dir) {
        case 'N': return y === 0;
        case 'S': return y === HEIGHT - 1;
        case 'E': return x === WIDTH - 1;
        case 'W': return x === 0;
    }
}

// Get all directions that DON'T go outside the map
function getInwardDirections(x: number, y: number): Direction[] {
    const allDirs: Direction[] = ['N', 'S', 'E', 'W'];
    return allDirs.filter(dir => !isEdge(x, y, dir));
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

    generate(): Grid {
        // STEP 1: Create the grid structure (no walls yet)
        this.grid.cells = Array(HEIGHT).fill(null).map(() => Array(WIDTH).fill(null));

        const startX = 3, startY = 0;

        // Choose 3 random positions for objectives
        const objectiveData: { x: number; y: number; openDir: Direction }[] = [];
        const usedPositions = new Set<string>([`${startX},${startY}`]);

        for (let i = 0; i < 3; i++) {
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 200) {
                attempts++;
                const x = Math.floor(Math.random() * WIDTH);
                const y = Math.floor(Math.random() * HEIGHT);
                const key = `${x},${y}`;

                if (usedPositions.has(key)) continue;

                // Get valid inward directions (not toward edge)
                const validDirs = getInwardDirections(x, y);
                if (validDirs.length === 0) continue;

                // Pick one random direction for the single opening
                const openDir = validDirs[Math.floor(Math.random() * validDirs.length)];

                usedPositions.add(key);
                objectiveData.push({ x, y, openDir });
                placed = true;
            }

            if (!placed) {
                throw new Error(`Could not place objective ${i}`);
            }
        }

        // STEP 2: Create all room objects (exits = empty for now)
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                let roomType: RoomType = RoomType.NORMAL;
                let name = 'Corridoio';

                if (x === startX && y === startY) {
                    roomType = RoomType.START;
                    name = 'Inizio';
                }

                const objIndex = objectiveData.findIndex(o => o.x === x && o.y === y);
                if (objIndex !== -1) {
                    roomType = RoomType.OBJECTIVE;
                    name = OBJECTIVE_NAMES[objIndex];
                }

                const room: Room = {
                    id: generateId(),
                    coordinates: { x, y },
                    type: roomType,
                    templateId: roomType.toLowerCase(),
                    name: name,
                    rarity: Rarity.COMMON,
                    exits: [], // Will be filled in step 3
                    rotation: 0,
                    theme: 'default',
                    staticObjects: [],
                    interactables: [],
                    items: roomType === RoomType.OBJECTIVE ? ['red_folder'] : [],
                    events: [],
                    state: { isVisited: false, isLocked: false }
                };

                this.grid.cells[y][x] = room;
            }
        }

        // STEP 3: Determine exits (doors) for each room at the END
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                const room = this.grid.cells[y][x]!;
                const exits: Direction[] = [];

                if (room.type === RoomType.OBJECTIVE) {
                    // Objective rooms: only 1 exit (the open direction)
                    const objData = objectiveData.find(o => o.x === x && o.y === y)!;
                    exits.push(objData.openDir);
                } else {
                    // Normal rooms (including START): door on all sides except edges
                    for (const dir of ['N', 'S', 'E', 'W'] as Direction[]) {
                        if (!isEdge(x, y, dir)) {
                            exits.push(dir);
                        }
                    }
                }

                room.exits = exits;
            }
        }

        return this.grid;
    }
}
