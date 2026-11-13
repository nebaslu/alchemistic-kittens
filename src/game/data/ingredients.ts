import type { IngredientId, PrepStation } from '../types';

export interface IngredientDef {
  name: string;
  emoji: string;
  prep: PrepStation;
}

export const INGREDIENT_IDS: IngredientId[] = [
  'catnip',
  'hairball',
  'meow3am',
  'fairyDust',
  'sirenTear',
  'scratcherRope',
];

export const INGREDIENTS: Record<IngredientId, IngredientDef> = {
  catnip: { name: 'Hierba gatera', emoji: '🌿', prep: 'mortar' },
  hairball: { name: 'Bola de pelos', emoji: '🟤', prep: 'mortar' },
  meow3am: { name: 'Maullido 3AM', emoji: '😾', prep: 'mortar' },
  fairyDust: { name: 'Polvo de hadas', emoji: '✨', prep: 'mortar' },
  sirenTear: { name: 'Lágrima de sirena', emoji: '💧', prep: 'none' },
  scratcherRope: { name: 'Cuerda de rascador mordida', emoji: '🧶', prep: 'mortar' },
};
