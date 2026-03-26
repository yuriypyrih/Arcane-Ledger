import clsx from "clsx";
import { Pencil, Pentagon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useDiceRollerPopup } from "../../../DicePage/DiceRollerPopup";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import type { AbilityKey, Character, CoreStats } from "../../../../types";
import {
  getAbilityScoreBreakdownForCharacter,
  getAbilityScoresForCharacter
} from "../../../../pages/CharactersPage/abilities";
import { getKeywordDescription } from "../../../../pages/CharactersPage/keywordDescriptions";
import {
  createDefaultCoreStats,
  getPointBuyRemaining,
  normalizePointBuyAbilities
} from "../../../../pages/CharactersPage/constants";
import {
  formatAbilityModifier,
  getAbilityModifier,
  getHitDiceDisplayForCharacter,
  getInitiativeBreakdownForCharacter,
  getInitiativeForCharacter,
  getMainAbilityForClass,
  getPassivePerceptionForCharacter,
  getProficiencyBonus
} from "../../../../pages/CharactersPage/gameplay";
import {
  getArmorClassBreakdownForCharacter,
  getArmorClassForCharacter
} from "../../../../pages/CharactersPage/armor";
import {
  getSpeedBreakdownForCharacter,
  getSpeedForCharacter
} from "../../../../pages/CharactersPage/speed";
import {
  applyPerfectFocusOnInitiativeForCharacter,
  type FeatureIndicator,
  applySuperiorInspirationOnInitiativeForCharacter,
  getBardicInspirationDieForCharacter,
  getCoreStatIndicatorsForCharacter,
  hasPerfectFocusForCharacter,
  getMonkMartialArtsDieForCharacter,
  getSavingThrowIndicatorsForCharacter
} from "../../../../pages/CharactersPage/classFeatures";
import RollStatePill from "../../../RollStatePill/RollStatePill";
import {
  getSavingThrowLevelFromEntries,
  getSavingThrowProficiencyForAbilityKey
} from "../../../../pages/CharactersPage/proficiency";
import { PROF_LEVEL } from "../../../../types";
import type {
  AbilitiesDraft,
  PersistCharacterUpdater
} from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  clampNumber,
  cloneAbilityScores,
  normalizeCustomAbilityScores
} from "../../../../pages/CharactersPage/CharacterSheetPage/utils";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import AbilityScoresModal from "./AbilityScoresModal";
import styles from "./StatsForm.module.css";

type CharacterStatsFormProps = {
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

type SelectedStatReference = {
  keyword: string;
  summaryText?: string;
  descriptionItems?: Array<{
    label: string;
    text: string;
  }>;
  detailCards?: Array<{
    label: string;
    value: string;
  }>;
  indicators?: FeatureIndicator[];
};

type CoreStatCard = {
  key: string;
  label: string;
  value: string;
  indicators?: FeatureIndicator[];
  summaryText?: string;
  detailCards?: Array<{
    label: string;
    value: string;
  }>;
};

const abilityKeys: AbilityKey[] = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];

const abilityDisplayLabels: Record<AbilityKey, string> = {
  STR: "Strength",
  DEX: "Dexterity",
  CON: "Constitution",
  INT: "Intelligence",
  WIS: "Wisdom",
  CHA: "Charisma"
};

const coreStatFields: Array<{ key: keyof CoreStats; label: string }> = [
  { key: "armorClass", label: "Armor Class" },
  { key: "initiative", label: "Initiative" },
  { key: "speed", label: "Speed" },
  { key: "passivePerception", label: "Passive Perception" },
  { key: "proficiencyBonus", label: "Proficiency Bonus" },
  { key: "hitDice", label: "Hit Dice" }
];

function createAbilitiesDraft(character: Character): AbilitiesDraft {
  return {
    attributeMode: "pointBuy",
    abilities: cloneAbilityScores(character.abilities)
  };
}

function formatArmorClassTermLabel(label: string, source: string): string {
  if (label === "Base") {
    return `Base (${source})`;
  }

  if (["STR", "DEX", "CON", "INT", "WIS", "CHA"].includes(label)) {
    return label;
  }

  return label;
}

function formatArmorClassFormula(
  total: number,
  entries: Array<{ label: string; value: number }>,
  source: string
): string {
  const terms = entries.map(
    (entry) =>
      `${entry.value >= 0 ? "+" : ""}${entry.value} ${formatArmorClassTermLabel(entry.label, source)}`
  );
  return `${total} AC = ${terms.join(" ")}`;
}

function formatSpeedTermLabel(label: string, source: string): string {
  if (label === "Base") {
    return `Base (${source})`;
  }

  return label;
}

function formatSpeedFormula(
  total: number,
  entries: Array<{ label: string; value: number }>,
  source: string
): string {
  const terms = entries.map(
    (entry) =>
      `${entry.value >= 0 ? "+" : ""}${entry.value} ${formatSpeedTermLabel(entry.label, source)}`
  );

  return `${total} ft = ${terms.join(" ")}`;
}

function formatInitiativeFormula(
  total: number,
  entries: Array<{ label: string; value: number }>
): string {
  const terms = entries.map(
    (entry) => `${entry.value >= 0 ? "+" : ""}${entry.value} ${entry.label}`
  );

  return `${formatAbilityModifier(total)} Initiative = ${terms.join(" ")}`;
}

function formatD20Formula(modifier: number): string {
  if (modifier === 0) {
    return "1d20";
  }

  return `1d20 ${modifier > 0 ? "+" : "-"} ${Math.abs(modifier)}`;
}

function formatAbilityModifierFormula(ability: AbilityKey, score: number): string {
  return `${formatAbilityModifier(getAbilityModifier(score))} ${ability} Modifier = floor((${score} ${ability} - 10) / 2)`;
}

function formatAbilityScoreFormula(
  ability: AbilityKey,
  total: number,
  entries: Array<{ label: string; value: number }>
): string {
  const [baseEntry, ...bonusEntries] = entries;
  const formattedEntries = [
    baseEntry
      ? `${baseEntry.value} ${ability} (${baseEntry.label})`
      : `${total} ${ability} (Base)`,
    ...bonusEntries.map(
      (entry) => `${entry.value >= 0 ? "+" : ""}${entry.value} (${entry.label})`
    )
  ];

  return `${total} ${ability} = ${formattedEntries.join(" ")}`;
}

function getProficiencyMultiplier(level: PROF_LEVEL): 0 | 1 | 2 {
  if (level === PROF_LEVEL.EXPERT) {
    return 2;
  }

  if (level === PROF_LEVEL.PROFICIENT) {
    return 1;
  }

  return 0;
}

function formatSavingThrowFormula(
  ability: AbilityKey,
  total: number,
  abilityModifier: number,
  proficiencyContribution: number,
  proficiencyLabel?: string
): string {
  const terms = [`${abilityModifier >= 0 ? "+" : ""}${abilityModifier} ${ability}`];

  if (proficiencyContribution !== 0 && proficiencyLabel) {
    terms.push(`${proficiencyContribution >= 0 ? "+" : ""}${proficiencyContribution} ${proficiencyLabel}`);
  }

  return `${formatAbilityModifier(total)} ${ability} Save = ${terms.join(" ")}`;
}

function stripLeadingLabel(description: string, label: string): string {
  if (description.startsWith(`${label}:`)) {
    return description.slice(label.length + 1).trim();
  }

  return description;
}

function formatDieValue(die: string | null): string | null {
  return die ? String(die).toLowerCase() : null;
}

function CharacterStatsForm({ className, onPersistCharacter }: CharacterStatsFormProps) {
  const { watch } = useFormContext<Character>();
  const character = watch() as Character;
  const [isAbilityModalOpen, setIsAbilityModalOpen] = useState(false);
  const [abilitiesDraft, setAbilitiesDraft] = useState<AbilitiesDraft>(() =>
    createAbilitiesDraft(character)
  );
  const [selectedStatReference, setSelectedStatReference] = useState<SelectedStatReference | null>(
    null
  );
  const [usePerfectFocusOnInitiative, setUsePerfectFocusOnInitiative] = useState(true);
  const { openDiceRoller, diceRollerPopup } = useDiceRollerPopup();

  useBodyScrollLock(Boolean(selectedStatReference) || isAbilityModalOpen);

  useEffect(() => {
    if (!selectedStatReference && !isAbilityModalOpen) {
      return;
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      if (selectedStatReference) {
        setSelectedStatReference(null);
        return;
      }

      if (isAbilityModalOpen) {
        setAbilitiesDraft(createAbilitiesDraft(character));
        setIsAbilityModalOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [character, isAbilityModalOpen, selectedStatReference]);

  const mainAbility = getMainAbilityForClass(character.className);
  const hasPerfectFocus = hasPerfectFocusForCharacter(character);
  const pointBuyRemaining =
    abilitiesDraft.attributeMode === "pointBuy"
      ? getPointBuyRemaining(abilitiesDraft.abilities)
      : null;
  const proficiencyBonus = getProficiencyBonus(character.level);
  const effectiveAbilities = getAbilityScoresForCharacter(character);
  const displayedCoreStats: CoreStats = {
    ...(character.coreStats ?? createDefaultCoreStats()),
    armorClass: String(getArmorClassForCharacter(character)),
    initiative: formatAbilityModifier(getInitiativeForCharacter(character)),
    speed: `${getSpeedForCharacter(character)} ft`,
    passivePerception: String(getPassivePerceptionForCharacter(character)),
    proficiencyBonus: formatAbilityModifier(proficiencyBonus),
    hitDice: getHitDiceDisplayForCharacter(character)
  };
  const coreStatIndicators = getCoreStatIndicatorsForCharacter(character);
  const savingThrowIndicators = getSavingThrowIndicatorsForCharacter(character);
  const armorClassBreakdown = getArmorClassBreakdownForCharacter(character);
  const speedBreakdown = getSpeedBreakdownForCharacter(character);
  const initiativeBreakdown = getInitiativeBreakdownForCharacter(character);
  const monkMartialArtsDie = getMonkMartialArtsDieForCharacter(character);
  const bardicInspirationDie = getBardicInspirationDieForCharacter(character);
  const abilitySavingThrowCards = abilityKeys.map((ability) => {
    const abilityScore = effectiveAbilities[ability];
    const abilityModifierValue = getAbilityModifier(abilityScore);
    const savingThrowProficiency = getSavingThrowProficiencyForAbilityKey(ability);
    const savingThrowLevel = getSavingThrowLevelFromEntries(
      character.savingThrowProficiencies,
      savingThrowProficiency
    );
    const proficiencyMultiplier = getProficiencyMultiplier(savingThrowLevel);
    const proficiencyContribution = proficiencyBonus * proficiencyMultiplier;
    const totalSavingThrowValue = abilityModifierValue + proficiencyContribution;
    const proficiencyLabel =
      proficiencyMultiplier === 2
        ? "Proficiency Bonus x2"
        : proficiencyMultiplier === 1
          ? "Proficiency Bonus"
          : undefined;

    return {
      ability,
      score: abilityScore,
      modifier: formatAbilityModifier(abilityModifierValue),
      modifierValue: abilityModifierValue,
      isSavingThrowProficient: proficiencyMultiplier > 0,
      hasSavingThrowAdvantage: (savingThrowIndicators[ability] ?? []).some(
        (indicator) => indicator.tone === "advantage"
      ),
      hasSavingThrowDisadvantage: (savingThrowIndicators[ability] ?? []).some(
        (indicator) => indicator.tone === "disadvantage"
      ),
      proficiencyContribution,
      proficiencyLabel,
      totalSavingThrowValue,
      totalSavingThrow: formatAbilityModifier(totalSavingThrowValue),
      indicators: savingThrowIndicators[ability] ?? []
    };
  });

  const baseCoreStatCards = coreStatFields.map((field) => {
    let detailValue: string | undefined;

    if (field.label === "Armor Class") {
      detailValue = formatArmorClassFormula(
        armorClassBreakdown.total,
        armorClassBreakdown.entries,
        armorClassBreakdown.source
      );
    } else if (field.label === "Initiative") {
      detailValue = formatInitiativeFormula(initiativeBreakdown.total, initiativeBreakdown.entries);
    } else if (field.label === "Speed") {
      detailValue = formatSpeedFormula(
        speedBreakdown.total,
        speedBreakdown.entries,
        speedBreakdown.source
      );
    }

    return {
      key: String(field.key),
      label: field.label,
      value: displayedCoreStats[field.key],
      indicators: coreStatIndicators[field.key],
      summaryText: getKeywordDescription(field.label) ?? undefined,
      detailCards: detailValue
        ? [
            {
              label: "Formula",
              value: detailValue
            }
          ]
        : undefined
    } satisfies CoreStatCard;
  });

  const additionalCoreStatCards: CoreStatCard[] = [];

  if (monkMartialArtsDie) {
    additionalCoreStatCards.push({
      key: "martial-arts-die",
      label: "Martial Arts Die",
      value: formatDieValue(monkMartialArtsDie) ?? "-",
      summaryText:
        "Your current Martial Arts die. When Martial Arts applies, your Unarmed Strike and Monk weapons can use this die in place of their normal damage die if it is higher.",
      detailCards: [
        {
          label: "Current Die",
          value: formatDieValue(monkMartialArtsDie) ?? "-"
        },
        {
          label: "Progression",
          value: "d6 at 1, d8 at 5, d10 at 11, d12 at 17"
        }
      ]
    });
  }

  if (bardicInspirationDie) {
    additionalCoreStatCards.push({
      key: "bardic-inspiration-die",
      label: "Bardic Die",
      value: formatDieValue(bardicInspirationDie) ?? "-",
      summaryText:
        "Your current Bardic Inspiration die. Creatures inspired by you roll this die when they spend a Bardic Inspiration use.",
      detailCards: [
        {
          label: "Current Die",
          value: formatDieValue(bardicInspirationDie) ?? "-"
        },
        {
          label: "Progression",
          value: "d6 at 1, d8 at 5, d10 at 10, d12 at 15"
        }
      ]
    });
  }

  const coreStatCards: CoreStatCard[] = [...additionalCoreStatCards, ...baseCoreStatCards];

  function syncAbilityDraftFromCharacter() {
    setAbilitiesDraft(createAbilitiesDraft(character));
  }

  function openAbilityEditor() {
    syncAbilityDraftFromCharacter();
    setIsAbilityModalOpen(true);
  }

  function cancelAbilityEditing() {
    syncAbilityDraftFromCharacter();
    setIsAbilityModalOpen(false);
  }

  function saveAbilities() {
    const nextAbilities =
      abilitiesDraft.attributeMode === "pointBuy"
        ? normalizePointBuyAbilities(cloneAbilityScores(abilitiesDraft.abilities))
        : normalizeCustomAbilityScores(cloneAbilityScores(abilitiesDraft.abilities));

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      attributeMode: abilitiesDraft.attributeMode,
      abilities: nextAbilities
    }));

    setIsAbilityModalOpen(false);
  }

  function updateAbilityScore(ability: AbilityKey, value: string) {
    const isPointBuy = abilitiesDraft.attributeMode === "pointBuy";
    const nextValue = clampNumber(
      value,
      isPointBuy ? 8 : 1,
      isPointBuy ? 15 : 99,
      abilitiesDraft.abilities[ability]
    );

    setAbilitiesDraft((current) => ({
      ...current,
      abilities: {
        ...current.abilities,
        [ability]: nextValue
      }
    }));
  }

  function openCoreStatReference(card: CoreStatCard) {
    if (card.label === "Initiative" && hasPerfectFocus) {
      setUsePerfectFocusOnInitiative(true);
    }

    setSelectedStatReference({
      keyword: card.label,
      summaryText: card.summaryText,
      indicators: card.indicators?.length ? card.indicators : undefined,
      detailCards: card.detailCards
    });
  }

  function openAbilityReference(
    ability: AbilityKey,
    indicators?: FeatureIndicator[]
  ) {
    const abilityBreakdown = getAbilityScoreBreakdownForCharacter(character, ability);
    const abilityDescription = getKeywordDescription(ability);
    const savingThrowKeyword = `${ability} Saving Throw`;
    const savingThrowDescription = getKeywordDescription(savingThrowKeyword);
    const selectedCard = abilitySavingThrowCards.find((card) => card.ability === ability);

    if (!selectedCard) {
      return;
    }

    const descriptionItems = [
      ...(abilityDescription
        ? [
            {
              label: abilityDisplayLabels[ability],
              text: stripLeadingLabel(abilityDescription, abilityDisplayLabels[ability])
            }
          ]
        : []),
      ...(savingThrowDescription
        ? [
            {
              label: savingThrowKeyword,
              text: stripLeadingLabel(savingThrowDescription, savingThrowKeyword)
            }
          ]
        : [])
    ];

    setSelectedStatReference({
      keyword: ability,
      indicators: indicators?.length ? indicators : undefined,
      descriptionItems: descriptionItems.length ? descriptionItems : undefined,
      detailCards: [
        {
          label: "Ability Score Formula",
          value: formatAbilityScoreFormula(
            ability,
            abilityBreakdown.total,
            abilityBreakdown.entries
          )
        },
        {
          label: "Ability Modifier Formula",
          value: formatAbilityModifierFormula(ability, selectedCard.score)
        },
        {
          label: "Saving Throw Formula",
          value: formatSavingThrowFormula(
            ability,
            selectedCard.totalSavingThrowValue,
            selectedCard.modifierValue,
            selectedCard.proficiencyContribution,
            selectedCard.proficiencyLabel
          )
        }
      ]
    });
  }

  function rollInitiative() {
    const initiativeFormula = formatInitiativeFormula(
      initiativeBreakdown.total,
      initiativeBreakdown.entries
    );

    onPersistCharacter((currentCharacter) => {
      let nextCharacter = applySuperiorInspirationOnInitiativeForCharacter(currentCharacter);

      if (usePerfectFocusOnInitiative) {
        nextCharacter = applyPerfectFocusOnInitiativeForCharacter(nextCharacter);
      }

      return nextCharacter;
    });
    setSelectedStatReference(null);
    openDiceRoller({
      title: "Initiative",
      formula: formatD20Formula(initiativeBreakdown.total),
      description: initiativeFormula
    });
  }

  function renderCoreStatsSection() {
    return (
      <section className={styles.statsGroup}>
        <div className={styles.statsGroupHeader}>
          <h3 className={styles.statsGroupTitle}>Core Stats</h3>
        </div>
        <div
          className={clsx(
            styles.modifierGrid,
            coreStatCards.length >= 7 && styles.coreStatGridWide
          )}
        >
          {coreStatCards.map((card) => (
            <button
              key={card.key}
              type="button"
              className={clsx(styles.modifierCard, styles.modifierCardButton)}
              onClick={() => openCoreStatReference(card)}
            >
              <div className={styles.modifierLabelRow}>
                <span className={clsx(styles.modifierLabel, styles.coreStatLabel)}>
                  {card.label}
                </span>
                {card.indicators?.map((indicator) => (
                  <RollStatePill
                    key={`${card.key}-${indicator.label}-${indicator.tone}`}
                    tone={indicator.tone}
                    label={indicator.label}
                  />
                ))}
              </div>
              <strong>{card.value}</strong>
            </button>
          ))}
        </div>
      </section>
    );
  }

  function renderAbilitySavingThrowsSection() {
    return (
      <section className={styles.statsGroup}>
        <div className={styles.statsGroupHeader}>
          <h3 className={clsx(styles.statsGroupTitle, styles.combinedGroupTitle)}>
            <span>Ability Modifier</span>
            <span className={styles.groupTitleDivider} aria-hidden="true" />
            <span>Saving Throws</span>
          </h3>
          <button
            type="button"
            className={shared.editButton}
            onClick={openAbilityEditor}
          >
            <Pencil size={16} />
            Edit
          </button>
        </div>

        <div className={styles.modifierGrid}>
          {abilitySavingThrowCards.map((card) => (
            <button
              key={card.ability}
              type="button"
              className={clsx(styles.modifierCard, styles.modifierCardButton)}
              onClick={() => openAbilityReference(card.ability, card.indicators)}
            >
              <div className={styles.modifierLabelRow}>
                <span className={styles.modifierLabel}>{card.ability}</span>
                <span
                  className={clsx(
                    styles.scoreBadge,
                    card.ability === mainAbility && styles.scoreBadgePrimary
                  )}
                  aria-label={`${card.ability} score ${card.score}`}
                >
                  <Pentagon size={28} className={styles.scoreBadgeIcon} aria-hidden="true" />
                  <span className={styles.scoreBadgeValue}>{card.score}</span>
                </span>
                {card.indicators.map((indicator) => (
                  <RollStatePill
                    key={`${card.ability}-${indicator.label}-${indicator.tone}`}
                    tone={indicator.tone}
                    label={indicator.label}
                  />
                ))}
              </div>
              <div className={styles.combinedValueRow}>
                <strong>{card.modifier}</strong>
                <span className={styles.combinedValueDivider} aria-hidden="true" />
                <strong
                  className={clsx(
                    card.hasSavingThrowAdvantage && styles.savingThrowValueAdvantage,
                    card.hasSavingThrowDisadvantage && styles.savingThrowValueDisadvantage
                  )}
                >
                  {card.totalSavingThrow}
                </strong>
              </div>
            </button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <article className={clsx(shared.sectionCard, className)}>
      <div className={shared.sectionHeader}>
        <div>
          <p className={shared.eyebrow}>Character Stats</p>
        </div>
      </div>

      <div className={styles.fullViewStack}>
        {renderCoreStatsSection()}
        {renderAbilitySavingThrowsSection()}
      </div>

      <AbilityScoresModal
        isOpen={isAbilityModalOpen}
        draft={abilitiesDraft}
        pointBuyRemaining={pointBuyRemaining}
        onClose={cancelAbilityEditing}
        onSave={saveAbilities}
        onSetAttributeMode={(attributeMode) =>
          setAbilitiesDraft((current) => ({
            ...current,
            attributeMode
          }))
        }
        onUpdateAbilityScore={updateAbilityScore}
      />

      {selectedStatReference ? (
        <div
          className={sheetStyles.spellDrawerBackdrop}
          role="presentation"
          onClick={() => setSelectedStatReference(null)}
        >
          <section
            className={sheetStyles.spellDrawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="character-stats-reference-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellDrawerHandle} aria-hidden="true" />
            <div className={clsx(sheetStyles.spellDrawerHeader, styles.referenceDrawerHeader)}>
              <div className={sheetStyles.spellDrawerHeaderContent}>
                <p className={sheetStyles.spellDrawerBadge}>Reference</p>
                <div className={sheetStyles.spellDrawerTitleRow}>
                  <h3 id="character-stats-reference-title">{selectedStatReference.keyword}</h3>
                </div>
                {selectedStatReference.summaryText ? (
                  <p className={sheetStyles.spellDrawerSummary}>
                    {selectedStatReference.summaryText}
                  </p>
                ) : null}
              </div>
              {selectedStatReference.indicators?.length ? (
                <div className={styles.referenceIndicatorStack}>
                  {selectedStatReference.indicators.map((indicator, index) => (
                    <RollStatePill
                      key={`${selectedStatReference.keyword}-${indicator.label}-${indicator.tone}-${indicator.source}-${index}`}
                      tone={indicator.tone}
                      label={indicator.label}
                      detailText={`From ${indicator.source}`}
                    />
                  ))}
                </div>
              ) : null}
              <button
                type="button"
                className={sheetStyles.spellDrawerCloseButton}
                onClick={() => setSelectedStatReference(null)}
                aria-label="Close stats details"
              >
                <X size={18} />
              </button>
            </div>
            {selectedStatReference.descriptionItems?.length ||
            selectedStatReference.detailCards?.length ? (
              <div className={sheetStyles.spellDrawerBody}>
                {selectedStatReference.descriptionItems?.length ? (
                  <div className={sheetStyles.spellDrawerDescriptionSection}>
                    <ul className={styles.referenceDescriptionList}>
                      {selectedStatReference.descriptionItems.map((item) => (
                        <li
                          key={`${selectedStatReference.keyword}-${item.label}`}
                          className={styles.referenceDescriptionItem}
                        >
                          <strong>{item.label}</strong>: {item.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {selectedStatReference.detailCards?.length ? (
                  <div className={clsx(sheetStyles.spellDrawerDetails, styles.referenceDetailStack)}>
                    {selectedStatReference.detailCards.map((detailCard) => (
                      <div
                        key={`${selectedStatReference.keyword}-${detailCard.label}`}
                        className={sheetStyles.spellDrawerDetailCard}
                      >
                        <span>{detailCard.label}</span>
                        <strong>{detailCard.value}</strong>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
            {selectedStatReference.keyword === "Initiative" ? (
              <div className={clsx(sheetStyles.spellDrawerActions, styles.initiativeActions)}>
                <div className={styles.initiativeActionsStart}>
                  {hasPerfectFocus ? (
                    <label className={styles.initiativeCheckboxLabel}>
                      <input
                        type="checkbox"
                        checked={usePerfectFocusOnInitiative}
                        onChange={(event) => setUsePerfectFocusOnInitiative(event.target.checked)}
                      />
                      <span>Perfect Focus</span>
                    </label>
                  ) : null}
                </div>
                <button
                  type="button"
                  className={sheetStyles.castButton}
                  onClick={rollInitiative}
                >
                  Roll Initiative
                </button>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
      {diceRollerPopup}
    </article>
  );
}

export default CharacterStatsForm;
