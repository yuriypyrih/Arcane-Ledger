import { bardManagedResources as bard } from "./classFeatures/bard/resourceManagement";
import { artificerManagedResources as artificer } from "./classFeatures/artificer/resourceManagement";
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
import { empoweredTransmutationEffectId } from "./classFeatures/wizard/subclasses/wizardTransmuterEmpoweredTransmutation";
import { shapeShifterFreeCastEffectId } from "./classFeatures/wizard/subclasses/wizardTransmuterShapeShifter";
import { splitEnchantmentEffectId } from "./classFeatures/wizard/subclasses/wizardEnchanterSplitEnchantment";
import { splinteredSummonsEffectId } from "./classFeatures/wizard/subclasses/wizardConjurerSplinteredSummons";
import { undeadThrallsFreeCastEffectId } from "./classFeatures/wizard/subclasses/wizardNecromancerUndeadThralls";
import { wondrousAlterationFreeCastEffectId } from "./classFeatures/wizard/subclasses/wizardTransmuterWondrousAlteration";
import {
  spiritualManifestationFreeCastEffectId,
  spiritualManifestationCoverEffectId
} from "./classFeatures/bard/subclasses/bardCollegeOfSpiritsEmpowered";
import { dispellingRecoveryEffectId } from "./classFeatures/cleric/subclasses/clericDomainSpellEffects";

export const spellOptionResources: Record<string, readonly ResourceManagementTarget[]> = {
  [undeadThrallsFreeCastEffectId]: [wizard.undeadThrallsUsesExpended],
  [wondrousAlterationFreeCastEffectId]: [wizard.wondrousAlterationUsesExpended],
  [spiritualManifestationFreeCastEffectId]: [bard.spiritualManifestationUsesExpended],
  [spiritualManifestationCoverEffectId]: [bard.spiritualManifestationCoverUsesExpended],
  [dispellingRecoveryEffectId]: [
    cleric.dispellingRecoveryUsesExpended,
    cleric.channelDivinityUsesExpended
  ],
  "jolt-to-life": [artificer.reanimatorJoltToLifeUsesExpended],
  "misty-wanderer": [ranger.mistyWandererUsesExpended],
  "fey-reinforcements": [ranger.feyReinforcementsUsesExpended],
  [splinteredSummonsEffectId]: [wizard.splinteredSummonsUsesExpended],
  [splitEnchantmentEffectId]: [wizard.splitEnchantmentUsesExpended],
  [empoweredTransmutationEffectId]: [wizard.empoweredTransmutationUsesExpended],
  [shapeShifterFreeCastEffectId]: [wizard.shapeShifterUsesExpended],
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
