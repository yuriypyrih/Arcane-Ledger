import type { ReactNode } from "react";
import type { BackgroundEntry, ClassEntry, SubclassEntry } from "../../../codex/entries";
import { getSubclassEntriesForClass } from "../../../codex/subclasses";
import { formatCodexLabel, formatCodexList } from "../../../utils/codex";
import {
  renderCodexRichText,
  type RenderCodexRichTextOptions
} from "../../../utils/codex/renderCodexRichText";
import {
  formatStarterPackStartingEquipmentSummary,
  getLevelOneWeaponMasteryCountForClass
} from "../../../codex/classes/starterPack";
import {
  formatBackgroundAbilityScoreOptions,
  formatBackgroundEquipmentOptions,
  formatBackgroundOriginFeat,
  formatBackgroundProficiencies
} from "../backgroundPresentation";
import {
  getClassProficiencyProfile,
  getEquipmentProficiencyLabelsForClass,
  getPrimaryAbilityForClass,
  getSavingThrowAbilityKeysForClass
} from "../../../pages/CharactersPage/proficiencyClassData";
import { getToolProficiencyLabel } from "../../../pages/CharactersPage/proficiencyOptions";
import ClassProgressionTable from "../ClassProgressionTable";
import styles from "./EntryOverviewContent.module.css";

type ClassEntryOverviewProps = {
  entry: ClassEntry;
  subclassEntries?: SubclassEntry[];
} & RenderCodexRichTextOptions;

type BackgroundEntryOverviewProps = {
  entry: BackgroundEntry;
} & RenderCodexRichTextOptions;

type DetailItemProps = {
  label: string;
  children: ReactNode;
  fullWidth?: boolean;
};

function formatSelectableProficiencyList(values: string[], count: number): string {
  if (values.length === 0 || count <= 0) {
    return "None";
  }

  return `Choose ${count}: ${values.join(", ")}`;
}

function formatClassToolProficiencyList(className: string): string {
  const profile = getClassProficiencyProfile(className);
  const grantedTools = (profile?.grantedToolProficiencies ?? []).map((entry) =>
    getToolProficiencyLabel(entry)
  );
  const selectableTools = (profile?.toolProficiencyChoices ?? []).map((entry) =>
    getToolProficiencyLabel(entry)
  );
  const selectableCount = profile?.toolProficiencyChoiceCount ?? 0;
  const parts = [
    ...grantedTools,
    selectableTools.length > 0 && selectableCount > 0
      ? `Choose ${selectableCount}: ${selectableTools.join(", ")}`
      : null
  ].filter((value): value is string => value !== null);

  return parts.length > 0 ? parts.join(" | ") : "None";
}

function createBackgroundOriginFeatReference(background: BackgroundEntry): string {
  return `<feat:${background.originFeat}>${formatBackgroundOriginFeat(background)}</feat>`;
}

function DetailItem({ label, children, fullWidth = false }: DetailItemProps) {
  return (
    <div className={`${styles.detailItem} ${fullWidth ? styles.detailItemFullWidth : ""}`.trim()}>
      <span>{label}</span>
      <strong>{children}</strong>
    </div>
  );
}

function renderRichValue(value: string, options: RenderCodexRichTextOptions): ReactNode {
  return renderCodexRichText(value, options);
}

export function ClassEntryOverviewItems({
  entry,
  subclassEntries,
  ...richTextOptions
}: ClassEntryOverviewProps) {
  const classPrimaryAbility = getPrimaryAbilityForClass(entry.name);
  const classStarterPack = entry.starterPack ?? null;
  const classSavingThrows = getSavingThrowAbilityKeysForClass(entry.name);
  const classProfile = getClassProficiencyProfile(entry.name);
  const classEquipmentLabels = getEquipmentProficiencyLabelsForClass(entry.name);
  const resolvedSubclassEntries = subclassEntries ?? getSubclassEntriesForClass(entry.name);
  const classStartingEquipment = classStarterPack
    ? formatStarterPackStartingEquipmentSummary(classStarterPack.startingEquipment)
    : "None";
  const classWeaponMasteryCount =
    classStarterPack?.weaponMasteryCount ?? getLevelOneWeaponMasteryCountForClass(entry.name);

  return (
    <>
      <DetailItem label="Primary Ability">
        {renderRichValue(
          classStarterPack?.primaryAbilityLabel ??
            (classPrimaryAbility ? formatCodexLabel(classPrimaryAbility) : "None"),
          richTextOptions
        )}
      </DetailItem>
      <DetailItem label="Hit Point Die">
        {renderRichValue(
          classStarterPack?.hitPointDieLabel ?? formatCodexLabel(entry.hitPointDie),
          richTextOptions
        )}
      </DetailItem>
      <DetailItem label="Saving Throws">
        {renderRichValue(
          classSavingThrows.length > 0 ? formatCodexList(classSavingThrows) : "None",
          richTextOptions
        )}
      </DetailItem>
      <DetailItem label="Weapon Proficiencies">
        {renderRichValue(
          classEquipmentLabels.weapons.length > 0
            ? classEquipmentLabels.weapons.join(", ")
            : "None",
          richTextOptions
        )}
      </DetailItem>
      <DetailItem label="Weapon Masteries">
        {renderRichValue(
          classWeaponMasteryCount > 0 ? String(classWeaponMasteryCount) : "None",
          richTextOptions
        )}
      </DetailItem>
      <DetailItem label="Armor Training">
        {renderRichValue(
          classEquipmentLabels.armor.length > 0 ? classEquipmentLabels.armor.join(", ") : "None",
          richTextOptions
        )}
      </DetailItem>
      <DetailItem label="Possible Skill Proficiencies">
        {renderRichValue(
          formatSelectableProficiencyList(
            classProfile?.skillProficiencyOptions ?? [],
            classProfile?.skillProficiencyCount ?? 0
          ),
          richTextOptions
        )}
      </DetailItem>
      <DetailItem label="Tool Proficiencies">
        {renderRichValue(formatClassToolProficiencyList(entry.name), richTextOptions)}
      </DetailItem>
      <DetailItem label="Starting Equipment">
        {renderRichValue(classStartingEquipment, richTextOptions)}
      </DetailItem>
      {entry.features.length > 0 ? (
        <div className={`${styles.detailItem} ${styles.detailItemFullWidth}`.trim()}>
          <span>Level Progression</span>
          <ClassProgressionTable
            featureRows={entry.features}
            subclassEntries={resolvedSubclassEntries}
          />
        </div>
      ) : null}
    </>
  );
}

export function ClassEntryOverview(props: ClassEntryOverviewProps) {
  return (
    <div className={styles.detailsGrid}>
      <ClassEntryOverviewItems {...props} />
    </div>
  );
}

export function BackgroundEntryOverviewItems({
  entry,
  ...richTextOptions
}: BackgroundEntryOverviewProps) {
  return (
    <>
      <DetailItem label="Ability Scores">
        {renderRichValue(formatBackgroundAbilityScoreOptions(entry), richTextOptions)}
      </DetailItem>
      <DetailItem label="Feat">
        {renderRichValue(createBackgroundOriginFeatReference(entry), richTextOptions)}
      </DetailItem>
      <DetailItem label="Skill + Tool Proficiencies">
        {renderRichValue(formatBackgroundProficiencies(entry), richTextOptions)}
      </DetailItem>
      <DetailItem label="Equipment" fullWidth>
        {renderRichValue(formatBackgroundEquipmentOptions(entry), richTextOptions)}
      </DetailItem>
    </>
  );
}

export function BackgroundEntryOverview(props: BackgroundEntryOverviewProps) {
  return (
    <div className={styles.detailsGrid}>
      <BackgroundEntryOverviewItems {...props} />
    </div>
  );
}
