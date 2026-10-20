import { bardManagedResources as bard } from "./classFeatures/bard/resourceManagement";
import { clericManagedResources as cleric } from "./classFeatures/cleric/resourceManagement";
import { druidManagedResources as druid } from "./classFeatures/druid/resourceManagement";
import { fighterManagedResources as fighter } from "./classFeatures/fighter/resourceManagement";
import { rangerManagedResources as ranger } from "./classFeatures/ranger/resourceManagement";
import { sorcererManagedResources as sorcerer } from "./classFeatures/sorcerer/resourceManagement";
import { warlockManagedResources as warlock } from "./classFeatures/warlock/resourceManagement";
import { wizardManagedResources as wizard } from "./classFeatures/wizard/resourceManagement";
import { getFeatSpellResource } from "./feats/runtime/resourceManagement";
import { namedResources } from "./managedClassResources";
import type { ResourceManagementTarget } from "./resourceManagement";
import { spellSlotResource } from "./resourceManagement";
import { getSpeciesSpellResource } from "./speciesResourceManagement";

export const spellOptionResources: Record<string, readonly ResourceManagementTarget[]> = {
  "star-map": [druid.starMapGuidingBoltUsesExpended],
  "natural-recovery": [druid.naturalRecoveryUsesExpended],
  "blessing-of-moonlight": [bard.blessingOfMoonlightUsesExpended],
  "beguiling-magic": [bard.beguilingMagicUsesExpended, namedResources["bardic-inspiration"]],
  "telekinetic-master": [
    fighter.psiWarriorTelekineticMasterUsesExpended,
    namedResources["psi-energy"]
  ],
  "psionic-sorcery": [namedResources.sorcery],
  "tamed-surge": [sorcerer.tamedSurgeUsesExpended],
  "dragon-companion": [sorcerer.dragonCompanionUsesExpended],
  "steps-of-the-fey": [warlock.stepsOfTheFeyUsesExpended],
  "phantasmal-creatures": [wizard.phantasmalCreaturesUsesExpended],
  "frozen-haunt": [ranger.frozenHauntUsesExpended, spellSlotResource(4)],
  "rogue-phantom-spirit-query": [namedResources["soul-trinkets"]],
  "cleric-enhanced-necromancy": [cleric.channelDivinityUsesExpended]
};

export function getSpellOptionResourceTargets(
  optionId: string,
  spellId: string
): readonly ResourceManagementTarget[] {
  const target =
    getFeatSpellResource(optionId, spellId) ?? getSpeciesSpellResource(optionId, spellId);
  return target ? [target] : (spellOptionResources[optionId] ?? []);
}
