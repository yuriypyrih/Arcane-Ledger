import { Brain, Flame, Hexagon, Music, PawPrint, Sparkles } from "lucide-react";
import { lazy, Suspense, useState, type ReactNode } from "react";
import ActionShape, { getActionShapeForCastingTime } from "../../ActionShape";
import CellContainer from "../../CellContainer/CellContainer";
import SpellDescriptionContent from "../../SpellDescriptionContent";
import { FEATS, type DivinityEntry, type SpellEntry } from "../../../codex/entries";
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
import type {
  FeatureActionIcon,
  FeatureActionResource
} from "../../../pages/CharactersPage/classFeatures";
import type { ResolvedKeywordReference } from "../../../utils/codex/renderCodexRichText";
import type { Character } from "../../../types";
import {
  formatCodexLabel,
  formatDivinitySubtitle,
  formatDivinityValue,
  formatSpellCastingTime
} from "../../../utils/codex";
import animaIcon from "../../../assets/svg/anima.svg";
import pyromancyIcon from "../../../assets/svg/pyromancy.svg";
import sheetStyles from "../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import styles from "./CodexDivinityDrawer.module.css";

const CodexFeatDrawer = lazy(() => import("../CodexFeatDrawer/CodexFeatDrawer"));
const CodexSpellDrawer = lazy(() => import("../CodexSpellDrawer/CodexSpellDrawer"));
const KeywordReferenceDrawer = lazy(
  () => import("../../KeywordReferenceDrawer/KeywordReferenceDrawer")
);

type SelectedFeatReference = {
  feat: FEATS;
  label: string;
};

type CodexDivinityDrawerProps = {
  divinity: DivinityEntry;
  character?: Pick<Character, "className" | "level" | "abilities" | "feats"> &
    Partial<Pick<Character, "subclassId">>;
  resources?: FeatureActionResource[];
  children?: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  backdropClassName?: string;
};

function renderUsesIcon(icon?: FeatureActionIcon) {
  if (icon === "anima") {
    return <img src={animaIcon} alt="" className={styles.resourceAssetIcon} />;
  }

  if (icon === "brain") {
    return <Brain size={14} strokeWidth={2.1} />;
  }

  if (icon === "sparkles") {
    return <Sparkles size={14} strokeWidth={2.1} />;
  }

  if (icon === "music") {
    return <Music size={14} strokeWidth={2.1} />;
  }

  if (icon === "flame") {
    return <Flame size={14} strokeWidth={2.1} />;
  }

  if (icon === "paw") {
    return <PawPrint size={14} strokeWidth={2.1} />;
  }

  if (icon === "psi") {
    return <Hexagon size={14} strokeWidth={2.1} />;
  }

  if (icon === "pyromancy") {
    return <img src={pyromancyIcon} alt="" className={styles.resourceAssetIcon} />;
  }

  return null;
}

function renderHeaderResource(resource: FeatureActionResource, key: string) {
  if (resource.kind === "tracker" && resource.icon) {
    return (
      <span key={key} className={styles.resourceBadge}>
        <span className={styles.resourceBadgeLabel}>{resource.label}</span>
        <span className={styles.resourceBadgeValue}>
          <span>{resource.cost ?? resource.current}</span>
          {renderUsesIcon(resource.icon)}
          <span>out of</span>
          <span>{`${resource.current}/${resource.total}`}</span>
          {renderUsesIcon(resource.icon)}
        </span>
      </span>
    );
  }

  if (resource.kind === "tracker") {
    return (
      <span key={key} className={styles.resourceBadge}>
        Charges
        <span className={sheetStyles.shortRestDots}>
          {Array.from({ length: resource.total }, (_, dotIndex) => (
            <span
              key={`${key}-dot-${dotIndex}`}
              className={[
                sheetStyles.shortRestDot,
                dotIndex < resource.current ? sheetStyles.shortRestDotActive : ""
              ]
                .filter(Boolean)
                .join(" ")}
            />
          ))}
        </span>
        {resource.supplementary ? (
          <span className={styles.resourceBadgeSupplementary}>{resource.supplementary}</span>
        ) : null}
      </span>
    );
  }

  return (
    <span key={key} className={styles.resourceBadge}>
      <span className={styles.resourceBadgeLabel}>{resource.label}</span>
      <span className={styles.resourceBadgeValue}>
        <span>{resource.value}</span>
        {renderUsesIcon(resource.icon)}
      </span>
    </span>
  );
}

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
  backdropClassName
}: CodexDivinityDrawerProps) {
  const [selectedSpellReference, setSelectedSpellReference] = useState<SpellEntry | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<ResolvedKeywordReference | null>(null);
  const [selectedFeatReference, setSelectedFeatReference] = useState<SelectedFeatReference | null>(
    null
  );
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
        onEscape={() => {
          if (selectedFeatReference) {
            setSelectedFeatReference(null);
            return;
          }

          if (selectedKeyword) {
            setSelectedKeyword(null);
            return;
          }

          if (selectedSpellReference) {
            setSelectedSpellReference(null);
            return;
          }

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
                {resources.map((resource, index) =>
                  renderHeaderResource(resource, `${divinity.id}-resource-${index}`)
                )}
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
        {selectedSpellReference ? (
          <CodexSpellDrawer
            spell={selectedSpellReference}
            backdropClassName={backdropClassName}
            onClose={() => setSelectedSpellReference(null)}
          />
        ) : null}
        {selectedKeyword ? (
          <KeywordReferenceDrawer
            title={selectedKeyword.title}
            entries={[
              {
                title: selectedKeyword.title,
                description: selectedKeyword.description,
                trackingMessage: selectedKeyword.trackingMessage
              }
            ]}
            badgeLabel="Keyword"
            backdropClassName={backdropClassName}
            onClose={() => setSelectedKeyword(null)}
          />
        ) : null}
        {selectedFeatReference ? (
          <CodexFeatDrawer
            feat={selectedFeatReference.feat}
            label={selectedFeatReference.label}
            backdropClassName={backdropClassName}
            onClose={() => setSelectedFeatReference(null)}
          />
        ) : null}
      </Suspense>
    </>
  );
}

export default CodexDivinityDrawer;
