import { Link2 } from "lucide-react";
import { DefenseTags, HitPointBar, HitPointReadout, Portrait, StatChip } from "./TableViewParts";
import { getCardTone, getHitPointRatio, isCardDown } from "./tableViewHelpers";
import { getPackTitle, toTurnGroups, type TableViewProps } from "./tableViewTypes";
import styles from "./ArcaneCircleView.module.css";

/** Names stay readable only while the ring has room for them. */
const MAX_LABELLED_TOKENS = 24;

/** Labels sit on the outer side of their token, so they never reach into the centre panel. */
function getLabelPlacement(angleDegrees: number, isActive: boolean) {
  if (isActive) {
    return null;
  }

  const radians = (angleDegrees * Math.PI) / 180;
  const sideways = Math.sin(radians);

  if (sideways > 0.2) {
    return "right";
  }

  if (sideways < -0.2) {
    return "left";
  }

  return Math.cos(radians) > 0 ? "top" : "bottom";
}

/** Table 3: the turn order as a wheel. Whoever acts is at the top; the wheel turns as turns pass. */
function ArcaneCircleView({ cards, roundNumber }: TableViewProps) {
  const groups = toTurnGroups(cards);
  const activeGroupIndex = groups.findIndex((group) => group.isActive);
  const activeGroup = activeGroupIndex >= 0 ? groups[activeGroupIndex]! : null;
  const lead = activeGroup?.cards[0] ?? null;
  const activeCardIndex = Math.max(
    0,
    cards.findIndex((card) => card.isActive)
  );
  const count = cards.length;
  const tokenSize = Math.min(0.15, 2 / Math.max(1, count));
  const showNames = count <= MAX_LABELLED_TOKENS;

  return (
    <div className={styles.stage}>
      <div
        className={styles.wheel}
        style={{ "--token": tokenSize, "--count": count } as React.CSSProperties}
      >
        <div className={styles.ring} aria-hidden="true" />
        <ol className={styles.tokens} aria-label="Initiative order">
          {cards.map((card, index) => {
            // Offset from the acting card, so the acting card always sits at 12 o'clock.
            const slot = (index - activeCardIndex + count) % count;
            const angle = (slot / count) * 360;
            const labelPlacement = showNames ? getLabelPlacement(angle, card.isActive) : null;

            return (
              <li
                key={card.id}
                className={styles.slot}
                data-side={card.isAlly ? "player" : "monster"}
                data-active={card.isActive || undefined}
                data-down={isCardDown(card) || undefined}
                data-pack={card.packPosition !== "single" || undefined}
                aria-current={card.isActive ? "true" : undefined}
                style={{ "--angle": `${angle}deg` } as React.CSSProperties}
              >
                <span className={styles.token}>
                  <span
                    className={styles.hpRing}
                    data-tone={getCardTone(card)}
                    data-hidden={card.currentHitPoints === null || undefined}
                    style={{ "--hp": getHitPointRatio(card) * 100 } as React.CSSProperties}
                  >
                    <Portrait card={card} className={styles.face} />
                  </span>
                  <span className={styles.order}>{card.order}</span>
                  {card.packPosition !== "single" ? (
                    <span className={styles.packMark} aria-label="Acts with a pack">
                      <Link2 aria-hidden="true" />
                    </span>
                  ) : null}
                  {labelPlacement ? (
                    <span className={styles.label} data-place={labelPlacement}>
                      {card.name}
                    </span>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ol>

        <div className={styles.center}>
          {activeGroup && lead ? (
            <article
              className={styles.focus}
              data-side={lead.isAlly ? "player" : "monster"}
              aria-label={`${lead.name} is acting`}
            >
              <p className={styles.focusEyebrow}>Acting now</p>
              <h2 className={styles.focusName}>
                {activeGroup.isPack ? getPackTitle(activeGroup.cards) : lead.name}
              </h2>
              {activeGroup.isPack ? (
                <p className={styles.focusSubtitle}>{`${activeGroup.cards.length} act together`}</p>
              ) : lead.subtitle ? (
                <p className={styles.focusSubtitle}>{lead.subtitle}</p>
              ) : null}
              {activeGroup.isPack ? null : (
                <>
                  <span className={styles.focusHp}>
                    <HitPointReadout card={lead} />
                  </span>
                  <HitPointBar card={lead} className={styles.focusBar} />
                </>
              )}
              <div className={styles.focusStats}>
                <StatChip label="AC" value={lead.ac} />
                <StatChip label="PP" value={lead.passivePerception} />
              </div>
              {activeGroup.cards.map((card) => (
                <DefenseTags key={card.id} card={card} className={styles.focusTags} />
              ))}
            </article>
          ) : (
            <article className={styles.focus}>
              <p className={styles.focusEyebrow}>{`Round ${roundNumber}`}</p>
              <h2 className={styles.focusName}>Waiting for the first turn</h2>
            </article>
          )}
        </div>
      </div>
    </div>
  );
}

export default ArcaneCircleView;
