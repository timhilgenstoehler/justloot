import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LootPackCard } from '../../src/components/LootPackCard';
import { TabScreen, tabPanelStyle } from '../../src/components/TabScreen';
import { LOOT_PACKS } from '../../src/constants/lootPacks';
import { getLootPack } from '../../src/systems/lootPackSystem';
import { colors } from '../../src/constants/theme';
import { gameAlert } from '../../src/utils/gameAlert';
import { INVENTORY_CAPACITY } from '../../src/types/game';
import { useGameStore } from '../../src/store/gameStore';

export default function CraftScreen() {
  const dust = useGameStore((s) => s.dust);
  const depth = useGameStore((s) => s.depth);
  const inventoryCount = useGameStore((s) => s.inventory.length);
  const beginPackReveal = useGameStore((s) => s.beginPackReveal);
  const purchaseLootPack = useGameStore((s) => s.purchaseLootPack);
  const closePackReveal = useGameStore((s) => s.closePackReveal);

  const handlePurchase = (packId: string, packName: string) => {
    const pack = getLootPack(packId);
    if (!pack) return;

    if (dust < pack.dustCost) {
      gameAlert('Not Enough Dust', 'Salvage items from your inventory to earn dust.');
      return;
    }
    if (inventoryCount + pack.cardCount > INVENTORY_CAPACITY) {
      gameAlert('Inventory Full', 'Free up at least 5 slots before opening a pack.');
      return;
    }

    beginPackReveal(packName);

    requestAnimationFrame(() => {
      const result = purchaseLootPack(packId);
      if (!result.ok) {
        closePackReveal();
        if (result.reason === 'insufficient_dust') {
          gameAlert('Not Enough Dust', 'Salvage items from your inventory to earn dust.');
        } else if (result.reason === 'inventory_full') {
          gameAlert('Inventory Full', 'Free up at least 5 slots before opening a pack.');
        }
      }
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TabScreen style={styles.tabScreen}>
        <Text style={styles.dust}>{dust.toLocaleString()} Dust</Text>
        <Text style={styles.hint}>Loot rolled at your max depth ({depth})</Text>

        <View style={tabPanelStyle.panel}>
          <ScrollView style={tabPanelStyle.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.section}>Loot Packs</Text>
          {LOOT_PACKS.map((pack) => (
            <LootPackCard
              key={pack.id}
              pack={pack}
              depth={depth}
              dust={dust}
              onPurchase={() => handlePurchase(pack.id, pack.name)}
            />
          ))}
          </ScrollView>
        </View>
      </TabScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
  },
  tabScreen: {
    flex: 1,
  },
  dust: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.cta,
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 4,
  },
  hint: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 12,
  },
  section: {
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 4,
  },
});
