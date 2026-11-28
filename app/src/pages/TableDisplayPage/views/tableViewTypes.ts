import type { TableDisplayCard } from "../tableDisplayModel";

export type TableViewProps = {
  cards: TableDisplayCard[];
  roundNumber: number;
};

/** One turn: a single combatant, or a pack that shares a turn. */
export type TurnGroup = {
  cards: TableDisplayCard[];
  id: string;
  isActive: boolean;
  isPack: boolean;
  /** Turn number of the first member. */
  order: number;
};

/** Cards that share a turn (a pack) become one group; everything else is its own group. */
export function toTurnGroups(cards: TableDisplayCard[]): TurnGroup[] {
  const groups: TurnGroup[] = [];

  cards.forEach((card) => {
    const last = groups.at(-1);

    if (card.packPosition !== "single" && card.packPosition !== "first" && last?.isPack) {
      last.cards.push(card);
      last.isActive = last.isActive || card.isActive;
      return;
    }

    groups.push({
      cards: [card],
      id: card.id,
      isActive: card.isActive,
      isPack: card.packPosition !== "single",
      order: card.order
    });
  });

  return groups.map((group) => ({
    ...group,
    id: group.cards.map((card) => card.id).join("+"),
    isPack: group.cards.length > 1
  }));
}

export function getPackTitle(cards: TableDisplayCard[]) {
  const names = new Set(cards.map((card) => card.name));

  return names.size === 1 ? `${cards[0]?.name} pack` : `Pack of ${cards.length}`;
}
