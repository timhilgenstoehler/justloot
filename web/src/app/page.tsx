import { GlowingItemCard } from '@/components/marketing/GlowingItemCard';
import { ScreenshotShowcase } from '@/components/marketing/ScreenshotShowcase';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { StoreButtons } from '@/components/marketing/StoreButtons';
import styles from './marketing.module.css';

export default function HomePage() {
  return (
    <div className={styles.page}>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <h1 className={styles.heroTitle}>
              No quests.
              <br />
              No story.
              <br />
              <span className={styles.gold}>Just loot.</span>
            </h1>

            <div className={styles.ctaRow}>
              <StoreButtons />
            </div>
          </div>
          <GlowingItemCard />
        </section>

        <section className={styles.showcase}>
          <p className={styles.showcaseLead}>Run. Fight. Loot. Repeat.</p>
          <ScreenshotShowcase />
        </section>

        <section className={styles.finalCta}>
          <StoreButtons layout="column" />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
