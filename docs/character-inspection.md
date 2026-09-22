# Read-only character inspection

Party owners can inspect a current member's cloud character from the Party Manager. Site admins
can open User Details in Administration and select one of that user's cloud characters. Both
entry points use the same single-column Character Inspection modal with the standard large overlay sizing.

The modal loads the latest cloud save each time it opens. It has no Refresh control and does not
poll or retrieve changes that remain only on the player's device. Failed loads offer Retry. Missing,
deleted, or inaccessible characters show no preview.
Late responses from a previous character or a closed modal are ignored.

## Permissions and API

- `GET /api/v1/party-groups/:partyGroupId/characters/:characterSheetId` requires the authenticated
  party owner and a non-deleted character present in both the party's membership list and the
  character's current party assignment. Ordinary party members cannot inspect other full sheets.
- `GET /api/v1/administration/users/:userId/characters` requires a site admin and returns the user's
  non-deleted character summaries, newest updated first. It does not return full sheet bodies.
- `GET /api/v1/administration/users/:userId/characters/:characterSheetId` requires a site admin and
  a non-deleted character belonging to that user. Inspection responses use the existing cloud
  character serialization and are marked `private, no-store`.

Existing owner-only character mutations remain owner-only. These reads grant no editing, upload,
sharing, deletion, or inventory-transfer permissions. No schema migration is required.

## Presentation and isolation

Inspection hydrates a cloud document in modal state, without using the editable page's persistence
hook, adopting it into the active-character store, updating the local roster, or queuing a save.
Sections reuse the normal sheet components and rules. Their optional read-only boundary disables
mutation controls, blocks unauthorized click/keyboard/change handlers, and supplies mutation callbacks
that never evaluate an updater. Reference navigation is explicitly allowed. Profile image uploads are
disabled at the hook boundary. The profile uses its normal responsive layout, breakpoints, and portrait styling,
the saved background texture is displayed, and Character Stats follows Gameplay.
The background layers the chosen texture over the same light/dark paper backdrop as the normal
sheet. The scroll area leaves room for the existing portrait overhang. Round/combat controls are
visibly disabled and have no hover feedback during inspection.
Clicking the portrait opens the existing profile image modal. Its Portrait and Background Texture
tabs show the saved images (or the class default/no texture), without upload, crop, reset, or texture
selection controls. Closing this preview returns focus to the portrait and leaves the sheet open.

Inventory inspection is separate from the editable equipment workflow. Every inventory stack is
visible, including unequipped items; container contents and item details can be inspected. Item
drawers display stored item snapshots and modifications without mutation footers. Nested item
inspection consumes Escape before the sheet closes, and keyboard focus stays in the active modal.

Abilities, combat stats, notes, companions, species, feats, invocations, and spells open their existing reference drawers
without editing or gameplay actions. Stat references retain their calculation breakdowns, while
ability/initiative rolls, armor formula selection, and Hit Dice spending remain unavailable. Class features expand on demand, with their choice controls
disabled. Gameplay keeps its normal compact presentation. Nested references retain focus and
consume Escape before the parent sheet. Multiclass inspection shows each class build and
spellcasting source, plus all slot pools. Admin inspection preserves the user's pending role
selection when returning to User Details. User Details keeps its footer visible and scrolls the
account fields and character list when the content exceeds the viewport height.

## Verification

`server/tests/character-inspection.test.ts` exercises scoped reads and existing mutation restrictions
through authenticated HTTP and disposable MongoDB. `app/tests/integration/character-inspection.test.tsx`
checks disabled interactions, inventory navigation, multiclass rendering, state/storage isolation,
retryable failures, delayed responses, reference drawers, saved backgrounds, section order, and admin role drafts. `app/e2e/character-inspection.spec.ts`
uses the real disposable API for both entry points on desktop and mobile, including nested item
and reference inspection, portrait/background previews, fresh HP on reopening, unchanged revisions,
focus restoration, the normal responsive profile, standard modal sizing, and a scrollable User Details
body with an accessible footer on short screens.
