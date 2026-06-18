import type { Slot } from '../types/game';

export const PREFIXES = [
  'Ashen',
  'Ancient',
  'Silent',
  'Moonforged',
  'Titan',
  'Cursed',
  'Forgotten',
  'Crimson',
  'Stormborn',
  'Hollow',
];

export const SUFFIXES = [
  'of Ash',
  'of Ruin',
  'of Embers',
  'of Silence',
  'of Storms',
  'of the Fallen King',
  'of Eternity',
  'of the Void',
  'of Frost',
  'of Blood',
];

export const OF_CONNECTORS = SUFFIXES.filter((s) => s.startsWith('of ')).map((s) =>
  s.replace('of ', ''),
);

const SLOT_BASES: Record<Slot, string[]> = {
  helmet: ['Crown', 'Helm', 'Mask'],
  shoulders: ['Pauldrons', 'Mantle', 'Guard'],
  chest: ['Plate', 'Hauberk', 'Aegis'],
  bracers: ['Bracers', 'Vambraces', 'Bindings'],
  gloves: ['Gauntlets', 'Grips', 'Gloves'],
  ring1: ['Ring', 'Band', 'Signet'],
  ring2: ['Ring', 'Band', 'Signet'],
  necklace: ['Amulet', 'Oath', 'Locket'],
  waist: ['Belt', 'Girdle', 'Cord'],
  legs: ['Greaves', 'Striders', 'Legguards'],
  boots: ['Boots', 'Treads', 'Walkers'],
  trinket1: ['Charm', 'Relic', 'Totem'],
  trinket2: ['Charm', 'Relic', 'Totem'],
  weapon: ['Blade', 'Sword', 'Staff', 'Mace'],
};

export function getBaseNameForSlot(slot: Slot): string {
  const bases = SLOT_BASES[slot];
  return bases[Math.floor(Math.random() * bases.length)];
}
