# Game sessions, live combat tracker and creature types

Handoff for the work on branch `feat/introduce-sessions` (cut from `main`). It records what exists, why it
was built that way, what is verified and what is not, so a new session can continue without the chat history.
Everything below is **established behavior in the branch** unless a section says otherwise.

Nothing on this branch is pushed. Security and Privacy/Legal review has **not** happened (see
[Approvals and open risks](#approvals-and-open-risks)).

## What was built

| Area                           | Summary                                                                                                                                                                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Game sessions                  | GM schedules sessions per campaign, players vote availability, GM starts and ends a live session, players get a Join button. Calendar, recap, duration, linked encounters.                                               |
| Live updates                   | Server-sent events (SSE), one shared connection per browser tab.                                                                                                                                                         |
| Email invites                  | Verified party members are emailed once per scheduled time.                                                                                                                                                              |
| Combat tracker (GM)            | Initiative values with auto-sort, roll creatures, packs that share one turn, server-decided turn controls (next, previous, skip, delay, undo), quick damage, creature picture links, resistances and immunities editing. |
| Combat tracker (player)        | Roll-for-initiative popup on the character sheet, re-roll approval by the GM, live party panel, characters in a party sync within ~1.5 s.                                                                                |
| Table view                     | Full-screen read-only page `/table/:partyGroupId` for a projector or a player's second screen.                                                                                                                           |
| Creature types                 | Copies of a creature in one encounter follow the same definition; "Link same monsters" for older copies.                                                                                                                 |
| Carried in from other branches | Local email-to-file mode (`6c41a851`) and Google sign-in (`ba43d739`).                                                                                                                                                   |

## Commits (oldest first)

`6c41a851` local email mode, `ba43d739` Google sign-in, `026ce525` sessions API + SSE + invites,
`6af9202e` tracker server upgrade, `0615b624` server tests, `d9f00405` shared event stream + API client,
`9c177f54` sessions UI, `00796489` GM tracker upgrade, `7c11138e` player initiative prompt + party panel,
`4138469e` table view, `f7063304` fix round tracker crash, `ce38c45a` re-roll approval (server),
`c4e302bc` packs as one box + pictures on table view, `16b9ce4d` quick damage + approvals on GM tracker,
`362206d8` re-roll prompt on the sheet, `5816c0b8` resistances on table view, `b3da6eda` show-resistances switch,
`7e3887cd` numbered copies, `674bb4fe` resistances editor in the drawer, `9d2c06d9` creature types (server),
`b4f3bee3` copies as links + picture preserved, `9d77b3ba` builder UI, `d9d51c9b` drawer notice.

`docs/gamification-v1-plan.md` is an older, unrelated, untracked analysis document; it is not part of this work.

## Where things live

### Server (`server/src/`)

- `models/GameSession.ts`: status `planned | live | ended | cancelled`; one live session per campaign (partial unique index); availability, linked prepared encounters, recap, revision, `invitedScheduledAt`.
- `services/gameSessionService.ts`, `controllers/gameSessionController.ts`, `routes/gameSessionRoutes.ts`: DM-only create/update/cancel/start/end (start and end are idempotent), player availability, upcoming sessions for a player, and the SSE endpoint.
- `services/campaignEventBus.ts`: in-process event bus (single server instance by decision). Event types: `game-session.updated|started|ended`, `live-encounter.updated`, `party-member.updated`, `encounter-creature.updated`. Events are hints; clients refetch.
- `services/campaignMembershipService.ts`: role resolution. A **player** is anyone who owns a non-deleted character in the campaign's selected party; the GM owns the campaign. Outsiders get the same 404 as a missing campaign.
- `services/partyLiveUpdates.ts`: character saves notify watchers of the party's live encounters.
- `services/gameSessionInviteService.ts`: emails verified party members through `authEmailService.sendAuthEmail`, claimed atomically so a retry cannot double-send.
- Tracker: `models/Campaign.ts` (tracker refs), `services/campaignLiveEncounterTrackerService.ts`, `services/liveEncounterTurnLogic.ts` (pure turn rules), `services/liveEncounterPlayerTurnService.ts`, `services/liveEncounterPlayerInitiativeService.ts`, `services/liveEncounterPlayerVisibility.ts` (what players may see).
- Creature types: `services/creatureTypeGroups.ts`, wired into `encounterTemplateService.ts` and `campaignService.ts`.

### Client (`app/src/`)

- `lib/campaignEventStream.ts` + `lib/useCampaignEvents.ts`: one `EventSource` per tab shared by all hooks; reopens only when the watched campaigns or parties change; refetch on reconnect; retries after the browser gives up.
- `api/gameSessions.ts`, `components/PlayerSessionsPanel/`, `pages/DmToolsPage/CampaignSessionsSection.tsx` (+ `CampaignSessionDetailsEditor.tsx`).
- GM tracker: `pages/DmToolsPage/CampaignLiveEncounter*.tsx`, `liveEncounterInitiative.ts` (sort, roll, packs, approvals), `useLiveEncounterTrackerPersistence.ts`, `encounterCreatureDamage.ts`, `CreatureDefensesEditor.tsx`, `CreatureImageUrlField.tsx`, `CreatureResistanceVisibilityToggle.tsx`, `CreatureTypeLinkNotice.tsx`.
- Player side: `components/CharactersPage/CharacterSheetPage/GameplayForm/InitiativePrompt.tsx`, `PartyInitiativeSubmit.tsx`, `StatsForm/InitiativeRerollModal.tsx`.
- Table view: `pages/TableDisplayPage/`. Encounter builder: `pages/DmToolsPage/EncounterCreatureBuilder.tsx`.

### HTTP surface added

- `/api/v1/game-sessions`: `GET /?campaignId=`, `POST /`, `GET /mine`, `GET /events` (SSE, repeatable `campaignId` and `partyGroupId`), `GET|PATCH /:id`, `POST /:id/cancel|start|end`, `PUT /:id/availability`.
- `/api/v1/campaigns/:id/live-encounter/turn` (POST). `PATCH /api/v1/party-groups/:id/live-encounter/initiative` (player).
- `POST .../prepared-encounters/:id/link-creature-types` and `POST /api/v1/encounter-templates/:id/link-creature-types` (owner only).

## Rules worth knowing

### Sessions

- Only the campaign owner edits sessions. Players vote only while a session is `planned`. Starting a session while another is live returns 409.
- Ending a session clears the live encounter that was started during it (the tracker stores `gameSessionId`).

### Live updates

- A failed or missed event is harmless: every client refetches on any event and after each reconnect.
- The shared stream tolerates inaccessible entries and fails only when none are accessible.

### Tracker

- GM saves are compare-and-set on the tracker `revision` (409 `LIVE_ENCOUNTER_REVISION_CONFLICT`); the client drops the stale edit and reloads. Saves are debounced 500 ms.
- Turn controls run on the server and are slot-aware: **a pack is one turn slot**. Undo only works while the revision still matches the last turn action.
- **Packs**: creatures with the same `groupId` that sit next to each other share one turn and one initiative value; only creatures can be packed.
- **Initiative**: a player's first value applies immediately; any later value is stored as `pendingInitiative` and only replaces the first if the GM approves (GM card shows approve/deny).
- Players see **GM-set creature pictures** whenever set. Everything else about a creature follows the visibility settings (`showResistancesAndImmunities` covers damage and status immunities).

### Creature types (per encounter or template)

- Creatures sharing `typeGroupId` follow the same definition: stat block with resistances/immunities, max HP, picture, description, player visibility, `type`, `duration`. Per creature: id, name, current HP, temporary HP, death saves.
- Duplicate sends `copyOfCreatureId`; the server links source and copy in one write and the copy inherits everything. `unlinkFromType` detaches. A type left with one creature dissolves. Clients cannot set `typeGroupId` directly.
- Editing any member copies only the **changed** definition fields to the others, so an HP-only edit never overwrites siblings.
- Copies are numbered: "Goblin" copied thrice gives Goblin 1, 2, 3 (`getNextCopyName`).

## How to run and check

```sh
npm run lint
npm test                  # app + server (server uses an isolated in-memory MongoDB)
npm run test:types
npm --prefix app run build && npm --prefix server run build
```

Last full run on this branch: 504 app tests and 64 server tests passing; lint, types and both builds clean.
Dev servers: `npm run dev` in `server/` and `app/` (app on `localhost:5174`, API on `localhost:3001`).

New tests added with approval: `server/tests/game-sessions-http.test.ts`, `server/tests/live-encounter-turn.test.ts`,
`server/tests/creature-types-http.test.ts`, `app/tests/rules/live-encounter-initiative.test.ts`,
`app/tests/rules/encounter-creature-copies.test.ts`. `AGENTS.md` requires approval before adding more.

## Not verified

- **No browser or two-account run was done.** All UI (calendar, popups, table view, packs, creature types) is covered by builds, lint, unit/HTTP tests and a few throwaway render checks, not by real use. Recommended walkthrough: GM schedules and starts a session; a second account votes and joins; GM starts combat; the player rolls from the popup; change HP and AC on the sheet and watch the tracker and `/table/:partyGroupId`; edit resistances on one goblin of a linked set; use Make independent and Link same monsters.
- Email was only exercised with a mocked sender. Without Resend configured, invites are logged (or written to the file set by `LOCAL_EMAIL_FILE_PATH`).
- Google sign-in needs `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` in `server/.env`; it was merged but not exercised here.
- Two `characters.test.ts` tests failed once each in a full run and passed on every rerun; the cause was not found.

## Known limitations

- A stale browser tab that edits a creature's definition can overwrite a sibling's newer values (diffing limits this to fields it changed).
- The sheet's initiative roll uses the dice popup and cannot report its result; the popup/re-roll prompt use their own roller (d20 + sheet bonus, no class-feature advantage).
- Players on a page other than their character sheet do not see the roll prompt until they open it.
- GM tracker shows packs as a bracket; only the table view draws one box.
- Creature types are per encounter by decision; the same goblin in two encounters is two types.
- Plain creatures given resistances get a minimal custom stat block; the encounter editor's Reset will not restore a real monster for them.
- Resistances are free text with no validation against real damage types or conditions.
- The in-memory event bus assumes one server instance. Multiple instances need shared pub/sub (Mongo change streams or Redis).
- Player availability is visible to every player in the session list.

## Approvals and open risks

Status: analysis and implementation complete; **approval not complete**.

- **Security** (required before production): new endpoints (game sessions, SSE stream, turn, player initiative, link creature types), the SSE channel, email sending, a new third-party sign-in path, and GM-supplied remote image links (they load from the viewer's browser and expose the viewer's IP to that host; only `https:` links are accepted).
- **Privacy / Legal** (required before production): emailing users, storing availability and attendance, player visibility of creature data.
- **Open question / gap:** who may see session recaps and attendance (owner only, or party members read-only) was never decided. Today the session API returns the recap (and everyone's availability) to party members in `GET /game-sessions?campaignId=` and `GET /game-sessions/mine`; only the UI does not show recaps to players. Decide this and, if recaps must stay GM-only, strip `recap` from the member record in `gameSessionService.toGameSessionRecord` callers.

## Useful context for the next session

- Work happens on `feat/introduce-sessions`; commit in small logical chunks with the `Co-Authored-By` trailer.
- `app/.env` is git-ignored and points at `http://localhost:3001/api/v1`. It once held a stale LAN IP that made the whole app look "offline"; use `localhost` unless testing from another device (then CORS origins in `server/.env` must include it).
- Running Prettier over whole folders reformats unrelated files; format only the files you changed.
- ESLint does not catch use-before-define inside callbacks (this crashed the round tracker once). To scan: `npx eslint --rule '{"no-use-before-define":["error",{"functions":false,"classes":false,"variables":true}],"@typescript-eslint/no-use-before-define":"off"}' <files>`.
- Shared editors (`CreatureEditorModal`, `CreatureCard`) are also used for character companions; extend around them instead of changing them.

## Ideas not started

Conditions and a defeated state on tracker cards; aria-live turn announcements and a "your turn" highlight; Discord notifications for sessions (availability is keyed by user id so a notifier can be added); a GM show/hide control for individual table-view cards; moving to shared pub/sub if the backend scales out.
