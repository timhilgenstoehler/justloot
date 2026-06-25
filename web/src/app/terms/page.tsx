import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { siteConfig } from '@/lib/siteConfig';
import styles from '../legal.module.css';

export const metadata: Metadata = {
  title: 'Terms of Service — Just Loot',
  description: 'Terms and conditions for using Just Loot.',
};

const LAST_UPDATED = 'June 24, 2026';

export default function TermsPage() {
  return (
    <div className={styles.page}>
      <SiteHeader />
      <main className={styles.main}>
        <h1>Terms of Service</h1>
        <p className={styles.meta}>Last updated: {LAST_UPDATED}</p>

        <section>
          <h2>Agreement</h2>
          <p>
            By downloading, installing, accessing, or using Just Loot (&ldquo;the App&rdquo;),
            including the web version at this site, you agree to these Terms of Service
            (&ldquo;Terms&rdquo;). If you do not agree, do not use the App.
          </p>
        </section>

        <section>
          <h2>The service</h2>
          <p>
            Just Loot is a loot-focused RPG provided by the operator of this website
            (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). The App may include
            cloud saves, leaderboards, arena play, and other online features. We may update,
            modify, or discontinue features at any time.
          </p>
        </section>

        <section>
          <h2>Accounts</h2>
          <ul>
            <li>You are responsible for activity on your account and for keeping your login credentials secure.</li>
            <li>You must provide accurate information when creating an account.</li>
            <li>You may play as a guest; guest progress may be lost if you delete the App or clear local data.</li>
            <li>We may suspend or terminate accounts that violate these Terms.</li>
          </ul>
        </section>

        <section>
          <h2>Acceptable use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Cheat, exploit bugs, use bots, or manipulate game systems</li>
            <li>Harass, abuse, or impersonate other players</li>
            <li>Attempt to gain unauthorized access to our systems or other accounts</li>
            <li>Reverse engineer, scrape, or redistribute the App except as permitted by law</li>
            <li>Use the App for any unlawful purpose</li>
          </ul>
        </section>

        <section>
          <h2>Virtual items and progress</h2>
          <p>
            In-game items, currency, ratings, and progress have no real-world monetary value.
            They are licensed to you for use within the App only. We do not guarantee that
            virtual items or progress will always be available or preserved.
          </p>
        </section>

        <section>
          <h2>Just Loot Plus</h2>
          <p>
            Just Loot Plus is an optional paid subscription that unlocks premium quality-of-life
            features in the App. Free players can enjoy the full core game; Plus is for players
            who want extra convenience and flexibility.
          </p>
          <p>Just Loot Plus currently includes:</p>
          <ul>
            <li>
              <strong>3 loadouts</strong> — save and switch between multiple gear setups
              without re-equipping manually each time.
            </li>
            <li>
              <strong>Auto salvage options</strong> — configure rules to automatically salvage
              unwanted loot based on your preferences.
            </li>
            <li>
              <strong>Future Plus features</strong> — new premium quality-of-life features we add
              to Just Loot Plus are included in your subscription at no extra charge.
            </li>
          </ul>
          <p>
            We may add, change, or remove individual Plus features over time as we improve the
            game, but subscribers will continue to receive the Plus feature set available at the
            time of their active subscription. Pricing, billing period, and cancellation are
            handled through the App Store or Google Play (or other platform where you subscribed).
            Subscriptions renew automatically unless you cancel before the renewal date in your
            platform account settings. Refunds are subject to the policies of the store where you
            purchased Plus.
          </p>
        </section>

        <section>
          <h2>Intellectual property</h2>
          <p>
            Just Loot, including its name, artwork, code, and game content, is owned by us or
            our licensors. These Terms do not grant you any ownership rights in the App.
          </p>
        </section>

        <section>
          <h2>Disclaimer</h2>
          <p>
            The App is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without
            warranties of any kind, whether express or implied. We do not warrant that the App
            will be uninterrupted, error-free, or free of harmful components.
          </p>
        </section>

        <section>
          <h2>Limitation of liability</h2>
          <p>
            To the fullest extent permitted by law, we are not liable for any indirect,
            incidental, special, consequential, or punitive damages, or for loss of data,
            profits, or goodwill arising from your use of the App.
          </p>
        </section>

        <section>
          <h2>Termination</h2>
          <p>
            You may stop using the App at any time. We may suspend or terminate your access if
            you breach these Terms or if we discontinue the service. Sections that by their
            nature should survive termination will remain in effect.
          </p>
        </section>

        <section>
          <h2>Changes</h2>
          <p>
            We may update these Terms from time to time. Continued use of the App after changes
            are posted constitutes acceptance of the revised Terms. The &ldquo;Last updated&rdquo;
            date at the top of this page indicates when they were last revised.
          </p>
        </section>

        <section>
          <h2>Privacy</h2>
          <p>
            Our collection and use of personal information is described in our{' '}
            <Link href="/privacy">Privacy Policy</Link>.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Questions about these Terms? Email{' '}
            <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.
          </p>
        </section>

        <p className={styles.back}>
          <Link href="/">← Back to Just Loot</Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
