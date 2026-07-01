'use client';

import { useEffect, useState } from 'react';
import styles from './GlowingItemCard.module.css';

const AFFIXES = [
  '+23% Fire Resistance',
  '+23 Fortitude',
  '+12% Attack Speed',
  '+13% Dodge Chance',
];

const PARTICLE_COUNT = 18;

/** Auto-advance delays (ms) after each step begins. */
const STEP_MS = [700, 450, 550, 500, 380, 380, 380, 380, 450, 0] as const;

type RevealStep =
  | 'locked'
  | 'glow'
  | 'rarity'
  | 'name'
  | 'affix0'
  | 'affix1'
  | 'affix2'
  | 'affix3'
  | 'power'
  | 'complete';

const STEPS: RevealStep[] = [
  'locked',
  'glow',
  'rarity',
  'name',
  'affix0',
  'affix1',
  'affix2',
  'affix3',
  'power',
  'complete',
];

function stepIndex(step: RevealStep): number {
  return STEPS.indexOf(step);
}

function hasReached(current: RevealStep, target: RevealStep): boolean {
  return stepIndex(current) >= stepIndex(target);
}

export function GlowingItemCard() {
  const [step, setStep] = useState<RevealStep>('locked');
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setStep('complete');
      return;
    }

    let i = 0;
    let timer: number | undefined;
    setStep('locked');

    const advance = () => {
      i += 1;
      if (i >= STEPS.length) return;
      setStep(STEPS[i]!);
      if (i < STEPS.length - 1) {
        timer = window.setTimeout(advance, STEP_MS[i] ?? 400);
      }
    };

    timer = window.setTimeout(advance, STEP_MS[0] ?? 700);
    return () => window.clearTimeout(timer);
  }, []);

  const glowing = hasReached(step, 'glow');
  const showRarity = hasReached(step, 'rarity');
  const showName = hasReached(step, 'name');
  const affixCount =
    step === 'affix0' ? 1 :
      step === 'affix1' ? 2 :
        step === 'affix2' ? 3 :
          step === 'affix3' || hasReached(step, 'power') ? 4 : 0;
  const showPower = hasReached(step, 'power');
  const showHint = hasReached(step, 'complete');
  const isComplete = step === 'complete';

  return (
    <div className={styles.wrap} aria-hidden>
      <div className={`${styles.aura} ${glowing ? styles.auraActive : ''}`}>
        <div className={styles.glowOuter} />
        <div className={styles.glowMid} />
        <div className={styles.glowInner} />
      </div>

      <div className={`${styles.particles} ${glowing ? styles.particlesActive : ''}`}>
        {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
          <span key={i} className={styles.particle} data-i={i} />
        ))}
      </div>

      <article
        className={[
          styles.card,
          glowing ? styles.cardGlowing : styles.cardLocked,
          isComplete ? styles.cardIdle : '',
        ].join(' ')}
      >
        {glowing && <div className={styles.cardShine} />}

        {step === 'locked' && (
          <p className={`${styles.lockedMark} ${styles.revealPop}`}>?</p>
        )}

        {glowing && (
          <p className={`${styles.eyebrow} ${styles.revealFade}`}>ITEM FOUND</p>
        )}

        {showRarity && (
          <p className={`${styles.rarity} ${styles.revealSlam}`}>LEGENDARY</p>
        )}

        {showName && (
          <h3 className={`${styles.name} ${styles.revealFade}`}>
            HOLLOW SIGNET
            <br />
            OF EMBERS
          </h3>
        )}

        {affixCount > 0 && (
          <ul className={styles.affixes}>
            {AFFIXES.slice(0, affixCount).map((line) => (
              <li key={line} className={styles.revealAffix}>
                {line}
              </li>
            ))}
          </ul>
        )}

        {showPower && (
          <div className={`${styles.powerBlock} ${styles.revealFade}`}>
            <span className={styles.powerLabel}>POWER</span>
            <span className={styles.powerValue}>193</span>
          </div>
        )}

      </article>
    </div>
  );
}
