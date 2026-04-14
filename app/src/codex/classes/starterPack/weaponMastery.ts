const levelOneWeaponMasteryCountByClassName: Partial<Record<string, number>> = {
  Barbarian: 2,
  Fighter: 3,
  Paladin: 2,
  Ranger: 2,
  Rogue: 2
};

export function getLevelOneWeaponMasteryCountForClass(className: string): number {
  return levelOneWeaponMasteryCountByClassName[className] ?? 0;
}
