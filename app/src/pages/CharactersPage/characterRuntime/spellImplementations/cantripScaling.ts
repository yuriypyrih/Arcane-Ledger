import { getSpellEntryById, type SpellEntry } from "../../../../codex/entries";
import { getCharacterLevel } from "../../multiclass";

/** The codex opts each spell into its own scaling rule; never infer it from damage alone. */
export function scaleCantripForCharacter(character: object, spell: SpellEntry): SpellEntry {
  if (spell.spellLevel !== 0 || !spell.cantripScaling) return spell;
  const level = getCharacterLevel(character);
  const count = 1 + [5, 11, 17].filter((threshold) => level >= threshold).length;
  if (spell.cantripScaling === "beams") {
    const addition = `<strong>Current beams.</strong> ${count}; roll a separate attack and damage for each beam.`;
    return {
      ...spell,
      descriptionAdditions: [
        ...(spell.descriptionAdditions ?? []).filter(
          (lines) =>
            !lines.some(
              (line) => typeof line === "string" && line.startsWith("<strong>Current beams.")
            )
        ),
        [addition]
      ]
    };
  }
  // Use the intrinsic base dice so repeated previews do not multiply already-scaled damage.
  const base = getSpellEntryById(spell.id)?.damage ?? spell.damage;
  return {
    ...spell,
    damage: base.flatMap(([amount, type]) =>
      typeof amount === "string" && /^\d*d\d+$/i.test(amount)
        ? Array.from({ length: count }, () => [amount, type] as [typeof amount, typeof type])
        : [[amount, type]]
    )
  };
}
