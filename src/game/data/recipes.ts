import type { IngredientId } from '../types';

export interface Recipe {
  id: string;
  name: string;
  emoji: string;
  complexity: 1 | 2 | 3;
  steps: IngredientId[];
  basePoints: number;
  cookTime: number;
  burnTime: number;
}

export const RECIPES: Record<string, Recipe> = {
  ronroneo: {
    id: 'ronroneo',
    name: 'Poción de Ronroneo',
    emoji: '🍵',
    complexity: 1,
    steps: ['catnip'],
    basePoints: 10,
    cookTime: 4,
    burnTime: 999,
  },
  antiPelos: {
    id: 'antiPelos',
    name: 'Antídoto Anti-Pelos',
    emoji: '🧴',
    complexity: 2,
    steps: ['hairball', 'meow3am'],
    basePoints: 20,
    cookTime: 6,
    burnTime: 30,
  },
  sirena: {
    id: 'sirena',
    name: 'Dulce Lágrima de Sirena',
    emoji: '🧪',
    complexity: 2,
    steps: ['sirenTear', 'fairyDust'],
    basePoints: 25,
    cookTime: 7,
    burnTime: 28,
  },
  montes: {
    id: 'montes',
    name: 'Poción del Gato Montés',
    emoji: '⚗️',
    complexity: 3,
    steps: ['catnip', 'scratcherRope', 'sirenTear'],
    basePoints: 40,
    cookTime: 9,
    burnTime: 24,
  },
};
