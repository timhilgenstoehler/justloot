import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';

export type GearTab = 'equipped' | 'inventory' | 'collection';

const TABS: { id: GearTab; label: string }[] = [
  { id: 'equipped', label: 'Equipped' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'collection', label: 'Collection' },
];

interface GearTabsProps {
  active: GearTab;
  onChange: (tab: GearTab) => void;
}

export function GearTabs({ active, onChange }: GearTabsProps) {
  return (
    <View style={styles.row}>
      {TABS.map((tab) => (
        <Pressable
          key={tab.id}
          style={[styles.tab, active === tab.id && styles.tabActive]}
          onPress={() => onChange(tab.id)}
        >
          <Text style={[styles.tabText, active === tab.id && styles.tabTextActive]}>
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.cta },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  tabTextActive: { color: colors.cta },
});
