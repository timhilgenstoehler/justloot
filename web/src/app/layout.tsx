import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const dynamic = 'force-dynamic';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

const title = 'Just Loot — No Quests. No Story. Just Loot.';
const description =
  'Find gear. Push deeper. Die. Find better gear. A minimalist loot RPG for iOS.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: '%s | Just Loot',
  },
  description,
  openGraph: {
    title,
    description,
    type: 'website',
    images: [
      {
        url: '/social.png',
        width: 1200,
        height: 600,
        alt: 'Just Loot — No Quests. No Story. Just Loot.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/social.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
      <Analytics />
    </html>
  );
}
