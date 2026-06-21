import { CoreLoopGraphic } from '@/components/marketing/CoreLoopGraphic';
import { GlowingItemCard } from '@/components/marketing/GlowingItemCard';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { StoreButtons } from '@/components/marketing/StoreButtons';
import styles from './marketing.module.css';

export default function HomePage() {
  return (
    <div className={styles.page}>
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>JUST LOOT</p>
            <h1 className={styles.heroTitle}>No quests. No story.<br />Just loot.</h1>
            <p className={styles.heroSub}>
              Find gear. Push deeper. Die. Find better gear.
            </p>
            <div className={styles.ctaRow}>
              <StoreButtons />
            </div>
          </div>
          <GlowingItemCard />
        </section>

        {/* Section 1 — Core Loop */}
        <section id="loop" className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionText}>
              <h2 className={styles.sectionTitle}>The entire game</h2>
              <ol className={styles.loopList}>
                <li>Run dungeon</li>
                <li>Find loot</li>
                <li>Equip or salvage</li>
                <li>Push deeper</li>
                <li>Repeat</li>
              </ol>
            </div>
            <CoreLoopGraphic />
          </div>
        </section>

        <div className={styles.divider} aria-hidden>⸻</div>

        {/* Section 2 — Loot */}
        <section id="loot" className={styles.section}>
          <div className={styles.sectionInnerNarrow}>
            <h2 className={styles.sectionTitle}>Every item can change your build.</h2>
            <p className={styles.body}>
              Stack crit, dodge, regen, thorns, resistances, attack speed, elemental damage.
            </p>
            <p className={styles.highlight}>
              A perfect Epic can beat a bad Legendary.
            </p>
          </div>
        </section>

        <div className={styles.divider} aria-hidden>⸻</div>

        {/* Section 3 — Packs */}
        <section id="packs" className={styles.section}>
          <div className={styles.sectionInnerNarrow}>
            <h2 className={styles.sectionTitle}>Turn bad loot into more loot.</h2>
            <p className={styles.body}>
              Salvage unwanted items into Dust.<br />
              Spend Dust on Seeker Packs.<br />
              Reveal 5 items one by one.
            </p>
          </div>
        </section>

        <div className={styles.divider} aria-hidden>⸻</div>

        {/* Section 4 — Arena */}
        <section id="arena" className={styles.section}>
          <div className={styles.sectionInnerNarrow}>
            <h2 className={styles.sectionTitle}>Someone is always ahead of you.</h2>
            <p className={styles.body}>
              Inspect other players.<br />
              Challenge them in Arena.<br />
              Climb the leaderboard.
            </p>
            <blockquote className={styles.quote}>
              &ldquo;Who the hell is qwerty?&rdquo;
            </blockquote>
          </div>
        </section>

        <div className={styles.divider} aria-hidden>⸻</div>

        {/* Section 5 — Loot Anywhere */}
        <section id="anywhere" className={styles.section}>
          <div className={styles.sectionInnerNarrow}>
            <h2 className={styles.sectionTitle}>One tap. One run. One more item.</h2>
            <p className={styles.comingSoon}>Coming soon:</p>
            <ul className={styles.featureList}>
              <li>Siri Shortcuts</li>
              <li>Home Screen Widgets</li>
              <li>Apple Watch runs</li>
            </ul>
            <p className={styles.siriLine}>&ldquo;Hey Siri, Just Loot.&rdquo;</p>
          </div>
        </section>

        {/* Final CTA */}
        <section className={styles.finalCta}>
          <p className={styles.finalLine}>
            The next Legendary could be your next run.
          </p>
          <StoreButtons layout="column" />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
