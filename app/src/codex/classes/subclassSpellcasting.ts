import { SPELL_LIST_CLASS } from "../entries/enums";

export type SubclassSpellcastingProgressionRow = {
  level: number;
  cantrips: number;
  preparedSpells: number;
  spellSlots: number[];
};

type SubclassSpellcastingProfile = {
  className: string;
  subclassId: string;
  classSpellListClasses: SPELL_LIST_CLASS[];
  preparedSpellListClasses: SPELL_LIST_CLASS[];
  usesSpellbook: boolean;
  progression: SubclassSpellcastingProgressionRow[];
};

const spellListClassByClassName: Partial<Record<string, SPELL_LIST_CLASS>> = {
  Artificer: SPELL_LIST_CLASS.ARTIFICER,
  Bard: SPELL_LIST_CLASS.BARD,
  Cleric: SPELL_LIST_CLASS.CLERIC,
  Druid: SPELL_LIST_CLASS.DRUID,
  Paladin: SPELL_LIST_CLASS.PALADIN,
  Ranger: SPELL_LIST_CLASS.RANGER,
  Sorcerer: SPELL_LIST_CLASS.SORCERER,
  Warlock: SPELL_LIST_CLASS.WARLOCK,
  Wizard: SPELL_LIST_CLASS.WIZARD
};

const eldritchKnightSpellcastingProfile: SubclassSpellcastingProfile = {
  className: "Fighter",
  subclassId: "fighter-eldritch-knight",
  classSpellListClasses: [SPELL_LIST_CLASS.WIZARD],
  preparedSpellListClasses: [SPELL_LIST_CLASS.WIZARD],
  usesSpellbook: false,
  progression: [
    { level: 3, cantrips: 2, preparedSpells: 3, spellSlots: [2, 0, 0, 0] },
    { level: 4, cantrips: 2, preparedSpells: 4, spellSlots: [3, 0, 0, 0] },
    { level: 7, cantrips: 2, preparedSpells: 5, spellSlots: [4, 2, 0, 0] },
    { level: 8, cantrips: 2, preparedSpells: 6, spellSlots: [4, 2, 0, 0] },
    { level: 10, cantrips: 3, preparedSpells: 7, spellSlots: [4, 3, 0, 0] },
    { level: 11, cantrips: 3, preparedSpells: 8, spellSlots: [4, 3, 0, 0] },
    { level: 13, cantrips: 3, preparedSpells: 9, spellSlots: [4, 3, 2, 0] },
    { level: 14, cantrips: 3, preparedSpells: 10, spellSlots: [4, 3, 2, 0] },
    { level: 16, cantrips: 3, preparedSpells: 11, spellSlots: [4, 3, 3, 0] },
    { level: 19, cantrips: 3, preparedSpells: 12, spellSlots: [4, 3, 3, 1] },
    { level: 20, cantrips: 3, preparedSpells: 13, spellSlots: [4, 3, 3, 1] }
  ]
};

const arcaneTricksterSpellcastingProfile: SubclassSpellcastingProfile = {
  className: "Rogue",
  subclassId: "rogue-arcane-trickster",
  classSpellListClasses: [SPELL_LIST_CLASS.WIZARD],
  preparedSpellListClasses: [SPELL_LIST_CLASS.WIZARD],
  usesSpellbook: false,
  progression: [
    // Mage Hand is auto-granted separately, so these cantrip counts track the selectable Wizard cantrips.
    { level: 3, cantrips: 2, preparedSpells: 3, spellSlots: [2, 0, 0, 0] },
    { level: 4, cantrips: 2, preparedSpells: 4, spellSlots: [3, 0, 0, 0] },
    { level: 5, cantrips: 2, preparedSpells: 4, spellSlots: [3, 0, 0, 0] },
    { level: 6, cantrips: 2, preparedSpells: 4, spellSlots: [3, 0, 0, 0] },
    { level: 7, cantrips: 2, preparedSpells: 5, spellSlots: [4, 2, 0, 0] },
    { level: 8, cantrips: 2, preparedSpells: 6, spellSlots: [4, 2, 0, 0] },
    { level: 9, cantrips: 2, preparedSpells: 6, spellSlots: [4, 2, 0, 0] },
    { level: 10, cantrips: 3, preparedSpells: 7, spellSlots: [4, 3, 0, 0] },
    { level: 11, cantrips: 3, preparedSpells: 8, spellSlots: [4, 3, 0, 0] },
    { level: 12, cantrips: 3, preparedSpells: 8, spellSlots: [4, 3, 0, 0] },
    { level: 13, cantrips: 3, preparedSpells: 9, spellSlots: [4, 3, 2, 0] },
    { level: 14, cantrips: 3, preparedSpells: 10, spellSlots: [4, 3, 2, 0] },
    { level: 15, cantrips: 3, preparedSpells: 10, spellSlots: [4, 3, 2, 0] },
    { level: 16, cantrips: 3, preparedSpells: 11, spellSlots: [4, 3, 3, 0] },
    { level: 17, cantrips: 3, preparedSpells: 11, spellSlots: [4, 3, 3, 0] },
    { level: 18, cantrips: 3, preparedSpells: 11, spellSlots: [4, 3, 3, 0] },
    { level: 19, cantrips: 3, preparedSpells: 12, spellSlots: [4, 3, 3, 1] },
    { level: 20, cantrips: 3, preparedSpells: 13, spellSlots: [4, 3, 3, 1] }
  ]
};

const subclassSpellcastingProfiles: SubclassSpellcastingProfile[] = [
  eldritchKnightSpellcastingProfile,
  arcaneTricksterSpellcastingProfile
];

function normalizeLevel(level: number): number {
  return Math.max(1, Math.min(20, Math.floor(level)));
}

export function getBaseSpellListClassForClassName(className: string): SPELL_LIST_CLASS | null {
  return spellListClassByClassName[className] ?? null;
}

export function getBaseClassSpellListClassesForCharacter(className: string): SPELL_LIST_CLASS[] {
  const spellListClass = getBaseSpellListClassForClassName(className);
  return spellListClass ? [spellListClass] : [];
}

export function getBasePreparedSpellListClassesForCharacter(
  className: string,
  level: number
): SPELL_LIST_CLASS[] {
  if (className === "Bard" && normalizeLevel(level) >= 10) {
    return [
      SPELL_LIST_CLASS.BARD,
      SPELL_LIST_CLASS.CLERIC,
      SPELL_LIST_CLASS.DRUID,
      SPELL_LIST_CLASS.WIZARD
    ];
  }

  return getBaseClassSpellListClassesForCharacter(className);
}

export function getSubclassSpellcastingProfile(
  className: string,
  subclassId?: string
): SubclassSpellcastingProfile | null {
  if (!subclassId) {
    return null;
  }

  return (
    subclassSpellcastingProfiles.find(
      (profile) => profile.className === className && profile.subclassId === subclassId
    ) ?? null
  );
}

export function getSubclassSpellcastingProgressionRow(
  className: string,
  level: number,
  subclassId?: string
): SubclassSpellcastingProgressionRow | null {
  const profile = getSubclassSpellcastingProfile(className, subclassId);

  if (!profile) {
    return null;
  }

  const normalizedLevel = normalizeLevel(level);
  const matchingRows = profile.progression
    .filter((row) => row.level <= normalizedLevel)
    .sort((left, right) => left.level - right.level);

  return matchingRows[matchingRows.length - 1] ?? null;
}

export function getClassSpellListClassesForCharacter(
  className: string,
  subclassId?: string
): SPELL_LIST_CLASS[] {
  return (
    getSubclassSpellcastingProfile(className, subclassId)?.classSpellListClasses ??
    getBaseClassSpellListClassesForCharacter(className)
  );
}

export function getPreparedSpellListClassesForCharacter(
  className: string,
  level: number,
  subclassId?: string
): SPELL_LIST_CLASS[] {
  return (
    getSubclassSpellcastingProfile(className, subclassId)?.preparedSpellListClasses ??
    getBasePreparedSpellListClassesForCharacter(className, level)
  );
}

export function getSpellbookUsageForCharacter(className: string, subclassId?: string): boolean {
  const subclassProfile = getSubclassSpellcastingProfile(className, subclassId);

  if (subclassProfile) {
    return subclassProfile.usesSpellbook;
  }

  return className === "Wizard";
}
