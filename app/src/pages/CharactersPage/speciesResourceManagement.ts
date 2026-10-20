import type { Character, CharacterSpeciesFeatureState } from "../../types";
import type { CounterResourceTarget } from "./resourceManagement";
import { counterResource, type ResourceManagementTarget } from "./resourceManagement";
import {
  getAasimarCelestialRevelationUsesRemaining,
  getAasimarCelestialRevelationUsesTotal,
  getAasimarHealingHandsUsesRemaining,
  getAasimarHealingHandsUsesTotal
} from "./species";
import {
  getDhampirVampiricBiteUsesRemaining,
  getDhampirVampiricBiteUsesTotal
} from "./speciesDhampir";
import {
  getDragonbornBreathWeaponUsesRemaining,
  getDragonbornBreathWeaponUsesTotal,
  getDragonbornDraconicFlightUsesRemaining,
  getDragonbornDraconicFlightUsesTotal
} from "./speciesDragonborn";
import { getDwarfStonecunningUsesRemaining, getDwarfStonecunningUsesTotal } from "./speciesDwarf";
import { getGenasiLineageFreeCastStateForCharacter } from "./speciesGenasi";
import {
  getGnomeSpeakWithAnimalsUsesRemaining,
  getGnomeSpeakWithAnimalsUsesTotal
} from "./speciesGnome";
import {
  getGoliathGiantAncestryUsesRemaining,
  getGoliathGiantAncestryUsesTotal,
  getGoliathLargeFormUsesRemaining,
  getGoliathLargeFormUsesTotal
} from "./speciesGoliath";
import {
  getHexbloodEerieTokenUsesRemaining,
  getHexbloodEerieTokenUsesTotal,
  getHexbloodHexMagicFreeCastStateForCharacter
} from "./speciesHexblood";
import { getLupinHowlUsesRemaining, getLupinHowlUsesTotal } from "./speciesLupin";
import { getOrcAdrenalineRushUsesRemaining, getOrcAdrenalineRushUsesTotal } from "./speciesOrc";
import {
  getRebornKnowledgeFromPastLifeUsesRemaining,
  getRebornKnowledgeFromPastLifeUsesTotal
} from "./speciesReborn";
import { getShifterShiftingUsesRemaining, getShifterShiftingUsesTotal } from "./speciesShifter";
import { getTieflingFiendishLegacyFreeCastStateForCharacter } from "./speciesTiefling";

function speciesResource<K extends keyof CharacterSpeciesFeatureState>(
  stateKey: K,
  field: keyof NonNullable<CharacterSpeciesFeatureState[K]>,
  label: string,
  total: CounterResourceTarget["total"],
  remaining: CounterResourceTarget["remaining"],
  boolean = false
): CounterResourceTarget {
  return counterResource(
    `species:${stateKey}:${String(field)}`,
    label,
    total,
    remaining,
    (character, expended) => ({
      ...character,
      speciesFeatureState: {
        ...character.speciesFeatureState,
        [stateKey]: {
          ...character.speciesFeatureState?.[stateKey],
          [field]: boolean ? expended > 0 : expended
        }
      }
    })
  );
}

export const speciesManagedResources = {
  healingHandsExpended: speciesResource(
    "aasimar",
    "healingHandsExpended",
    "Healing Hands",
    getAasimarHealingHandsUsesTotal,
    getAasimarHealingHandsUsesRemaining,
    true
  ),
  celestialRevelationExpended: speciesResource(
    "aasimar",
    "celestialRevelationExpended",
    "Celestial Revelation",
    getAasimarCelestialRevelationUsesTotal,
    getAasimarCelestialRevelationUsesRemaining,
    true
  ),
  breathWeaponUsesExpended: speciesResource(
    "dragonborn",
    "breathWeaponUsesExpended",
    "Breath Weapon",
    getDragonbornBreathWeaponUsesTotal,
    getDragonbornBreathWeaponUsesRemaining,
    false
  ),
  draconicFlightExpended: speciesResource(
    "dragonborn",
    "draconicFlightExpended",
    "Draconic Flight",
    getDragonbornDraconicFlightUsesTotal,
    getDragonbornDraconicFlightUsesRemaining,
    true
  ),
  stonecunningUsesExpended: speciesResource(
    "dwarf",
    "stonecunningUsesExpended",
    "Stonecunning",
    getDwarfStonecunningUsesTotal,
    getDwarfStonecunningUsesRemaining,
    false
  ),
  vampiricBiteUsesExpended: speciesResource(
    "dhampir",
    "vampiricBiteUsesExpended",
    "Vampiric Bite",
    getDhampirVampiricBiteUsesTotal,
    getDhampirVampiricBiteUsesRemaining,
    false
  ),
  giantAncestryUsesExpended: speciesResource(
    "goliath",
    "giantAncestryUsesExpended",
    "Giant Ancestry",
    getGoliathGiantAncestryUsesTotal,
    getGoliathGiantAncestryUsesRemaining,
    false
  ),
  largeFormExpended: speciesResource(
    "goliath",
    "largeFormExpended",
    "Large Form",
    getGoliathLargeFormUsesTotal,
    getGoliathLargeFormUsesRemaining,
    true
  ),
  eerieTokenExpended: speciesResource(
    "hexblood",
    "eerieTokenExpended",
    "Eerie Token",
    getHexbloodEerieTokenUsesTotal,
    getHexbloodEerieTokenUsesRemaining,
    true
  ),
  howlUsesExpended: speciesResource(
    "lupin",
    "howlUsesExpended",
    "Howl",
    getLupinHowlUsesTotal,
    getLupinHowlUsesRemaining,
    false
  ),
  knowledgeFromPastLifeUsesExpended: speciesResource(
    "reborn",
    "knowledgeFromPastLifeUsesExpended",
    "Knowledge from a Past Life",
    getRebornKnowledgeFromPastLifeUsesTotal,
    getRebornKnowledgeFromPastLifeUsesRemaining,
    false
  ),
  shiftingUsesExpended: speciesResource(
    "shifter",
    "shiftingUsesExpended",
    "Shifting",
    getShifterShiftingUsesTotal,
    getShifterShiftingUsesRemaining,
    false
  ),
  speakWithAnimalsUsesExpended: speciesResource(
    "gnome",
    "speakWithAnimalsUsesExpended",
    "Speak with Animals",
    getGnomeSpeakWithAnimalsUsesTotal,
    getGnomeSpeakWithAnimalsUsesRemaining,
    false
  ),
  adrenalineRushUsesExpended: speciesResource(
    "orc",
    "adrenalineRushUsesExpended",
    "Adrenaline Rush",
    getOrcAdrenalineRushUsesTotal,
    getOrcAdrenalineRushUsesRemaining,
    false
  )
};

export const speciesActionResources: Record<string, readonly ResourceManagementTarget[]> = {
  "species-aasimar-healing-hands": [speciesManagedResources.healingHandsExpended],
  "species-aasimar-celestial-revelation": [speciesManagedResources.celestialRevelationExpended],
  "species-dragonborn-breath-weapon": [speciesManagedResources.breathWeaponUsesExpended],
  "species-dragonborn-draconic-flight": [speciesManagedResources.draconicFlightExpended],
  "species-dwarf-stonecunning": [speciesManagedResources.stonecunningUsesExpended],
  "species-goliath-clouds-jaunt": [speciesManagedResources.giantAncestryUsesExpended],
  "species-goliath-stones-endurance": [speciesManagedResources.giantAncestryUsesExpended],
  "species-goliath-storms-thunder": [speciesManagedResources.giantAncestryUsesExpended],
  "species-goliath-large-form": [speciesManagedResources.largeFormExpended],
  "species-hexblood-eerie-token": [speciesManagedResources.eerieTokenExpended],
  "species-lupin-howl": [speciesManagedResources.howlUsesExpended],
  "species-reborn-knowledge-from-past-life": [
    speciesManagedResources.knowledgeFromPastLifeUsesExpended
  ],
  "species-shifter-shifting": [speciesManagedResources.shiftingUsesExpended],
  "common-action-dash": [speciesManagedResources.adrenalineRushUsesExpended]
};

export function getSpeciesSpellResource(
  optionId: string,
  spellId: string
): CounterResourceTarget | undefined {
  if (optionId === "forest-gnome") return speciesManagedResources.speakWithAnimalsUsesExpended;
  if (optionId === "goliath-giant-ancestry")
    return speciesManagedResources.giantAncestryUsesExpended;
  const configuration =
    optionId === "genasi-lineage"
      ? {
          label: "Genasi Lineage",
          state: getGenasiLineageFreeCastStateForCharacter,
          read: (character: Character) =>
            character.speciesFeatureState?.genasi?.freeCastExpendedSpellIds ?? [],
          write: (character: Character, ids: string[]) => ({
            ...character,
            speciesFeatureState: {
              ...character.speciesFeatureState,
              genasi: { ...character.speciesFeatureState?.genasi, freeCastExpendedSpellIds: ids }
            }
          })
        }
      : optionId === "hex-magic"
        ? {
            label: "Hex Magic",
            state: getHexbloodHexMagicFreeCastStateForCharacter,
            read: (character: Character) =>
              character.speciesFeatureState?.hexblood?.hexMagicExpendedSpellIds ?? [],
            write: (character: Character, ids: string[]) => ({
              ...character,
              speciesFeatureState: {
                ...character.speciesFeatureState,
                hexblood: {
                  ...character.speciesFeatureState?.hexblood,
                  hexMagicExpendedSpellIds: ids
                }
              }
            })
          }
        : optionId === "fiendish-legacy"
          ? {
              label: "Fiendish Legacy",
              state: getTieflingFiendishLegacyFreeCastStateForCharacter,
              read: (character: Character) =>
                character.speciesFeatureState?.tiefling?.fiendishLegacyFreeCastExpendedSpellIds ??
                [],
              write: (character: Character, ids: string[]) => ({
                ...character,
                speciesFeatureState: {
                  ...character.speciesFeatureState,
                  tiefling: {
                    ...character.speciesFeatureState?.tiefling,
                    fiendishLegacyFreeCastExpendedSpellIds: ids
                  }
                }
              })
            }
          : null;
  if (!configuration) return undefined;
  return counterResource(
    `species:${optionId}:${spellId}`,
    configuration.label,
    (character) => configuration.state(character, spellId)?.usesTotal ?? 0,
    (character) => configuration.state(character, spellId)?.usesRemaining ?? 0,
    (character, expended) =>
      configuration.write(
        character,
        expended
          ? [...new Set([...configuration.read(character), spellId])]
          : configuration.read(character).filter((id) => id !== spellId)
      )
  );
}
