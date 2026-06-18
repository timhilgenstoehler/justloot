# Just Loot — Web (Next.js)

Browser-playable build of **Just Loot** for quick sharing with friends. Reuses the same game logic and screens from the Expo app via `react-native-web`.

## Local dev

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel (fastest)

1. Push this repo to GitHub
2. [vercel.com/new](https://vercel.com/new) → import the repo
3. Set **Root Directory** to `web`
4. Deploy — Vercel auto-detects Next.js

Or with the CLI:

```bash
cd web
npx vercel
```

## Deploy elsewhere

```bash
cd web
npm install
npm run build
npm run start
```

## Notes

- Saves use **localStorage** (per browser/device)
- Mobile-style layout is centered in a phone frame on desktop
- Expo-only APIs (haptics, native navigation) are shimmed for web
- Same routes as the app: `/`, `/arena`, `/gear`, `/leaderboard`, `/comparison`
