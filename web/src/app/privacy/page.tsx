import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { siteConfig } from '@/lib/siteConfig';
import styles from '../legal.module.css';

export const metadata: Metadata = {
  title: 'Privacy Policy — Just Loot',
  description: 'Privacy policy for the Just Loot mobile app.',
};

const LAST_UPDATED = 'June 18, 2026';

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <SiteHeader />
      <main className={styles.main}>
        <h1>Privacy Policy</h1>
        <p className={styles.meta}>Last updated: {LAST_UPDATED}</p>

        <section>
          <h2>Overview</h2>
          <p>
            Just Loot (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) operates the Just Loot
            mobile application. This policy explains what information we collect, how we use it,
            and your choices.
          </p>
        </section>

        <section>
          <h2>Information we collect</h2>
          <ul>
            <li>
              <strong>Account information:</strong> Email address and display name if you create
              an account or sign in as a guest.
            </li>
            <li>
              <strong>Game data:</strong> Character progress, inventory, equipment, arena rating,
              and leaderboard entries stored to enable cloud saves and multiplayer features.
            </li>
            <li>
              <strong>Usage data:</strong> Basic analytics such as daily active use and run counts
              to improve the game.
            </li>
            <li>
              <strong>Device information:</strong> Device type and OS version when you contact
              support or when required for crash diagnostics.
            </li>
          </ul>
        </section>

        <section>
          <h2>How we use information</h2>
          <ul>
            <li>Provide cloud save and sync across devices</li>
            <li>Operate leaderboards, arena, and social feed features</li>
            <li>Improve gameplay and fix bugs</li>
            <li>Respond to support requests</li>
          </ul>
        </section>

        <section>
          <h2>Third-party services</h2>
          <p>
            We use Supabase for authentication and data storage. Data is processed according to
            their privacy policy. We do not sell your personal information.
          </p>
        </section>

        <section>
          <h2>Data retention</h2>
          <p>
            We retain your account and game data while your account is active. If you request
            deletion, we remove your data within 30 days except where retention is required by law.
          </p>
        </section>

        <section>
          <h2>Children</h2>
          <p>
            Just Loot is not directed at children under 13. We do not knowingly collect personal
            information from children under 13.
          </p>
        </section>

        <section>
          <h2>Your rights</h2>
          <p>
            You may request access, correction, or deletion of your data by contacting{' '}
            <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.
          </p>
        </section>

        <section>
          <h2>Changes</h2>
          <p>
            We may update this policy from time to time. We will post the revised version on
            this page with an updated date.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Questions about this policy? Email{' '}
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
