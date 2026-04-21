import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import ResourceManagementModal from "../../ResourceManagementModal";
import styles from "./ResourceCountWidget.module.css";

export type ResourceCountWidgetIcon =
  | {
      kind: "lucide";
      icon: LucideIcon;
    }
  | {
      kind: "image";
      src: string;
    };

type ResourceCountWidgetProps = {
  icon: ResourceCountWidgetIcon;
  pillLabel: string;
  modalTitle: string;
  current: number;
  total: number;
  titleSuffix?: string;
  onAdd: () => void;
  onUse: () => void;
  onReset: () => void;
};

function renderPillIcon(icon: ResourceCountWidgetIcon) {
  if (icon.kind === "lucide") {
    const Icon = icon.icon;

    return (
      <span className={styles.pillIcon} aria-hidden="true">
        <Icon size={16} />
      </span>
    );
  }

  return <img src={icon.src} alt="" className={styles.pillImage} aria-hidden="true" />;
}

function ResourceCountWidget({
  icon,
  pillLabel,
  modalTitle,
  current,
  total,
  titleSuffix,
  onAdd,
  onUse,
  onReset
}: ResourceCountWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const modalTitleId = [modalTitle, titleSuffix, "resource-modal-title"]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
  const resolvedModalTitle = [modalTitle, `${current}/${total}`, titleSuffix]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <button
        type="button"
        className={styles.pill}
        onClick={() => setIsOpen(true)}
        aria-label={pillLabel}
        title={pillLabel}
      >
        {renderPillIcon(icon)}
        <span>{pillLabel}</span>
      </button>

      {isOpen ? (
        <ResourceManagementModal
          titleId={modalTitleId}
          title={resolvedModalTitle}
          closeLabel={`Close ${modalTitle} resource management`}
          onClose={() => setIsOpen(false)}
          actions={[
            {
              label: "Use 1",
              onClick: onUse,
              disabled: current <= 0,
              ariaLabel: `Use 1 ${modalTitle}`
            },
            {
              label: "Reset 1",
              onClick: onAdd,
              disabled: current >= total,
              ariaLabel: `Reset 1 ${modalTitle}`
            },
            {
              label: "Reset All",
              onClick: onReset,
              disabled: current >= total,
              ariaLabel: `Reset all ${modalTitle}`
            }
          ]}
        />
      ) : null}
    </>
  );
}

export default ResourceCountWidget;
