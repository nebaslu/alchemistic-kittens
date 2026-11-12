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

export interface LevelDef {
  name: string;
  hearts: number;
  maxActiveOrders: number;
  orders: OrderDef[];
  layout: StationPlacement[];
}

const ingredientRow = (): StationPlacement[] =>
  INGREDIENT_IDS.map((ingredient, i) => ({
    kind: 'ingredient' as StationKind,
    x: 90 + i * 130,
    y: 150,
    ingredient,
  }));

export const LEVELS: LevelDef[] = [
  {
    name: 'Nivel 1 · Aprendiz de torre',
    hearts: 3,
    maxActiveOrders: 1,
    orders: [
      { recipeId: 'ronroneo', timeLimit: 70 },
      { recipeId: 'ronroneo', timeLimit: 70 },
    ],
    layout: [
      ...ingredientRow(),
      { kind: 'mortar', x: 100, y: 300, label: 'Almirez' },
      { kind: 'cuttingBoard', x: 100, y: 430, label: 'Tabla' },
      { kind: 'cauldron', x: 480, y: 330 },
      { kind: 'counter', x: 850, y: 300, label: 'Expendedor' },
      { kind: 'wandRack', x: 850, y: 470, label: 'Varita' },
    ],
  },
  {
    name: 'Nivel 2 · Oficial alquimista',
    hearts: 3,
    maxActiveOrders: 2,
    orders: [
      { recipeId: 'ronroneo', timeLimit: 80 },
      { recipeId: 'antiPelos', timeLimit: 95 },
      { recipeId: 'sirena', timeLimit: 95 },
    ],
    layout: [
      ...ingredientRow(),
      { kind: 'mortar', x: 110, y: 280, label: 'Almirez' },
      { kind: 'cuttingBoard', x: 110, y: 430, label: 'Tabla' },
      { kind: 'cauldron', x: 500, y: 350 },
      { kind: 'counter', x: 860, y: 280, label: 'Expendedor' },
      { kind: 'wandRack', x: 860, y: 480, label: 'Varita' },
    ],
  },
  {
    name: 'Nivel 3 · Maestro de la torre',
    hearts: 3,
    maxActiveOrders: 3,
    orders: [
      { recipeId: 'antiPelos', timeLimit: 85 },
      { recipeId: 'sirena', timeLimit: 85 },
      { recipeId: 'montes', timeLimit: 100 },
      { recipeId: 'ronroneo', timeLimit: 70 },
    ],
    layout: [
      ...ingredientRow(),
      { kind: 'mortar', x: 120, y: 290, label: 'Almirez' },
      { kind: 'cuttingBoard', x: 120, y: 450, label: 'Tabla' },
      { kind: 'cauldron', x: 470, y: 340 },
      { kind: 'counter', x: 850, y: 290, label: 'Expendedor' },
      { kind: 'wandRack', x: 850, y: 490, label: 'Varita' },
    ],
  },
];
