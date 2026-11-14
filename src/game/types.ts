/** Tipos compartidos del juego (ingredientes, estaciones, items, estados del caldero). */
export type IngredientId =
  | 'catnip'
  | 'hairball'
  | 'meow3am'
  | 'fairyDust'
  | 'sirenTear'
  | 'scratcherRope';

export type PrepStation = 'mortar' | 'none';

export type StationKind =
  | 'ingredient'
  | 'mortar'
  | 'cauldron'
  | 'counter'
  | 'wandRack';

export type ItemKind = 'ingredient' | 'potion' | 'wand';

export interface Item {
  kind: ItemKind;
  ingredient?: IngredientId;
  processed?: boolean;
  potionId?: string;
}

export type CauldronState = 'empty' | 'cooking' | 'ready' | 'exploded';

export interface MedalThresholds {
  bronze: number;
  silver: number;
  gold: number;
}
