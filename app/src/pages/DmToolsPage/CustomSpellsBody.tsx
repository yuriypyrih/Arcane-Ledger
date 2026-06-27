import { PenLine, Plus, Sparkles, Trash2 } from "lucide-react";
import { lazy, Suspense, type ReactNode, useEffect, useId, useRef, useState } from "react";
import {
  deleteCustomSpell,
  listCustomSpells,
  type CustomSpellListScope,
  type CustomSpellRecord
} from "../../api/customSpells";
import ActionButton from "../../components/ActionButton";
import { DestructiveConfirmationModal } from "../../components/Overlay";
import {
  removeCustomSpellRecord,
  setCustomSpells,
  setCustomSpellsError,
  setCustomSpellsLoading,
  showToast,
  upsertCustomSpellRecord,
  useAppDispatch,
  useAppSelector
} from "../../store";
import { formatCodexLabel, formatSpellLevelLabel } from "../../utils/codex/formatCodexLabel";
import CustomSpellEditorModal from "./CustomSpellEditorModal";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import { getDmToolsQuotaForRole } from "./dmToolsQuotas";
import DmToolsEmptyState from "./DmToolsEmptyState";
import DmToolsListCard from "./DmToolsListCard";
import styles from "./DmToolsPage.module.css";

const CodexSpellDrawer = lazy(
  () => import("../../components/CodexPage/CodexSpellDrawer/CodexSpellDrawer")
);

type CustomSpellsBodyProps = {
  panelId: string;
  tabId: string;
};

function getDeleteCustomSpellMessage(customSpell: CustomSpellRecord): ReactNode {
  return (
    <>
      Delete <strong>{customSpell.spell.name}</strong>. Characters that already baked this spell
      into their sheet keep their saved snapshot.
    </>
  );
}

function getCustomSpellMeta(customSpell: CustomSpellRecord) {
  const spell = customSpell.spell;
  const lists = spell.spellLists.map(formatCodexLabel).join(", ");

  return `${formatSpellLevelLabel(spell.spellLevel)} ${formatCodexLabel(spell.magicSchool)} • ${
    lists || "No lists"
  }`;
}

function CustomSpellsBody({ panelId, tabId }: CustomSpellsBodyProps) {
  const deleteTitleId = useId();
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((state) => state.auth.status);
  const authUserId = useAppSelector((state) => state.auth.user?.id ?? null);
  const authUserNickname = useAppSelector((state) => state.auth.user?.nickname ?? null);
  const authUserRole = useAppSelector((state) => state.auth.user?.role ?? null);
  const customSpells = useAppSelector((state) => state.dmTools.customSpells);
  const customSpellsStatus = useAppSelector((state) => state.dmTools.customSpellsStatus);
  const customSpellsError = useAppSelector((state) => state.dmTools.customSpellsError);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCustomSpell, setEditingCustomSpell] = useState<CustomSpellRecord | null>(null);
  const [pendingDeleteCustomSpell, setPendingDeleteCustomSpell] =
    useState<CustomSpellRecord | null>(null);
  const [previewCustomSpell, setPreviewCustomSpell] = useState<CustomSpellRecord | null>(null);
  const [customSpellScope, setCustomSpellScope] = useState<CustomSpellListScope>("mine");
  const [isDeletingCustomSpell, setIsDeletingCustomSpell] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const loadedCustomSpellsForAuthRef = useRef<string | null>(null);
  const isAuthenticated = authStatus === "authenticated";
  const customSpellLimit = getDmToolsQuotaForRole("customSpells", authUserRole);
  const isAtCustomSpellLimit =
    isAuthenticated && customSpellScope === "mine" && customSpells.length >= customSpellLimit;

  useEffect(() => {
    let didCancel = false;
    const loadKey = isAuthenticated && authUserId ? `${authUserId}:${customSpellScope}` : null;

    if (!loadKey) {
      loadedCustomSpellsForAuthRef.current = null;
      return () => {
        didCancel = true;
      };
    }

    if (loadedCustomSpellsForAuthRef.current === loadKey) {
      return () => {
        didCancel = true;
      };
    }

    loadedCustomSpellsForAuthRef.current = loadKey;
    dispatch(setCustomSpellsLoading());

    void listCustomSpells({ scope: customSpellScope, suppressFailureToast: true })
      .then(({ customSpells: nextCustomSpells }) => {
        if (!didCancel) {
          dispatch(setCustomSpells(nextCustomSpells));
        }
      })
      .catch((error) => {
        if (!didCancel) {
          dispatch(
            setCustomSpellsError(
              getDmToolsApiErrorMessage(error, "Unable to load custom spells.")
            )
          );
          loadedCustomSpellsForAuthRef.current = null;
        }
      });

    return () => {
      didCancel = true;
    };
  }, [authUserId, customSpellScope, dispatch, isAuthenticated]);

  function handleCreateClick() {
    if (!isAuthenticated) {
      dispatch(
        showToast({
          text: "Sign in to create custom spells.",
          type: "warning"
        })
      );
      return;
    }

    if (isAtCustomSpellLimit) {
      dispatch(
        showToast({
          text: `You can create up to ${customSpellLimit} custom spells.`,
          type: "warning"
        })
      );
      return;
    }

    setEditingCustomSpell(null);
    setIsEditorOpen(true);
  }

  async function handleConfirmDeleteCustomSpell() {
    if (!pendingDeleteCustomSpell || isDeletingCustomSpell) {
      return;
    }

    setActionError(null);
    setIsDeletingCustomSpell(true);

    try {
      const { customSpellId } = await deleteCustomSpell(pendingDeleteCustomSpell.id, {
        suppressFailureToast: true
      });

      dispatch(removeCustomSpellRecord(customSpellId));
      dispatch(
        showToast({
          text: "Custom spell deleted.",
          type: "success"
        })
      );
      setPendingDeleteCustomSpell(null);
    } catch (deleteError) {
      setActionError(getDmToolsApiErrorMessage(deleteError, "Unable to delete custom spell."));
    } finally {
      setIsDeletingCustomSpell(false);
    }
  }

  function renderCustomSpellScopeToggle() {
    const nextScope = customSpellScope === "public" ? "mine" : "public";

    return (
      <button
        type="button"
        className={styles.segmentedToggle}
        aria-label={`Show ${nextScope === "public" ? "public" : "my"} custom spells`}
        onClick={() => {
          loadedCustomSpellsForAuthRef.current = null;
          setCustomSpellScope(nextScope);
        }}
      >
        <span
          className={[
            styles.segmentedToggleSegment,
            customSpellScope === "mine" ? styles.segmentedToggleSegmentActive : ""
          ]
            .filter(Boolean)
            .join(" ")}
        >
          Mine
        </span>
        <span
          className={[
            styles.segmentedToggleSegment,
            customSpellScope === "public" ? styles.segmentedToggleSegmentActive : ""
          ]
            .filter(Boolean)
            .join(" ")}
        >
          Public
        </span>
      </button>
    );
  }

  return (
    <section
      className={styles.toolBody}
      id={panelId}
      role="tabpanel"
      aria-labelledby={tabId}
      tabIndex={0}
    >
      <div className={styles.bodyHeader}>
        <div>
          <h3 className={styles.bodyTitle}>Custom Spells</h3>
        </div>
        <div className={styles.headerActions}>
          {isAuthenticated ? (
            <span className={styles.memberCount}>
              {customSpellScope === "public"
                ? `${customSpells.length} public`
                : `${customSpells.length}/${customSpellLimit} spells`}
            </span>
          ) : null}
          {isAuthenticated ? renderCustomSpellScopeToggle() : null}
          <ActionButton
            icon={<Plus size={16} aria-hidden="true" />}
            disabled={isAtCustomSpellLimit}
            fullWidth={false}
            title={
              isAtCustomSpellLimit
                ? `You can create up to ${customSpellLimit} custom spells.`
                : undefined
            }
            onClick={handleCreateClick}
          >
            Add Spell
          </ActionButton>
        </div>
      </div>

      {actionError ? <p className={styles.modalError}>{actionError}</p> : null}

      {customSpellsStatus === "loading" ? (
        <DmToolsEmptyState icon={<Sparkles size={18} aria-hidden="true" />}>
          Loading custom spells...
        </DmToolsEmptyState>
      ) : customSpellsError ? (
        <p className={styles.modalError}>{customSpellsError}</p>
      ) : !isAuthenticated ? (
        <DmToolsEmptyState icon={<Sparkles size={18} aria-hidden="true" />}>
          Sign in to manage custom spells.
        </DmToolsEmptyState>
      ) : customSpells.length > 0 ? (
        <div className={styles.dmToolsList}>
          {customSpells.map((customSpell) => {
            const canManageCustomSpell = customSpell.ownerId === authUserId;
            const actionMeta =
              customSpell.public || customSpellScope === "public" ? (
                <>
                  {customSpell.public ? (
                    <span className={styles.dmToolsListCardPublicPill}>Public</span>
                  ) : null}
                  {customSpellScope === "public" ? (
                    <span>Owner: {customSpell.ownerNickname ?? "Unknown Player"}</span>
                  ) : null}
                </>
              ) : undefined;
            const actions = canManageCustomSpell
              ? [
                  {
                    disabled: isDeletingCustomSpell,
                    icon: <PenLine size={18} aria-hidden="true" />,
                    label: `Edit ${customSpell.spell.name}`,
                    onClick: () => {
                      setActionError(null);
                      setEditingCustomSpell(customSpell);
                      setIsEditorOpen(true);
                    }
                  },
                  {
                    disabled: isDeletingCustomSpell,
                    icon: <Trash2 size={18} aria-hidden="true" />,
                    label: `Delete ${customSpell.spell.name}`,
                    onClick: () => {
                      setActionError(null);
                      setPendingDeleteCustomSpell(customSpell);
                    }
                  }
                ]
              : [];

            return (
              <DmToolsListCard
                key={customSpell.id}
                actionMeta={actionMeta}
                icon={<Sparkles size={18} aria-hidden="true" />}
                title={customSpell.spell.name}
                meta={getCustomSpellMeta(customSpell)}
                tone="customSpell"
                ariaLabel={`Preview ${customSpell.spell.name}`}
                onClick={() => setPreviewCustomSpell(customSpell)}
                actions={actions}
              />
            );
          })}
        </div>
      ) : (
        <DmToolsEmptyState icon={<Sparkles size={18} aria-hidden="true" />}>
          {customSpellScope === "public" ? "No public custom spells yet." : "No custom spells yet."}
        </DmToolsEmptyState>
      )}

      {isEditorOpen ? (
        <CustomSpellEditorModal
          customSpell={editingCustomSpell}
          onClose={() => setIsEditorOpen(false)}
          onSaved={(savedCustomSpell) => {
            const savedCustomSpellWithOwner = {
              ...savedCustomSpell,
              ownerNickname:
                savedCustomSpell.ownerNickname ??
                (savedCustomSpell.ownerId === authUserId ? authUserNickname : null)
            };

            if (customSpellScope === "public" && !savedCustomSpellWithOwner.public) {
              dispatch(removeCustomSpellRecord(savedCustomSpellWithOwner.id));
            } else {
              dispatch(upsertCustomSpellRecord(savedCustomSpellWithOwner));
            }
            setIsEditorOpen(false);
            setEditingCustomSpell(null);
          }}
        />
      ) : null}

      {pendingDeleteCustomSpell ? (
        <DestructiveConfirmationModal
          titleId={deleteTitleId}
          title="Delete custom spell?"
          message={getDeleteCustomSpellMessage(pendingDeleteCustomSpell)}
          confirmLabel={isDeletingCustomSpell ? "Deleting..." : "Delete"}
          closeLabel="Close delete custom spell confirmation"
          onCancel={() => setPendingDeleteCustomSpell(null)}
          onConfirm={() => {
            void handleConfirmDeleteCustomSpell();
          }}
        />
      ) : null}

      {previewCustomSpell ? (
        <Suspense fallback={null}>
          <CodexSpellDrawer
            spell={previewCustomSpell.spell}
            customEffects={previewCustomSpell.customEffects}
            isCustomSpell
            onClose={() => setPreviewCustomSpell(null)}
          />
        </Suspense>
      ) : null}
    </section>
  );
}

export default CustomSpellsBody;
