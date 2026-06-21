import styles from './GlowingItemCard.module.css';

export function GlowingItemCard() {
  return (
    <div className={styles.wrap} aria-hidden>
      <div className={styles.glow} />
      <article className={styles.card}>
        <div className={styles.rarity}>LEGENDARY</div>
        <div className={styles.icon}>⚔</div>
        <h3 className={styles.name}>Voidcleaver</h3>
        <p className={styles.slot}>Two-Handed Sword</p>
        <ul className={styles.stats}>
          <li>
            <span className={styles.statLabel}>Power</span>
            <span className={styles.statValue}>+847</span>
          </li>
          <li>
            <span className={styles.statLabel}>Crit</span>
            <span className={styles.statValue}>+12%</span>
          </li>
          <li>
            <span className={styles.statLabel}>Thorns</span>
            <span className={styles.statValue}>+8%</span>
          </li>
        </ul>
      </article>
    </div>
  );
}
