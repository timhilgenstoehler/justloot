import type { Slot } from '../types/game';

export interface SlotConfig {
  id: Slot;
  label: string;
  shortLabel: string;
}

export const LEFT_SLOTS: SlotConfig[] = [
  { id: 'helmet', label: 'Helmet', shortLabel: 'Helm' },
  { id: 'shoulders', label: 'Shoulders', shortLabel: 'Shld' },
  { id: 'chest', label: 'Chest', shortLabel: 'Chest' },
  { id: 'bracers', label: 'Bracers', shortLabel: 'Brac' },
  { id: 'gloves', label: 'Gloves', shortLabel: 'Glov' },
  { id: 'ring1', label: 'Ring 1', shortLabel: 'Ring1' },
  { id: 'ring2', label: 'Ring 2', shortLabel: 'Ring2' },
];

export const RIGHT_SLOTS: SlotConfig[] = [
  { id: 'necklace', label: 'Necklace', shortLabel: 'Neck' },
  { id: 'waist', label: 'Waist', shortLabel: 'Waist' },
  { id: 'legs', label: 'Legs', shortLabel: 'Legs' },
  { id: 'boots', label: 'Boots', shortLabel: 'Boots' },
  { id: 'trinket1', label: 'Trinket 1', shortLabel: 'Trnk1' },
  { id: 'trinket2', label: 'Trinket 2', shortLabel: 'Trnk2' },
  { id: 'weapon', label: 'Weapon', shortLabel: 'Wpn' },
];

export const ALL_SLOTS: Slot[] = [
  ...LEFT_SLOTS.map((s) => s.id),
  ...RIGHT_SLOTS.map((s) => s.id),
];

export function getSlotLabel(slot: Slot): string {
  const config = [...LEFT_SLOTS, ...RIGHT_SLOTS].find((s) => s.id === slot);
  return config?.label ?? slot;
}
