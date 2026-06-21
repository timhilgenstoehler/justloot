import Link from 'next/link';
import { siteConfig } from '@/lib/siteConfig';
import styles from './SiteFooter.module.css';

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.brand}>
        <p className={styles.name}>{siteConfig.name.toUpperCase()}</p>
        <p className={styles.tagline}>{siteConfig.tagline}</p>
      </div>
      <nav className={styles.links} aria-label="Footer">
        <Link href="/support">Support</Link>
        <Link href="/privacy">Privacy</Link>
        <a href={`mailto:${siteConfig.supportEmail}`}>Contact</a>
      </nav>
      <p className={styles.copy}>
        © {new Date().getFullYear()} Just Loot. All rights reserved.
      </p>
    </footer>
  );
}
