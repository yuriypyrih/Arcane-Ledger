import { useRef } from "react";
import type { TableDisplayCard } from "../tableDisplayModel";
import { DefenseTags, HitPointBar, HitPointReadout, Portrait } from "./TableViewParts";
import { getHitPointRatio, isCardDown } from "./tableViewHelpers";
import { getPackTitle, toTurnGroups, type TableViewProps, type TurnGroup } from "./tableViewTypes";
import { useFitScale } from "./useFitScale";
import styles from "./BattleLineView.module.css";

function BattleCard({
  card,
  compact = false,
  isNext
}: {
  card: TableDisplayCard;
  compact?: boolean;
  isNext: boolean;
}) {
  const down = isCardDown(card);

  return (
    <li
      className={styles.card}
      data-side={card.isAlly ? "player" : "monster"}
      data-active={card.isActive || undefined}
      data-next={(isNext && !card.isActive) || undefined}
      data-down={down || undefined}
      data-compact={compact || undefined}
      aria-current={card.isActive ? "true" : undefined}
      style={{ "--hp": getHitPointRatio(card) } as React.CSSProperties}
    >
      {compact ? null : card.isActive ? (
        <span className={styles.banner}>Acting</span>
      ) : isNext ? (
        <span className={styles.banner} data-kind="next">
          Next
        </span>
      ) : null}
      <div className={styles.portrait}>
        <Portrait card={card} className={styles.face} />
        <span className={styles.order} aria-label={`Turn order ${card.order}`}>
          {card.order}
        </span>
        <span className={styles.statStrip}>
          {card.initiative !== null ? <span>{`Init ${card.initiative}`}</span> : null}
          {card.ac !== null ? <span>{`AC ${card.ac}`}</span> : null}
          {compact || card.passivePerception === null ? null : (
            <span>{`PP ${card.passivePerception}`}</span>
          )}
        </span>
        {down ? <span className={styles.stamp}>Down</span> : null}
      </div>
      <h3 className={styles.name}>{card.name}</h3>
      <div className={styles.vitals}>
        <span className={styles.hp}>
          <HitPointReadout card={card} />
        </span>
        <HitPointBar card={card} className={styles.bar} />
      </div>
      <DefenseTags card={card} className={styles.tags} />
    </li>
  );
}

function GroupView({ group, nextGroupId }: { group: TurnGroup; nextGroupId: string | null }) {
  const isNext = group.id === nextGroupId;

  if (!group.isPack) {
    return <BattleCard card={group.cards[0]!} isNext={isNext} />;
  }

  return (
    <li
      className={styles.pack}
      data-side={group.cards[0]!.isAlly ? "player" : "monster"}
      data-active={group.isActive || undefined}
      data-next={(isNext && !group.isActive) || undefined}
    >
      <p className={styles.packHeader}>
        <span className={styles.packOrder}>{group.order}</span>
        <span className={styles.packTitle}>{getPackTitle(group.cards)}</span>
        <span className={styles.packNote}>{`×${group.cards.length} act together`}</span>
        {group.isActive ? <span className={styles.packBanner}>Acting</span> : null}
        {isNext && !group.isActive ? (
          <span className={styles.packBanner} data-kind="next">
            Next
          </span>
        ) : null}
      </p>
      <ul className={styles.packCards}>
        {group.cards.map((card) => (
          <BattleCard key={card.id} card={card} compact isNext={false} />
        ))}
      </ul>
    </li>
  );
}

/** The whole turn order as one strip, so the room can see where the round is heading. */
function Ribbon({ groups, nextGroupId }: { groups: TurnGroup[]; nextGroupId: string | null }) {
  return (
    <ol className={styles.ribbon} aria-hidden="true">
      {groups.map((group) => {
        const lead = group.cards[0]!;

        return (
          <li
            key={group.id}
            className={styles.node}
            data-side={lead.isAlly ? "player" : "monster"}
            data-active={group.isActive || undefined}
            data-next={(group.id === nextGroupId && !group.isActive) || undefined}
            data-down={group.cards.every(isCardDown) || undefined}
          >
            <Portrait card={lead} className={styles.nodeFace} />
            <span className={styles.nodeNumber}>{group.order}</span>
            {group.isPack ? (
              <span className={styles.nodePack}>{`×${group.cards.length}`}</span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function DockTile({ card, isNext }: { card: TableDisplayCard; isNext: boolean }) {
  return (
    <li
      className={styles.dockTile}
      data-active={card.isActive || undefined}
      data-next={(isNext && !card.isActive) || undefined}
      data-down={isCardDown(card) || undefined}
      aria-current={card.isActive ? "true" : undefined}
    >
      {card.isActive ? (
        <span className={styles.banner}>Acting</span>
      ) : isNext ? (
        <span className={styles.banner} data-kind="next">
          Next
        </span>
      ) : null}
      <span className={styles.dockPortrait}>
        <Portrait card={card} className={styles.dockFace} />
        <span className={styles.dockOrder} aria-label={`Turn order ${card.order}`}>
          {card.order}
        </span>
      </span>
      <span className={styles.dockBody}>
        <span className={styles.dockName}>{card.name}</span>
        <span className={styles.dockHp}>
          <HitPointReadout card={card} />
        </span>
        <HitPointBar card={card} className={styles.dockBar} />
        <span className={styles.dockMeta}>
          {card.ac !== null ? <span>{`AC ${card.ac}`}</span> : null}
          {card.passivePerception !== null ? <span>{`PP ${card.passivePerception}`}</span> : null}
          {card.initiative !== null ? <span>{`Init ${card.initiative}`}</span> : null}
        </span>
        <DefenseTags card={card} className={styles.dockTags} />
      </span>
    </li>
  );
}

/**
 * Table 4: the Classic enemy cards take the stage, the party waits on a compact dock below, and a
 * turn ribbon between them shows who acts now and who is next.
 */
function BattleLineView({ cards }: TableViewProps) {
  const groups = toTurnGroups(cards);
  const activeIndex = groups.findIndex((group) => group.isActive);
  const nextGroup =
    groups.length > 1 && activeIndex >= 0 ? groups[(activeIndex + 1) % groups.length] : null;
  const nextGroupId = nextGroup?.id ?? null;
  const foes = groups.filter((group) => !group.cards[0]!.isAlly);
  const party = groups.filter((group) => group.cards[0]!.isAlly);
  const boardRef = useRef<HTMLDivElement | null>(null);
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
  // Start generous: the fit shrinks everything until the stage and the dock really fit the screen.
  const estimate = 1.6;
  const fit = useFitScale(boardRef, estimate, signature, 0.5);

  return (
    <div
      ref={boardRef}
      className={styles.board}
      style={{ "--fit": fit, "--dock-fit": Math.min(fit, 1.1) } as React.CSSProperties}
    >
      <section className={styles.stage} aria-label="Foes">
        <h2 className={styles.stageLabel}>Foes</h2>
        {foes.length > 0 ? (
          <ol className={styles.stageCards} data-fit-area>
            {foes.map((group) => (
              <GroupView key={group.id} group={group} nextGroupId={nextGroupId} />
            ))}
          </ol>
        ) : (
          <p className={styles.empty}>No foes in the order.</p>
        )}
      </section>
      <Ribbon groups={groups} nextGroupId={nextGroupId} />
      <section className={styles.dock} aria-label="Party">
        <h2 className={styles.dockLabel}>Party</h2>
        {party.length > 0 ? (
          <ol className={styles.dockTiles} data-fit-area>
            {party.map((group) => (
              <DockTile key={group.id} card={group.cards[0]!} isNext={group.id === nextGroupId} />
            ))}
          </ol>
        ) : (
          <p className={styles.empty}>No heroes in the order.</p>
        )}
      </section>
    </div>
  );
}

export default BattleLineView;
