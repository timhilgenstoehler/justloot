import Link from 'next/link';
import styles from './SiteHeader.module.css';

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        JUST LOOT
      </Link>
      <nav className={styles.nav} aria-label="Main">
        <a href="#loop">Loop</a>
        <a href="#loot">Loot</a>
        <a href="#arena">Arena</a>
        <Link href="/support">Support</Link>
        <Link href="/privacy">Privacy</Link>
      </nav>
    </header>
  );
}
