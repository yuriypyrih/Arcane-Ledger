import { getHitPointTone, type TableDisplayCard } from "../tableDisplayModel";

export function hasHitPoints(card: TableDisplayCard) {
  return card.currentHitPoints !== null && card.maxHitPoints !== null;
}

export function getHitPointRatio(card: TableDisplayCard) {
  return hasHitPoints(card)
    ? Math.min(1, Math.max(0, (card.currentHitPoints ?? 0) / Math.max(1, card.maxHitPoints ?? 1)))
    : 0;
}

export function isCardDown(card: TableDisplayCard) {
  return hasHitPoints(card) && (card.currentHitPoints ?? 0) <= 0;
}

export function getCardTone(card: TableDisplayCard) {
  return getHitPointTone(card.currentHitPoints ?? 0, card.maxHitPoints ?? 1);
}
