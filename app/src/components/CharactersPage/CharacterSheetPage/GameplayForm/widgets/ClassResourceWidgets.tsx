import type { Character } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import { CharacterSheetSectionProfiler } from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetSectionProfiler";
import ResourceCountWidget from "./ResourceCountWidget";
import { classResourceWidgets } from "./classResourceWidgetDefinitions";
import { classResourcePersistOptions } from "./persistOptions";

type ClassResourceWidgetsProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

export default function ClassResourceWidgets({
  character,
  onPersistCharacter
}: ClassResourceWidgetsProps) {
  return classResourceWidgets.map((resource) => {
    const total = resource.total(character);
    const die = resource.die?.(character);

    if (total <= 0 || (resource.die && !die)) {
      return null;
    }

    const current = resource.remaining(character);

    return (
      <CharacterSheetSectionProfiler key={resource.id} id={resource.id}>
        <ResourceCountWidget
          icon={resource.icon}
          pillLabel={`${current}/${total} ${resource.label}`}
          modalTitle={resource.label}
          current={current}
          total={total}
          titleSuffix={die?.toUpperCase()}
          onAdd={() => onPersistCharacter(resource.restoreOne, classResourcePersistOptions)}
          onUse={() => onPersistCharacter(resource.spendOne, classResourcePersistOptions)}
          onReset={() => onPersistCharacter(resource.restoreAll, classResourcePersistOptions)}
        />
      </CharacterSheetSectionProfiler>
    );
  });
}
