import { StatsRow } from './StatsRow';
import type { CombatStats } from '../types/game';

interface CombatStatsRowProps {
  stats: CombatStats;
}

export function CombatStatsRow({ stats }: CombatStatsRowProps) {
  return (
    <StatsRow
      items={[
        { label: 'Health', value: stats.health },
        { label: 'Attack', value: stats.attack },
        { label: 'Defense', value: stats.defense },
        { label: 'Speed', value: stats.speed },
      ]}
    />
  );
}

interface ProfileMetaRowProps {
  maxDepth: number;
  powerScore: number;
  arenaRating: number;
}

export function ProfileMetaRow({ maxDepth, powerScore, arenaRating }: ProfileMetaRowProps) {
  return (
    <StatsRow
      items={[
        { label: 'Max Depth', value: maxDepth },
        { label: 'Power', value: powerScore.toLocaleString() },
        { label: 'Arena', value: arenaRating },
      ]}
    />
  );
}
