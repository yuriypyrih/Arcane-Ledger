import { useEffect, useLayoutEffect, useState, type ComponentPropsWithoutRef } from "react";
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

  useLayoutEffect(() => {
    setDraftValue(value);
  }, [resetSignal, value]);

  useEffect(() => {
    if (debouncedDraftValue !== value && debouncedDraftValue === draftValue) {
      onValueChange(debouncedDraftValue);
    }
  }, [debouncedDraftValue, draftValue, onValueChange, value]);

  return (
    <TextInput
      {...inputProps}
      value={draftValue}
      onChange={(event) => setDraftValue(event.target.value)}
    />
  );
}

export default SearchField;
