# DnD Companion PWA

Lightweight DnD companion app with three core features:

1. Dice Roller with formula input, advantage/disadvantage, and roll history.
2. Character Sheets with create and edit flows stored in memory for now.
3. Encyclopedia / Codex with searchable placeholder rules content from JSON.

The workspace is a monorepo shell with two independent npm projects:

- `app`: Vite + React + TypeScript PWA.
- `server`: Node.js + Express + TypeScript boilerplate.

## Getting Started

Install and run each project independently:

```bash
cd app
npm install
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
