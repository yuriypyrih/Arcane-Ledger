import { PawPrint, PenLine, Plus, Trash2 } from "lucide-react";
import { type ReactNode, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  deleteCustomBestiary,
  listCustomBestiary,
  type CustomBestiaryListScope,
  type CustomBestiaryRecord
} from "../../api/customBestiary";
import ActionButton from "../../components/ActionButton";
import MonsterEntryDrawer from "../../components/MonsterEntryRenderer/MonsterEntryDrawer";
import { formatMonsterTitleMeta } from "../../components/MonsterEntryRenderer/monsterEntryFormatting";
import { DestructiveConfirmationModal } from "../../components/Overlay";
import {
  removeCustomBestiaryRecord,
  setCustomBestiary,
  setCustomBestiaryError,
  setCustomBestiaryLoading,
  showToast,
  upsertCustomBestiaryRecord,
  useAppDispatch,
  useAppSelector
} from "../../store";
import CustomBestiaryEditorModal from "./CustomBestiaryEditorModal";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import {
  clampDmToolsPage,
  getDmToolsPageItems
} from "./dmToolsPagination";
import { getDmToolsQuotaForRole } from "./dmToolsQuotas";
import DmToolsEmptyState from "./DmToolsEmptyState";
import DmToolsListCard from "./DmToolsListCard";
import DmToolsPaginationControls from "./DmToolsPaginationControls";
import styles from "./DmToolsPage.module.css";

type CustomBestiaryBodyProps = {
  panelId: string;
  tabId: string;
};

function getDeleteCustomBestiaryMessage(customCreature: CustomBestiaryRecord): ReactNode {
  return (
    <>
      Delete <strong>{customCreature.monster.name || "this custom creature"}</strong>. Encounters
      and companions that already use this stat block keep their saved snapshot.
    </>
  );
}

function getCustomCreatureMeta(customCreature: CustomBestiaryRecord) {
  return formatMonsterTitleMeta(customCreature.monster) || "Custom creature";
}

function CustomBestiaryBody({ panelId, tabId }: CustomBestiaryBodyProps) {
  const deleteTitleId = useId();
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((state) => state.auth.status);
  const authUserId = useAppSelector((state) => state.auth.user?.id ?? null);
  const authUserNickname = useAppSelector((state) => state.auth.user?.nickname ?? null);
  const authUserRole = useAppSelector((state) => state.auth.user?.role ?? null);
  const customBestiary = useAppSelector((state) => state.dmTools.customBestiary);
  const customBestiaryStatus = useAppSelector((state) => state.dmTools.customBestiaryStatus);
  const customBestiaryError = useAppSelector((state) => state.dmTools.customBestiaryError);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCustomCreature, setEditingCustomCreature] =
    useState<CustomBestiaryRecord | null>(null);
  const [pendingDeleteCustomCreature, setPendingDeleteCustomCreature] =
    useState<CustomBestiaryRecord | null>(null);
  const [previewCustomCreature, setPreviewCustomCreature] =
    useState<CustomBestiaryRecord | null>(null);
  const [customBestiaryScope, setCustomBestiaryScope] =
    useState<CustomBestiaryListScope>("mine");
  const [customBestiaryPage, setCustomBestiaryPage] = useState(1);
  const [isDeletingCustomCreature, setIsDeletingCustomCreature] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const loadedCustomBestiaryForAuthRef = useRef<string | null>(null);
  const isAuthenticated = authStatus === "authenticated";
  const customBestiaryLimit = getDmToolsQuotaForRole("customBestiary", authUserRole);
  const isAtCustomBestiaryLimit =
    isAuthenticated &&
    customBestiaryScope === "mine" &&
    customBestiary.length >= customBestiaryLimit;
  const paginatedCustomBestiary = useMemo(
    () => getDmToolsPageItems(customBestiary, customBestiaryPage),
    [customBestiary, customBestiaryPage]
  );

  useEffect(() => {
    setCustomBestiaryPage((currentPage) =>
      clampDmToolsPage(currentPage, customBestiary.length)
    );
  }, [customBestiary.length]);

  useEffect(() => {
    let didCancel = false;
    const loadKey =
      isAuthenticated && authUserId ? `${authUserId}:${customBestiaryScope}` : null;

    if (!loadKey) {
      loadedCustomBestiaryForAuthRef.current = null;
      return () => {
        didCancel = true;
      };
    }

    if (loadedCustomBestiaryForAuthRef.current === loadKey) {
      return () => {
        didCancel = true;
      };
    }

    loadedCustomBestiaryForAuthRef.current = loadKey;
    dispatch(setCustomBestiaryLoading());

    void listCustomBestiary({ scope: customBestiaryScope, suppressFailureToast: true })
      .then(({ customBestiary: nextCustomBestiary }) => {
        if (!didCancel) {
          dispatch(setCustomBestiary(nextCustomBestiary));
        }
      })
      .catch((error) => {
        if (!didCancel) {
          dispatch(
            setCustomBestiaryError(
              getDmToolsApiErrorMessage(error, "Unable to load custom creatures.")
            )
          );
          loadedCustomBestiaryForAuthRef.current = null;
        }
      });

    return () => {
      didCancel = true;
    };
  }, [authUserId, customBestiaryScope, dispatch, isAuthenticated]);

  function handleCreateClick() {
    if (!isAuthenticated) {
      dispatch(
        showToast({
          text: "Sign in to create custom creatures.",
          type: "warning"
        })
      );
      return;
    }

    if (isAtCustomBestiaryLimit) {
      dispatch(
        showToast({
          text: `You can create up to ${customBestiaryLimit} custom creatures.`,
          type: "warning"
        })
      );
      return;
    }

    setEditingCustomCreature(null);
    setIsEditorOpen(true);
  }

  async function handleConfirmDeleteCustomCreature() {
    if (!pendingDeleteCustomCreature || isDeletingCustomCreature) {
      return;
    }

    setActionError(null);
    setIsDeletingCustomCreature(true);

    try {
      const { customBestiaryId } = await deleteCustomBestiary(pendingDeleteCustomCreature.id, {
        suppressFailureToast: true
      });

      dispatch(removeCustomBestiaryRecord(customBestiaryId));
      dispatch(
        showToast({
          text: "Custom creature deleted.",
          type: "success"
        })
      );
      setPendingDeleteCustomCreature(null);
    } catch (deleteError) {
      setActionError(
        getDmToolsApiErrorMessage(deleteError, "Unable to delete custom creature.")
      );
    } finally {
      setIsDeletingCustomCreature(false);
    }
  }

  function renderCustomBestiaryScopeToggle() {
    const nextScope = customBestiaryScope === "public" ? "mine" : "public";

    return (
      <button
        type="button"
        className={styles.segmentedToggle}
        aria-label={`Show ${nextScope === "public" ? "public" : "my"} custom creatures`}
        onClick={() => {
          loadedCustomBestiaryForAuthRef.current = null;
          setCustomBestiaryPage(1);
          setCustomBestiaryScope(nextScope);
        }}
      >
        <span
          className={[
            styles.segmentedToggleSegment,
            customBestiaryScope === "mine" ? styles.segmentedToggleSegmentActive : ""
          ]
            .filter(Boolean)
            .join(" ")}
        >
          Mine
        </span>
        <span
          className={[
            styles.segmentedToggleSegment,
            customBestiaryScope === "public" ? styles.segmentedToggleSegmentActive : ""
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
          <h3 className={styles.bodyTitle}>Custom Bestiary</h3>
        </div>
        <div className={styles.headerActions}>
          {isAuthenticated ? (
            <span className={styles.memberCount}>
              {customBestiaryScope === "public"
                ? `${customBestiary.length} public`
                : `${customBestiary.length}/${customBestiaryLimit} creatures`}
            </span>
          ) : null}
          {isAuthenticated ? renderCustomBestiaryScopeToggle() : null}
          <ActionButton
            icon={<Plus size={16} aria-hidden="true" />}
            disabled={isAtCustomBestiaryLimit}
            fullWidth={false}
            title={
              isAtCustomBestiaryLimit
                ? `You can create up to ${customBestiaryLimit} custom creatures.`
                : undefined
            }
            onClick={handleCreateClick}
          >
            Add Creature
          </ActionButton>
        </div>
      </div>

      {actionError ? <p className={styles.modalError}>{actionError}</p> : null}

      {customBestiaryStatus === "loading" ? (
        <DmToolsEmptyState icon={<PawPrint size={18} aria-hidden="true" />}>
          Loading custom creatures...
        </DmToolsEmptyState>
      ) : customBestiaryError ? (
        <p className={styles.modalError}>{customBestiaryError}</p>
      ) : !isAuthenticated ? (
        <DmToolsEmptyState icon={<PawPrint size={18} aria-hidden="true" />}>
          Sign in to manage custom creatures.
        </DmToolsEmptyState>
      ) : customBestiary.length > 0 ? (
        <>
          <div className={styles.dmToolsList}>
            {paginatedCustomBestiary.map((customCreature) => {
              const canManageCustomCreature = customCreature.ownerId === authUserId;
              const creatureName = customCreature.monster.name || "Custom Creature";
              const actionMeta =
                customCreature.public || customBestiaryScope === "public" ? (
                  <>
                    {customCreature.public ? (
                      <span className={styles.dmToolsListCardPublicPill}>Public</span>
                    ) : null}
                    {customBestiaryScope === "public" ? (
                      <span>Owner: {customCreature.ownerNickname ?? "Unknown Player"}</span>
                    ) : null}
                  </>
                ) : undefined;
              const actions = canManageCustomCreature
                ? [
                    {
                      disabled: isDeletingCustomCreature,
                      icon: <PenLine size={18} aria-hidden="true" />,
                      label: `Edit ${creatureName}`,
                      onClick: () => {
                        setActionError(null);
                        setEditingCustomCreature(customCreature);
                        setIsEditorOpen(true);
                      }
                    },
                    {
                      disabled: isDeletingCustomCreature,
                      icon: <Trash2 size={18} aria-hidden="true" />,
                      label: `Delete ${creatureName}`,
                      onClick: () => {
                        setActionError(null);
                        setPendingDeleteCustomCreature(customCreature);
                      }
                    }
                  ]
                : [];

              return (
                <DmToolsListCard
                  key={customCreature.id}
                  actionMeta={actionMeta}
                  icon={<PawPrint size={18} aria-hidden="true" />}
                  title={creatureName}
                  meta={getCustomCreatureMeta(customCreature)}
                  tone="customBestiary"
                  ariaLabel={`Preview ${creatureName}`}
                  onClick={() => setPreviewCustomCreature(customCreature)}
                  actions={actions}
                />
              );
            })}
          </div>
          <DmToolsPaginationControls
            currentPage={customBestiaryPage}
            itemLabel="custom creatures"
            totalItems={customBestiary.length}
            onPageChange={setCustomBestiaryPage}
          />
        </>
      ) : (
        <DmToolsEmptyState icon={<PawPrint size={18} aria-hidden="true" />}>
          {customBestiaryScope === "public"
            ? "No public custom creatures yet."
            : "No custom creatures yet."}
        </DmToolsEmptyState>
      )}

      {isEditorOpen ? (
        <CustomBestiaryEditorModal
          customCreature={editingCustomCreature}
          onClose={() => setIsEditorOpen(false)}
          onSaved={(savedCustomCreature) => {
            const savedCustomCreatureWithOwner = {
              ...savedCustomCreature,
              ownerNickname:
                savedCustomCreature.ownerNickname ??
                (savedCustomCreature.ownerId === authUserId ? authUserNickname : null)
            };

            if (customBestiaryScope === "public" && !savedCustomCreatureWithOwner.public) {
              dispatch(removeCustomBestiaryRecord(savedCustomCreatureWithOwner.id));
            } else {
              dispatch(upsertCustomBestiaryRecord(savedCustomCreatureWithOwner));
            }
            setIsEditorOpen(false);
            setEditingCustomCreature(null);
          }}
        />
      ) : null}

      {pendingDeleteCustomCreature ? (
        <DestructiveConfirmationModal
          titleId={deleteTitleId}
          title="Delete custom creature?"
          message={getDeleteCustomBestiaryMessage(pendingDeleteCustomCreature)}
          confirmLabel={isDeletingCustomCreature ? "Deleting..." : "Delete"}
          closeLabel="Close delete custom creature confirmation"
          onCancel={() => setPendingDeleteCustomCreature(null)}
          onConfirm={() => {
            void handleConfirmDeleteCustomCreature();
          }}
        />
      ) : null}

      {previewCustomCreature ? (
        <MonsterEntryDrawer
          monster={previewCustomCreature.monster}
          status="ready"
          badgeLabel="Custom Creature Preview"
          onClose={() => setPreviewCustomCreature(null)}
        />
      ) : null}
    </section>
  );
}

export default CustomBestiaryBody;
