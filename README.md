# VAR — Verified Agent Records

> "VAR remembers every wrong call you made."

A World Cup 2026 prediction roast agent powered by **Walrus Memory**. Users submit match predictions; VAR stores them permanently on Walrus Mainnet and roasts users based on their prediction track record. The roast on Day 1 is polite. The roast on Day 7 is savage and personal — because VAR remembers everything.

Built for the **Walrus Memory World Cup Hackathon** (June 5–24, 2026).

---

## What It Does

1. **Connect** your Sui wallet (Slush / Suiet / Phantom)
2. **Predict** World Cup 2026 match results — saved permanently on Walrus Mainnet
3. **Get roasted** by the VAR AI agent based on your prediction history
4. **Share** your verdict card on X with a real OG image preview
5. **Champion pick** — lock in your World Cup winner once, forever

The longer you play, the more data VAR has. Day 1: polite. Day 4+: it names your bias, your blind spots, your recurring mistakes.

---

## Pages

| Route | Description |
|---|---|
| `/` | Landing page — hero, features, demo roast comparison |
| `/predict` | Submit match predictions (Group A–L) |
| `/history` | Full timeline: predictions + VAR verdict snapshots |
| `/champion` | Lock in your World Cup 2026 winner pick |
| `/leaderboard` | All wallets ranked by prediction accuracy |
| `/h2h?a=0x...&b=0x...` | Head-to-head (H2H) comparison between two wallets |
| `/card?userId=0x...` | Shareable roast card — downloadable PNG + X share |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend + API | Next.js 16 (App Router, TypeScript, Tailwind CSS v4) |
| Agent Memory | Walrus Memory — `@mysten-incubation/memwal` |
| LLM (Roast Engine) | Groq `llama-3.3-70b-versatile` via Vercel AI SDK |
| Sui Wallet | `@mysten/dapp-kit`, `@mysten/sui`, `@tanstack/react-query` |
| Football Data | football-data.org API v4 |
| Flag Images | flagcdn.com CDN |
| OG Images | `next/og` (Satori / ImageResponse) — edge runtime |
| Deployment | Vercel (Cron Jobs for auto-sync) |

---

## Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other commands:

```bash
npm run build      # Production build
npm start          # Start production server
npx tsc --noEmit   # Type check
```

---

## Environment Variables

Create `.env.local` in the project root. **Never commit this file.**

```env
# Walrus Memory
MEMWAL_PRIVATE_KEY=...
MEMWAL_ACCOUNT_ID=...
MEMWAL_SERVER_URL=https://relayer.memory.walrus.xyz

# Groq
GROQ_API_KEY=gsk_...

# Admin endpoint protection
ADMIN_SECRET=var-admin-2026

# Sui Network (public — safe to expose)
NEXT_PUBLIC_SUI_NETWORK=mainnet

# Football data
FOOTBALL_API_KEY=...

# Required for OG image absolute URLs (auto-set by Vercel, set manually for local testing)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Restart the dev server after any `.env.local` change.

---

## Memory Architecture

All state lives on Walrus Mainnet — no database, no Postgres, no SQLite.

| Memory type | Written when | Example |
|---|---|---|
| `[PREDICTION]` | User submits a match prediction | `[PREDICTION] User 0x... predicted Brazil to win...` |
| `[RESULT]` | Match is resolved (auto-sync or admin) | `[RESULT] Match match_537327 ... CORRECT` |
| `[PATTERN]` | Every 3rd resolved prediction per user | `[PATTERN] User 0x... bias toward favorites...` |
| `[LEADERBOARD]` | Every resolve, per user | `[LEADERBOARD] User 0x...: 10 predictions, 7 correct, 70% accuracy` |
| `[STREAK]` | Every resolve, per user | `[STREAK] User 0x... is on a 3-game losing streak` |
| `[CHAMPION_PICK]` | User locks in WC winner | `[CHAMPION_PICK] User 0x... predicts Brazil will win...` |
| `[CHAMPION_RESULT]` | Admin resolves actual winner | `[CHAMPION_RESULT] User 0x... champion pick Brazil — CORRECT` |
| `[ROAST_SNAPSHOT]` | After each RESULT/PATTERN write | Stored verdict text for replay without Groq cost |

---

## Groq Token Optimization

Groq free tier: 100,000 tokens/day. VAR uses a three-layer caching strategy:

| Layer | Where | TTL | Busted by |
|---|---|---|---|
| Server-side cache | `app/api/roast/route.ts` | 30 min | `?bust=1` param |
| Predict page cache | `localStorage['var-predict-roast-{userId}']` | Until new prediction | New prediction submit |
| History page cache | `localStorage['var-history-roast-{userId}']` | 1 hour | New prediction or TTL |

Cross-page invalidation: prediction submit writes `localStorage['var-last-prediction-{userId}']` timestamp. History page compares this against its own cache timestamp to detect staleness.

---

## Auto-Sync (Vercel Cron)

`GET /api/matches/sync` runs every 30 minutes on Vercel Pro, once daily on Hobby.

Manually trigger:
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/matches/sync" -Method GET
```

---

## Admin Endpoints

All require `x-admin-secret: var-admin-2026` header.

```powershell
# Manually resolve a match
Invoke-WebRequest -Uri "http://localhost:3000/api/predictions/resolve" `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json"; "x-admin-secret" = "var-admin-2026" } `
  -Body '{"matchId":"match_537327","actualWinner":"Mexico","homeScore":2,"awayScore":0}'

# Resolve champion winner
Invoke-WebRequest -Uri "http://localhost:3000/api/champion/resolve" `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json"; "x-admin-secret" = "var-admin-2026" } `
  -Body '{"actualWinner":"Brazil"}'
```

---

## Wallet Setup

VAR uses **Sui** wallets (not MetaMask — that's EVM only). Recommended wallets:
- **Slush** (formerly Sui Wallet, by Mysten Labs)
- **Suiet**
- **Phantom** (Sui version)

The wallet address is the userId — all memories on Walrus are keyed by wallet address. Public history pages (`/history?userId=0x...`) work without wallet connection.
