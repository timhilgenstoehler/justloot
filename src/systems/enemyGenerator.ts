import { ENEMY_NAMES } from '../constants/enemies';
import { scaleEnemyStat } from '../constants/combatBalance';
import type { ElementType, Enemy } from '../types/game';

const ENEMY_ELEMENTS: Partial<Record<string, ElementType>> = {
  'Ember Shade': 'fire',
  'Frostbound Dead': 'cold',
  'Void Touched': 'poison',
  'Ash Stalker': 'fire',
  'Dust Wraith': 'poison',
  'Pale Collector': 'cold',
};

const RANDOM_ELEMENTS: ElementType[] = ['fire', 'cold', 'lightning', 'poison'];

function rollElement(depth: number, name: string): ElementType | undefined {
  if (depth < 2) return undefined;

  const themed = ENEMY_ELEMENTS[name];
  if (themed) return themed;

  if (Math.random() < 0.35) {
    return RANDOM_ELEMENTS[Math.floor(Math.random() * RANDOM_ELEMENTS.length)];
  }

  return undefined;
}

export function generateEnemy(depth: number): Enemy {
  const name = ENEMY_NAMES[Math.floor(Math.random() * ENEMY_NAMES.length)];
  const stats = scaleEnemyStat(depth);
  const element = rollElement(depth, name);

  return {
    name,
    ...stats,
    element,
  };
}
