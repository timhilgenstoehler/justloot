import { siteConfig } from '@/lib/siteConfig';
import styles from './StoreButtons.module.css';

interface StoreButtonsProps {
  layout?: 'row' | 'column';
}

export function StoreButtons({ layout = 'row' }: StoreButtonsProps) {
  return (
    <div className={layout === 'column' ? styles.column : styles.row}>
      <a
        href={siteConfig.appStoreUrl}
        className={`${styles.storeBtn} ${styles.storeBtnActive}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className={styles.storeIcon} aria-hidden>
          
        </span>
        <span className={styles.storeText}>
          <span className={styles.storeLabel}>Download on the</span>
          <span className={styles.storeNameActive}>App Store</span>
        </span>
      </a>
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
