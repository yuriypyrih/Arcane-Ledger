import { DefenseTags, HitPointBar, HitPointReadout, Portrait, StatChip } from "./TableViewParts";
import { getCardTone, isCardDown } from "./tableViewHelpers";
import { getPackTitle, toTurnGroups, type TableViewProps, type TurnGroup } from "./tableViewTypes";
import styles from "./SpotlightView.module.css";

const MAX_UP_NEXT = 6;

function UpNextRow({ group, position }: { group: TurnGroup; position: number }) {
  const lead = group.cards[0]!;
  const allDown = group.cards.every(isCardDown);

  return (
    <li
      className={styles.nextRow}
      data-side={lead.isAlly ? "player" : "monster"}
      data-down={allDown || undefined}
    >
      <span
        className={styles.nextPosition}
        aria-label={`Acts ${position === 1 ? "next" : `in ${position}`}`}
      >
        {position}
      </span>
      <span className={styles.nextFaces}>
        {group.cards.slice(0, 3).map((card) => (
          <Portrait key={card.id} card={card} className={styles.nextPortrait} />
        ))}
      </span>
      <span className={styles.nextText} data-pack={group.isPack || undefined}>
        <span className={styles.nextName}>
          {group.isPack ? getPackTitle(group.cards) : lead.name}
        </span>
        {group.isPack ? (
          <span className={styles.nextNote}>{`×${group.cards.length} act together`}</span>
        ) : lead.subtitle ? (
          <span className={styles.nextMeta}>{lead.subtitle}</span>
        ) : null}
      </span>
      {group.isPack ? null : (
        <span className={styles.nextVitals}>
          <span className={styles.nextHp}>
            <HitPointReadout card={lead} />
          </span>
          <HitPointBar card={lead} className={styles.nextBar} />
        </span>
      )}
    </li>
  );
}

/** Table 1: one huge panel for whoever acts now, and a short, calm "up next" list beside it. */
function SpotlightView({ cards, roundNumber }: TableViewProps) {
  const groups = toTurnGroups(cards);
  const activeIndex = groups.findIndex((group) => group.isActive);
  const active = activeIndex >= 0 ? groups[activeIndex]! : null;
  const waiting = active
    ? [...groups.slice(activeIndex + 1), ...groups.slice(0, activeIndex)]
    : groups;
  const upNext = waiting.slice(0, MAX_UP_NEXT);
  const hidden = waiting.length - upNext.length;
  const lead = active?.cards[0] ?? null;

  return (
    <div className={styles.stage}>
      {active && lead ? (
        <article
          className={styles.hero}
          data-side={lead.isAlly ? "player" : "monster"}
          data-down={active.cards.every(isCardDown) || undefined}
          aria-label={`${lead.name} is acting`}
        >
          <p className={styles.eyebrow}>
            <span className={styles.pulse} aria-hidden="true" />
            {active.isPack ? "Pack acting now" : "Acting now"}
          </p>
          <div className={styles.heroBody} data-pack={active.isPack || undefined}>
            {active.isPack ? (
              <ul className={styles.packTiles} aria-label="Pack members">
                {active.cards.map((card) => (
                  <li
                    key={card.id}
                    className={styles.packTile}
                    data-down={isCardDown(card) || undefined}
                  >
                    <Portrait card={card} className={styles.packTilePortrait} />
                    <span className={styles.packTileHp} data-tone={getCardTone(card)}>
                      <HitPointReadout card={card} />
                    </span>
                    <HitPointBar card={card} className={styles.packTileBar} />
                  </li>
                ))}
              </ul>
            ) : (
              <Portrait card={lead} className={styles.heroPortrait} />
            )}
            <div className={styles.heroInfo}>
              <h2 className={styles.heroName}>
                {active.isPack ? getPackTitle(active.cards) : lead.name}
              </h2>
              {active.isPack ? (
                <p
                  className={styles.heroSubtitle}
                >{`${active.cards.length} creatures take this turn together`}</p>
              ) : lead.subtitle ? (
                <p className={styles.heroSubtitle}>{lead.subtitle}</p>
              ) : null}
              <div className={styles.heroStats}>
                <StatChip label="Init" value={lead.initiative} />
                <StatChip label="AC" value={lead.ac} />
                <StatChip label="PP" value={lead.passivePerception} />
              </div>
              {active.isPack ? null : (
                <div className={styles.heroVitals}>
                  <span className={styles.heroHp}>
                    <HitPointReadout card={lead} />
                  </span>
                  <HitPointBar card={lead} className={styles.heroBar} />
                </div>
              )}
              {active.cards.map((card) => (
                <DefenseTags key={card.id} card={card} className={styles.heroTags} />
              ))}
            </div>
          </div>
        </article>
      ) : (
        <article className={styles.hero} data-idle="true" aria-label="Waiting for the first turn">
          <p className={styles.eyebrow}>{`Round ${roundNumber}`}</p>
          <h2 className={styles.idleTitle}>Waiting for the first turn</h2>
        </article>
      )}

      <aside className={styles.next} aria-label="Up next">
        <h2 className={styles.nextTitle}>{active ? "Up next" : "Order"}</h2>
        <ol className={styles.nextList}>
          {upNext.map((group, index) => (
            <UpNextRow key={group.id} group={group} position={index + 1} />
          ))}
        </ol>
        {hidden > 0 ? <p className={styles.more}>{`+ ${hidden} more later this round`}</p> : null}
      </aside>
    </div>
  );
}

export default SpotlightView;
