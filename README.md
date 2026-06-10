# Watch Hunt

> Find your grail at the right price.

A local-first web app that tracks watch references across 8 auction houses and grey market platforms, alerting you when a piece appears at or below your target price.

## Markets Monitored

**Auction Houses**
- Sotheby's
- Christie's
- Phillips
- Antiquorum

**Grey Market**
- Chrono24
- WatchCharts Marketplace
- WatchPatrol
- eBay (Auctions + Sold Listings)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

1. Click **Add Watch** — enter brand, model, optional reference number, and your max price
2. Click **Search** on any card to scan all markets immediately
3. Click **Search All** to scan your entire watchlist at once
4. Results are cached and shown with source badges — green means at/below your price

## Daily Automation

To run a morning search automatically, set a system scheduled task (Windows Task Scheduler or cron) to call:

```
POST http://localhost:3000/api/search
Body: { "all": true }
```

Or integrate with your existing daily briefing workflow.

## Deploying to Vercel

```bash
vercel deploy
```

No database needed — watch data is stored in `data/watches.json`.
For Vercel deployment, swap the JSON file storage for a database (Vercel KV or Postgres).

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS
- Local JSON file storage

## eBay API (real listings)

Without credentials, eBay results are search links. To get real listings
(exact item, price, seller feedback) inline:

1. Create a free developer account at https://developer.ebay.com
2. Create an app keyset (production) — you need the **App ID (Client ID)**
   and **Cert ID (Client Secret)**
3. Set environment variables:
   - Locally: create `.env.local` with
     `EBAY_CLIENT_ID=...` and `EBAY_CLIENT_SECRET=...`
   - Vercel: Project Settings → Environment Variables, add both, redeploy
