import { DUNGEON_NAME } from '../constants/enemies';
import type { CharacterCombatLoadout } from './characterStatsCalculator';
import {
  getBlockChance,
  getDamageEffects,
  getDodgeChance,
  getElementalResist,
  getExecuteChance,
  getLifeSteal,
  getThornsDamage,
  hasSpecialEffect,
} from './characterStatsCalculator';
import {
  createCombatTracker,
  getMvpItem,
  recordContribution,
  recordEnemyDamage,
  recordPlayerDamage,
} from './combatTracker';
import type {
  BuildCombatState,
  CombatEffect,
  CombatLogLine,
  CombatResists,
  CombatResult,
  CombatStats,
  ElementType,
  Enemy,
  Rarity,
} from '../types/game';

const MAX_ROUNDS = 20;

export interface CombatSimContext {
  depth: number;
  locationName?: string;
  weaponName?: string;
}

let logIdCounter = 0;

function nextLogId(): string {
  logIdCounter += 1;
  return `log-${logIdCounter}`;
}

interface Fighter {
  name: string;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  critChance: number;
  critDamage: number;
  effects: CombatEffect[];
  resists: CombatResists;
  element?: ElementType;
  isPlayer: boolean;
  isBoss?: boolean;
}

interface CombatContext {
  playerStats: CombatStats;
  build: BuildCombatState;
  round: number;
  weaponName: string;
  tracker: ReturnType<typeof createCombatTracker>;
}

interface LogState {
  log: CombatLogLine[];
  player: Fighter;
  enemy: Fighter;
}

function addLine(
  state: LogState,
  type: CombatLogLine['type'],
  text: string,
  itemRarity?: Rarity,
): void {
  state.log.push({
    id: nextLogId(),
    type,
    text,
    playerHp: state.player.health,
    playerMaxHp: state.player.maxHealth,
    enemyHp: state.enemy.health,
    enemyMaxHp: state.enemy.maxHealth,
    itemRarity,
  });
}

function addHealthSnapshot(state: LogState, label: string, current: number, max: number): void {
  state.log.push({
    id: nextLogId(),
    type: 'health',
    text: '',
    playerHp: state.player.health,
    playerMaxHp: state.player.maxHealth,
    enemyHp: state.enemy.health,
    enemyMaxHp: state.enemy.maxHealth,
    healthLabel: label,
    healthCurrent: current,
    healthMax: max,
  });
}

function addRoundHealthSummary(state: LogState, enemyName: string): void {
  addHealthSnapshot(state, 'YOU', state.player.health, state.player.maxHealth);
  addHealthSnapshot(state, enemyName.toUpperCase(), state.enemy.health, state.enemy.maxHealth);
  addLine(state, 'round', '');
}

function rollChance(percent: number): boolean {
  return Math.random() * 100 < percent;
}

function calcDamage(attack: number, defense: number, ignoreArmor = false): number {
  if (ignoreArmor || defense <= 0) return Math.max(1, attack);
  return Math.max(1, Math.round(attack * (100 / (100 + defense * 6))));
}

const ELEMENT_LABELS: Record<ElementType, string> = {
  fire: 'fire',
  cold: 'frost',
  lightning: 'lightning',
  poison: 'poison',
  bleed: 'bleed',
};

const ELEMENT_PROC_LABELS: Record<ElementType, string> = {
  fire: 'Burn Damage',
  cold: 'Frost Damage',
  lightning: 'Lightning Damage',
  poison: 'Poison Damage',
  bleed: 'Bleed Damage',
};

const ELEMENT_DAMAGE_TYPES: Record<ElementType, CombatEffect['type']> = {
  fire: 'fireDamage',
  cold: 'frostDamage',
  lightning: 'lightningDamage',
  poison: 'poisonDamage',
  bleed: 'bleedDamage',
};

const ELEMENT_VERBS: Record<ElementType, string> = {
  fire: 'burns',
  cold: 'freezes',
  lightning: 'shocks',
  poison: 'poisons',
  bleed: 'bleeds',
};

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function isImmune(build: BuildCombatState, element?: ElementType): boolean {
  if (!element) return false;
  if (element === 'poison' && hasSpecialEffect(build, 'immunePoison')) return true;
  if (element === 'fire' && hasSpecialEffect(build, 'immuneBurn')) return true;
  if (element === 'cold' && hasSpecialEffect(build, 'immuneFrost')) return true;
  return false;
}

function applyElementalDamage(
  element: ElementType,
  rawDamage: number,
  resists: CombatResists,
  defender: Fighter,
  ctx: CombatContext,
  state: LogState,
  sourceItemName?: string,
  sourceItemRarity?: Rarity,
): void {
  if (defender.isPlayer && isImmune(ctx.build, element)) {
    addLine(state, 'proc', `You are immune to ${ELEMENT_LABELS[element]}.`);
    return;
  }

  const resist = getElementalResist(resists, element);
  const reduced = Math.max(0, Math.round(rawDamage * (1 - resist / 100)));

  if (reduced <= 0) {
    addLine(
      state,
      'proc',
      `Your ${ELEMENT_LABELS[element]} resist absorbs the ${ELEMENT_LABELS[element]} damage.`,
    );
    return;
  }

  defender.health = Math.max(0, defender.health - reduced);

  if (defender.isPlayer) {
    recordPlayerDamage(ctx.tracker, reduced);
    addLine(
      state,
      'proc',
      resist > 0
        ? `${capitalize(ELEMENT_LABELS[element])} deals ${reduced} damage (${resist}% resisted).`
        : `${capitalize(ELEMENT_LABELS[element])} deals ${reduced} damage.`,
    );
  } else {
    const label = ELEMENT_PROC_LABELS[element];
    const itemName = sourceItemName ?? ctx.weaponName;
    recordEnemyDamage(ctx.tracker, reduced, itemName, label);
    addLine(
      state,
      'proc',
      sourceItemName
        ? `${sourceItemName} ${ELEMENT_VERBS[element]} the enemy for ${reduced} damage.`
        : `${capitalize(ELEMENT_LABELS[element])} deals ${reduced} damage.`,
      sourceItemRarity,
    );
  }
}

function applyProcDamages(
  attacker: Fighter,
  defender: Fighter,
  baseDamage: number,
  ctx: CombatContext,
  state: LogState,
): void {
  const types: CombatEffect['type'][] = [
    'fireDamage',
    'frostDamage',
    'lightningDamage',
    'poisonDamage',
    'bleedDamage',
  ];

  for (const type of types) {
    for (const proc of getDamageEffects(attacker.effects, type)) {
      const elementMap: Partial<Record<CombatEffect['type'], ElementType>> = {
        fireDamage: 'fire',
        frostDamage: 'cold',
        lightningDamage: 'lightning',
        poisonDamage: 'poison',
        bleedDamage: 'bleed',
      };
      const element = elementMap[type]!;
      const ignoreArmor = type === 'fireDamage' && hasSpecialEffect(ctx.build, 'fireIgnoresArmor');
      const procDmg = Math.max(1, Math.round(baseDamage * (proc.value / 100)));
      if (defender.isPlayer) {
        applyElementalDamage(element, procDmg, defender.resists, defender, ctx, state);
      } else {
        defender.health = Math.max(0, defender.health - procDmg);
        recordEnemyDamage(
          ctx.tracker,
          procDmg,
          proc.sourceItemName,
          ELEMENT_PROC_LABELS[element],
        );
        addLine(
          state,
          'proc',
          `${proc.sourceItemName} ${ELEMENT_VERBS[element]} the enemy for ${procDmg} damage.`,
          proc.sourceItemRarity,
        );
      }
    }
  }
}

function tryExecute(
  attacker: Fighter,
  defender: Fighter,
  effects: CombatEffect[],
  ctx: CombatContext,
  state: LogState,
): boolean {
  const chance = getExecuteChance(effects);
  if (chance <= 0) return false;
  const threshold = defender.maxHealth * 0.2;
  if (defender.health > threshold) return false;
  if (!rollChance(chance)) return false;

  const remaining = defender.health;
  defender.health = 0;
  if (attacker.isPlayer) {
    recordEnemyDamage(ctx.tracker, remaining, ctx.weaponName, 'Execute');
  }
  addLine(state, 'proc', 'Execute.');
  return true;
}

function performAttack(
  attacker: Fighter,
  defender: Fighter,
  ctx: CombatContext,
  state: LogState,
  swingIndex = 1,
): void {
  let attackPower = attacker.attack;
  if (attacker.isPlayer && ctx.build.buildAffixes.includes('berserk')) {
    if (attacker.health <= attacker.maxHealth * 0.5) {
      attackPower = Math.round(attackPower * 1.35);
      addLine(state, 'proc', 'Berserk surges through you.');
    }
  }

  const isCrit = rollChance(attacker.critChance);
  const critMult = isCrit ? attacker.critDamage / 100 : 1;
  const rawDamage = Math.round(calcDamage(attackPower, defender.defense) * critMult);

  if (defender.isPlayer) {
    const dodge = getDodgeChance(defender.effects);
    if (dodge > 0 && rollChance(dodge)) {
      const dodgeSource = defender.effects.find((e) => e.type === 'dodge');
      const sourceName = dodgeSource?.sourceItemName ?? 'Your gear';
      recordContribution(ctx.tracker, sourceName, 'Dodge', rawDamage);
      addLine(state, 'action', 'You dodge.');
      return;
    }

    const block = getBlockChance(defender.effects);
    if (block > 0 && rollChance(block)) {
      const blockSource = defender.effects.find((e) => e.type === 'block');
      const sourceName = blockSource?.sourceItemName ?? 'Your gear';
      recordContribution(ctx.tracker, sourceName, 'Block', rawDamage);
      addLine(state, 'proc', `${sourceName} blocks ${rawDamage} damage.`, blockSource?.sourceItemRarity);
      return;
    }
  }

  if (swingIndex > 1) {
    addLine(state, 'action', 'You strike again.');
  } else if (attacker.isPlayer) {
    addLine(state, 'action', 'You strike.');
  } else {
    addLine(state, 'action', `${attacker.name} attacks.`);
  }

  if (isCrit) {
    addLine(state, 'action', 'Critical Hit!');
  }

  const damage = rawDamage;
  defender.health = Math.max(0, defender.health - damage);

  if (attacker.isPlayer) {
    recordEnemyDamage(
      ctx.tracker,
      damage,
      ctx.weaponName,
      isCrit ? 'Critical Damage' : 'Strike Damage',
    );
    addLine(state, 'action', `${defender.name} takes ${damage} damage.`);
  } else {
    recordPlayerDamage(ctx.tracker, damage);
    addLine(state, 'action', `You take ${damage} damage.`);
  }

  if (tryExecute(attacker, defender, attacker.effects, ctx, state)) return;

  if (isCrit && attacker.isPlayer && hasSpecialEffect(ctx.build, 'critAppliesBurn') && !defender.isPlayer) {
    const burn = Math.max(1, Math.round(damage * 0.25));
    defender.health = Math.max(0, defender.health - burn);
    recordEnemyDamage(ctx.tracker, burn, ctx.weaponName, 'Burn Damage');
    addLine(state, 'proc', `Burn deals ${burn} damage.`);
  }

  if (attacker.isPlayer) {
    applyProcDamages(attacker, defender, damage, ctx, state);

    if (ctx.build.buildAffixes.includes('fireball')) {
      const fb = Math.max(1, Math.round(attackPower * 0.2));
      defender.health = Math.max(0, defender.health - fb);
      recordEnemyDamage(ctx.tracker, fb, 'Fireball', 'Fire Damage');
      addLine(state, 'proc', `Fireball hits ${defender.name} for ${fb} damage.`);
    }

    if (ctx.build.buildAffixes.includes('chainLightning') && rollChance(25)) {
      const bolt = Math.max(1, Math.round(attackPower * 0.15));
      defender.health = Math.max(0, defender.health - bolt);
      recordEnemyDamage(ctx.tracker, bolt, 'Chain Lightning', 'Lightning Damage');
      addLine(state, 'proc', `Chain Lightning arcs for ${bolt} damage.`);
    }

    if (
      ctx.build.buildAffixes.includes('poisonNova') &&
      defender.health > 0 &&
      defender.health <= defender.maxHealth * 0.3
    ) {
      const nova = Math.max(1, Math.round(attackPower * 0.3));
      defender.health = Math.max(0, defender.health - nova);
      recordEnemyDamage(ctx.tracker, nova, 'Poison Nova', 'Poison Damage');
      addLine(state, 'proc', `Poison Nova erupts for ${nova} damage.`);
    }

    const lifeSteal = getLifeSteal(attacker.effects);
    if (lifeSteal > 0) {
      const heal = Math.max(1, Math.round(damage * (lifeSteal / 100)));
      attacker.health = Math.min(attacker.maxHealth, attacker.health + heal);
      const stealSource = attacker.effects.find((e) => e.type === 'lifeSteal');
      recordContribution(
        ctx.tracker,
        stealSource?.sourceItemName ?? ctx.weaponName,
        'Life Steal',
        heal,
      );
      addLine(
        state,
        'proc',
        `${stealSource?.sourceItemName ?? 'Life Steal'} heals you for ${heal} health.`,
        stealSource?.sourceItemRarity,
      );
    }
  }

  if (!attacker.isPlayer && defender.isPlayer && defender.health > 0) {
    const thorns = getThornsDamage(defender.effects);
    for (const thorn of thorns.sources) {
      if (thorn.value <= 0) continue;
      attacker.health = Math.max(0, attacker.health - thorn.value);
      recordEnemyDamage(ctx.tracker, thorn.value, thorn.sourceItemName, 'Thorns');
      addLine(
        state,
        'proc',
        `${thorn.sourceItemName} strikes ${attacker.name} for ${thorn.value} damage.`,
        thorn.sourceItemRarity,
      );
    }

    if (attacker.element) {
      const elementalDamage = Math.max(1, Math.round(attacker.attack * 0.35));
      applyElementalDamage(
        attacker.element,
        elementalDamage,
        defender.resists,
        defender,
        ctx,
        state,
      );
    }
  }
}

function playerAttackPhase(
  player: Fighter,
  enemy: Fighter,
  ctx: CombatContext,
  state: LogState,
): void {
  const extraSwing =
    ctx.playerStats.attackSpeed > 0 && rollChance(Math.min(50, ctx.playerStats.attackSpeed));

  performAttack(player, enemy, ctx, state, 1);

  if (extraSwing && enemy.health > 0 && player.health > 0) {
    addLine(state, 'action', '');
    performAttack(player, enemy, ctx, state, 2);
  }

  if (
    hasSpecialEffect(ctx.build, 'attackTwiceEveryThirdTurn') &&
    ctx.round % 3 === 0 &&
    enemy.health > 0 &&
    player.health > 0
  ) {
    addLine(state, 'action', '');
    performAttack(player, enemy, ctx, state, 2);
  }
}

function resolveContext(
  context: CombatSimContext | number,
): { depth: number; locationName: string; weaponName: string } {
  if (typeof context === 'number') {
    return { depth: context, locationName: DUNGEON_NAME, weaponName: 'Your Strikes' };
  }
  return {
    depth: context.depth,
    locationName: context.locationName ?? DUNGEON_NAME,
    weaponName: context.weaponName ?? 'Your Strikes',
  };
}

export function simulateCombat(
  loadout: CharacterCombatLoadout,
  enemy: Enemy,
  context: CombatSimContext | number,
): CombatResult {
  logIdCounter = 0;
  const { depth, locationName, weaponName } = resolveContext(context);
  const tracker = createCombatTracker();
  const { stats: playerStats, effects: playerEffects, resists: playerResists, build } = loadout;

  const player: Fighter = {
    name: 'You',
    health: playerStats.health,
    maxHealth: playerStats.health,
    attack: playerStats.attack,
    defense: playerStats.defense,
    speed: playerStats.speed,
    critChance: playerStats.critChance,
    critDamage: playerStats.critDamage,
    effects: playerEffects,
    resists: playerResists,
    isPlayer: true,
  };

  const enemyFighter: Fighter = {
    name: enemy.name,
    health: enemy.health,
    maxHealth: enemy.health,
    attack: enemy.attack,
    defense: enemy.defense,
    speed: enemy.speed,
    critChance: 3,
    critDamage: 150,
    effects: [],
    resists: { fire: 0, cold: 0, lightning: 0, poison: 0, bleed: 0 },
    element: enemy.element,
    isPlayer: false,
    isBoss: enemy.isBoss,
  };

  const state: LogState = { log: [], player, enemy: enemyFighter };

  addRoundHealthSummary(state, enemyFighter.name);

  let rounds = 0;
  let victory = false;
  let revived = false;

  while (rounds < MAX_ROUNDS && player.health > 0 && enemyFighter.health > 0) {
    rounds += 1;
    const ctx: CombatContext = { playerStats, build, round: rounds, weaponName, tracker };

    addLine(state, 'round', `Round ${rounds}`);
    addLine(state, 'round', '');

    if (playerStats.healthRegen > 0 && player.health > 0) {
      const regen = Math.min(playerStats.healthRegen, player.maxHealth - player.health);
      if (regen > 0) {
        player.health += regen;
        recordContribution(tracker, 'Regeneration', 'Healing', regen);
        addLine(state, 'proc', `You regenerate ${regen} health.`);
      }
    }

    const playerFirst = player.speed >= enemyFighter.speed;

    if (playerFirst) {
      playerAttackPhase(player, enemyFighter, ctx, state);
      if (enemyFighter.health > 0 && player.health > 0) {
        addLine(state, 'action', '');
        performAttack(enemyFighter, player, ctx, state);
      }
    } else {
      performAttack(enemyFighter, player, ctx, state);
      if (enemyFighter.health > 0 && player.health > 0) {
        addLine(state, 'action', '');
        playerAttackPhase(player, enemyFighter, ctx, state);
      }
    }

    addRoundHealthSummary(state, enemyFighter.name);
  }

  if (player.health <= 0 && !revived && hasSpecialEffect(build, 'reviveOncePerRun')) {
    revived = true;
    build.revivedThisRun = true;
    player.health = Math.round(player.maxHealth * 0.4);
    recordContribution(tracker, 'Revive', 'Healing', player.health);
    addLine(state, 'proc', 'You revive.');
  }

  if (player.health > 0 && enemyFighter.health <= 0) {
    victory = true;
    addLine(state, 'outcome', 'Victory.');
  } else if (player.health <= 0) {
    victory = false;
    addLine(state, 'outcome', 'Defeated.');
  } else if (enemyFighter.health <= 0) {
    victory = true;
    addLine(state, 'outcome', 'Victory.');
  } else {
    victory = player.health >= enemyFighter.health;
    addLine(state, 'outcome', victory ? 'Victory.' : 'Defeated.');
  }

  const closeCall =
    !victory && enemyFighter.health > 0 && enemyFighter.health / enemyFighter.maxHealth <= 0.1
      ? { enemyRemainingHp: enemyFighter.health, enemyMaxHp: enemyFighter.maxHealth }
      : null;

  return {
    victory,
    log: state.log,
    enemyName: enemy.name,
    rounds,
    locationName,
    depth,
    playerMaxHp: player.maxHealth,
    playerFinalHp: Math.max(0, player.health),
    enemyMaxHp: enemyFighter.maxHealth,
    enemyFinalHp: Math.max(0, enemyFighter.health),
    damageDealt: tracker.damageDealt,
    damageTaken: tracker.damageTaken,
    contributors: tracker.contributions,
    mvpItem: getMvpItem(tracker.contributions),
    closeCall,
  };
}
