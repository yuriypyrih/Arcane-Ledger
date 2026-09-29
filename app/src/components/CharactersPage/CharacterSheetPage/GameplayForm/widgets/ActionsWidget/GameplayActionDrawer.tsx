import { useNestedReferences } from "../../../../../CodexPage/useNestedReferences";
import { NestedReferenceDrawers } from "../../../../../CodexPage/NestedReferenceDrawers";
import { type ReactNode } from "react";
import type { SpellDescriptionEntry } from "../../../../../../codex/entries";
import DescriptionContent from "../../../../../DescriptionContent/DescriptionContent";

import {
  OverlayBody,
  OverlayCloseButton,
  OverlayEyebrow,
  OverlayHeader,
  OverlayHeaderContent,
  OverlayTitle,
  OverlayTitleRow,
  SheetDrawer,
  overlayClassNames
} from "../../../../../Overlay";
import type {
  FeatureActionFact,
  FeatureActionHeaderTag
} from "../../../../../../pages/CharactersPage/classFeatures";
import { orderDescriptionAdditionSections } from "../../../../../../pages/CharactersPage/actionModalDescriptions";

import FeatureActionFacts from "./FeatureActionFacts";
import FeatureActionHeaderTags from "./FeatureActionHeaderTags";
import styles from "./GameplayActionDrawer.module.css";

type GameplayActionDrawerProps = {
  title: string;
  eyebrow?: string;
  badges?: string[];
  titleAccessory?: ReactNode;
  headerAside?: ReactNode;
  description: SpellDescriptionEntry[];
  descriptionAdditions?: SpellDescriptionEntry[][];
  facts?: FeatureActionFact[];
  factsSectionTitle?: string | null;
  headerTags?: FeatureActionHeaderTag[];
  detailsContent?: ReactNode;
  warning?: string | null;
  blockedReason?: string | null;
  footer?: ReactNode;
  children?: ReactNode;
  bodyClassName?: string;
  onClose: () => void;
  backdropClassName?: string;
  drawerClassName?: string;
};

function GameplayActionDrawer({
  title,
  eyebrow,
  badges = [],
  titleAccessory,
  headerAside,
  description,
  descriptionAdditions = [],
  facts = [],
  factsSectionTitle = "Details",
  headerTags = [],
  detailsContent = null,
  warning = null,
  blockedReason = null,
  footer,
  children,
  bodyClassName,
  onClose,
  backdropClassName,
  drawerClassName
}: GameplayActionDrawerProps) {
  const references = useNestedReferences();
  const {
    setSelectedSpellReference,
    setSelectedDivinityReference,
    setSelectedKeyword,
    setSelectedFeatReference
  } = references;

  const hasBaseDescription = description.length > 0;
  const descriptionSections = orderDescriptionAdditionSections(descriptionAdditions);
  const hasHeaderAside = headerTags.length > 0 || Boolean(headerAside) || badges.length > 0;

  return (
    <>
      <SheetDrawer
        titleId="gameplay-action-drawer-title"
        onClose={onClose}
        onEscape={() => {
          if (references.closeTopReference()) return;

          onClose();
        }}
        backdropClassName={backdropClassName}
        drawerClassName={[styles.drawerPanel, drawerClassName ?? ""].join(" ").trim()}
      >
        <div className={styles.shell}>
          <OverlayHeader
            className={[styles.header, hasHeaderAside ? styles.headerWithAside : ""].join(" ")}
          >
            <OverlayHeaderContent className={styles.headerContent}>
              {eyebrow ? <OverlayEyebrow>{eyebrow}</OverlayEyebrow> : null}
              <OverlayTitleRow>
                <OverlayTitle id="gameplay-action-drawer-title">{title}</OverlayTitle>
                {titleAccessory}
              </OverlayTitleRow>
            </OverlayHeaderContent>
            {hasHeaderAside ? (
              <div className={styles.headerAside}>
                {headerTags.length > 0 ? (
                  <div className={styles.resourceBadgeRow}>
                    <FeatureActionHeaderTags tags={headerTags} tagKeyPrefix={title} />
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
              </div>
            ) : null}
            <OverlayCloseButton
              className={styles.closeButton}
              label={`Close ${title}`}
              onClick={onClose}
            />
          </OverlayHeader>

          <OverlayBody className={[styles.body, bodyClassName ?? ""].join(" ").trim()}>
            {hasBaseDescription || descriptionSections.length > 0 ? (
              <div className={styles.descriptionStack}>
                {hasBaseDescription ? (
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
                {descriptionSections.map((section, index) => (
                  <div
                    key={`${title}-description-section-${index}`}
                    className={styles.descriptionSection}
                  >
                    {hasBaseDescription || index > 0 ? (
                      <hr className={styles.descriptionDivider} aria-hidden="true" />
                    ) : null}
                    <DescriptionContent
                      description={section}
                      className={`${overlayClassNames.descriptionList} ${overlayClassNames.descriptionSection}`}
                      entryClassName={overlayClassNames.descriptionLine}
                      strongClassName={overlayClassNames.descriptionStrong}
                      linkClassName={styles.inlineLinkButton}
                      onOpenKeyword={setSelectedKeyword}
                      onOpenSpell={setSelectedSpellReference}
                      onOpenDivinity={setSelectedDivinityReference}
                      onOpenFeat={(feat, label) => setSelectedFeatReference({ feat, label })}
                    />
                  </div>
                ))}
              </div>
            ) : null}

            {detailsContent}

            <FeatureActionFacts title={title} facts={facts} sectionTitle={factsSectionTitle} />

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

      <NestedReferenceDrawers references={references} backdropClassName={backdropClassName} />
    </>
  );
}

export default GameplayActionDrawer;
