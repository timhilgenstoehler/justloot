import styles from './StoreButtons.module.css';

interface StoreButtonsProps {
  layout?: 'row' | 'column';
}

export function StoreButtons({ layout = 'row' }: StoreButtonsProps) {
  return (
    <div className={layout === 'column' ? styles.column : styles.row}>
      <button type="button" className={styles.storeBtn} disabled aria-label="App Store — coming soon">
        <span className={styles.storeIcon} aria-hidden>
          
        </span>
        <span className={styles.storeText}>
          <span className={styles.storeSoon}>Coming soon</span>
          <span className={styles.storeName}>App Store</span>
        </span>
      </button>
      <button type="button" className={styles.storeBtn} disabled aria-label="Google Play — coming soon">
        <span className={styles.storeIcon} aria-hidden>
          ▶
        </span>
        <span className={styles.storeText}>
          <span className={styles.storeSoon}>Coming soon</span>
          <span className={styles.storeName}>Google Play</span>
        </span>
      </button>
    </div>
  );
}
