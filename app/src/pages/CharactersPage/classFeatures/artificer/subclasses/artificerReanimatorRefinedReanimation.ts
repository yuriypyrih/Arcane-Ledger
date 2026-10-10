import type { ReactionEntry, SpellEntry } from "../../../../../codex/entries";
import { CLASS_FEATURE, REACTION, SPELL_COMPONENT } from "../../../../../codex/entries/enums";
import type { Character, CharacterArtificerFeatureState } from "../../../../../types";
import { ACTION_CARD_THEME } from "../../../actionCardTheme";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import { getEffectiveHitPointMaximumForCharacter } from "../../../traits";
import { createChargesCardUsage } from "../../cardUsage";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import { replaceClassFeatureState, spendClassResource } from "../../shared/resourceState";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";
import type { FeatureActionCard } from "../../types";
import { getLivingArtificerReanimatedCompanions } from "./artificerReanimatorCompanion";
import { reanimatorSubclassId } from "./artificerReanimatorSkillSet";
import { hasArtificerSubclassFeature } from "./artificerSubclassHelpers";

export const artificerFacilitatedRevivalActionKey = "artificer-reanimator-facilitated-revival";
export const artificerLifeTransferReactionEntryId = "artificer-reanimator-life-transfer";

function hasRefinedReanimation(character: SubclassRuntimeCharacter): boolean {
  return hasArtificerSubclassFeature(character, reanimatorSubclassId, 15);
}

function getRefinedReanimationSection(character: SubclassRuntimeCharacter, name: string) {
  return getFeatureDescriptionForCharacter(character, CLASS_FEATURE.REFINED_REANIMATION).filter(
    (entry) => typeof entry === "string" && entry.startsWith(`<strong>${name}.</strong>`)
  );
}

export function normalizeArtificerFacilitatedRevivalState(
  value: unknown,
  character: SubclassRuntimeCharacter
): Pick<CharacterArtificerFeatureState, "facilitatedRevivalUsesExpended"> {
  if (!hasRefinedReanimation(character)) return {};
  const record =
    value && typeof value === "object" ? (value as Partial<CharacterArtificerFeatureState>) : {};
  const expended = Number(record.facilitatedRevivalUsesExpended);
  return { facilitatedRevivalUsesExpended: Number.isFinite(expended) && expended >= 1 ? 1 : 0 };
}

export function getArtificerFacilitatedRevivalUsesTotal(character: SubclassRuntimeCharacter) {
  return hasRefinedReanimation(character) ? 1 : 0;
}

export function getArtificerFacilitatedRevivalUsesRemaining(character: SubclassRuntimeCharacter) {
  return (
    getArtificerFacilitatedRevivalUsesTotal(character) -
    (normalizeArtificerFacilitatedRevivalState(character.classFeatureState?.artificer, character)
      .facilitatedRevivalUsesExpended ?? 0)
  );
}

export function getArtificerFacilitatedRevivalAction(
  character: SubclassRuntimeCharacter
): FeatureActionCard | null {
  if (!hasRefinedReanimation(character)) return null;
  const usesRemaining = getArtificerFacilitatedRevivalUsesRemaining(character);
  const description = getRefinedReanimationSection(character, "Facilitated Revival");
  return {
    key: artificerFacilitatedRevivalActionKey,
    name: "Facilitated Revival",
    sourceFeature: CLASS_FEATURE.REFINED_REANIMATION,
    cardTheme: ACTION_CARD_THEME.MAGIC,
    summary: "Cast Raise Dead without a spell slot or Material components.",
    detail: "Open Raise Dead and cast it using your Facilitated Revival charge.",
    breakdown: "Free Raise Dead spell",
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    usesRemaining,
    usesTotal: 1,
    cardUsage: createChargesCardUsage(usesRemaining, 1),
    description,
    drawer: { kind: "confirm", description, confirmLabel: "Open Raise Dead" },
    execute: {
      kind: "spell",
      spellSource: "fixed",
      effectKind: "facilitated-revival",
      spellId: "spell-raise-dead",
      spellLevel: 5,
      label: "Open Raise Dead",
      actionContextText: "Using Facilitated Revival",
      actionAvailabilityText: "Cast without expending a spell slot or Material components.",
      actionConsumesSpellSlot: false
    },
    disabled: usesRemaining <= 0,
    disabledReason:
      usesRemaining <= 0 ? "Facilitated Revival recharges when you finish a Long Rest." : undefined
  };
}

export function getArtificerFacilitatedRevivalSpellEntry(
  character: Character,
  spell: SpellEntry
): SpellEntry {
  return appendFeatureSourcedDescriptionAddition(
    {
      ...spell,
      components: spell.components.filter((component) => component !== SPELL_COMPONENT.M)
    },
    character,
    CLASS_FEATURE.REFINED_REANIMATION,
    getRefinedReanimationSection(character, "Facilitated Revival"),
    "Facilitated Revival"
  );
}

export function consumeArtificerFacilitatedRevivalUse(character: Character): Character {
  return spendClassResource(
    character,
    {
      stateKey: "artificer",
      counter: "facilitatedRevivalUsesExpended",
      total: getArtificerFacilitatedRevivalUsesTotal(character),
      remaining: getArtificerFacilitatedRevivalUsesRemaining(character)
    },
    1
  );
}

export function restoreArtificerFacilitatedRevivalOnLongRest(character: Character): Character {
  if (
    !hasRefinedReanimation(character) ||
    !character.classFeatureState?.artificer?.facilitatedRevivalUsesExpended
  ) {
    return character;
  }
  return replaceClassFeatureState(character, "artificer", {
    ...character.classFeatureState?.artificer,
    facilitatedRevivalUsesExpended: 0
  });
}

export function getArtificerLifeTransferReactionEntries(
  character: SubclassRuntimeCharacter
): ReactionEntry[] {
  if (!hasRefinedReanimation(character)) return [];
  return [
    {
      id: artificerLifeTransferReactionEntryId,
      reaction: REACTION.LIFE_TRANSFER,
      name: "Life Transfer",
      sourceType: "feature",
      sourceFeature: CLASS_FEATURE.REFINED_REANIMATION,
      sourceLabel: "Reanimator",
      description: getRefinedReanimationSection(character, "Life Transfer")
    }
  ];
}

export function getArtificerLifeTransferCompanions(character: Character) {
  return hasRefinedReanimation(character)
    ? getLivingArtificerReanimatedCompanions(character).filter(
        (entry) => entry.currentHitPoints > 0
      )
    : [];
}

export function applyArtificerLifeTransfer(character: Character, companionId: string): Character {
  const companion = getArtificerLifeTransferCompanions(character).find(
    (entry) => entry.id === companionId
  );
  if (!companion) return character;
  return {
    ...character,
    currentHitPoints: Math.min(
      getEffectiveHitPointMaximumForCharacter(character),
      Math.max(0, character.currentHitPoints) + companion.currentHitPoints
    ),
    companions: character.companions.map((entry) =>
      entry.id === companionId
        ? {
            ...entry,
            currentHitPoints: 0,
            temporaryHitPoints: 0,
            temporaryHitPointsSource: undefined,
            deathSaves: { successes: 0, failures: 3 }
          }
        : entry
    )
  };
}
