# Arcane Ledger

![Arcane Ledger hero](app/src/assets/img/empty-roster-banner.webp)

**A 5e-ready campaign workbench for characters, rules, encounters, and table prep.**

Arcane Ledger is a polished, full-stack tabletop companion built around a persistent character
roster, a searchable compendium, and GM tools for preparing and running sessions. It is designed to
feel like a useful artifact at the table: fast enough for live play, detailed enough for character
management, and flexible enough for homebrew-heavy campaigns.

## What It Does

- **Character roster and sheets**: create, manage, duplicate, import, share, and sync characters
  with rich sheet sections for profile, stats, skills, proficiencies, features, feats, companions,
  equipment, spellcasting, and gameplay.
- **Gameplay tracking**: track hit points, temporary hit points, death saves, rests, resources,
  action economy, feature actions, traits, conditions, reactions, and dice-driven outcomes from one
  play-focused surface.
- **Spellcasting and inventory**: manage prepared spells, slots, rituals, always-prepared spells,
  equipment, containers, currency, attunement, custom items, and class-derived spell behavior.
- **Compendium browsing**: search and inspect spells, items, monsters, classes, species,
  backgrounds, rules, feats, divinities, and other reference material through reusable drawers and
  detail pages.
- **GM tools and prep tray**: build campaigns, organize party groups, prepare encounter templates,
  attach session notes, tune player visibility, and run live encounters with initiative and round
  tracking.
- **Companions and creatures**: create custom companions, inherit monster-backed creatures, inspect
  stat blocks, and reuse the same creature pipeline across sheets, compendium views, and encounter
  tools.

## Architecture

Arcane Ledger is split into two TypeScript projects:

- `app` is the frontend PWA. It owns the player-facing and GM-facing experience: routing,
  character sheets, the compendium, offline-friendly local state, sync status, dice rolling,
  drawers, modals, and responsive UI.
- `server` is the backend API. It handles authenticated accounts, cloud character storage, sharing,
  party groups, campaigns, encounter templates, live encounter state, support feedback, analytics,
  and database-backed reference browsing.

The frontend keeps most sheet behavior derivation-driven: class features, spells, resources,
actions, statuses, companions, and equipment flow from shared codex/runtime modules plus the current
character state. The backend keeps durable account and campaign data in MongoDB and exposes the app's
server-backed workflows under one versioned API surface.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, React Router, Redux Toolkit, React Hook Form, CSS Modules,
  lucide-react, Three.js, `vite-plugin-pwa`, and `vite-plugin-svgr`.
- **Backend**: Node.js, Express, TypeScript, MongoDB, Mongoose, cookie-based auth, rate limiting,
  Helmet, image processing, and structured service/controller layers.
- **Tooling and delivery**: independent npm projects, ESLint, Prettier, Docker, GitHub Actions,
  Ansible, Netlify configuration, and separate Docker builds for the frontend and backend.

## Running Locally

Install and run the frontend:

```bash
cd app
npm install
cp .env.example .env
npm run dev
```

Install and run the backend:

```bash
cd server
npm install
cp .env.example .env
npm run db:docker:up
npm run dev
```

Build each project from its own directory:

```bash
cd app && npm run build
cd server && npm run build
```

The frontend expects `VITE_API_BASE_URL` to point at the backend API root. The backend expects a
MongoDB connection and the environment values shown in `server/.env.example`.

## Project Notes

Arcane Ledger is unofficial, free, noncommercial fan software for supporting tabletop play. The
original project source and documentation are licensed under the PolyForm Noncommercial License;
rules text, game terms, third-party data, and third-party assets remain under their own licenses and
source terms.

Read the repository's licensing boundary before reusing material:

- [LICENSE.md](LICENSE.md)
- [NOTICE.md](NOTICE.md)
- [ATTRIBUTIONS.md](ATTRIBUTIONS.md)

This repository is actively maintained as a portfolio centerpiece and a real application. The codebase
prioritizes feature-derived character behavior, reusable interaction surfaces, and practical session
workflows over demo-only scaffolding.
