import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { siteConfig } from '@/lib/siteConfig';
import styles from '../legal.module.css';

export const metadata: Metadata = {
  title: 'Support — Just Loot',
  description: 'Get help with Just Loot on iOS.',
};

export default function SupportPage() {
  return (
    <div className={styles.page}>
      <SiteHeader />
      <main className={styles.main}>
        <h1>Support</h1>
        <p className={styles.lead}>
          Need help with Just Loot? We&apos;re here for you.
        </p>

        <section>
          <h2>Contact</h2>
          <p>
            Email us at{' '}
            <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.
            We typically respond within 2 business days.
          </p>
        </section>

        <section>
          <h2>Common questions</h2>
          <dl className={styles.faq}>
            <div>
              <dt>How do I save my progress?</dt>
              <dd>
                Sign in with email or play as a guest. Progress syncs to the cloud when
                you&apos;re connected.
              </dd>
            </div>
            <div>
              <dt>When is the app available?</dt>
              <dd>
                Just Loot is coming soon to the App Store and Google Play. Check back here
                or email us to get notified at launch.
              </dd>
            </div>
            <div>
              <dt>How do I delete my account?</dt>
              <dd>
                Email {siteConfig.supportEmail} from the address linked to your account.
                We&apos;ll delete your data within 30 days.
              </dd>
            </div>
            <div>
              <dt>App crashes or won&apos;t open?</dt>
              <dd>
                Try deleting and reinstalling the app. If the issue persists, email us
                with your device model and iOS version.
              </dd>
            </div>
          </dl>
        </section>

        <p className={styles.back}>
          <Link href="/">← Back to Just Loot</Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
