# Arcane Ledger PWA

Lightweight Arcane Ledger app with three core features:

1. Dice Roller with formula input, advantage/disadvantage, and roll history.
2. Character Sheets with create and edit flows stored in memory for now.
3. Encyclopedia / Codex with searchable placeholder rules content from JSON.

The workspace is a monorepo shell with two independent npm projects:

- `app`: Vite + React + TypeScript PWA.
- `server`: Node.js + Express + TypeScript backend with MongoDB import/read tooling.

## Getting Started

Install and run each project independently:

```bash
cd app
npm install
cp .env.example .env
npm run dev
```

```bash
cd server
npm install
npm run dev
```

Build each project from its own directory:

```bash
cd app && npm run build
cd server && npm run build
```

## Backend Notes

- The backend exposes its API under `server` at `/api/v1`.
- Set the frontend `VITE_API_BASE_URL` to the full backend API root, such as `http://localhost:3001/api/v1`. If it is omitted or blank, API-backed frontend features treat the backend as unavailable instead of guessing a same-origin API path.
- Monster fetch snapshots are stored under `server/data/open5e/monsters/fetch-MM-DD-YYYY/`.
- Item fetch snapshots are stored under `server/data/open5e/items/fetch-MM-DD-YYYY/`.
- Fetch Open5e monsters with `npm --prefix server run db:monsters:fetch`.
- Import the latest monster snapshot with `npm --prefix server run db:monsters:import`.
- Fetch Open5e items with `npm --prefix server run db:items:fetch`.
- Inspect the latest item snapshot schema with `npm --prefix server run db:items:inspect`.
- Import the latest item snapshot with `npm --prefix server run db:items:import`.

## Frontend Notes

- Global styles are loaded once in `app/src/main.tsx` through `global.css`.
- Component and page styling uses CSS Modules.
- The PWA is configured with `vite-plugin-pwa` to precache the app shell and use stale-while-revalidate for JSON assets.
- SVG React imports are standardized with `vite-plugin-svgr` using the Vite-native `?react` suffix:

```ts
import Logo from "./assets/dragon-dice.svg?react";
```

## Structure

```text
.
├── .gitignore
├── app
│   ├── public
│   └── src
└── server
    └── src
```
