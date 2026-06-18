import type { Rarity } from '../types/game';

export const colors = {
  background: '#0B0B0F',
  surface: '#14141A',
  surfaceBorder: '#1E1E28',
  textPrimary: '#E8E6E3',
  textMuted: '#6B6B7B',
  cta: '#C9A227',
  ctaPressed: '#A8861F',
  silhouette: '#2A2A35',
  silhouetteGlow: '#3D3D4D',
} as const;

export const rarityColors: Record<Rarity, string> = {
  common: '#9D9D9D',
  rare: '#4A9EFF',
  epic: '#A855F7',
  legendary: '#F59E0B',
  mythic: '#EF4444',
};

export const rarityLabels: Record<Rarity, string> = {
  common: 'COMMON',
  rare: 'RARE',
  epic: 'EPIC',
  legendary: 'LEGENDARY',
  mythic: 'MYTHIC',
};
