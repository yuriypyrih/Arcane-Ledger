import { useEffect, useState, type ComponentPropsWithoutRef } from "react";
import TextInput from "../CharactersPage/FormInputs/TextInput";

type SearchFieldProps = Omit<ComponentPropsWithoutRef<"input">, "onChange" | "type" | "value"> & {
  value: string;
  onValueChange: (value: string) => void;
  debounceMs?: number;
  invalid?: boolean;
};

const DEFAULT_DEBOUNCE_MS = 300;

function SearchField({
  value,
  onValueChange,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  ...inputProps
}: SearchFieldProps) {
  const [draftValue, setDraftValue] = useState(value);

  useEffect(() => {
    setDraftValue(value);
  }, [value]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (draftValue !== value) {
        onValueChange(draftValue);
      }
    }, debounceMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [debounceMs, draftValue, onValueChange, value]);

  return (
    <TextInput
      {...inputProps}
      value={draftValue}
      onChange={(event) => setDraftValue(event.target.value)}
    />
  );
}

export default SearchField;
