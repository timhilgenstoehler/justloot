export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type ItemQuality = 'poor' | 'normal' | 'great' | 'perfect' | 'ancient';

export type Slot =
  | 'helmet'
  | 'shoulders'
  | 'chest'
  | 'bracers'
  | 'gloves'
  | 'ring1'
  | 'ring2'
  | 'necklace'
  | 'waist'
  | 'legs'
  | 'boots'
  | 'trinket1'
  | 'trinket2'
  | 'weapon';

export type StatCategory =
  | 'primary'
  | 'offensive'
  | 'defensive'
  | 'utility'
  | 'buildDefining'
  | 'specialEffect';

export type StatId =
  | 'vitality'
  | 'strength'
  | 'fortitude'
  | 'dexterity'
  | 'critChance'
  | 'critDamage'
  | 'fireDamage'
  | 'frostDamage'
  | 'lightningDamage'
  | 'poisonDamage'
  | 'bleedDamage'
  | 'lifeSteal'
  | 'executeChance'
  | 'blockChance'
  | 'dodgeChance'
  | 'healthRegen'
  | 'armorPercent'
  | 'fireResist'
  | 'frostResist'
  | 'lightningResist'
  | 'poisonResist'
  | 'bleedResist'
  | 'allResist'
  | 'attackSpeed'
  | 'lootQuality'
  | 'lootRarity'
  | 'goldFind'
  | 'arenaRatingGain'
  | 'thorns'
  // legacy (migration only)
  | 'dustFind'
  | 'experienceGain'
  | 'bossDamage'
  | 'attackRating'
  | 'enhancedDefense'
  | 'enhancedDamage'
  | 'maxLife'
  | 'maxStamina'
  | 'maxMana'
  | 'coldResist'
  | 'fasterHitRecovery'
  | 'manaSteal'
  | 'lightRadius'
  | 'magicFind';

export type BuildAffixId =
  | 'fireball'
  | 'poisonNova'
  | 'chainLightning'
  | 'berserk';

export type SpecialEffectId =
  | 'critAppliesBurn'
  | 'immunePoison'
  | 'immuneBurn'
  | 'immuneFrost'
  | 'reviveOncePerRun'
  | 'fireIgnoresArmor'
  | 'attackTwiceEveryThirdTurn';

export interface SecondaryStat {
  id: StatId;
  value: number;
  display: string;
}

export interface Item {
  id: string;
  slot: Slot;
  rarity: Rarity;
  quality: ItemQuality;
  name: string;
  defense?: number;
  stats: SecondaryStat[];
  buildAffix?: BuildAffixId;
  specialEffects?: SpecialEffectId[];
  power: number;
}

export interface InventoryItem extends Item {
  acquiredAt: number;
  foundDepth: number;
  favorite: boolean;
}

export type InventorySort = 'newest' | 'power' | 'rarity' | 'slot';
export type InventorySlotFilter = Slot | 'ring' | 'trinket' | 'all';
export type InventoryRarityFilter = Rarity | 'all';

export interface CompareRequest {
  source: 'pending' | 'inventory';
  itemId: string;
  targetSlot: Slot;
}

export const INVENTORY_CAPACITY = 1000;

export interface CombatStats {
  health: number;
  attack: number;
  defense: number;
  speed: number;
  critChance: number;
  critDamage: number;
  attackSpeed: number;
  healthRegen: number;
}

export type CombatEffectType =
  | 'lifeSteal'
  | 'fireDamage'
  | 'frostDamage'
  | 'lightningDamage'
  | 'poisonDamage'
  | 'bleedDamage'
  | 'thorns'
  | 'block'
  | 'dodge'
  | 'execute';

export interface CombatEffect {
  type: CombatEffectType;
  value: number;
  sourceItemName: string;
  sourceItemRarity?: Rarity;
}

export interface CombatResists {
  fire: number;
  cold: number;
  lightning: number;
  poison: number;
  bleed: number;
}

export type ElementType = 'fire' | 'cold' | 'lightning' | 'poison' | 'bleed';

export interface BuildCombatState {
  buildAffixes: BuildAffixId[];
  specialEffects: SpecialEffectId[];
  berserkActive: boolean;
  revivedThisRun: boolean;
}

export interface Enemy {
  name: string;
  health: number;
  attack: number;
  defense: number;
  speed: number;
  element?: ElementType;
  isBoss?: boolean;
}

export type CombatLogLineType =
  | 'header'
  | 'encounter'
  | 'round'
  | 'action'
  | 'proc'
  | 'health'
  | 'outcome';

export interface CombatLogLine {
  id: string;
  type: CombatLogLineType;
  text: string;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  healthLabel?: string;
  healthCurrent?: number;
  healthMax?: number;
  itemRarity?: Rarity;
}

export interface CombatContribution {
  itemName: string;
  label: string;
  amount: number;
}

export interface CombatMvpItem {
  itemName: string;
  label: string;
  amount: number;
}

export interface CombatCloseCall {
  enemyRemainingHp: number;
  enemyMaxHp: number;
}

export interface CombatResult {
  victory: boolean;
  log: CombatLogLine[];
  enemyName: string;
  rounds: number;
  locationName: string;
  depth: number;
  playerMaxHp: number;
  playerFinalHp: number;
  enemyMaxHp: number;
  enemyFinalHp: number;
  damageDealt: number;
  damageTaken: number;
  contributors: CombatContribution[];
  mvpItem: CombatMvpItem | null;
  closeCall: CombatCloseCall | null;
}

export type RunPhase = 'idle' | 'combat' | 'victory' | 'defeat';
export type RunMode = 'dungeon' | 'arena';

export interface CollectionEntry {
  fingerprint: string;
  name: string;
  slot: Slot;
  rarity: Rarity;
  quality: ItemQuality;
  depthFound: number;
  foundAt: number;
  viewed?: boolean;
  buildAffix?: BuildAffixId;
}

export interface CollectionCounters {
  common: number;
  rare: number;
  epic: number;
  legendary: number;
  mythic: number;
  ancient: number;
}

export interface FeedEntry {
  id: string;
  text: string;
  timestamp: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  arenaRating: number;
  powerScore: number;
  depth: number;
  timestamp: number;
  isPlayer?: boolean;
}

export interface LootBonuses {
  lootQuality: number;
  lootRarity: number;
}

export interface GameState {
  playerName: string;
  dust: number;
  totalRuns: number;
  depth: number;
  selectedDepth: number;
  equipment: Partial<Record<Slot, Item>>;
  inventory: InventoryItem[];
  pendingLoot: Item | null;
  compareRequest: CompareRequest | null;
  inventorySort: InventorySort;
  inventorySlotFilter: InventorySlotFilter;
  inventoryRarityFilter: InventoryRarityFilter;
  runPhase: RunPhase;
  runMode: RunMode;
  combatResult: CombatResult | null;
  combatLogIndex: number;
  showResult: boolean;
  lastSalvageDust: number | null;
  lastDefeatDust: number | null;
  collection: Record<string, CollectionEntry>;
  collectionCounters: CollectionCounters;
  feedLog: FeedEntry[];
  arenaRating: number;
  arenaWins: number;
  arenaLosses: number;
  leaderboard: LeaderboardEntry[];
  equippedLootBonuses: LootBonuses;
  runBuildState: BuildCombatState;
  arenaOpponentRating: number | null;
  arenaOpponentId: string | null;
}
