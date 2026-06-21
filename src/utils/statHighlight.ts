/** Whether a secondary stat value is strong enough to highlight in gold. */
export function isStrongStatValue(label: string, numeric: number): boolean {
  switch (label) {
    case 'Crit':
      return numeric >= 35;
    case 'Crit Dmg':
      return numeric >= 200;
    case 'Atk Speed':
      return numeric >= 12;
    case 'Regen':
      return numeric >= 10;
    case 'Dodge':
      return numeric >= 12;
    case 'Block':
      return numeric >= 12;
    case 'Life Steal':
      return numeric >= 8;
    case 'Thorns':
      return numeric >= 15;
    case 'Execute':
      return numeric >= 8;
    case 'Fire Dmg':
    case 'Frost Dmg':
    case 'Lightning':
    case 'Poison Dmg':
    case 'Bleed Dmg':
      return numeric >= 25;
    case 'Fire Res':
    case 'Frost Res':
    case 'Lightning Res':
    case 'Poison Res':
    case 'Bleed Res':
      return numeric >= 45;
    case 'Build':
    case 'Special':
      return true;
    default:
      return false;
  }
}
