import type { Character } from "../../../types";
import { createCharacterSheetRecordV2 } from "../../../pages/CharactersPage/characterSheetRecord";

const invalidFilenameCharacterPattern = /[<>:"/\\|?*]/g;
const leadingOrTrailingDotsPattern = /^\.+|\.+$/g;
const repeatedDashPattern = /-+/g;
const whitespacePattern = /\s+/g;

function normalizeFilenameSegment(value: string, fallback: string) {
  const sanitizedValue = value
    .trim()
    .replace(invalidFilenameCharacterPattern, "")
    .replace(whitespacePattern, "-")
    .replace(repeatedDashPattern, "-")
    .replace(leadingOrTrailingDotsPattern, "");

  return sanitizedValue.length > 0 ? sanitizedValue : fallback;
}

export function createCharacterExportFilename(
  character: Pick<Character, "name" | "className" | "level">
) {
  const characterName = normalizeFilenameSegment(character.name, "character");
  const className = normalizeFilenameSegment(character.className, "class");

  return `${characterName}-${className}-${character.level}.json`;
}

export function downloadCharacterExport(character: Character) {
  if (typeof document === "undefined" || typeof URL === "undefined") {
    return;
  }

  const objectUrl = URL.createObjectURL(
    new Blob([JSON.stringify(createCharacterSheetRecordV2(character), null, 2)], {
      type: "application/json"
    })
  );
  const downloadLink = document.createElement("a");

  downloadLink.href = objectUrl;
  downloadLink.download = createCharacterExportFilename(character);
  document.body.append(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  URL.revokeObjectURL(objectUrl);
}
