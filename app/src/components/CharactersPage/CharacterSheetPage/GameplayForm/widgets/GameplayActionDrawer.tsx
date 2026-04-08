import { Brain, Flame, Hexagon, Music, PawPrint, Sparkles } from "lucide-react";
import { useState, type ReactNode } from "react";
import type {
  DivinityEntry,
  FEATS,
  SpellDescriptionEntry,
  SpellEntry
} from "../../../../../codex/entries";
import DescriptionContent from "../../../../DescriptionContent/DescriptionContent";
import CellContainer from "../../../../CellContainer/CellContainer";
import KeywordReferenceDrawer from "../../../../KeywordReferenceDrawer/KeywordReferenceDrawer";
import CodexDivinityDrawer from "../../../../CodexPage/CodexDivinityDrawer/CodexDivinityDrawer";
import CodexFeatDrawer from "../../../../CodexPage/CodexFeatDrawer/CodexFeatDrawer";
import CodexSpellDrawer from "../../../../CodexPage/CodexSpellDrawer/CodexSpellDrawer";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayEyebrow,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  OverlayTitleRow,
  SheetDrawer,
  overlayClassNames
} from "../../../../Overlay";
import type {
  FeatureActionFact,
  FeatureActionIcon,
  FeatureActionResource
} from "../../../../../pages/CharactersPage/classFeatures";
import type { ResolvedKeywordReference } from "../../../../../utils/codex/renderCodexRichText";
import animaIcon from "../../../../../assets/svg/anima.svg";
import pyromancyIcon from "../../../../../assets/svg/pyromancy.svg";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import styles from "./GameplayActionDrawer.module.css";

type GameplayActionDrawerProps = {
  title: string;
  eyebrow?: string;
  badges?: string[];
  headerAside?: ReactNode;
  description: SpellDescriptionEntry[];
  facts?: FeatureActionFact[];
  resources?: FeatureActionResource[];
  helperText?: string;
  warning?: string | null;
  blockedReason?: string | null;
  footer?: ReactNode;
  children?: ReactNode;
  onClose: () => void;
  backdropClassName?: string;
  drawerClassName?: string;
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

function getToneClassName(tone: FeatureActionFact["tone"], classes: Record<string, string>) {
  if (tone === "danger") {
    return classes.danger;
  }

  if (tone === "accent") {
    return classes.accent;
  }

  return "";
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
      <span
        className={[
          styles.resourceBadgeValue,
          getToneClassName(resource.tone, {
            danger: styles.resourceBadgeValueDanger,
            accent: styles.resourceBadgeValueAccent
          })
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span>{resource.value}</span>
        {renderUsesIcon(resource.icon)}
      </span>
    </span>
  );
}

function GameplayActionDrawer({
  title,
  eyebrow,
  badges = [],
  headerAside,
  description,
  facts = [],
  resources = [],
  helperText,
  warning = null,
  blockedReason = null,
  footer,
  children,
  onClose,
  backdropClassName,
  drawerClassName
}: GameplayActionDrawerProps) {
  const [selectedSpellReference, setSelectedSpellReference] = useState<SpellEntry | null>(null);
  const [selectedDivinityReference, setSelectedDivinityReference] = useState<DivinityEntry | null>(
    null
  );
  const [selectedKeyword, setSelectedKeyword] = useState<ResolvedKeywordReference | null>(null);
  const [selectedFeatReference, setSelectedFeatReference] = useState<{
    feat: FEATS;
    label: string;
  } | null>(null);

  return (
    <>
      <SheetDrawer
        titleId="gameplay-action-drawer-title"
        onClose={onClose}
        onEscape={() => {
          if (selectedFeatReference) {
            setSelectedFeatReference(null);
            return;
          }

          if (selectedKeyword) {
            setSelectedKeyword(null);
            return;
          }

          if (selectedDivinityReference) {
            setSelectedDivinityReference(null);
            return;
          }

          if (selectedSpellReference) {
            setSelectedSpellReference(null);
            return;
          }

          onClose();
        }}
        backdropClassName={backdropClassName}
        drawerClassName={[styles.drawerPanel, drawerClassName ?? ""].join(" ").trim()}
      >
        <div className={styles.shell}>
          <OverlayHeader className={styles.header}>
            <OverlayHeaderContent className={styles.headerContent}>
              {eyebrow ? <OverlayEyebrow>{eyebrow}</OverlayEyebrow> : null}
              <OverlayTitleRow>
                <OverlayTitle id="gameplay-action-drawer-title">{title}</OverlayTitle>
              </OverlayTitleRow>
              {helperText ? <OverlaySummary>{helperText}</OverlaySummary> : null}
            </OverlayHeaderContent>
            <div className={styles.headerAside}>
              {resources.length > 0 ? (
                <div className={styles.resourceBadgeRow}>
                  {resources.map((resource, index) =>
                    renderHeaderResource(resource, `${title}-resource-${index}`)
                  )}
                </div>
              ) : null}
              {headerAside}
              {badges.length > 0 ? (
                <div className={styles.badgeRow}>
                  {badges.map((badge) => (
                    <span key={`${title}-${badge}`} className={styles.badgePill}>
                      {badge}
                    </span>
                  ))}
                </div>
              ) : null}
              <OverlayCloseButton label={`Close ${title}`} onClick={onClose} />
            </div>
          </OverlayHeader>

          <OverlayBody className={styles.body}>
            {description.length > 0 ? (
              <DescriptionContent
                description={description}
                className={`${overlayClassNames.descriptionList} ${overlayClassNames.descriptionSection}`}
                entryClassName={overlayClassNames.descriptionLine}
                strongClassName={overlayClassNames.descriptionStrong}
                linkClassName={styles.inlineLinkButton}
                onOpenKeyword={setSelectedKeyword}
                onOpenSpell={setSelectedSpellReference}
                onOpenDivinity={setSelectedDivinityReference}
                onOpenFeat={(feat, label) => setSelectedFeatReference({ feat, label })}
              />
            ) : null}

            {facts.length > 0 ? (
              <section className={styles.section}>
                <h4 className={styles.sectionTitle}>Details</h4>
                <div className={styles.factGrid}>
                  {facts.map((fact, index) => (
                    <CellContainer
                      key={`${title}-fact-${index}`}
                      label={fact.label}
                      content={fact.value}
                      contentClassName={getToneClassName(fact.tone, {
                        danger: styles.factValueDanger,
                        accent: styles.factValueAccent
                      })}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {children}
          </OverlayBody>

          {warning || blockedReason || footer ? (
            <div className={styles.footer}>
              {warning || blockedReason ? (
                <div className={styles.warningBlock}>
                  {blockedReason ? <p className={styles.warningCard}>{blockedReason}</p> : null}
                  {warning ? <p className={styles.warningCard}>{warning}</p> : null}
                </div>
              ) : null}
              {footer}
            </div>
          ) : null}
        </div>
      </SheetDrawer>

      {selectedSpellReference ? (
        <CodexSpellDrawer
          spell={selectedSpellReference}
          onClose={() => setSelectedSpellReference(null)}
        />
      ) : null}
      {selectedDivinityReference ? (
        <CodexDivinityDrawer
          divinity={selectedDivinityReference}
          onClose={() => setSelectedDivinityReference(null)}
        />
      ) : null}
      {selectedKeyword ? (
        <KeywordReferenceDrawer
          title={selectedKeyword.title}
          entries={[
            {
              title: selectedKeyword.title,
              description: selectedKeyword.description
            }
          ]}
          badgeLabel="Keyword"
          onClose={() => setSelectedKeyword(null)}
        />
      ) : null}
      {selectedFeatReference ? (
        <CodexFeatDrawer
          feat={selectedFeatReference.feat}
          label={selectedFeatReference.label}
          onClose={() => setSelectedFeatReference(null)}
        />
      ) : null}
    </>
  );
}

export default GameplayActionDrawer;
