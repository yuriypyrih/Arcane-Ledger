import type { ComponentPropsWithoutRef } from "react";
import { useReadOnlySheet } from "./readOnlySheetContext";

/** Reference navigation remains available inside a disabled sheet section. */
type Props = Omit<ComponentPropsWithoutRef<"button">, "onClick"> & { onClick?: () => void };

export default function SheetReferenceButton(props: Props) {
  const readOnly = useReadOnlySheet();
  if (!readOnly) return <button {...props} />;
  const { type: _type, disabled: _disabled, onClick, onKeyDown, ...rest } = props;
  return (
    <span
      {...rest}
      role="button"
      tabIndex={0}
      data-read-only-navigation="true"
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.();
        } else {
          (onKeyDown as ComponentPropsWithoutRef<"span">["onKeyDown"])?.(event);
        }
      }}
    />
  );
}
