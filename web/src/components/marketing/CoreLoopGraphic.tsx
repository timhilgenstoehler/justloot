import type { CSSProperties } from 'react';
import styles from './CoreLoopGraphic.module.css';

const STEPS = [
  'Run dungeon',
  'Find loot',
  'Equip or salvage',
  'Push deeper',
  'Repeat',
] as const;

export function CoreLoopGraphic() {
  return (
    <div className={styles.wrap} aria-label="Core game loop">
      <div className={styles.ring} />
      <ol className={styles.steps}>
        {STEPS.map((step, i) => (
          <li key={step} className={styles.step} style={{ '--i': i } as CSSProperties}>
            <span className={styles.num}>{i + 1}</span>
            <span className={styles.label}>{step}</span>
          </li>
        ))}
      </ol>
      <div className={styles.orbit} />
    </div>
  );
}
