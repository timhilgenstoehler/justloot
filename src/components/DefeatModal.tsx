import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CombatSummary } from './CombatSummary';
import { colors } from '../constants/theme';
import { useGameStore } from '../store/gameStore';
import { modalBackdropStyle } from '../utils/modalLayout';

export function DefeatModal() {
  const runPhase = useGameStore((s) => s.runPhase);
  const combatResult = useGameStore((s) => s.combatResult);
  const lastDefeatDust = useGameStore((s) => s.lastDefeatDust);
  const dismissDefeat = useGameStore((s) => s.dismissDefeat);

  if (runPhase !== 'defeat' || !combatResult) return null;

  return (
    <Modal visible animationType="fade" transparent statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <CombatSummary
              result={combatResult}
              variant="defeat"
              lastDefeatDust={lastDefeatDust}
            />
          </ScrollView>

          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={dismissDefeat}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const mono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

const styles = StyleSheet.create({
  backdrop: modalBackdropStyle({
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    padding: 24,
  }),
  card: {
    backgroundColor: '#0D0D12',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#3A3A45',
    maxHeight: '85%',
    padding: 20,
  },
  scroll: {
    maxHeight: 480,
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 4,
  },
  button: {
    backgroundColor: colors.surface,
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontFamily: mono,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 2,
  },
});
