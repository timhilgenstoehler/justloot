# Just Loot — Marketing Site (Next.js)

Landing page for **Just Loot**. Black background, gold accents, App Store / Google Play coming-soon CTAs.

Contact: `timhilgenstoehler+justloot@gmail.com`

## Local dev

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Marketing homepage |
| `/support` | Support & contact (App Store requirement) |
| `/privacy` | Privacy policy (App Store requirement) |
| `/stats` | Password-protected analytics dashboard |

## Environment variables

Optional — set in Vercel (or `.env.local`):

```
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

`/stats` requires Supabase env vars for the analytics dashboard (password: `lootlol`).

## Deploy to Vercel

1. Import repo → set **Root Directory** to `web`
2. Add env vars above
3. Deploy

```bash
cd web
npx vercel
```

## Notes

- Marketing-only Next.js app — no Expo / React Native code in the bundle.
- Native app lives in the repo root (`app/`, Expo).
