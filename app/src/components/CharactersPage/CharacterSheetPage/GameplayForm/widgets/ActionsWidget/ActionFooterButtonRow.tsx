import { Children, type ReactNode } from "react";
import styles from "./ActionsWidget.module.css";

type ActionFooterButtonRowProps = {
  children: ReactNode;
  className?: string;
  endGroupClassName?: string;
  settings?: ReactNode;
};

function ActionFooterButtonRow({
  children,
  className = styles.weaponFooterActions,
  endGroupClassName = styles.footerActionEndGroup,
  settings
}: ActionFooterButtonRowProps) {
  const actionItems = Children.toArray(children).filter(Boolean);

  if (!settings || actionItems.length === 0) {
    return <div className={className}>{actionItems}</div>;
  }

  const leadingItems = actionItems.slice(0, -1);
  const finalItem = actionItems[actionItems.length - 1];

  return (
    <div className={className}>
      {leadingItems}
      <div className={endGroupClassName}>
        {finalItem}
        {settings}
      </div>
    </div>
  );
}

export default ActionFooterButtonRow;
