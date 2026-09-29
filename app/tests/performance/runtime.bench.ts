import {
  createCharacterInventoryItem,
  setInventoryItemWornStateById
} from "../../src/pages/CharactersPage/inventoryItems";
import { bench, describe } from "vitest";
import type { Character } from "../../src/types";
import { getSpellEntryById } from "../../src/codex/selectors";
import { characterFixture } from "../fixtures/character";
import { multiclassFixture } from "../fixtures/multiclass";
import { magicInitiateFeat } from "../fixtures/feats";
import { getCharacterRuntime } from "../../src/pages/CharactersPage/characterRuntime/characterRuntime";
import { normalizeCharacterRuntimeUpdate } from "../../src/pages/CharactersPage/CharacterSheetPage/activeCharacterNormalization";
import { getAbilityScoresForCharacter } from "../../src/pages/CharactersPage/abilities";
import { applyLongRestToFeatureState } from "../../src/pages/CharactersPage/classFeatures";
import {
  compileFeatureContributions,
  getFeatureDescriptionAdditions,
  type FeatureContributionSpec
} from "../../src/pages/CharactersPage/featureContributions";

// Comparative measurements, not timing assertions. Run on the same machine/build settings.
const options = { time: 1000, iterations: 50, warmupTime: 200, warmupIterations: 5 };
const spell = getSpellEntryById("spell-fire-bolt")!;
const single = characterFixture({
  className: "Wizard",
  subclassId: "wizard-evoker",
  level: 10,
  xp: 64000,
  feats: [magicInitiateFeat()]
});
const multi = multiclassFixture(
  [
    { className: "Fighter", level: 2 },
    { className: "Wizard", level: 6, subclassId: "wizard-bladesinger" },
    { className: "Ranger", level: 3, subclassId: "ranger-hunter" }
  ],
  { feats: [magicInitiateFeat()] }
);

function readSheet(character: Character) {
  const runtime = getCharacterRuntime(character);
  getAbilityScoresForCharacter(character);
  return [
    runtime.combatSummary.coreStats,
    runtime.combatSummary.abilities,
    runtime.combatSummary.skills,
    runtime.combatSummary.hitPoints,
    runtime.combatSummary.actions,
    runtime.combatSummary.defenses,
    runtime.combatSummary.resources,
    runtime.equipment,
    runtime.spellcasting,
    runtime.spellEntryTransformer.transformSpellEntry(spell)
  ];
}

for (const [name, character] of [
  ["single", single],
  ["multiclass", multi]
] as const) {
  const armor = createCharacterInventoryItem(
    {
      id: "bench-armor",
      key: "bench-armor",
      name: "Chain Mail",
      category: { key: "heavy-armor", name: "Heavy Armor" },
      armor: {
        category: "heavy",
        ac_base: 16,
        ac_display: "16",
        ac_add_dexmod: false,
        ac_cap_dexmod: 0,
        grants_stealth_disadvantage: true,
        strength_score_required: 13
      }
    },
    { id: "bench-armor" }
  );
  const inventory = [armor];
  readSheet(character);
  describe(name, () => {
    bench(
      "warm sheet derivation",
      () => {
        readSheet(character);
      },
      options
    );
    bench(
      "new snapshot derivation",
      () => {
        readSheet({ ...character });
      },
      options
    );
    bench(
      "ability edit and dependent derivation",
      () => {
        readSheet(
          normalizeCharacterRuntimeUpdate(
            {
              ...character,
              abilities: { ...character.abilities, INT: 20 }
            },
            ["profile"]
          )
        );
      },
      options
    );
    bench(
      "HP-only edit and dependent derivation",
      () => {
        readSheet(
          normalizeCharacterRuntimeUpdate({ ...character, currentHitPoints: 7 }, ["resources"])
        );
      },
      options
    );
    bench(
      "equip armor and dependent derivation",
      () => {
        readSheet(
          normalizeCharacterRuntimeUpdate(
            {
              ...character,
              inventoryItems: setInventoryItemWornStateById(inventory, "bench-armor", true)
            },
            ["inventory"]
          )
        );
      },
      options
    );
    bench(
      "cast update and dependent derivation",
      () => {
        readSheet(
          normalizeCharacterRuntimeUpdate({ ...character, spellSlotsExpended: [1] }, [
            "spells",
            "resources",
            "features",
            "statuses"
          ])
        );
      },
      options
    );
    bench(
      "rest and dependent derivation",
      () => {
        readSheet(applyLongRestToFeatureState({ ...character }));
      },
      options
    );
    bench(
      "repeated spell drawer projection",
      () => {
        const transformer = getCharacterRuntime(character).spellEntryTransformer;
        for (let i = 0; i < 20; i++) transformer.transformSpellEntry(spell);
      },
      options
    );
  });
}

for (const count of [25, 100]) {
  const contributions: FeatureContributionSpec[] = Array.from({ length: count }, (_, index) => ({
    source: { id: `source-${index}`, label: `Source ${index}`, type: "feat" },
    descriptionAdditions: [
      {
        id: `description-${index}`,
        target: "spell",
        targetKey: `spell-${index}`,
        sourceLabel: `Source ${index}`,
        descriptionEntries: [`Benefit ${index}`]
      }
    ]
  }));
  const compiled = compileFeatureContributions(contributions);
  describe(`${count} synthetic contributions`, () => {
    bench(
      "compile",
      () => {
        compileFeatureContributions(contributions);
      },
      options
    );
    bench(
      "20 targeted description lookups",
      () => {
        for (let i = 0; i < 20; i++)
          getFeatureDescriptionAdditions(compiled, "spell", { targetKey: "spell-1" });
      },
      options
    );
  });
}
