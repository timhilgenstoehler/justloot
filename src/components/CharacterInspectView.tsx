import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CharacterStatsPanel } from './CharacterStatsPanel';
import { EquipmentColumn } from './EquipmentColumn';
import { ItemDetailModal } from './ItemDetailModal';
import { PowerHeader } from './PowerHeader';
import { LEFT_SLOTS, RIGHT_SLOTS } from '../constants/slots';
import { SCREEN_PADDING } from '../constants/layout';
import { colors } from '../constants/theme';
import { calculateCharacterLoadout } from '../systems/characterStatsCalculator';
import type { Item, Slot } from '../types/game';
import type { PlayerInspectData } from '../services/inspectService';

interface CharacterInspectViewProps {
  data: PlayerInspectData;
  isSelf?: boolean;
  onFight?: () => void;
  fightDisabled?: boolean;
}

export function CharacterInspectView({
  data,
  isSelf,
  onFight,
  fightDisabled,
}: CharacterInspectViewProps) {
  const [detailItem, setDetailItem] = useState<{ item: Item; slot: Slot } | null>(null);

  const loadout = calculateCharacterLoadout(data.equipment);
  const combatStats = loadout.stats;

  return (
    <View style={styles.container}>
      <Text style={styles.badge}>{isSelf ? 'Your Build' : 'Inspecting'}</Text>

      <PowerHeader
        playerName={data.playerName}
        selectedDepth={data.depth}
        maxUnlockedDepth={data.depth}
        powerScore={data.powerScore}
        combatStats={combatStats}
        arenaRating={data.arenaRating}
      />

      <View style={styles.characterArea}>
        <EquipmentColumn
          slots={LEFT_SLOTS}
          equipment={data.equipment}
          align="left"
          onItemPress={(item) => {
            const slot = LEFT_SLOTS.find((s) => data.equipment[s.id]?.id === item.id)?.id;
            if (slot) setDetailItem({ item, slot });
          }}
        />
        <CharacterStatsPanel
          stats={combatStats}
          effects={loadout.effects}
          resists={loadout.resists}
          build={loadout.build}
        />
        <EquipmentColumn
          slots={RIGHT_SLOTS}
          equipment={data.equipment}
          align="right"
          onItemPress={(item) => {
            const slot = RIGHT_SLOTS.find((s) => data.equipment[s.id]?.id === item.id)?.id;
            if (slot) setDetailItem({ item, slot });
          }}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.record}>
          Arena {data.arenaWins}W · {data.arenaLosses}L
        </Text>
        <Text style={styles.hint}>Tap gear to view items — read only</Text>
        {!isSelf && onFight && (
          <Pressable
            style={({ pressed }) => [
              styles.fightButton,
              pressed && styles.fightPressed,
              fightDisabled && styles.fightDisabled,
            ]}
            onPress={onFight}
            disabled={fightDisabled}
          >
            <Text style={styles.fightText}>Fight in Arena</Text>
          </Pressable>
        )}
      </View>

      <ItemDetailModal
        item={detailItem?.item ?? null}
        mode="equipped"
        equippedSlot={detailItem?.slot}
        readOnly
        onClose={() => setDetailItem(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  badge: {
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 2,
  },
  characterArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING,
    minHeight: 0,
    gap: 6,
  },
  footer: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: 12,
    alignItems: 'center',
    gap: 8,
  },
  record: {
    fontSize: 12,
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  hint: {
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  fightButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 6,
    backgroundColor: colors.cta,
    alignItems: 'center',
  },
  fightPressed: { opacity: 0.85 },
  fightDisabled: { opacity: 0.4 },
  fightText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0B0B0F',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
