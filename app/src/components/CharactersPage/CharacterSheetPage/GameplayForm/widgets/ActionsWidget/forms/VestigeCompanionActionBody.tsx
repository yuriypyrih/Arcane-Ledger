import {
  getWarlockVestigeCompanionStatBlock,
  vestigeCompanionDefinitionConfig
} from "../../../../../../../pages/CharactersPage/classFeatures/warlock/subclasses/warlockVestigePatron";
import SummonDefinitionPanel from "../../../../SpellCastingForm/SummonDefinitionPanel";
import type { ActionFormBodyContext } from "../uiAdapters/types";
import {
  getSemblanceOfLifeCompanion,
  getSemblanceOfLifeSpellLevel,
  getSemblanceOfLifeSpiritName,
  semblanceOfLifeActionKey
} from "../../../../../../../pages/CharactersPage/classFeatures/warlock/subclasses/warlockSemblanceOfLife";

export default function VestigeCompanionActionBody({
  context
}: {
  context: ActionFormBodyContext;
}) {
  const {
    character,
    selectedAction,
    selectedVestigeCompanionDefinitions,
    setSelectedVestigeCompanionDefinitions
  } = context;
  if (!selectedAction || selectedAction.kind !== "feature") return null;
  const hasDefinition = selectedVestigeCompanionDefinitions.length > 0;
  const isForm = selectedAction.action.key === semblanceOfLifeActionKey;
  return (
    <>
      {isForm ? (
        <p>
          Choose a {getSemblanceOfLifeSpiritName(character) ?? "matching spirit"} and configure it
          for spell level {getSemblanceOfLifeSpellLevel(character)}. Set its Max HP to the temporary
          HP it grants. Your vestige keeps its own HP, Hit Dice, and Divine Power.
        </p>
      ) : null}
      <SummonDefinitionPanel
        character={character}
        config={
          isForm
            ? {
                spellId: semblanceOfLifeActionKey,
                defaultType: getSemblanceOfLifeCompanion(character)?.type
              }
            : vestigeCompanionDefinitionConfig
        }
        createDefaultMonster={
          isForm ? undefined : () => getWarlockVestigeCompanionStatBlock(character)
        }
        mode={isForm ? "form" : "summon"}
        definitions={selectedVestigeCompanionDefinitions}
        disabled={hasDefinition || selectedAction.disabled}
        onDefinitionsChange={setSelectedVestigeCompanionDefinitions}
        spell={{ name: selectedAction.name, description: selectedAction.drawer.description ?? [] }}
        sourceKind="feature"
      />
    </>
  );
}
