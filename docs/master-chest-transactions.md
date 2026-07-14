# Master Chest Operations

The Master Chest uses operation-based optimistic saves designed for standalone MongoDB. It does not
require MongoDB transactions, a replica set, a database lease, or a recovery lock.

The API route still uses `/transactions` because one request contains a batch of related operations.
That name does not mean the backend opens a MongoDB transaction.

## Mental model

A snapshot update says, “replace the chest with the copy I opened earlier.” That can overwrite a
different player's newer changes.

An operation says what the player intended:

```json
{
  "type": "transfer-item",
  "direction": "chest-to-character",
  "sourceStackId": "sword-stack-id",
  "quantity": 1
}
```

The backend applies that operation to the latest saved state. Independent operations can therefore
survive intervening saves, while an operation whose source item or currency is no longer available
is rejected with `MASTER_CHEST_OPERATION_CONFLICT`.

## Save flow

1. The frontend syncs the character and builds operations from the edited preview.
2. A process-local queue orders saves for the same party group.
3. The backend loads the latest Master Chest and character inventory.
4. The pure inventory helper validates and applies every requested operation to those snapshots.
5. The character inventory is updated with a character revision guard.
6. The Master Chest is updated with a chest revision guard.
7. If a guarded write loses a race, the backend restores the first write when necessary, reloads
   current state, and tries the operation batch again.
8. After five unsuccessful races, the request becomes a normal operation conflict and the frontend
   reloads current contents for review.

The queue has no MongoDB record. A backend restart clears it automatically, so it cannot leave the
Master Chest persistently busy.

## Semantic conflicts

The operation batch is rejected when it is no longer valid against the latest data. Examples:

- A requested stack no longer exists.
- A stack contains fewer copies than requested.
- The source currency balance is insufficient.
- A concurrent character or chest write keeps winning the revision guard.

The frontend discards that preview, reloads the current chest, and asks the player to review and
repeat the intended move.

## Revision guards

MongoDB updates one document atomically. The service uses that property by including the revision it
just read in each update filter. A failed match means another writer changed the document, so the
service does not overwrite that newer state.

Legacy party groups may not have `masterChestRevision` stored. A missing revision is treated as
revision `1`, and the revision filter accepts either representation.

## Idempotency

The frontend creates one UUID for each Save. After a successful save, the backend retains a committed
operation record for seven days. Repeating the same UUID returns current authoritative data without
moving an item or currency twice.

An incomplete record created by the older lease-and-journal implementation no longer locks the
party. Only a retry of that exact UUID is rejected and refreshed; a new operation can proceed.

## Standalone limitation

A player transfer changes a character document and a party-group document. Standalone MongoDB cannot
make those two writes atomic together. The service updates them sequentially and compensates the
character write if the chest revision loses a race.

A process crash in the short interval between those two document writes can still leave them out of
sync. This is the accepted tradeoff for the simpler standalone mechanism. Normal concurrent saves,
stale previews, and invalid item or currency requests remain guarded.

The process-local queue is shared by all requests handled by one backend process. If the application
is later scaled to multiple backend processes, revision retries still prevent blind chest overwrites,
but cross-process requests can require more retries because their queues are not shared.

## Code-reading path

1. `masterChestOperationBuilder.ts` converts the frontend preview into item and currency operations.
2. `createPartyGroupMasterChestTransaction` sends the operation batch and idempotency UUID.
3. `masterChestOptimisticOperationService.ts` reloads state, applies revision guards, retries races,
   and compensates the character write when needed.
4. `masterChestSaveQueue.ts` orders saves for one party within the backend process.
5. `masterChestInventory.ts` contains the pure operation validation and inventory transformations.
6. `MasterChestOperation.ts` retains completed UUIDs for idempotent replays.
7. `MasterChestModal.tsx` handles sync-first saving, conflict reloads, and authoritative character
   adoption.

## Key takeaway

The server treats each Save as a list of orders, not a stale replacement snapshot. It applies those
orders to the latest state when they remain possible and rejects them when their item or currency
requirements are no longer satisfied.
