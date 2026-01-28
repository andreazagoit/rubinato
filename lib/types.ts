export type Direction = 'N' | 'S' | 'E' | 'W';

export enum RoomType {
  START = 'START',
  NORMAL = 'NORMAL',
  OBJECTIVE = 'OBJECTIVE',
  EVENT = 'EVENT',
  END = 'END',
  EMPTY = 'EMPTY'
}

export enum Rarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  UNIQUE = 'UNIQUE' // For one-off rooms
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface RoomTemplate {
  layoutId: string;
  name: string;
  rarity: Rarity;
  baseExits: Direction[]; // Exits when rotation is 0
  unique?: boolean; // If true, removed from deck after placement
  mandatory?: boolean; // If true, must be in the initial deck
  description?: string;
  visualTag?: string; // For frontend 'theme'
}

export interface RoomState {
  isVisited: boolean;
  isLocked: boolean;
}

export interface Room {
  id: string; // UUID
  coordinates: Coordinates;
  type: RoomType;

  // Template Info
  templateId: string;
  name: string;
  rarity: Rarity;

  // Visuals & Layout
  exits: Direction[]; // Final active exits
  rotation: 0 | 90 | 180 | 270;
  theme: string;

  // Contents
  staticObjects: any[];
  interactables: string[];
  items: string[];
  events: string[];

  state: RoomState;
}

export interface Grid {
  width: number;
  height: number;
  cells: (Room | null)[][];
}
