import { useNestedReferences } from "../useNestedReferences";
import { NestedReferenceDrawers } from "../NestedReferenceDrawers";
import { Suspense, type ReactNode } from "react";
import ActionShape, { getActionShapeForCastingTime } from "../../ActionShape";
import CellContainer from "../../CellContainer/CellContainer";
import SpellDescriptionContent from "../../SpellDescriptionContent";
import { type DivinityEntry } from "../../../codex/entries";
import { orderDescriptionAdditionSections } from "../../../pages/CharactersPage/actionModalDescriptions";
import {
  OverlayBadge,
  OverlayBody,
  OverlayCloseButton,
  OverlayDetailsGrid,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  OverlayTitleRow,
  SheetDrawer,
  overlayClassNames
} from "../../Overlay";
import { getClericResolvedDivinityDisplay } from "../../../pages/CharactersPage/classFeatures/cleric/cleric";
import type { FeatureActionResource } from "../../../pages/CharactersPage/classFeatures";
import { createHeaderTagsFromResources } from "../../../pages/CharactersPage/classFeatures/cardUsage";
import FeatureActionHeaderTags from "../../CharactersPage/CharacterSheetPage/GameplayForm/widgets/ActionsWidget/FeatureActionHeaderTags";

import type { Character } from "../../../types";
import {
  formatCodexLabel,
  formatDivinitySubtitle,
  formatDivinityValue,
  formatSpellCastingTime
} from "../../../utils/codex";
import styles from "./CodexDivinityDrawer.module.css";

type CodexDivinityDrawerProps = {
  divinity: DivinityEntry;
  character?: Pick<Character, "className" | "level" | "abilities" | "feats"> &
    Partial<Pick<Character, "subclassId">>;
  resources?: FeatureActionResource[];
  children?: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  backdropClassName?: string;
  stacked?: boolean;
};

function getDivinityValueCell(
  damage: ReturnType<typeof getClericResolvedDivinityDisplay>["damage"],
  healing: ReturnType<typeof getClericResolvedDivinityDisplay>["healing"],
  customValueCell?: ReturnType<typeof getClericResolvedDivinityDisplay>["valueCell"] | null
): {
  label: string;
  content: string;
} {
  if (customValueCell) {
    return customValueCell;
  }

  const damageLabel = damage ? formatDivinityValue(damage) : null;
  const healingLabel = healing ? formatDivinityValue(healing) : null;

  if (damageLabel && healingLabel) {
    return {
      label: "Damage/Heal",
      content: damageLabel === healingLabel ? damageLabel : `${damageLabel} / ${healingLabel}`
    };
  }

  if (damageLabel) {
    return {
      label: "Damage",
      content: damageLabel
    };
  }

  if (healingLabel) {
    return {
      label: "Heal",
      content: healingLabel
    };
  }

  return {
    label: "Damage",
    content: "-"
  };
}

function CodexDivinityDrawer({
  divinity,
  character,
  resources = [],
  children,
  footer,
  onClose,
  backdropClassName,
  stacked = false
}: CodexDivinityDrawerProps) {
  const references = useNestedReferences();
  const { setSelectedSpellReference, setSelectedKeyword, setSelectedFeatReference } = references;

  const resolvedDisplay = character
    ? getClericResolvedDivinityDisplay(character, divinity)
    : {
        damage: divinity.damage ?? null,
        healing: divinity.healing ?? null,
        valueCell: null,
        description: divinity.description,
        descriptionAdditions: []
      };
  const valueCell = getDivinityValueCell(
    resolvedDisplay.damage,
    resolvedDisplay.healing,
    resolvedDisplay.valueCell
  );
  const castingTimeActionShape = getActionShapeForCastingTime(divinity.castingTime);
  const hasBaseDescription = resolvedDisplay.description.length > 0;
  const descriptionSections = orderDescriptionAdditionSections(
    resolvedDisplay.descriptionAdditions
  );

  return (
    <>
      <SheetDrawer
        titleId="codex-divinity-drawer-title"
        onClose={onClose}
        backdropClassName={backdropClassName}
        stacked={stacked}
        onEscape={() => {
          if (references.closeTopReference()) return;

          onClose();
        }}
      >
        <OverlayHeader className={styles.header}>
          <OverlayHeaderContent>
            <OverlayBadge>{formatCodexLabel("DIVINITY")}</OverlayBadge>
            <OverlayTitleRow>
              <OverlayTitle id="codex-divinity-drawer-title">{divinity.name}</OverlayTitle>
            </OverlayTitleRow>
            <OverlaySummary>{formatDivinitySubtitle(divinity)}</OverlaySummary>
          </OverlayHeaderContent>
          <div className={styles.headerAside}>
            {resources.length > 0 ? (
              <div className={styles.resourceBadgeRow}>
                <FeatureActionHeaderTags
                  tags={createHeaderTagsFromResources(resources)}
                  tagKeyPrefix={`${divinity.id}-resource`}
                />
              </div>
            ) : null}
            <OverlayCloseButton label="Close divinity details" onClick={onClose} />
          </div>
        </OverlayHeader>

        <OverlayBody>
          <OverlayDetailsGrid>
            <CellContainer
              label="Casting Time"
              content={
                <span className={styles.castingTimeContent}>
                  <span>{formatSpellCastingTime(divinity.castingTime)}</span>
                  {castingTimeActionShape ? (
                    <ActionShape
                      shape={castingTimeActionShape}
                      isSelected
                      size="small"
                      className={styles.castingTimeShape}
                    />
                  ) : null}
                </span>
              }
            />
            <CellContainer label="Range" content={divinity.range} />
            <CellContainer label="Duration" content={divinity.duration} />
            <CellContainer label={valueCell.label} content={valueCell.content} />
          </OverlayDetailsGrid>

          {hasBaseDescription || descriptionSections.length > 0 ? (
            <div className={styles.descriptionStack}>
              {hasBaseDescription ? (
                <SpellDescriptionContent
                  description={resolvedDisplay.description}
                  className={`${overlayClassNames.descriptionList} ${overlayClassNames.descriptionSection}`}
                  entryClassName={overlayClassNames.descriptionLine}
                  strongClassName={overlayClassNames.descriptionStrong}
                  linkClassName={styles.inlineLinkButton}
                  onOpenKeyword={setSelectedKeyword}
                  onOpenSpell={setSelectedSpellReference}
                  onOpenFeat={(feat, label) => setSelectedFeatReference({ feat, label })}
                />
              ) : null}
              {descriptionSections.map((section, index) => (
                <div
                  key={`${divinity.id}-description-section-${index}`}
                  className={styles.descriptionSection}
                >
                  {hasBaseDescription || index > 0 ? (
                    <hr className={styles.descriptionDivider} aria-hidden="true" />
                  ) : null}
                  <SpellDescriptionContent
                    description={section}
                    className={`${overlayClassNames.descriptionList} ${overlayClassNames.descriptionSection}`}
                    entryClassName={overlayClassNames.descriptionLine}
                    strongClassName={overlayClassNames.descriptionStrong}
                    linkClassName={styles.inlineLinkButton}
                    onOpenKeyword={setSelectedKeyword}
                    onOpenSpell={setSelectedSpellReference}
                    onOpenFeat={(feat, label) => setSelectedFeatReference({ feat, label })}
                  />
                </div>
              ))}
            </div>
          ) : null}
          {children}
        </OverlayBody>
        {footer ? <OverlayFooter>{footer}</OverlayFooter> : null}
      </SheetDrawer>

      <Suspense fallback={null}>
        <NestedReferenceDrawers
          references={references}
          backdropClassName={backdropClassName}
          stacked
        />
      </Suspense>
    </>
  );
}

export default CodexDivinityDrawer;
