export const shadowBladeSpellId = "spell-shadow-blade";
export const flameBladeSpellId = "spell-flame-blade";
export const bladeOfDisasterSpellId = "spell-blade-of-disaster";

const ephemeralWeaponSpellOutcomeSummaries = new Map<string, string>([
  [shadowBladeSpellId, "Summons weapon"],
  [flameBladeSpellId, "Summons weapon"],
  [bladeOfDisasterSpellId, "Creates planar rift"]
]);

const castAttackSuppressedEphemeralWeaponSpellIds = new Set([
  flameBladeSpellId,
  bladeOfDisasterSpellId
]);

export function isEphemeralWeaponSpellId(spellId: string | null | undefined): boolean {
  return typeof spellId === "string" && ephemeralWeaponSpellOutcomeSummaries.has(spellId);
}

export function getEphemeralWeaponSpellOutcomeSummary(
  spell: { id?: string } | null | undefined
): string | null {
  return spell?.id ? (ephemeralWeaponSpellOutcomeSummaries.get(spell.id) ?? null) : null;
}

export function shouldSuppressEphemeralWeaponSpellCastAttackRoll(
  spell: { id?: string } | null | undefined
): boolean {
  return spell?.id ? castAttackSuppressedEphemeralWeaponSpellIds.has(spell.id) : false;
}
