import { RoomType } from './types';

export enum Texture {
    FLOOR_ASPHALT = '/textures/floor_asphalt.png',
    FLOOR_WOOD_DARK = '/textures/floor_wood_dark.png',
    FLOOR_PIXEL = '/textures/floor_pixel.png',

    WALL_CONCRETE_PANEL = '/textures/wall_concrete_panel.png',
    WALL_CONCRETE_DARK = '/textures/wall_concrete_dark.png',
    WALL_BRUTALIST_DARK = '/textures/wall_brutalist_dark.png',
    WALL_PIXEL = '/textures/wall_pixel.png',

    CEILING_CONCRETE_DARK = '/textures/ceiling_concrete_dark.png',
    CEILING_INDUSTRIAL_DARK = '/textures/ceiling_industrial_dark.png',
    CEILING_PIXEL = '/textures/ceiling_pixel.png'
}

export interface RoomDefinition {
    name: string;
    color: string; // Used for map identification
    floor: Texture | string | null;
    wall: Texture | string | null;
    ceiling: Texture | string | null;
}

export const ROOM_DEFINITIONS: Record<RoomType, RoomDefinition> = {
    [RoomType.START]: {
        name: 'Inizio',
        color: '#4ade80', // Green
        floor: Texture.FLOOR_ASPHALT,
        wall: Texture.WALL_CONCRETE_PANEL,
        ceiling: null
    },
    [RoomType.PARKING]: {
        name: 'Parcheggio Esterno',
        color: '#6b7280', // Gray
        floor: Texture.FLOOR_ASPHALT,
        wall: Texture.WALL_CONCRETE_PANEL,
        ceiling: null
    },
    [RoomType.NORMAL]: {
        name: 'Corridoio',
        color: '#374151', // Dark Gray
        floor: Texture.FLOOR_WOOD_DARK,
        wall: Texture.WALL_CONCRETE_DARK,
        ceiling: Texture.CEILING_CONCRETE_DARK
    },
    [RoomType.OBJECTIVE]: {
        name: 'Obiettivo',
        color: '#f87171', // Red
        floor: Texture.FLOOR_WOOD_DARK,
        wall: Texture.WALL_BRUTALIST_DARK,
        ceiling: Texture.CEILING_INDUSTRIAL_DARK
    },
    [RoomType.EVENT]: {
        name: 'Sito Evento',
        color: '#fbbf24', // Amber
        floor: Texture.FLOOR_PIXEL,
        wall: Texture.WALL_PIXEL,
        ceiling: Texture.CEILING_PIXEL
    },
    [RoomType.END]: {
        name: 'Uscita',
        color: '#6366f1', // Indigo
        floor: Texture.FLOOR_WOOD_DARK,
        wall: Texture.WALL_CONCRETE_DARK,
        ceiling: Texture.CEILING_CONCRETE_DARK
    },
    [RoomType.EMPTY]: {
        name: 'Vuoto',
        color: '#000000', // Black
        floor: null,
        wall: null,
        ceiling: null
    }
};
