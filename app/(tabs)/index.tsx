import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CharacterStatsPanel } from '../../src/components/CharacterStatsPanel';
import { CombatStatsRow, ProfileMetaRow } from '../../src/components/CombatStatsRow';
import { DepthSelector } from '../../src/components/DepthSelector';
import { EquipmentColumn } from '../../src/components/EquipmentColumn';
import { ItemDetailModal } from '../../src/components/ItemDetailModal';
import { LoginModal } from '../../src/components/LoginScreen';
import { ProfileStrip } from '../../src/components/ProfileStrip';
import { TabScreen } from '../../src/components/TabScreen';
import { LEFT_SLOTS, RIGHT_SLOTS } from '../../src/constants/slots';
import { SCREEN_PADDING } from '../../src/constants/layout';
import { colors } from '../../src/constants/theme';
import { generateBuildArchetype } from '../../src/systems/buildArchetype';
import { useAuthStore } from '../../src/store/authStore';
import type { Item, Slot } from '../../src/types/game';
import { useGameStore } from '../../src/store/gameStore';

export default function CharacterScreen() {
  const playerName = useGameStore((s) => s.playerName);
  const depth = useGameStore((s) => s.depth);
  const selectedDepth = useGameStore((s) => s.selectedDepth);
  const setSelectedDepth = useGameStore((s) => s.setSelectedDepth);
  const equipment = useGameStore((s) => s.equipment);
  const runPhase = useGameStore((s) => s.runPhase);
  const showResult = useGameStore((s) => s.showResult);
  const getPowerScore = useGameStore((s) => s.getPowerScore);
  const getCombatLoadout = useGameStore((s) => s.getCombatLoadout);
  const arenaRating = useGameStore((s) => s.arenaRating);
  const signOut = useAuthStore((s) => s.signOut);
  const session = useAuthStore((s) => s.session);
  const isDebugSession = useAuthStore((s) => s.isDebugSession);
  const canSignOut = !!session || isDebugSession;

  const [detailItem, setDetailItem] = useState<{ item: Item; slot: Slot } | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  const powerScore = getPowerScore();
  const loadout = getCombatLoadout();
  const combatStats = loadout.stats;
  const runDisabled = runPhase !== 'idle' || showResult;

  const buildTitle = useMemo(() => {
    const l = getCombatLoadout();
    return generateBuildArchetype(l.stats, l.effects, l.resists, l.build);
  }, [equipment, getCombatLoadout]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TabScreen>
        <ProfileStrip
          playerName={playerName}
          title={buildTitle}
          onSignIn={
            !canSignOut
              ? () => {
                  setLoginOpen(true);
                }
              : undefined
          }
          onSignOut={
            canSignOut
              ? () => {
                  void signOut();
                }
              : undefined
          }
          signOutLabel={isDebugSession ? 'Exit debug mode' : 'Sign out'}
        />
        <ProfileMetaRow
          maxDepth={depth}
          powerScore={powerScore}
          arenaRating={arenaRating}
        />
        <CombatStatsRow stats={combatStats} />

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
          <CharacterStatsPanel
            stats={combatStats}
            effects={loadout.effects}
            resists={loadout.resists}
            build={loadout.build}
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
        </View>
      </TabScreen>

      <ItemDetailModal
        item={detailItem?.item ?? null}
        mode="equipped"
        equippedSlot={detailItem?.slot}
        onClose={() => setDetailItem(null)}
      />

      <LoginModal visible={loginOpen} onClose={() => setLoginOpen(false)} />
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
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING,
    minHeight: 0,
    gap: 6,
  },
  footer: {
    marginTop: 0,
    paddingBottom: 26,
  },
});
