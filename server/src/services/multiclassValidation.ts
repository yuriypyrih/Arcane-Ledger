import { AppError } from "../errors/AppError.js";

const classNames = new Set([
  "Artificer",
  "Barbarian",
  "Bard",
  "Cleric",
  "Druid",
  "Fighter",
  "Monk",
  "Paladin",
  "Ranger",
  "Rogue",
  "Sorcerer",
  "Warlock",
  "Wizard",
  "Custom"
]);
const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);
const isCount = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= 0;

/** Validate the storage contract here; gameplay eligibility belongs to the codex/runtime. */
export function validateMulticlassSheet(sheet: Record<string, unknown>) {
  const progression = sheet.progression as Record<string, unknown>;
  const state = progression.multiclass;
  const invalid = (): never => {
    throw new AppError("Invalid multiclass progression.", 400, "INVALID_SHEET");
  };
  if (sheet.schemaVersion === 2) {
    if (state !== undefined) invalid();
    return;
  }
  if (
    !isRecord(state) ||
    !Array.isArray(state.classes) ||
    !state.classes.length ||
    state.classes.length > 100
  )
    return invalid();
  const ids = new Set<string>();
  const identities = new Set<string>();
  let total = 0;
  for (const entry of state.classes) {
    if (
      !isRecord(entry) ||
      typeof entry.id !== "string" ||
      !entry.id.trim() ||
      typeof entry.className !== "string" ||
      !classNames.has(entry.className) ||
      !isCount(entry.level) ||
      entry.level < (entry.id === state.startingClassId ? 1 : 0) ||
      entry.level > 100
    )
      return invalid();
    for (const field of [
      "cantripIds",
      "spellbookSpellIds",
      "preparedSpellIds",
      "skillChoices",
      "toolChoices"
    ]) {
      const value = entry[field];
      if (
        value !== undefined &&
        (!Array.isArray(value) || value.some((item) => typeof item !== "string"))
      )
        return invalid();
    }
    if (entry.customClass !== undefined && !isRecord(entry.customClass)) return invalid();
    if (
      entry.inactiveFeats !== undefined &&
      (!Array.isArray(entry.inactiveFeats) || entry.inactiveFeats.some((feat) => !isRecord(feat)))
    )
      return invalid();
    if (
      entry.hitPointRolls !== undefined &&
      (!Array.isArray(entry.hitPointRolls) ||
        entry.hitPointRolls.length > 100 ||
        entry.hitPointRolls.some(
          (roll) => roll !== null && (!isCount(roll) || roll < 1 || roll > 12)
        ))
    )
      return invalid();
    const customId = isRecord(entry.customClass) ? entry.customClass.id : undefined;
    if (customId !== undefined && typeof customId !== "string") return invalid();
    const identity =
      entry.className === "Custom" ? `Custom:${customId ?? entry.id}` : entry.className;
    if (ids.has(entry.id) || identities.has(identity)) return invalid();
    ids.add(entry.id);
    identities.add(identity);
    total += entry.level;
  }
  if (
    state.hitPointsAdjustment !== undefined &&
    (typeof state.hitPointsAdjustment !== "number" || !Number.isFinite(state.hitPointsAdjustment))
  )
    return invalid();
  if (
    state.hitDiceExpendedByClass !== undefined &&
    (!isRecord(state.hitDiceExpendedByClass) ||
      Object.values(state.hitDiceExpendedByClass).some((count) => !isCount(count)))
  )
    return invalid();
  if (
    state.hitDiceExpended !== undefined &&
    (!isRecord(state.hitDiceExpended) ||
      Object.entries(state.hitDiceExpended).some(
        ([die, count]) => !["d6", "d8", "d10", "d12"].includes(die) || !isCount(count)
      ))
  )
    return invalid();
  if (
    state.slotPoolsExpended !== undefined &&
    (!isRecord(state.slotPoolsExpended) ||
      Object.values(state.slotPoolsExpended).some(
        (list) => !Array.isArray(list) || list.length > 9 || list.some((count) => !isCount(count))
      ))
  )
    return invalid();
  if (
    total < 1 ||
    total > 100 ||
    total !== progression.level ||
    typeof state.startingClassId !== "string" ||
    !ids.has(state.startingClassId)
  )
    invalid();
}
