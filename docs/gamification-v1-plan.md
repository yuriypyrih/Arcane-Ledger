# Gamification v1: planning document

Status: draft v2 for joint planning on branch `feat/introduce-gamification-v1`. Nothing is implemented. Sections 1 and 2 record decisions made by the product owner; **(proposed)** marks suggestions to decide together; **(verify)** marks unconfirmed facts.

## 1. Decisions so far (from the product owner)

| Topic | Decision |
|---|---|
| Goal | Inspire players and GMs to join in and make the app feel rewarding |
| Core loop | Collect XP, level up your profile, spend earned currency in a marketplace |
| XP sources | Daily check-in (XP for each day logged in) and one-off quests, for example "Become a GM" (create your first campaign) and "Join a campaign". More quests to be defined later |
| Audience | Both GMs and players |
| Progress | Follows the account across devices |
| Visibility | Other people can see your profile; profile is public or private (setting) |
| Marketplace | Buy themes and icons with in-game currency earned through the loop above. Not pay-to-win: cosmetics only, no real-money purchase |
| Art | Start with small icons; move to custom art when it is available |

## 2. Current state (facts from the repo scan; not exhaustive)

- No gamification code exists. The `User` model (`server/src/models/User.ts`) has email, nickname, role, theme mode and dice-roller preferences, but no progress, currency or profile-visibility fields.
- Campaigns, parties and encounters already exist on the server (`Campaign.ts`, `PartyGroup.ts`, `campaignService.ts`, `partyGroupService.ts`), so "create a campaign" and "join a campaign" are real server events.
- Analytics events are best effort and not a complete record (`docs/analytics-activity.md`), so they are not a safe basis for XP or currency.
- Theming today is light/dark mode (`themeMode`). Purchasable themes need a theme token system that does not exist yet (verify).
- Avatar and background texture metadata exist on characters, and the d20 viewport has textures. These are candidates for purchasable cosmetics (verify what applies to a profile versus a character).
- Day bucketing elsewhere uses UTC.

## 3. Key design implications

1. **XP and currency must be server-authoritative.** Because currency buys things and profiles are visible to others, the client cannot be trusted to grant it. This replaces the earlier idea of client-side evaluation.
2. **Award at the source event.** The server grants XP where the event happens (for example in campaign creation), not by a client claiming it. Each one-off quest is guarded by a unique `(account, quest)` record so it can only pay out once, even with retries.
3. **Use an append-only ledger.** Every XP or currency change is an immutable entry with an idempotency key (`daily:2026-11-26`, `quest:become-gm`). Balances and level are derived from the ledger, not stored as free counters. This matches the repo's "derive, don't keep duplicate counters" rule and the Master Chest idempotency approach in `docs/master-chest-transactions.md`.
4. **Daily check-in needs the server.** One grant per account per day, with a day boundary to decide (section 6). It works whenever the user is online and signed in.
5. **Marketplace needs entitlements.** The account stores owned items and which are equipped. Purchases are a ledger spend plus an entitlement, ideally atomic. The Master Chest transaction design is the closest existing pattern (verify fit; MongoDB multi-document transactions are not used in the server today).

## 4. Proposed v1 shape

**XP and levels**
- Profile level derived from total XP using a level table in code. Name it so it is not confused with character level (working name: "Ledger rank", to decide).
- Level-ups unlock marketplace items and titles; they do not change any character rule.

**Currency**
- One earn-only currency (working name to decide). Earned from quests and level-ups; spent only in the marketplace.
- Needs sinks and a modest earn rate so the marketplace stays interesting. Tuning is a later task.

**Quests (starter list, to define together)**

| Quest | Trigger | Repeat | Reward |
|---|---|---|---|
| Daily check-in | First qualifying visit of the day while signed in | Daily | Small XP (value to decide) |
| Become a GM | Create first campaign | Once | XP + currency |
| Join a campaign | Join a campaign for the first time | Once | XP + currency |
| Create your first character | First character created | Once | XP + currency |
| Complete your profile | Nickname and avatar icon chosen | Once | XP |
| More | To be found later | | |

**Marketplace**
- Catalog in code: id, name, type (icon or theme), price, level required, preview.
- Starts with small icons; themes follow once a theme token system exists.
- Preview before buying; equipped item stored on the profile.

**Profile**
- Public or private setting. Proposed default: private, with opt-in to public (decision needed).
- Public view shows only chosen fields (nickname, level, equipped icon, selected badges). Never email.

## 5. Opportunities (ideas to react to)

- **Quest chains for onboarding:** "Create a character", then "Open the codex", then "Take a rest", teaching the app while rewarding.
- **Recruit loop:** a GM invite link that gives both sides a reward when a new player joins a campaign. This directly serves "inspire players to join in".
- **Campaign cosmetics:** icons or banners unlocked per campaign for everyone in the party.
- **GM tools:** GM-awarded badges or XP to players for sessions. High value but abuse-prone, so v2 with caps.
- **Seasons and events:** limited-time themes and quests that give a reason to return.
- **Shareable profile card:** a public profile link with level and badges, usable for marketing.
- **Collections:** icon sets that reward completing the set.
- **Milestone badges:** "First long rest", "Survived at 0 HP", derived from character state where it already exists.
- **Later art upgrade:** keep the catalog data-driven so swapping small icons for custom art is a content change, not a code change.

## 6. Risks and design questions

| Risk | Why it matters | Mitigation (proposed) |
|---|---|---|
| Farming and abuse | XP and currency have value. Create-and-delete campaigns or alt accounts could farm rewards | One-time quests via unique record; require the campaign to persist or have another member before paying out; cap repeatables |
| Daily pressure | A streak that resets on a missed day can feel punishing | Flat daily XP with no streak loss, or a soft weekly bonus; avoid loss mechanics |
| Day boundary | UTC day versus the user's local day changes when the check-in resets | Decision needed; UTC matches existing analytics, local feels more natural |
| Inflation | Earn-only currency with weak sinks loses meaning | Price tiers, level gates, occasional limited items |
| Public profiles | Visibility of user data to others | Private by default, field allowlist, no email; Privacy review before launch |
| Fairness | "Not pay-to-win" must hold | Cosmetics only; no real-money path. If real-money purchases are ever considered, that needs Legal review |
| Scope creep | Many ideas, one team | v1 = ledger + daily check-in + 3 to 4 quests + profile + icon marketplace |
| Theme system | Purchasable themes need tokenized styling | Ship icons first, themes in a later step |

## 7. Approvals and owners (unverified; confirm who they are)

- **Product/design:** mechanics, tone, economy values, catalog.
- **Security:** new server endpoints and account data fields, abuse controls.
- **Privacy/Legal:** public profile visibility, new per-account data, any commitments to users about the currency or marketplace terms, and any move toward real-money purchases. This document is analysis only, not a compliance conclusion.

## 8. Open questions

- [ ] Day boundary for daily check-in: UTC or the user's local time?
- [ ] Daily check-in design: flat XP, or streak bonuses? Is a missed day allowed to cost anything (recommendation: no)?
- [ ] Profile default: private with opt-in public, or public by default?
- [ ] What does a public profile show: nickname, level, icon, badges, campaigns, characters?
- [ ] Is a campaign quest paid on creation, or only after the campaign has another member or a session?
- [ ] Names: the currency, the profile level, the marketplace.
- [ ] Do GMs and players have separate tracks (GM level vs player level) or one shared level?
- [ ] First batch of quests beyond the three above, and rough XP and currency values?
- [ ] Should purchased items be tradable or gifted between users? (Recommendation: no for v1.)
- [ ] Who owns economy balancing after launch?

## 9. Suggested next steps

1. Settle the open questions above, starting with day boundary, profile defaults and quest anti-abuse.
2. Agree the starter quest list and rough economy numbers.
3. Write a short technical design: ledger model, quest evaluators on the server, profile visibility fields, marketplace entitlements.
4. Build a thin vertical slice: ledger, daily check-in, one quest, level display.
5. Add the profile page and a first icon marketplace; add themes after a theme token system exists.
