import clsx from "clsx";
import { Check, Plus } from "lucide-react";
import { useId } from "react";
import { MONSTER_SOURCE_OPTIONS } from "../../../../constants/monsters";
import MonsterCodexTable from "../../../CodexPage/MonsterCodexTable";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  SheetModal
} from "../../../Overlay";
import SearchField from "../../../SearchField";
import SelectInput from "../../FormInputs/SelectInput";
import type { CodexStatus, MonsterListItem, MonsterOrdering } from "../../../../types";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import { companionMonsterTypeOptions } from "./companionUtils";
import styles from "./CompanionsSection.module.css";

type MonsterBrowserModalProps = {
  monsters: MonsterListItem[];
  totalEntries: number;
  status: CodexStatus;
  currentPage: number;
  totalPages: number;
  query: string;
  searchResetSignal?: unknown;
  selectedMonsterSlug: string | null;
  monsterTypeFilter: string;
  monsterSourceFilter: string;
  monsterTypeOptions?: string[];
  ordering: MonsterOrdering;
  pendingSelectSlug: string | null;
  summary?: string;
  title?: string;
  onClose: () => void;
  onQueryChange: (value: string) => void;
  onMonsterTypeFilterChange: (value: string) => void;
  onMonsterSourceFilterChange: (value: string) => void;
  onOrderingChange: (value: MonsterOrdering) => void;
  onPageChange: (page: number) => void;
  onOpenMonsterPreview: (monster: MonsterListItem) => void;
  onSelectMonster: (monster: MonsterListItem) => Promise<void>;
};

function MonsterBrowserModal({
  monsters,
  totalEntries,
  status,
  currentPage,
  totalPages,
  query,
  searchResetSignal,
  selectedMonsterSlug,
  monsterTypeFilter,
  monsterSourceFilter,
  monsterTypeOptions = companionMonsterTypeOptions,
  ordering,
  pendingSelectSlug,
  summary = "Choose a stat block to inherit for this companion.",
  title = "Browse monsters",
  onClose,
  onQueryChange,
  onMonsterTypeFilterChange,
  onMonsterSourceFilterChange,
  onOrderingChange,
  onPageChange,
  onOpenMonsterPreview,
  onSelectMonster
}: MonsterBrowserModalProps) {
  const titleId = useId();

  return (
    <SheetModal
      titleId={titleId}
      onClose={onClose}
      size="large"
      panelClassName={styles.browserModal}
      backdropClassName={styles.browserBackdrop}
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitle id={titleId}>{title}</OverlayTitle>
          <OverlaySummary>{summary}</OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close monster browser" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.browserBody}>
        <div className={styles.browserControls}>
          <label className={shared.fieldWide}>
            <span className={shared.fieldLabel}>Search Monsters</span>
            <SearchField
              value={query}
              resetSignal={searchResetSignal}
              onValueChange={onQueryChange}
              placeholder="Search by monster name"
            />
          </label>

          <label className={shared.field}>
            <span className={shared.fieldLabel}>Filter Type</span>
            <SelectInput
              value={monsterTypeFilter}
              onChange={(event) => onMonsterTypeFilterChange(event.target.value)}
            >
              <option value="all">All monster types</option>
              {monsterTypeOptions.map((typeOption) => (
                <option key={typeOption} value={typeOption}>
                  {typeOption}
                </option>
              ))}
            </SelectInput>
          </label>

          <label className={shared.field}>
            <span className={shared.fieldLabel}>Filter Source</span>
            <SelectInput
              value={monsterSourceFilter}
              onChange={(event) => onMonsterSourceFilterChange(event.target.value)}
            >
              <option value="all">All sources</option>
              {MONSTER_SOURCE_OPTIONS.map((sourceOption) => (
                <option key={sourceOption} value={sourceOption}>
                  {sourceOption}
                </option>
              ))}
            </SelectInput>
          </label>
        </div>

        <MonsterCodexTable
          monsters={monsters}
          totalEntries={totalEntries}
          status={status}
          currentPage={currentPage}
          totalPages={totalPages}
          ordering={ordering}
          onPageChange={onPageChange}
          onOrderingChange={onOrderingChange}
          onMonsterClick={onOpenMonsterPreview}
          getRowTone={(monster) =>
            selectedMonsterSlug && monster.slug === selectedMonsterSlug ? "valid" : null
          }
          renderNamePrefix={(monster) => {
            const isSelected = monster.slug === selectedMonsterSlug;
            const isPending = pendingSelectSlug === monster.slug;

            return (
              <button
                type="button"
                className={clsx(
                  styles.selectMonsterButton,
                  isSelected && styles.selectMonsterButtonSelected
                )}
                onClick={(event) => {
                  event.stopPropagation();
                  void onSelectMonster(monster);
                }}
                disabled={isPending}
                aria-label={
                  isSelected
                    ? `${monster.name} already selected`
                    : `Use ${monster.name} as monster template`
                }
                title={isSelected ? "Selected monster" : "Use this monster"}
              >
                {isSelected ? <Check size={14} /> : <Plus size={14} />}
              </button>
            );
          }}
          className={styles.monsterTable}
          tableWrapperClassName={styles.monsterTableWrapper}
        />
      </OverlayBody>
    </SheetModal>
  );
}

export default MonsterBrowserModal;
