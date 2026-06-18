import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ItemDetailModal } from '../src/components/ItemDetailModal';
import { NavRow } from '../src/components/NavRow';
import { DepthSelector } from '../src/components/DepthSelector';
import { EquipmentColumn } from '../src/components/EquipmentColumn';
import { PowerHeader } from '../src/components/PowerHeader';
import { StartRunButton } from '../src/components/StartRunButton';
import { LEFT_SLOTS, RIGHT_SLOTS } from '../src/constants/slots';
import { SCREEN_PADDING } from '../src/constants/layout';
import { colors } from '../src/constants/theme';
import type { Item, Slot } from '../src/types/game';
import { useGameStore } from '../src/store/gameStore';

export default function CharacterScreen() {
  const playerName = useGameStore((s) => s.playerName);
  const dust = useGameStore((s) => s.dust);
  const depth = useGameStore((s) => s.depth);
  const selectedDepth = useGameStore((s) => s.selectedDepth);
  const setSelectedDepth = useGameStore((s) => s.setSelectedDepth);
  const equipment = useGameStore((s) => s.equipment);
  const runPhase = useGameStore((s) => s.runPhase);
  const showResult = useGameStore((s) => s.showResult);
  const getPowerScore = useGameStore((s) => s.getPowerScore);
  const getCombatLoadout = useGameStore((s) => s.getCombatLoadout);
  const startRun = useGameStore((s) => s.startRun);
  const arenaRating = useGameStore((s) => s.arenaRating);

  const [detailItem, setDetailItem] = useState<{ item: Item; slot: Slot } | null>(null);

  const powerScore = getPowerScore();
  const loadout = getCombatLoadout();
  const combatStats = loadout.stats;
  const runDisabled = runPhase !== 'idle' || showResult;

  return (
    <SafeAreaView style={styles.container}>
      <PowerHeader
        playerName={playerName}
        selectedDepth={selectedDepth}
        maxUnlockedDepth={depth}
        powerScore={powerScore}
        combatStats={combatStats}
        combatEffects={loadout.effects}
        combatResists={loadout.resists}
        arenaRating={arenaRating}
        dust={dust}
      />

      <NavRow disabled={runDisabled} />

      <View style={styles.characterArea}>
        <EquipmentColumn
          slots={LEFT_SLOTS}
          equipment={equipment}
          align="left"
          onItemPress={(item) => {
            const slot = LEFT_SLOTS.find((s) => equipment[s.id]?.id === item.id)?.id;
            if (slot) setDetailItem({ item, slot });
          }}
        />
        <EquipmentColumn
          slots={RIGHT_SLOTS}
          equipment={equipment}
          align="right"
          onItemPress={(item) => {
            const slot = RIGHT_SLOTS.find((s) => equipment[s.id]?.id === item.id)?.id;
            if (slot) setDetailItem({ item, slot });
          }}
        />
      </View>

      <View style={styles.footer}>
        <DepthSelector
          maxUnlocked={depth}
          selectedDepth={selectedDepth}
          onSelect={setSelectedDepth}
          disabled={runDisabled}
        />
        <StartRunButton onPress={startRun} disabled={runDisabled} />
      </View>

      <ItemDetailModal
        item={detailItem?.item ?? null}
        mode="equipped"
        equippedSlot={detailItem?.slot}
        onClose={() => setDetailItem(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  characterArea: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING,
    minHeight: 0,
  },
  footer: {
    paddingBottom: 6,
  },
});
