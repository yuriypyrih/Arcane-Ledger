export { createEphemeralWeaponAction } from "./actions";
export {
  bladeOfDisasterEphemeralWeaponDefinition,
  flameBladeEphemeralWeaponDefinition,
  psychicBladeBonusDamage,
  psychicBladeEphemeralWeaponDefinition,
  psychicBladeEquipmentSummary,
  psychicBladeWeaponEntry,
  shadowBladeEphemeralWeaponDefinition,
  spellEphemeralWeaponDefinitions
} from "./definitions";
export { getActiveSpellEphemeralWeaponActionsForCharacter } from "./spellActions";
export {
  bladeOfDisasterSpellId,
  flameBladeSpellId,
  getEphemeralWeaponSpellOutcomeSummary,
  isEphemeralWeaponSpellId,
  shadowBladeSpellId,
  shouldSuppressEphemeralWeaponSpellCastAttackRoll
} from "./spellIds";
export { createEphemeralWeaponStatusEntry } from "./status";
export type {
  EphemeralWeaponActionContext,
  EphemeralWeaponActivation,
  EphemeralWeaponCharacter,
  EphemeralWeaponDefinition,
  EphemeralWeaponStatusEntryOptions
} from "./types";
