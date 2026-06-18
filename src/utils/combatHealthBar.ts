export const BAR_SEGMENTS = 16;

export function getHealthBarColor(ratio: number): string {
  if (ratio > 0.6) return '#4ADE80';
  if (ratio > 0.3) return '#FBBF24';
  return '#EF4444';
}

export function getHealthBarSegments(current: number, max: number): { filled: number; empty: number; ratio: number } {
  const ratio = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;
  const filled = Math.round(ratio * BAR_SEGMENTS);
  return { filled, empty: BAR_SEGMENTS - filled, ratio };
}
