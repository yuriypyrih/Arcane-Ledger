import { useMemo, useState } from "react";
import {
  getSelectedSubclassForCharacter,
  getSubclassOptionsForClassName,
  normalizeSubclassId
} from "../../../../pages/CharactersPage/subclasses";
import {
  areCharacterClassRulesEnforced,
  isCustomClassName,
  normalizeCustomClassConfig
} from "../../../../pages/CharactersPage/customClass";
import type { Character } from "../../../../types";
import {
  CUSTOM_CLASS_NAME_MAX_LENGTH,
  CUSTOM_SUBCLASS_LABEL,
  CUSTOM_SUBCLASS_NAME_MAX_LENGTH,
  createCustomMetadataId,
  createDefaultCustomSubclassConfig,
  isCustomSubclassId,
  normalizeCustomSubclassConfig
} from "../../../../pages/CharactersPage/customOrigins";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayEyebrow,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  SheetModal
} from "../../../Overlay";
import ActionButton from "../../../ActionButton";
import SelectInput from "../../FormInputs/SelectInput";
import TextInput from "../../FormInputs/TextInput";
import RadioContainerOption from "../RadioContainerOption";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./FeatEditorModal.module.css";

type SubclassEditorModalProps = {
  character: Character;
  onCancel: () => void;
  onSave: (draft: {
    subclassId: string;
    classRulesEnforced: boolean;
    customClass?: Character["customClass"];
    customSubclass?: Character["customSubclass"];
  }) => void;
};

function SubclassEditorModal({ character, onCancel, onSave }: SubclassEditorModalProps) {
  const selectedSubclass = getSelectedSubclassForCharacter(character);
  const isCustomClass = isCustomClassName(character.className);
  const [draftCustomClass, setDraftCustomClass] = useState(() => {
    const normalizedCustomClass = normalizeCustomClassConfig(character.customClass);

    return {
      ...normalizedCustomClass,
      id: normalizedCustomClass.id ?? createCustomMetadataId("class")
    };
  });
  const [draftCustomSubclass, setDraftCustomSubclass] = useState(
    () =>
      normalizeCustomSubclassConfig(character.customSubclass, {
        className: character.className
      }) ?? createDefaultCustomSubclassConfig(character.className)
  );
  const [draftSubclassId, setDraftSubclassId] = useState(
    selectedSubclass?.id ??
      (character.subclassId === character.customSubclass?.id ? character.subclassId : "")
  );
  const [draftClassRulesEnforced, setDraftClassRulesEnforced] = useState(
    () => areCharacterClassRulesEnforced(character)
  );
  const subclassOptions = useMemo(
    () => getSubclassOptionsForClassName(character.className),
    [character.className]
  );
  const normalizedSubclassId =
    normalizeSubclassId(draftSubclassId, character.className, draftCustomSubclass) ?? "";
  const isDraftCustomSubclass =
    !isCustomClass &&
    isCustomSubclassId(draftSubclassId) &&
    draftSubclassId === draftCustomSubclass.id;
  const isCustomClassNameReady = !isCustomClass || Boolean(draftCustomClass.name?.trim());
  const isCustomSubclassNameReady =
    !isDraftCustomSubclass || Boolean(draftCustomSubclass.name.trim());
  const isSubclassReady = isCustomClass || normalizedSubclassId.length > 0;
  const isReady = isCustomClassNameReady && isCustomSubclassNameReady && isSubclassReady;

  function saveSubclass() {
    if (!isReady) {
      return;
    }

    onSave({
      subclassId: normalizedSubclassId,
      classRulesEnforced: isCustomClass ? false : draftClassRulesEnforced,
      customClass: isCustomClass ? normalizeCustomClassConfig(draftCustomClass) : undefined,
      customSubclass: isDraftCustomSubclass ? draftCustomSubclass : undefined
    });
  }

  return (
    <SheetModal
      titleId="character-subclass-editor-title"
      onClose={onCancel}
      size="small"
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayEyebrow>Build</OverlayEyebrow>
          <div className={styles.heading}>
            <h3 id="character-subclass-editor-title" className={styles.headingTitle}>
              Edit Class and Subclass
            </h3>
            <OverlaySummary className={shared.helperText}>
              Choose the subclass used for class feature progression.
            </OverlaySummary>
          </div>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close subclass editor" onClick={onCancel} />
      </OverlayHeader>

      <OverlayBody className={styles.scrollArea}>
        <div className={styles.singleFieldGrid}>
          {isCustomClass ? (
            <label className={styles.field}>
              Custom class name
              <TextInput
                value={draftCustomClass.name ?? ""}
                maxLength={CUSTOM_CLASS_NAME_MAX_LENGTH}
                onChange={(event) =>
                  setDraftCustomClass((current) => ({
                    ...current,
                    name: event.target.value.slice(0, CUSTOM_CLASS_NAME_MAX_LENGTH)
                  }))
                }
              />
            </label>
          ) : null}

          <label className={styles.field}>
            Subclass
            <SelectInput
              compact
              value={draftSubclassId}
              disabled={isCustomClass}
              onChange={(event) => setDraftSubclassId(event.target.value)}
            >
              <option value="">
                {isCustomClass
                  ? "No subclass options"
                  : subclassOptions.length > 0
                    ? "Select a subclass"
                    : "Select a subclass"}
              </option>
              {subclassOptions.map((subclass) => (
                <option key={subclass.id} value={subclass.id}>
                  {subclass.name}
                </option>
              ))}
              {!isCustomClass ? (
                <>
                  <option disabled value="__custom-subclass-divider">
                    ──────────
                  </option>
                  <option value={draftCustomSubclass.id}>{CUSTOM_SUBCLASS_LABEL}</option>
                </>
              ) : null}
            </SelectInput>
          </label>

          {isDraftCustomSubclass ? (
            <label className={styles.field}>
              Custom subclass name
              <TextInput
                value={draftCustomSubclass.name}
                maxLength={CUSTOM_SUBCLASS_NAME_MAX_LENGTH}
                onChange={(event) =>
                  setDraftCustomSubclass((current) => ({
                    ...current,
                    name: event.target.value.slice(0, CUSTOM_SUBCLASS_NAME_MAX_LENGTH)
                  }))
                }
              />
            </label>
          ) : null}
        </div>

        {!isReady ? (
          <p className={styles.validation}>
            {isCustomClass && !isCustomClassNameReady
              ? "Enter a custom class name before saving."
              : isDraftCustomSubclass && !isCustomSubclassNameReady
                ? "Enter a custom subclass name before saving."
                : "Choose a subclass before saving."}
          </p>
        ) : null}

        <div className={styles.rulesEnforcementDivider} aria-hidden="true" />
        <RadioContainerOption
          header="Class rules enforcement"
          subheader="Your class will enforce their build rules"
          selected={draftClassRulesEnforced}
          onSelect={() => setDraftClassRulesEnforced((current) => !current)}
          disabled={isCustomClass}
          indicatorType="checkbox"
        />
      </OverlayBody>

      <OverlayFooter className={styles.footer}>
        <ActionButton variant="OUTLINE" fullWidth={false} onClick={onCancel}>
          Cancel
        </ActionButton>
        <ActionButton fullWidth={false} onClick={saveSubclass} disabled={!isReady}>
          Save
        </ActionButton>
      </OverlayFooter>
    </SheetModal>
  );
}

export default SubclassEditorModal;
