# Master Chest Transactions

The Master Chest uses operation-based updates so several players can save independent transfers
without overwriting each other. On a replica set it uses a MongoDB transaction. On standalone
MongoDB it automatically uses a lease, durable journal, revision guards, and recovery. This guide
explains both paths from a frontend developer's point of view.

## Mental model

### Snapshot updates and operations

A snapshot update says, “make the chest look exactly like this.” If Alice and Bob both loaded revision
12, Alice's saved snapshot makes Bob's revision-12 snapshot stale. Accepting Bob's snapshot would
remove Alice's changes, even if they touched different items.

An operation says what changed:

```json
{
  "type": "transfer-item",
  "direction": "chest-to-character",
  "sourceStackId": "sword-stack-id",
  "quantity": 1
}
```

The backend applies that command to the latest state. Alice can move a Sword while Bob moves a
Potion because both commands remain valid after either one commits first.

### Database transaction

A player transfer modifies two MongoDB documents: the Party Group containing the chest and the
Character Sheet containing the player's inventory. A database transaction gives the batch
atomicity: chest, character, history, and idempotency record all commit, or none of them do.

Transactions also provide isolation. Two requests may arrive together, but MongoDB establishes a
safe commit order. If both initially write the same Party Group document, one transaction retries
against the state committed by the other.

### Standalone fallback

Standalone MongoDB cannot provide a real multi-document transaction. The fallback therefore uses a
small saga:

1. An atomic lease serializes Master Chest writers for one party, including writers from another
   backend process.
2. The backend reads and validates the latest chest and character state.
3. A durable operation journal records the before and intended after inventory states.
4. Character and chest updates use compare-and-swap revision filters.
5. The operation is marked committed only after both writes succeed.
6. An interrupted prepared operation is completed on the next Master Chest request. If current data
   no longer matches either side of the journal, the chest is locked with
   `MASTER_CHEST_RECOVERY_REQUIRED` instead of guessing or overwriting newer data.

This is not perfectly atomic: a crash can leave the two documents temporarily inconsistent until
recovery runs. It still prevents ordinary concurrent saves, stale snapshots, and duplicate retries,
and it detects rather than silently overwrites a state that cannot be recovered safely.

### Semantic conflict

A write conflict is an internal database coordination event and is normally retried. A semantic
conflict means the retried command is no longer possible. Examples include:

- The requested stack no longer exists.
- The stack has fewer copies than requested.
- The requested currency balance is no longer sufficient.

The whole batch is rejected in these cases. The UI reloads current state and asks the player to
repeat the transfer.

### Idempotency key

The frontend creates one UUID for each Save. If the server commits but the response is lost, the
frontend retries with the same UUID. The server finds the completed operation and returns success
without applying it again.

An idempotency key answers, “have I already processed this intended request?” It is not a revision
and it does not control ordering. Reusing a UUID with different request content is rejected.

### Revision

Chest and character revisions still identify durable state versions. They remain useful for cloud
sync, diagnostics, and responses, but independent Master Chest operations are no longer rejected
merely because the chest revision advanced.

## Request lifecycle

```text
Player edits local preview
        ↓
Frontend flushes and syncs character
        ↓
Frontend derives operations against original stack IDs
        ↓
Frontend creates or reuses a Save UUID
        ↓
Backend selects atomic or standalone execution
        ↓
Backend reads latest chest and character
        ↓
Backend validates and applies every operation
        ↓
Atomic transaction, or lease + journal + guarded writes
        ↓
Frontend adopts the authoritative character response
```

The modal compares its base and final inventories by a transfer-safe item signature. Location-only
fields such as stack ID, equipped state, and on-hand count are excluded, while item modifications,
charges, stored spells, tags, and container contents remain part of the identity. The resulting
commands reference original stable stack IDs. Moving an item out and then back therefore produces no
net command.

## Code-reading path

1. Start with `masterChestOperationBuilder.ts` to see how the frontend converts a preview into item
   and currency operations.
2. Follow `createPartyGroupMasterChestTransaction` in `app/src/api/partyGroups.ts` to see the wire
   contract.
3. Read the transaction route and controller in the Party Group backend flow.
4. Continue into `masterChestTransactionCoordinator.ts` to see capability-based path selection.
5. Read `masterChestTransactionService.ts` for the fully atomic replica-set implementation.
6. Read `masterChestStandaloneTransactionService.ts` for leases, journaling, guarded writes,
   compensation, and recovery.
7. Read `masterChestInventory.ts` for pure stack, quantity, currency, and history transformations.
8. Inspect `MasterChestOperation.ts` and `MasterChestLease.ts` for idempotency, recovery state, and
   per-party writer serialization.
9. Return to `MasterChestModal.tsx` and `useCharacterSheetPersistence.ts` for sync-first saving,
   conflict handling, and adoption of the server-returned character.

## Debugger exercises

Use development or staging data; do not start these exercises against production data.

1. Pause before the API call and inspect the derived operation array.
2. Send the same request and UUID twice. The second response should set `replayed` to `true` and no
   quantity should change twice.
3. Submit independent Sword and Potion transfers concurrently. Both should succeed.
4. Submit two withdrawals for the last copy of one stack. One should receive
   `MASTER_CHEST_OPERATION_CONFLICT` with the failing operation index and available quantity.
5. On standalone MongoDB, interrupt the process after the first guarded write. Retry the same UUID
   and observe the prepared journal recover without applying the transfer twice.
6. Add a temporary throw before the replica-set transaction commit and confirm neither chest nor
   character changes. Remove the throw immediately after the exercise.

## Replica-set deployment

MongoDB multi-document transactions require a replica set. Both Docker Compose definitions configure
an authenticated single-node set named `rs0`, generate a private keyfile, and run `rs.initiate()`
idempotently. The backend checks `hello.setName` during startup and selects the fully atomic path when
available. If it is absent, startup continues and the standalone fallback is selected automatically.

Before updating an existing production MongoDB:

1. Stop application writes and create a verified `mongodump`.
2. Preserve the current database files or restore the dump into the named `/data/db` volume.
3. Deploy the keyfile and replica-set Compose configuration.
4. Add `replicaSet=rs0` to `MONGODB_URI`; container-to-container production connections should use
   the advertised `mongodb:27017` member address.
5. Start MongoDB, wait for the replica initializer, and confirm `rs.status().ok === 1`.
6. Compare critical collection counts with the pre-deployment backup before starting the backend.

Local host connections may add `replicaSet=rs0&directConnection=true` when using the provided
replica-set Compose file, because its member advertises the Docker service hostname.

Replica-set deployment remains recommended for production because it removes the temporary
inconsistency window and the possibility of manual recovery. It is no longer required to run the
backend or use operation-based Master Chest saves.

## Key takeaway

Concurrent does not mean MongoDB changes one document literally simultaneously. Requests can arrive
together, and the application re-evaluates each intention against current state. A replica set
provides atomic commits; standalone mode serializes writers and journals the two guarded writes.
Independent intentions survive, while impossible or unsafe operations become explicit conflicts.
