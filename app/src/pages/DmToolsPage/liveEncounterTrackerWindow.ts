/** Opens the tracker in its own window so the GM can keep it beside the table or on a second screen. */
export function openLiveEncounterTrackerWindow(href: string) {
  window.open(
    new URL(href, window.location.origin).toString(),
    "arcane-ledger-live-encounter",
    "popup=yes,width=1280,height=860"
  );
}

/** Opens the full-screen table display (what players see) in its own window, e.g. for a projector. */
export function openTableDisplayWindow(href: string) {
  window.open(
    new URL(href, window.location.origin).toString(),
    "arcane-ledger-table-display",
    "popup=yes,width=1600,height=900"
  );
}
