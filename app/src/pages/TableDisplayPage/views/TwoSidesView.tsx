import { Shield, Swords } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import type { TableDisplayCard } from "../tableDisplayModel";
import { DefenseTags, HitPointReadout, Portrait } from "./TableViewParts";
import { getCardTone, getHitPointRatio, isCardDown } from "./tableViewHelpers";
import { getPackTitle, toTurnGroups, type TableViewProps, type TurnGroup } from "./tableViewTypes";
import styles from "./TwoSidesView.module.css";

function CombatantRow({ card, inPack = false }: { card: TableDisplayCard; inPack?: boolean }) {
  return (
    <li
      className={styles.row}
      data-side={card.isAlly ? "player" : "monster"}
      data-active={card.isActive || undefined}
      data-down={isCardDown(card) || undefined}
      data-in-pack={inPack || undefined}
      aria-current={card.isActive ? "true" : undefined}
      style={{ "--hp": getHitPointRatio(card) } as React.CSSProperties}
    >
      <span className={styles.rowHealth} data-tone={getCardTone(card)} aria-hidden="true" />
      <span className={styles.order}>{card.order}</span>
      <Portrait card={card} className={styles.face} />
      <span className={styles.who}>
        <span className={styles.headline}>
          <span className={styles.name}>{card.name}</span>
          <span className={styles.meta}>
            {card.initiative !== null ? <span>{`Init ${card.initiative}`}</span> : null}
            {card.ac !== null ? <span>{`AC ${card.ac}`}</span> : null}
            {card.passivePerception !== null ? <span>{`PP ${card.passivePerception}`}</span> : null}
          </span>
        </span>
        <DefenseTags card={card} className={styles.tags} />
      </span>
      <span className={styles.hp}>
        <HitPointReadout card={card} />
      </span>
      {card.isActive ? <span className={styles.acting}>Acting</span> : null}
    </li>
  );
}

function GroupBlock({ group }: { group: TurnGroup }) {
  if (!group.isPack) {
    return <CombatantRow card={group.cards[0]!} />;
  }

  return (
    <li className={styles.pack} data-active={group.isActive || undefined}>
      <p className={styles.packHeader}>
        <span className={styles.packOrder}>{group.order}</span>
        <span className={styles.packTitle}>{getPackTitle(group.cards)}</span>
        <span className={styles.packCount}>{`×${group.cards.length} act together`}</span>
      </p>
      <ul className={styles.packRows}>
        {group.cards.map((card) => (
          <CombatantRow key={card.id} card={card} inPack />
        ))}
      </ul>
    </li>
  );
}

/** A rough measure of how much vertical room a side needs, so a crowded side shrinks to fit. */
function getRowUnits(groups: TurnGroup[]) {
  const rowUnits = (card: TableDisplayCard) =>
    1 +
    (card.resistances.length +
      card.immunities.length +
      card.conditionImmunities.length +
      card.vulnerabilities.length >
    0
      ? 0.45
      : 0);

  return groups.reduce(
    (total, group) =>
      total +
      (group.isPack
        ? 0.7 + group.cards.reduce((sum, card) => sum + rowUnits(card) * 0.9, 0)
        : rowUnits(group.cards[0]!)),
    0
  );
}

/** How many rows fit at full size; beyond this everything scales down together. */
const FULL_SIZE_ROW_UNITS = 6.4;

function SideColumn({
  groups,
  label,
  side
}: {
  groups: TurnGroup[];
  label: string;
  side: "monster" | "player";
}) {
  const count = groups.reduce((total, group) => total + group.cards.length, 0);

  return (
    <section className={styles.column} data-side={side} aria-label={label}>
      <h2 className={styles.columnTitle}>
        {side === "player" ? <Shield aria-hidden="true" /> : <Swords aria-hidden="true" />}
        <span>{label}</span>
        <span className={styles.columnCount}>{count}</span>
      </h2>
      {groups.length > 0 ? (
        <ol className={styles.rows} data-rows>
          {groups.map((group) => (
            <GroupBlock key={group.id} group={group} />
          ))}
        </ol>
      ) : (
        <p className={styles.empty}>
          {side === "player" ? "No heroes in the order." : "No foes in the order."}
        </p>
      )}
    </section>
  );
}

const MIN_FIT = 0.4;
const FIT_STEP = 0.94;

/** Table 2: heroes on the left, foes on the right, each row filled to its remaining health. */
function TwoSidesView({ cards }: TableViewProps) {
  const groups = toTurnGroups(cards);
  const party = groups.filter((group) => group.cards[0]!.isAlly);
  const foes = groups.filter((group) => !group.cards[0]!.isAlly);
  const estimate = Math.min(
    1,
    FULL_SIZE_ROW_UNITS / Math.max(1, getRowUnits(party), getRowUnits(foes))
  );
  // What is on screen decides when the size is worked out again.
  const signature = groups
    .map((group) =>
      group.cards
        .map(
          (card) =>
            `${card.id}:${card.resistances.length}${card.immunities.length}${card.conditionImmunities.length}${card.vulnerabilities.length}`
        )
        .join("+")
    )
    .join("|");
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [measured, setMeasured] = useState({ fit: estimate, signature });
  const fit = measured.signature === signature ? measured.fit : estimate;

  // The estimate is a first guess; this shrinks the rows until both columns really fit the screen.
  useLayoutEffect(() => {
    const board = boardRef.current;

    if (!board) {
      return;
    }

    const overflows = Array.from(board.querySelectorAll<HTMLElement>("[data-rows]")).some(
      (element) => element.scrollHeight > element.clientHeight + 1
    );

    if (overflows && fit > MIN_FIT) {
      setMeasured({ fit: Math.max(MIN_FIT, fit * FIT_STEP), signature });
    } else if (measured.signature !== signature) {
      setMeasured({ fit, signature });
    }
  }, [fit, measured.signature, signature]);

  // A new screen size changes how much room there is, so start over from the estimate.
  useLayoutEffect(() => {
    const board = boardRef.current;

    if (!board || typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const observer = new ResizeObserver(() => setMeasured({ fit: estimate, signature }));

    observer.observe(board);

    return () => observer.disconnect();
  }, [estimate, signature]);

  return (
    <div ref={boardRef} className={styles.board} style={{ "--fit": fit } as React.CSSProperties}>
      <SideColumn groups={party} label="The Party" side="player" />
      <div className={styles.spine} aria-hidden="true" />
      <SideColumn groups={foes} label="The Foes" side="monster" />
    </div>
  );
}

export default TwoSidesView;
