import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { ItemReveal } from './ItemReveal';
import { colors } from '../constants/theme';
import { modalBackdropStyle } from '../utils/modalLayout';
import { useGameStore } from '../store/gameStore';

export function PackRevealModal() {
  const packReveal = useGameStore((s) => s.packReveal);
  const collectionCounters = useGameStore((s) => s.collectionCounters);
  const closePackReveal = useGameStore((s) => s.closePackReveal);

  const [cardIndex, setCardIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (packReveal) {
      setCardIndex(0);
      setDone(false);
    }
  }, [packReveal?.packName]);

  if (!packReveal) return null;

  const { packName, items } = packReveal;

  const collectionStats = {
    itemsFound:
      collectionCounters.common +
      collectionCounters.rare +
      collectionCounters.epic +
      collectionCounters.legendary +
      collectionCounters.mythic,
    legendariesFound: collectionCounters.legendary,
    mythicsFound: collectionCounters.mythic,
  };

  const handleClose = () => {
    setCardIndex(0);
    setDone(false);
    closePackReveal();
  };

  const handleRevealComplete = () => {
    if (!items) return;
    if (cardIndex < items.length - 1) {
      setCardIndex((i) => i + 1);
      return;
    }
    setDone(true);
  };

  const current = items?.[cardIndex];

  return (
    <Modal
      visible
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <SafeAreaView style={modalBackdropStyle(styles.backdrop)} edges={['top', 'bottom']}>
        <View style={styles.inner}>
          <Text style={styles.packName}>{packName}</Text>

          {!items ? (
            <View style={styles.opening}>
              <Text style={styles.openingMark}>?</Text>
              <Text style={styles.openingHint}>OPENING PACK</Text>
            </View>
          ) : !done && current ? (
            <>
              <Text style={styles.progress}>
                Card {cardIndex + 1} of {items.length}
              </Text>
              <View style={styles.revealWrap}>
                <ItemReveal
                  key={current.id}
                  item={current}
                  collectionStats={collectionStats}
                  onRevealComplete={handleRevealComplete}
                />
              </View>
            </>
          ) : (
            <View style={styles.doneBlock}>
              <Text style={styles.doneTitle}>Pack Opened</Text>
              <Text style={styles.doneSub}>
                {items?.length ?? 0} items added to inventory
              </Text>
              <Pressable style={styles.doneBtn} onPress={handleClose}>
                <Text style={styles.doneText}>Done</Text>
              </Pressable>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  inner: {
    width: '100%',
    maxWidth: 420,
    flex: 1,
    justifyContent: 'center',
    maxHeight: '100%',
  },
  packName: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.cta,
    letterSpacing: 4,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 16,
  },
  opening: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 360,
  },
  openingMark: {
    fontSize: 64,
    fontWeight: '200',
    color: colors.textMuted,
    letterSpacing: 4,
    marginBottom: 16,
  },
  openingHint: {
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 3,
  },
  progress: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 12,
  },
  revealWrap: {
    flexShrink: 1,
  },
  doneBlock: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  doneTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.cta,
    letterSpacing: 3,
    marginBottom: 8,
  },
  doneSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 28,
    textAlign: 'center',
  },
  doneBtn: {
    paddingVertical: 14,
    paddingHorizontal: 48,
    backgroundColor: colors.cta,
    borderRadius: 4,
  },
  doneText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0B0B0F',
    letterSpacing: 1,
  },
});
