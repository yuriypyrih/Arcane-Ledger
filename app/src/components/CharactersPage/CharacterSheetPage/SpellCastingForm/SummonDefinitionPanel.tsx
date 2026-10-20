import { Search } from "lucide-react";
import { useState } from "react";
import type { SpellEntry } from "../../../../codex/entries";
import type { Character, CharacterCompanion, MonsterRecord } from "../../../../types";
import { getCompanionStatusLabel } from "../../../../pages/CharactersPage/companions";
import type { SpellSummonDefinitionConfig } from "../../../../pages/CharactersPage/spellSummons";
import { flattenSpellDescriptionLines } from "../../../../utils/codex/spellDescription";
import { getMonsterHitPoints, getMonsterTypeName } from "../../../../utils/monsters";
import ActionButton from "../../../ActionButton";
import CreatureEditorModal from "../CompanionsSection/CreatureEditorModal";
import CreatureCard from "../CompanionsSection/CreatureCard";
import {
  createEmptyCompanionDraft,
  getCompanionSourceLabel,
  type CompanionDraft
} from "../CompanionsSection/companionUtils";
import { getManualStatusDurationDraft } from "../GameplayForm/widgets/TraitsConditionsWidget/manualStatusDuration";
import styles from "./CharacterSpellDrawer.module.css";

type SummonDefinitionPanelProps = {
  character: Character;
  config: SpellSummonDefinitionConfig;
  createDefaultMonster?: () => MonsterRecord;
  definitions: CharacterCompanion[];
  disabled?: boolean;
  disabledReason?: string | null;
  onDefinitionsChange: (definitions: CharacterCompanion[]) => void;
  spell: Pick<SpellEntry, "name" | "description">;
  sourceKind?: "spell" | "feature";
  mode?: "summon" | "form";
};

function createSummonInitialDraft(
  spellName: string,
  spellDescription: SpellEntry["description"],
  config: SpellSummonDefinitionConfig,
  monster?: MonsterRecord
): CompanionDraft {
  const durationDraft = config.defaultDuration
    ? getManualStatusDurationDraft(config.defaultDuration)
    : undefined;

  const durationDefaults = durationDraft
    ? {
        durationType: durationDraft.type,
        durationValue: durationDraft.value
      }
    : {};

  return createEmptyCompanionDraft({
    description: flattenSpellDescriptionLines(spellDescription)
      .map((line) => line.replace(/<\/?(?:link|spell)(?::[^>]+)?>/g, ""))
      .join("\n\n"),
    ...durationDefaults,
    separateInitiative: config.defaultSeparateInitiative === true,
    source: spellName,
    type: config.defaultType ?? (monster ? getMonsterTypeName(monster) : null) ?? "",
    ...(monster
      ? {
          name: monster.name,
          maxHitPoints: String(Math.max(1, getMonsterHitPoints(monster) ?? 1)),
          inheritedCreatureEntry: monster
        }
      : {})
  });
}

function SummonDefinitionPanel({
  character,
  config,
  createDefaultMonster,
  definitions,
  disabled = false,
  disabledReason = null,
  onDefinitionsChange,
  spell,
  sourceKind = "spell",
  mode = "summon"
}: SummonDefinitionPanelProps) {
  const [editingDefinitionIndex, setEditingDefinitionIndex] = useState<number | "new" | null>(null);
  const [initialDraft, setInitialDraft] = useState<CompanionDraft>();
  const activeDefinition =
    typeof editingDefinitionIndex === "number"
      ? (definitions[editingDefinitionIndex] ?? null)
      : null;
  const buttonLabel =
    mode === "form"
      ? "Define Spirit Form"
      : definitions.length > 0
        ? "Add additional summon"
        : createDefaultMonster
          ? `Define ${spell.name}`
          : "Choose an eligible stat block yourself";

  function handleAddDefinition() {
    setInitialDraft(
      createSummonInitialDraft(spell.name, spell.description, config, createDefaultMonster?.())
    );
    setEditingDefinitionIndex("new");
  }

  function handleSaveDefinition(nextDefinition: CharacterCompanion) {
    if (typeof editingDefinitionIndex === "number") {
      onDefinitionsChange(
        definitions.map((definition, index) =>
          index === editingDefinitionIndex ? nextDefinition : definition
        )
      );
      return;
    }

    onDefinitionsChange([...definitions, nextDefinition]);
  }

  function handleRemoveDefinition(definitionIndex: number) {
    onDefinitionsChange(definitions.filter((_, index) => index !== definitionIndex));
  }

  return (
    <section className={styles.summonDefinitionSection} aria-label={`${spell.name} summon`}>
      {definitions.map((definition, definitionIndex) => {
        const statusLabel = getCompanionStatusLabel(definition);
        const sourceLabel = getCompanionSourceLabel(definition);

        return (
          <CreatureCard
            key={`${definition.id}-${definitionIndex}`}
            creature={definition}
            editLabel={`Edit ${definition.name} ${mode} definition`}
            predisposition="friendly"
            removeLabel={`Clear ${definition.name} ${mode} definition`}
            sourceLabel={sourceLabel}
            statusLabel={statusLabel}
            onEdit={() => setEditingDefinitionIndex(definitionIndex)}
            onInspect={() => setEditingDefinitionIndex(definitionIndex)}
            onRemove={() => handleRemoveDefinition(definitionIndex)}
          />
        );
      })}

      <div className={styles.summonDefinitionEmpty}>
        {!disabled ? (
          <ActionButton
            actionType="INFO"
            variant="OUTLINE"
            icon={<Search size={16} aria-hidden="true" />}
            title={disabledReason ?? undefined}
            onClick={handleAddDefinition}
          >
            {buttonLabel}
          </ActionButton>
        ) : null}
        {disabledReason ? <p className={styles.summonDefinitionNotice}>{disabledReason}</p> : null}
      </div>

      {editingDefinitionIndex !== null ? (
        <CreatureEditorModal
          allowAdditionalStatBlocks={mode !== "form"}
          character={character}
          creature={activeDefinition}
          creatures={character.companions ?? []}
          initialDraft={initialDraft}
          labels={{
            browseButton: "Browse Monsters",
            browseSummary: `Choose a stat block to inherit for this ${mode}.`,
            browseTitle: "Browse monsters",
            closeLabel: "Close summon definition",
            createButton: mode === "form" ? "Define Form" : "Define Summon",
            createTitle: `Define ${mode}`,
            deleteButton: "Delete",
            deleteCloseLabel: "Close delete summon confirmation",
            deleteConfirmLabel: "Delete",
            deleteMessage: (currentSummon) => (
              <>
                This will remove <strong>{currentSummon.name}</strong> from this{" "}
                {sourceKind === "spell" ? "spell cast" : "action"}.
              </>
            ),
            deleteTitle: "Delete summon?",
            editTitle: `Edit ${mode}`,
            inheritedStatBlockTitle: mode === "form" ? "Stat block" : "Stat blocks",
            noStatBlockText: "No stat block selected.",
            previewBadgeLabel: "Monster Preview",
            saveButton: mode === "form" ? "Update Form" : "Update Summon",
            summary:
              mode === "form"
                ? "Define the spirit form your existing companion will adopt."
                : sourceKind === "spell"
                  ? "Define the companion this spell will create when cast."
                  : "Define the companion this action will create.",
            useMonsterButton: "Use Monster"
          }}
          onClose={() => setEditingDefinitionIndex(null)}
          onSaveCreature={handleSaveDefinition}
          preserveTypeOnMonsterSelect
          showDurationFields={mode !== "form"}
          showSeparateInitiativeToggle={mode !== "form"}
        />
      ) : null}
    </section>
  );
}

export default SummonDefinitionPanel;
