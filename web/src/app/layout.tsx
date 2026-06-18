import type { Metadata, Viewport } from 'next';
import { Providers } from '@/components/Providers';
import './globals.css';

export const dynamic = 'force-dynamic';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

const title = 'Just Loot — No Quests. No Story. Just Loot.';
const description =
  'Find loot, optimize your build, push deeper depths, and chase legendary gear in a minimalist RPG focused entirely on the thrill of item hunting.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
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
  maximumScale: 1,
  themeColor: '#0B0B0F',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="phone-shell">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
