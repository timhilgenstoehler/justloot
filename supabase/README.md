# Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. **SQL Editor** → paste and run `schema.sql` from this folder
3. **Authentication** → Providers → enable **Email**
   - For quick testing with friends, disable "Confirm email" under Email provider settings
4. **Project Settings** → API → copy URL + `anon` public key into `.env` (see root `.env.example`)

## Tables

| Table | Purpose |
|-------|---------|
| `profiles` | Display name per user |
| `player_saves` | Full game JSON (gear, inventory, collection, arena stats) |
| `leaderboard_entries` | Arena rating, power, depth — real PvP opponents |
| `feed_entries` | Global activity feed (mythic drops, arena results) |

## Sync behavior

- Login loads cloud save → overwrites local cache
- Game changes debounce-sync to cloud (~1.5s)
- Leaderboard + feed refresh from server on arena/leaderboard screens
- Arena fights update **both players'** ratings via `apply_arena_result` RPC
