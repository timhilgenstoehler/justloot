import { COMBAT_BALANCE } from '../constants/combatBalance';
import { clampLegacyStatValue, migrateLegacyStatId } from '../systems/itemMigration';
import type {
  BuildAffixId,
  BuildCombatState,
  CombatEffect,
  CombatResists,
  CombatStats,
  ElementType,
  Item,
  LootBonuses,
  Slot,
  SpecialEffectId,
} from '../types/game';

const BASE_STATS: CombatStats = {
  health: 50,
  attack: 6,
  defense: 0,
  speed: 10,
  critChance: 5,
  critDamage: 150,
  attackSpeed: 0,
  healthRegen: 0,
};

const EMPTY_RESISTS: CombatResists = {
  fire: 0,
  cold: 0,
  lightning: 0,
  poison: 0,
  bleed: 0,
};

function pushCombatEffect(
  effects: CombatEffect[],
  item: Item,
  type: CombatEffect['type'],
  value: number,
): void {
  effects.push({
    type,
    value,
    sourceItemName: item.name,
    sourceItemRarity: item.rarity,
  });
}

export interface CharacterCombatLoadout {
  stats: CombatStats;
  effects: CombatEffect[];
  resists: CombatResists;
  build: BuildCombatState;
  lootBonuses: LootBonuses;
}

export function calculateCharacterLoadout(
  equipment: Partial<Record<Slot, Item>>,
): CharacterCombatLoadout {
  let health = BASE_STATS.health;
  let attack = BASE_STATS.attack;
  let defense = BASE_STATS.defense;
  let speed = BASE_STATS.speed;
  let critChance = BASE_STATS.critChance;
  let critDamage = BASE_STATS.critDamage;
  let attackSpeed = BASE_STATS.attackSpeed;
  let healthRegen = BASE_STATS.healthRegen;

  let armorPercent = 0;

  const effects: CombatEffect[] = [];
  const resists: CombatResists = { ...EMPTY_RESISTS };
  let allResist = 0;

  const buildAffixes = new Set<BuildAffixId>();
  const specialEffects = new Set<SpecialEffectId>();

  let lootQuality = 0;
  let lootRarity = 0;

  for (const item of Object.values(equipment)) {
    if (!item) continue;

    if (item.buildAffix) buildAffixes.add(item.buildAffix);
    for (const fx of item.specialEffects ?? []) specialEffects.add(fx);

    if (item.defense) {
      defense += item.defense * COMBAT_BALANCE.defenseFromItemScale;
    }

    for (const raw of item.stats) {
      const id = migrateLegacyStatId(raw.id);
      const value = clampLegacyStatValue(id, raw.value);

      switch (id) {
        case 'vitality':
          health += value * COMBAT_BALANCE.vitalityHealthMult;
          break;
        case 'strength':
          attack += value * COMBAT_BALANCE.strengthScale;
          break;
        case 'fortitude':
          defense += value * 0.5;
          break;
        case 'dexterity':
          speed += value;
          critChance += value * 0.5;
          break;
        case 'armorPercent':
        case 'enhancedDefense':
          armorPercent += value;
          break;
        case 'critChance':
          critChance += value;
          break;
        case 'critDamage':
          critDamage += value;
          break;
        case 'attackSpeed':
          attackSpeed += value;
          break;
        case 'healthRegen':
          healthRegen += value;
          break;
        case 'blockChance':
          pushCombatEffect(effects, item, 'block', value);
          break;
        case 'dodgeChance':
          pushCombatEffect(effects, item, 'dodge', value);
          break;
        case 'lifeSteal':
        case 'manaSteal':
          pushCombatEffect(effects, item, 'lifeSteal', value);
          break;
        case 'thorns':
          pushCombatEffect(effects, item, 'thorns', value);
          break;
        case 'fireDamage':
          pushCombatEffect(effects, item, 'fireDamage', value);
          break;
        case 'frostDamage':
          pushCombatEffect(effects, item, 'frostDamage', value);
          break;
        case 'lightningDamage':
          pushCombatEffect(effects, item, 'lightningDamage', value);
          break;
        case 'poisonDamage':
          pushCombatEffect(effects, item, 'poisonDamage', value);
          break;
        case 'bleedDamage':
          pushCombatEffect(effects, item, 'bleedDamage', value);
          break;
        case 'executeChance':
          pushCombatEffect(effects, item, 'execute', value);
          break;
        case 'fireResist':
          resists.fire += value;
          break;
        case 'frostResist':
        case 'coldResist':
          resists.cold += value;
          break;
        case 'lightningResist':
          resists.lightning += value;
          break;
        case 'poisonResist':
          resists.poison += value;
          break;
        case 'bleedResist':
          resists.bleed += value;
          break;
        case 'allResist':
          allResist += value;
          break;
        case 'lootQuality':
          lootQuality += value;
          break;
        case 'lootRarity':
        case 'magicFind':
          lootRarity += value;
          break;
        default:
          break;
      }
    }
  }

  armorPercent = Math.min(45, armorPercent);
  const defenseMult = 1 + armorPercent / (100 + armorPercent);
  defense = Math.round(defense * defenseMult);

  critChance = Math.min(50, Math.round(critChance));
  critDamage = Math.min(300, Math.round(critDamage));
  attackSpeed = Math.min(50, Math.round(attackSpeed));

  resists.fire = capResist(resists.fire + allResist);
  resists.cold = capResist(resists.cold + allResist);
  resists.lightning = capResist(resists.lightning + allResist);
  resists.poison = capResist(resists.poison + allResist);
  resists.bleed = capResist(resists.bleed + allResist);

  return {
    stats: {
      health: Math.round(health),
      attack: Math.max(1, Math.round(attack)),
      defense: Math.max(0, Math.round(defense)),
      speed: Math.max(1, Math.round(speed)),
      critChance,
      critDamage,
      attackSpeed,
      healthRegen,
    },
    effects,
    resists,
    build: {
      buildAffixes: [...buildAffixes],
      specialEffects: [...specialEffects],
      berserkActive: false,
      revivedThisRun: false,
    },
    lootBonuses: { lootQuality, lootRarity },
  };
}

function capResist(value: number): number {
  return Math.min(75, Math.max(0, Math.round(value)));
}

export function getElementalResist(resists: CombatResists, element: ElementType): number {
  if (element === 'cold') return resists.cold;
  return resists[element];
}

export function hasSpecialEffect(build: BuildCombatState, id: SpecialEffectId): boolean {
  return build.specialEffects.includes(id);
}

export function getBlockChance(effects: CombatEffect[]): number {
  return Math.min(
    35,
    effects.filter((e) => e.type === 'block').reduce((sum, e) => sum + e.value, 0),
  );
}

export function getDodgeChance(effects: CombatEffect[]): number {
  return Math.min(
    35,
    effects.filter((e) => e.type === 'dodge').reduce((sum, e) => sum + e.value, 0),
  );
}

export function getLifeSteal(effects: CombatEffect[]): number {
  return Math.min(
    20,
    effects.filter((e) => e.type === 'lifeSteal').reduce((sum, e) => sum + e.value, 0),
  );
}

export function getThornsDamage(effects: CombatEffect[]): { total: number; sources: CombatEffect[] } {
  const sources = effects.filter((e) => e.type === 'thorns');
  return {
    total: sources.reduce((sum, e) => sum + e.value, 0),
    sources,
  };
}

export function getDamageEffects(
  effects: CombatEffect[],
  type: CombatEffect['type'],
): CombatEffect[] {
  return effects.filter((e) => e.type === type);
}

export function getExecuteChance(effects: CombatEffect[]): number {
  return Math.min(
    25,
    effects.filter((e) => e.type === 'execute').reduce((sum, e) => sum + e.value, 0),
  );
}
