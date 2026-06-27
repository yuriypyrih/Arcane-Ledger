import { Backpack, PenLine, Plus, Trash2 } from "lucide-react";
import {
  lazy,
  Suspense,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from "react";
import {
  deleteCustomItem,
  listCustomItems,
  type CustomItemListScope,
  type CustomItemRecord
} from "../../api/customItems";
import ActionButton from "../../components/ActionButton";
import { ItemInspectionHeader } from "../../components/ItemInspection";
import { DestructiveConfirmationModal } from "../../components/Overlay";
import sheetStyles from "../CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import { buildItemDetailPresentation } from "../ItemCodexEntryPage/itemPresentation";
import {
  removeCustomItemRecord,
  setCustomItems,
  setCustomItemsError,
  setCustomItemsLoading,
  showToast,
  upsertCustomItemRecord,
  useAppDispatch,
  useAppSelector
} from "../../store";
import CustomItemEditorModal from "./CustomItemEditorModal";
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

const EquipmentInventoryItemDrawer = lazy(
  () =>
    import(
      "../../components/CharactersPage/CharacterSheetPage/EquipmentForm/EquipmentInventoryItemDrawer"
    )
);

type CustomItemsBodyProps = {
  panelId: string;
  tabId: string;
};

function getDeleteCustomItemMessage(customItem: CustomItemRecord): ReactNode {
  return (
    <>
      Delete <strong>{customItem.item.name ?? "this custom item"}</strong>. Characters that
      already added this item keep their saved inventory snapshot.
    </>
  );
}

function getCustomItemMeta(customItem: CustomItemRecord) {
  const presentation = buildItemDetailPresentation(customItem.item);
  const flags = [
    customItem.item.is_magic_item ? "Magic" : null,
    customItem.item.requires_attunement ? "Attunement" : null
  ].filter(Boolean);

  return [presentation.categoryLabel, presentation.rarityLabel, ...flags].join(" • ");
}

function CustomItemsBody({ panelId, tabId }: CustomItemsBodyProps) {
  const deleteTitleId = useId();
  const previewTitleId = useId();
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((state) => state.auth.status);
  const authUserId = useAppSelector((state) => state.auth.user?.id ?? null);
  const authUserNickname = useAppSelector((state) => state.auth.user?.nickname ?? null);
  const authUserRole = useAppSelector((state) => state.auth.user?.role ?? null);
  const customItems = useAppSelector((state) => state.dmTools.customItems);
  const customItemsStatus = useAppSelector((state) => state.dmTools.customItemsStatus);
  const customItemsError = useAppSelector((state) => state.dmTools.customItemsError);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCustomItem, setEditingCustomItem] = useState<CustomItemRecord | null>(null);
  const [pendingDeleteCustomItem, setPendingDeleteCustomItem] =
    useState<CustomItemRecord | null>(null);
  const [previewCustomItem, setPreviewCustomItem] = useState<CustomItemRecord | null>(null);
  const [customItemScope, setCustomItemScope] = useState<CustomItemListScope>("mine");
  const [customItemPage, setCustomItemPage] = useState(1);
  const [isDeletingCustomItem, setIsDeletingCustomItem] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const loadedCustomItemsForAuthRef = useRef<string | null>(null);
  const isAuthenticated = authStatus === "authenticated";
  const customItemLimit = getDmToolsQuotaForRole("customItems", authUserRole);
  const isAtCustomItemLimit =
    isAuthenticated && customItemScope === "mine" && customItems.length >= customItemLimit;
  const paginatedCustomItems = useMemo(
    () => getDmToolsPageItems(customItems, customItemPage),
    [customItemPage, customItems]
  );

  useEffect(() => {
    setCustomItemPage((currentPage) => clampDmToolsPage(currentPage, customItems.length));
  }, [customItems.length]);

  useEffect(() => {
    let didCancel = false;
    const loadKey = isAuthenticated && authUserId ? `${authUserId}:${customItemScope}` : null;

    if (!loadKey) {
      loadedCustomItemsForAuthRef.current = null;
      return () => {
        didCancel = true;
      };
    }

    if (loadedCustomItemsForAuthRef.current === loadKey) {
      return () => {
        didCancel = true;
      };
    }

    loadedCustomItemsForAuthRef.current = loadKey;
    dispatch(setCustomItemsLoading());

    void listCustomItems({ scope: customItemScope, suppressFailureToast: true })
      .then(({ customItems: nextCustomItems }) => {
        if (!didCancel) {
          dispatch(setCustomItems(nextCustomItems));
        }
      })
      .catch((error) => {
        if (!didCancel) {
          dispatch(
            setCustomItemsError(getDmToolsApiErrorMessage(error, "Unable to load custom items."))
          );
          loadedCustomItemsForAuthRef.current = null;
        }
      });

    return () => {
      didCancel = true;
    };
  }, [authUserId, customItemScope, dispatch, isAuthenticated]);

  function handleCreateClick() {
    if (!isAuthenticated) {
      dispatch(
        showToast({
          text: "Sign in to create custom items.",
          type: "warning"
        })
      );
      return;
    }

    if (isAtCustomItemLimit) {
      dispatch(
        showToast({
          text: `You can create up to ${customItemLimit} custom items.`,
          type: "warning"
        })
      );
      return;
    }

    setEditingCustomItem(null);
    setIsEditorOpen(true);
  }

  async function handleConfirmDeleteCustomItem() {
    if (!pendingDeleteCustomItem || isDeletingCustomItem) {
      return;
    }

    setActionError(null);
    setIsDeletingCustomItem(true);

    try {
      const { customItemId } = await deleteCustomItem(pendingDeleteCustomItem.id, {
        suppressFailureToast: true
      });

      dispatch(removeCustomItemRecord(customItemId));
      dispatch(
        showToast({
          text: "Custom item deleted.",
          type: "success"
        })
      );
      setPendingDeleteCustomItem(null);
    } catch (deleteError) {
      setActionError(getDmToolsApiErrorMessage(deleteError, "Unable to delete custom item."));
    } finally {
      setIsDeletingCustomItem(false);
    }
  }

  function renderCustomItemScopeToggle() {
    const nextScope = customItemScope === "public" ? "mine" : "public";

    return (
      <button
        type="button"
        className={styles.segmentedToggle}
        aria-label={`Show ${nextScope === "public" ? "public" : "my"} custom items`}
        onClick={() => {
          loadedCustomItemsForAuthRef.current = null;
          setCustomItemPage(1);
          setCustomItemScope(nextScope);
        }}
      >
        <span
          className={[
            styles.segmentedToggleSegment,
            customItemScope === "mine" ? styles.segmentedToggleSegmentActive : ""
          ]
            .filter(Boolean)
            .join(" ")}
        >
          Mine
        </span>
        <span
          className={[
            styles.segmentedToggleSegment,
            customItemScope === "public" ? styles.segmentedToggleSegmentActive : ""
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
          <h3 className={styles.bodyTitle}>Custom Items</h3>
        </div>
        <div className={styles.headerActions}>
          {isAuthenticated ? (
            <span className={styles.memberCount}>
              {customItemScope === "public"
                ? `${customItems.length} public`
                : `${customItems.length}/${customItemLimit} items`}
            </span>
          ) : null}
          {isAuthenticated ? renderCustomItemScopeToggle() : null}
          <ActionButton
            icon={<Plus size={16} aria-hidden="true" />}
            disabled={isAtCustomItemLimit}
            fullWidth={false}
            title={
              isAtCustomItemLimit
                ? `You can create up to ${customItemLimit} custom items.`
                : undefined
            }
            onClick={handleCreateClick}
          >
            Add Item
          </ActionButton>
        </div>
      </div>

      {actionError ? <p className={styles.modalError}>{actionError}</p> : null}

      {customItemsStatus === "loading" ? (
        <DmToolsEmptyState icon={<Backpack size={18} aria-hidden="true" />}>
          Loading custom items...
        </DmToolsEmptyState>
      ) : customItemsError ? (
        <p className={styles.modalError}>{customItemsError}</p>
      ) : !isAuthenticated ? (
        <DmToolsEmptyState icon={<Backpack size={18} aria-hidden="true" />}>
          Sign in to manage custom items.
        </DmToolsEmptyState>
      ) : customItems.length > 0 ? (
        <>
          <div className={styles.dmToolsList}>
            {paginatedCustomItems.map((customItem) => {
              const canManageCustomItem = customItem.ownerId === authUserId;
              const itemName = customItem.item.name ?? "Custom Item";
              const actionMeta =
                customItem.public || customItemScope === "public" ? (
                  <>
                    {customItem.public ? (
                      <span className={styles.dmToolsListCardPublicPill}>Public</span>
                    ) : null}
                    {customItemScope === "public" ? (
                      <span>Owner: {customItem.ownerNickname ?? "Unknown Player"}</span>
                    ) : null}
                  </>
                ) : undefined;
              const actions = canManageCustomItem
                ? [
                    {
                      disabled: isDeletingCustomItem,
                      icon: <PenLine size={18} aria-hidden="true" />,
                      label: `Edit ${itemName}`,
                      onClick: () => {
                        setActionError(null);
                        setEditingCustomItem(customItem);
                        setIsEditorOpen(true);
                      }
                    },
                    {
                      disabled: isDeletingCustomItem,
                      icon: <Trash2 size={18} aria-hidden="true" />,
                      label: `Delete ${itemName}`,
                      onClick: () => {
                        setActionError(null);
                        setPendingDeleteCustomItem(customItem);
                      }
                    }
                  ]
                : [];

              return (
                <DmToolsListCard
                  key={customItem.id}
                  actionMeta={actionMeta}
                  icon={<Backpack size={18} aria-hidden="true" />}
                  title={itemName}
                  meta={getCustomItemMeta(customItem)}
                  tone="customItem"
                  ariaLabel={`Preview ${itemName}`}
                  onClick={() => setPreviewCustomItem(customItem)}
                  actions={actions}
                />
              );
            })}
          </div>
          <DmToolsPaginationControls
            currentPage={customItemPage}
            itemLabel="custom items"
            totalItems={customItems.length}
            onPageChange={setCustomItemPage}
          />
        </>
      ) : (
        <DmToolsEmptyState icon={<Backpack size={18} aria-hidden="true" />}>
          {customItemScope === "public" ? "No public custom items yet." : "No custom items yet."}
        </DmToolsEmptyState>
      )}

      {isEditorOpen ? (
        <CustomItemEditorModal
          customItem={editingCustomItem}
          onClose={() => setIsEditorOpen(false)}
          onSaved={(savedCustomItem) => {
            const savedCustomItemWithOwner = {
              ...savedCustomItem,
              ownerNickname:
                savedCustomItem.ownerNickname ??
                (savedCustomItem.ownerId === authUserId ? authUserNickname : null)
            };

            if (customItemScope === "public" && !savedCustomItemWithOwner.public) {
              dispatch(removeCustomItemRecord(savedCustomItemWithOwner.id));
            } else {
              dispatch(upsertCustomItemRecord(savedCustomItemWithOwner));
            }
            setIsEditorOpen(false);
            setEditingCustomItem(null);
          }}
        />
      ) : null}

      {pendingDeleteCustomItem ? (
        <DestructiveConfirmationModal
          titleId={deleteTitleId}
          title="Delete custom item?"
          message={getDeleteCustomItemMessage(pendingDeleteCustomItem)}
          confirmLabel={isDeletingCustomItem ? "Deleting..." : "Delete"}
          closeLabel="Close delete custom item confirmation"
          onCancel={() => setPendingDeleteCustomItem(null)}
          onConfirm={() => {
            void handleConfirmDeleteCustomItem();
          }}
        />
      ) : null}

      {previewCustomItem ? (
        <Suspense fallback={null}>
          <EquipmentInventoryItemDrawer
            item={previewCustomItem.item}
            status="ready"
            titleId={previewTitleId}
            modEffects={previewCustomItem.mods.effects ?? []}
            headerContent={
              <div className={sheetStyles.spellDrawerHeaderContent}>
                <p className={sheetStyles.spellDrawerBadge}>Custom Item Preview</p>
                <ItemInspectionHeader
                  item={previewCustomItem.item}
                  titleId={previewTitleId}
                  headingLevel="h3"
                />
              </div>
            }
            onClose={() => setPreviewCustomItem(null)}
          />
        </Suspense>
      ) : null}
    </section>
  );
}

export default CustomItemsBody;
