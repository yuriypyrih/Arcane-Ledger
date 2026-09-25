# Visitor activity

The admin analytics graph follows the existing date range and sits directly below its picker.
Daily and Monday–Sunday weekly buckets use UTC. Weekly values count distinct identities
across the covered days, not the sum of daily counts. Weeks are clipped to the selected
range. Today, clipped weeks, and periods with only partial history are labelled partial.

## What counts as activity

The existing frontend collection endpoint records activity for `app_boot`, `session_start`,
`page_view`, `character_sheet_opened`, `character_created`, `codex_search_submitted`, and
`support_feedback_submitted`. Error and connectivity events do not qualify. There is no
heartbeat, tracking of general API traffic, or new frontend event. Offline use, unreported
events, and ongoing gameplay that emits none of these events are not measured.

Signed-in activity is stored in `AnalyticsAccountActivity`: one document per UTC day and
hashed account ID, with the first recording timestamp. The account comes from the server's
authenticated session at batch receipt, never from an ID supplied in the event payload.
Atomic upserts and a unique `(date, accountKey)` index deduplicate repeated visits,
concurrent batches, and use on multiple devices. Collection is best effort; failures are
reported through existing server error reporting without failing the user's action.
Days are assigned when the server receives the batch, matching existing daily rollups.

Anonymous visitors use the existing browser-local identifier and daily rollups. Clearing
browser storage or using another browser/device can count the same person again. A person
who visits anonymously and then signs in can appear in both series, so the graph does not
add the two series into a unique-person total. Authentication is resolved at batch receipt,
so a batch crossing a login/logout boundary uses the session present when sent.

## History and completeness

The earliest stored account-activity timestamp marks the beginning of account history.
There is no account backfill or migration. Earlier days show a separate dashed series of
signed-in **browsers**, derived from qualifying existing frontend rollups. The transition
day shows partial account activity; its pre-launch signed-in browser activity cannot be
separated within the daily rollup and is not blended into the account count. A week spanning
the transition shows legacy browser and account values separately, each with its covered
dates. Those values must not be summed into a weekly unique-person count.

Browser history starts at the earliest qualifying frontend rollup. Before available history
and on future dates, counts are unavailable rather than zero. Zero means no recorded
qualifying activity within available history, not proof that collection succeeded. The first
browser-history day is conservatively partial. All-time starts at the earliest relevant
stored account or browser activity.

Existing browser rollups can stop collecting identifiers at their unique-key cap (including
when the session cap is reached). Affected buckets show a lower bound with `≥` and an
incomplete-tracking label. If a nonempty rollup has no retained identifiers, its unique count
cannot be reconstructed: a bucket with no usable keys is unavailable, or a lower bound when
other rollups supply keys. Raw event counts and stored unique counters are never added to
pretend to reconstruct unique visitors. Account activity does not use those capped arrays.

The existing summary endpoint adds `activityTimeline` with daily and weekly buckets,
`accountHistoryStartedAt`, and per-series covered dates, partial flags, and incomplete flags.
Only counts and coverage metadata leave the server; stored identity hashes do not.
Current totals, existing Active Users/Characters cards, and demographics keep their previous
definitions. In particular, Active Users still uses accounts' latest interaction timestamps
and need not match this graph's event-based account history.
