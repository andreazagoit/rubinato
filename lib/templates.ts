import { Direction, RoomTemplate, Rarity } from './types';

// Helper to define exits easily
const N = 'N', S = 'S', E = 'E', W = 'W';

export const ROOM_TEMPLATES: RoomTemplate[] = [
    // --- UNIQUE OBJECTIVE ROOMS (Mandatory) ---
    {
        layoutId: 'archive_room',
        name: 'The Archive',
        rarity: Rarity.UNIQUE,
        baseExits: [S], // One entrance
        unique: true,
        mandatory: true,
        description: 'A dusty room filled with records. Contains a Red Folder.',
        visualTag: 'files'
    },
    {
        layoutId: 'server_room',
        name: 'Server Farm',
        rarity: Rarity.UNIQUE,
        baseExits: [N, S], // Through-room
        unique: true,
        mandatory: true,
        description: 'Humming servers and blinking lights. Contains a Red Folder.',
        visualTag: 'tech'
    },
    {
        layoutId: 'director_office',
        name: 'Director Office',
        rarity: Rarity.UNIQUE,
        baseExits: [E], // Dead end
        unique: true,
        mandatory: true,
        description: 'A luxurious desk with a view. Contains a Red Folder.',
        visualTag: 'luxury'
    },

    // --- SPECIAL / RARE ROOMS ---
    {
        layoutId: 'ritual_chamber',
        name: 'Ritual Chamber',
        rarity: Rarity.RARE,
        baseExits: [N, E, W],
        unique: true,
        description: 'Something bad happened here.'
    },
    {
        layoutId: 'cafeteria',
        name: 'Cafeteria',
        rarity: Rarity.UNCOMMON,
        baseExits: [N, S, E, W],
        description: 'Overturned tables and rotten food.'
    },

    // --- COMMON CORRIDORS & SHAPES ---
    {
        layoutId: 'corridor_i',
        name: 'Corridor',
        rarity: Rarity.COMMON,
        baseExits: [N, S],
    },
    {
        layoutId: 'corner_l',
        name: 'Corner',
        rarity: Rarity.COMMON,
        baseExits: [N, E],
    },
    {
        layoutId: 't_junction',
        name: 'T-Junction',
        rarity: Rarity.COMMON,
        baseExits: [N, E, W],
    },
    {
        layoutId: 'crossroad',
        name: 'Crossroad',
        rarity: Rarity.COMMON,
        baseExits: [N, S, E, W],
    },
    {
        layoutId: 'dead_end',
        name: 'Dead End',
        rarity: Rarity.COMMON,
        baseExits: [N], // Will be rotated
    },

    // --- FALLBACK ---
    {
        layoutId: 'solid',
        name: 'Solid Block',
        rarity: Rarity.COMMON,
        baseExits: [],
    }
];

export function getTemplatesWithExits(requiredExits: Direction[]): RoomTemplate[] {
    // Not used in new logic, but kept for compatibility or reference
    return ROOM_TEMPLATES;
}
