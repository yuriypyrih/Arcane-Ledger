import { useEffect, useLayoutEffect, useRef, useState, type ComponentPropsWithoutRef } from "react";
import { useDebouncedValue } from "../../lib/useDebouncedValue";
import TextInput from "../CharactersPage/FormInputs/TextInput";

type SearchFieldProps = Omit<ComponentPropsWithoutRef<"input">, "onChange" | "type" | "value"> & {
  value: string;
  onValueChange: (value: string) => void;
  debounceMs?: number;
  resetSignal?: unknown;
  invalid?: boolean;
};

const DEFAULT_DEBOUNCE_MS = 300;

function SearchField({
  value,
  onValueChange,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  resetSignal,
  ...inputProps
}: SearchFieldProps) {
  const [draftValue, setDraftValue] = useState(value);
  const debouncedDraftValue = useDebouncedValue(draftValue, debounceMs);
  const previousValueRef = useRef(value);
  const previousResetSignalRef = useRef(resetSignal);
  const isSyncingFromProps =
    previousValueRef.current !== value || previousResetSignalRef.current !== resetSignal;

  useLayoutEffect(() => {
    previousValueRef.current = value;
    previousResetSignalRef.current = resetSignal;
    setDraftValue(value);
  }, [resetSignal, value]);

  useEffect(() => {
    if (isSyncingFromProps && draftValue !== value) {
      return;
    }

    if (debouncedDraftValue !== value && debouncedDraftValue === draftValue) {
      onValueChange(debouncedDraftValue);
    }
  }, [debouncedDraftValue, draftValue, isSyncingFromProps, onValueChange, value]);

  return (
    <TextInput
      {...inputProps}
      value={draftValue}
      onChange={(event) => setDraftValue(event.target.value)}
    />
  );
}

export default SearchField;
