import type { IngredientId, StationKind } from '../types';
import { INGREDIENT_IDS } from './ingredients';

export interface StationPlacement {
  kind: StationKind;
  x: number;
  y: number;
  ingredient?: IngredientId;
  label?: string;
}

export interface OrderDef {
  recipeId: string;
  timeLimit: number;
}

export interface ScreenDef {
  id: string;
  name: string;
  maxActiveOrders: number;
  pool: OrderDef[];
  layout: StationPlacement[];
}

export interface WorldDef {
  id: string;
  name: string;
  emoji: string;
  screens: ScreenDef[];
}

const ingredientRow = (): StationPlacement[] =>
  INGREDIENT_IDS.map((ingredient, i) => ({
    kind: 'ingredient' as StationKind,
    x: 90 + i * 130,
    y: 150,
    ingredient,
  }));

export const WORLDS: WorldDef[] = [
  {
    id: 'torre',
    name: 'Rascador de la Torre del Mago',
    emoji: '🗼',
    screens: [
      {
        id: 'torre-s1',
        name: 'Pantalla 1 · Sótano de pociones',
        maxActiveOrders: 1,
        pool: [{ recipeId: 'ronroneo', timeLimit: 70 }],
        layout: [
          ...ingredientRow(),
          { kind: 'mortar', x: 100, y: 320, label: 'Almirez' },
          { kind: 'cuttingBoard', x: 100, y: 450, label: 'Tabla' },
          { kind: 'cauldron', x: 480, y: 350 },
          { kind: 'counter', x: 850, y: 320, label: 'Expendedor' },
          { kind: 'wandRack', x: 850, y: 490, label: 'Varita' },
        ],
      },
      {
        id: 'torre-s2',
        name: 'Pantalla 2 · Sala del caldero',
        maxActiveOrders: 2,
        pool: [
          { recipeId: 'ronroneo', timeLimit: 80 },
          { recipeId: 'antiPelos', timeLimit: 95 },
          { recipeId: 'sirena', timeLimit: 95 },
        ],
        layout: [
          ...ingredientRow(),
          { kind: 'mortar', x: 110, y: 300, label: 'Almirez' },
          { kind: 'cuttingBoard', x: 110, y: 450, label: 'Tabla' },
          { kind: 'cauldron', x: 500, y: 370 },
          { kind: 'counter', x: 860, y: 300, label: 'Expendedor' },
          { kind: 'wandRack', x: 860, y: 500, label: 'Varita' },
        ],
      },
      {
        id: 'torre-s3',
        name: 'Pantalla 3 · Ático del mago',
        maxActiveOrders: 3,
        pool: [
          { recipeId: 'antiPelos', timeLimit: 85 },
          { recipeId: 'sirena', timeLimit: 85 },
          { recipeId: 'montes', timeLimit: 100 },
          { recipeId: 'ronroneo', timeLimit: 70 },
        ],
        layout: [
          ...ingredientRow(),
          { kind: 'mortar', x: 120, y: 310, label: 'Almirez' },
          { kind: 'cuttingBoard', x: 120, y: 470, label: 'Tabla' },
          { kind: 'cauldron', x: 470, y: 360 },
          { kind: 'counter', x: 850, y: 310, label: 'Expendedor' },
          { kind: 'wandRack', x: 850, y: 510, label: 'Varita' },
        ],
      },
    ],
  },
];
