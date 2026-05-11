import { pathToFileURL, fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type Open5eSpellDocument = {
  name?: string;
  key?: string;
  display_name?: string;
  publisher?: {
    key?: string;
  };
  gamesystem?: {
    key?: string;
  };
  permalink?: string;
};

type Open5eSpellRecord = {
  key: string;
  document: Open5eSpellDocument;
  school?: {
    key?: string;
  };
  classes?: Array<{
    name?: string;
    key?: string;
  }>;
  name: string;
  desc?: string;
  higher_level?: string;
  level: number;
  range_text?: string;
  ritual?: boolean;
  casting_time?: string;
  reaction_condition?: string | null;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  saving_throw_ability?: string;
  attack_roll?: boolean;
  damage_roll?: string;
  damage_types?: string[];
  duration?: string;
  concentration?: boolean;
};

type Open5eSpellPage = {
  results?: Open5eSpellRecord[];
};

type CodexSpellEntry = {
  id: string;
  name: string;
  category: string;
  source?: SpellSourceMetadata;
  legacyIds?: string[];
  legacyNames?: string[];
  magicSchool: string;
  castingTime: Array<string>;
  range: string;
  components: string[];
  duration: string[];
  description: SpellDescriptionEntry[];
  descriptionAdditions?: SpellDescriptionEntry[][];
  trackingState: string;
  isHealingSpell?: boolean;
  isSavingThrowSpell?: boolean;
  savingThrowAbility?: string | null;
  isAttackSpell?: boolean;
  isDamagingSpell?: boolean;
  damage: WeaponDamage;
  healing: SpellHealing;
  spellLists: string[];
  spellLevel: number;
  ritual?: boolean;
};

type SpellDescriptionList = {
  type: "list";
  style: "bullet" | "number";
  items: string[];
};

type SpellDescriptionEntry = string | SpellDescriptionList;
type WeaponDamageAmount = string | number;
type WeaponDamageType = string | string[];
type WeaponDamage = Array<[WeaponDamageAmount, WeaponDamageType]>;
type SpellHealingAmount = WeaponDamageAmount | "spellcastingAbility";
type SpellHealing = SpellHealingAmount[] | { label: string };
type SpellSourceMetadata = {
  documentKey: string;
  documentName: string;
  ruleset: "5e-2024" | "5e-2014" | "a5e" | "third-party" | "legacy-local";
  open5eKey?: string;
  publisherKey?: string;
  permalink?: string;
};

type SpellAliasMigration = {
  legacyName: string;
  canonicalName: string;
};

type GeneratedSpellEntry = CodexSpellEntry & {
  source: SpellSourceMetadata;
};

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const workspaceRoot = path.resolve(currentDir, "../../..");
const appSpellsRoot = path.join(workspaceRoot, "app/src/codex/spells");
const open5eSpellsRoot = path.join(workspaceRoot, "server/data/open5e/spells");

const srd2024DocumentKey = "srd-2024";
const expectedSrd2024SpellCount = 339;
const expectedLegacySpellCount = 232;

const spellAliasMigrations: SpellAliasMigration[] = [
  { legacyName: "Melf's Acid Arrow", canonicalName: "Acid Arrow" },
  { legacyName: "Bigby's Hand", canonicalName: "Arcane Hand" },
  { legacyName: "Mordenkainen's Sword", canonicalName: "Arcane Sword" },
  { legacyName: "Nystul's Magic Aura", canonicalName: "Arcanist's Magic Aura" },
  { legacyName: "Evard's Black Tentacles", canonicalName: "Black Tentacles" },
  { legacyName: "Branding Smite", canonicalName: "Shining Smite" },
  { legacyName: "Mordenkainen's Faithful Hound", canonicalName: "Faithful Hound" },
  { legacyName: "Tenser's Floating Disk", canonicalName: "Floating Disk" },
  { legacyName: "Otiluke's Freezing Sphere", canonicalName: "Freezing Sphere" },
  { legacyName: "Tasha's Hideous Laughter", canonicalName: "Hideous Laughter" },
  { legacyName: "Drawmij's Instant Summons", canonicalName: "Instant Summons" },
  { legacyName: "Otto's Irresistible Dance", canonicalName: "Irresistible Dance" },
  { legacyName: "Mordenkainen's Magnificent Mansion", canonicalName: "Magnificent Mansion" },
  { legacyName: "Mordenkainen's Private Sanctum", canonicalName: "Private Sanctum" },
  { legacyName: "Otiluke's Resilient Sphere", canonicalName: "Resilient Sphere" },
  { legacyName: "Leomund's Secret Chest", canonicalName: "Secret Chest" },
  { legacyName: "Rary's Telepathic Bond", canonicalName: "Telepathic Bond" },
  { legacyName: "Leomund's Tiny Hut", canonicalName: "Tiny Hut" },
  { legacyName: "Feeblemind", canonicalName: "Befuddlement" },
  { legacyName: "Power Word: Heal", canonicalName: "Power Word Heal" },
  { legacyName: "Power Word: Kill", canonicalName: "Power Word Kill" },
  { legacyName: "Power Word: Stun", canonicalName: "Power Word Stun" }
];

const healingOverrides = new Map<string, SpellHealing>([
  ["Cure Wounds", ["D8", "D8", "spellcastingAbility"]],
  ["Goodberry", [1]],
  ["Heal", [70]],
  ["Healing Word", ["D4", "D4", "spellcastingAbility"]],
  [
    "Mass Cure Wounds",
    ["D8", "D8", "D8", "D8", "D8", "spellcastingAbility"]
  ],
  ["Mass Heal", { label: "Up to 700 Hit Points" }],
  ["Mass Healing Word", ["D4", "D4", "spellcastingAbility"]],
  ["Power Word Heal", { label: "All Hit Points" }],
  ["Prayer of Healing", ["D8", "D8"]],
  ["Regenerate", ["D8", "D8", "D8", "D8", 15]]
]);

const sorcerousBurstDamageTypes = [
  "ACID",
  "COLD",
  "FIRE",
  "LIGHTNING",
  "POISON",
  "PSYCHIC",
  "THUNDER"
];

function normalizeLookupName(name: string): string {
  return name.trim().toLowerCase();
}

function slugifySpellName(name: string): string {
  return `spell-${name
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}`;
}

function toVariableName(name: string): string {
  const words = name
    .trim()
    .replace(/['’]/g, "")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
  const variableName = words
    .map((word, index) => {
      const lower = word.toLowerCase();
      return index === 0 ? lower : `${lower.slice(0, 1).toUpperCase()}${lower.slice(1)}`;
    })
    .join("");

  return /^[A-Za-z_$]/.test(variableName) ? variableName : `spell${variableName}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isCodexSpellEntry(value: unknown): value is CodexSpellEntry {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.id === "string" && typeof value.name === "string";
}

function getFetchDateArg(): string | null {
  const fetchDateArg = process.argv.find((arg) => arg.startsWith("--fetch-date="));
  return fetchDateArg ? fetchDateArg.slice("--fetch-date=".length) : null;
}

function hasDryRunArg(): boolean {
  return process.argv.includes("--dry-run");
}

async function getSnapshotDir(): Promise<string> {
  const fetchDate = getFetchDateArg();

  if (fetchDate) {
    const snapshotDir = path.join(open5eSpellsRoot, `fetch-${fetchDate}`);

    if (!existsSync(snapshotDir)) {
      throw new Error(`Open5e spell snapshot not found: ${snapshotDir}`);
    }

    return snapshotDir;
  }

  const entries = await readdir(open5eSpellsRoot, { withFileTypes: true });
  const fetchDirs = entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("fetch-"))
    .map((entry) => entry.name)
    .sort();

  const latestFetchDir = fetchDirs.at(-1);

  if (!latestFetchDir) {
    throw new Error(`No Open5e spell snapshots found in ${open5eSpellsRoot}`);
  }

  return path.join(open5eSpellsRoot, latestFetchDir);
}

async function loadOpen5eSpellRecords(snapshotDir: string): Promise<Open5eSpellRecord[]> {
  const pageFiles = (await readdir(snapshotDir))
    .filter((fileName) => /^page-\d+\.json$/.test(fileName))
    .sort((left, right) => {
      const leftPage = Number(left.match(/\d+/)?.[0] ?? 0);
      const rightPage = Number(right.match(/\d+/)?.[0] ?? 0);
      return leftPage - rightPage;
    });

  const records: Open5eSpellRecord[] = [];

  for (const fileName of pageFiles) {
    const page = JSON.parse(
      await readFile(path.join(snapshotDir, fileName), "utf8")
    ) as Open5eSpellPage;

    records.push(...(page.results ?? []));
  }

  return records;
}

async function loadCurrentSpellEntries(): Promise<CodexSpellEntry[]> {
  const spellsModulePath = pathToFileURL(path.join(appSpellsRoot, "index.ts")).href;
  const spellsModule = (await import(spellsModulePath)) as { spellEntries?: unknown };
  const spellEntries = spellsModule.spellEntries;

  if (!Array.isArray(spellEntries)) {
    throw new Error("Could not load current spellEntries from the app codex.");
  }

  return spellEntries.filter(isCodexSpellEntry);
}

function createSourceFromOpen5e(record: Open5eSpellRecord): SpellSourceMetadata {
  const document = record.document;
  const gamesystemKey = document.gamesystem?.key;
  const ruleset: SpellSourceMetadata["ruleset"] =
    gamesystemKey === "5e-2024"
      ? "5e-2024"
      : gamesystemKey === "5e-2014"
        ? "5e-2014"
        : gamesystemKey === "a5e"
          ? "a5e"
          : "third-party";

  return {
    documentKey: document.key ?? srd2024DocumentKey,
    documentName: document.display_name ?? document.name ?? document.key ?? "Open5e",
    ruleset,
    open5eKey: record.key,
    ...(document.publisher?.key ? { publisherKey: document.publisher.key } : {}),
    ...(document.permalink ? { permalink: document.permalink } : {})
  };
}

function createLegacySource(): SpellSourceMetadata {
  return {
    documentKey: "legacy-local",
    documentName: "Legacy / Expanded Local",
    ruleset: "legacy-local"
  };
}

function normalizeLegacySource(source: unknown): SpellSourceMetadata {
  if (
    isRecord(source) &&
    typeof source.documentKey === "string" &&
    typeof source.documentName === "string" &&
    typeof source.ruleset === "string"
  ) {
    return source as SpellSourceMetadata;
  }

  return createLegacySource();
}

function mapSchool(record: Open5eSpellRecord, current?: CodexSpellEntry): string {
  const schoolKey = record.school?.key?.trim().toUpperCase();
  return schoolKey || current?.magicSchool || "EVOCATION";
}

function mapComponents(record: Open5eSpellRecord): string[] {
  const components: string[] = [];

  if (record.verbal) {
    components.push("V");
  }

  if (record.somatic) {
    components.push("S");
  }

  if (record.material) {
    components.push("M");
  }

  return components;
}

function formatDurationText(duration: string): string {
  const trimmedDuration = duration.trim().replace(/\s+/g, " ");

  if (!trimmedDuration) {
    return "Special";
  }

  if (trimmedDuration.toLowerCase() === "instantaneous") {
    return "Instantaneous";
  }

  if (trimmedDuration.toLowerCase() === "special") {
    return "Special";
  }

  return trimmedDuration
    .replace(/\b(\d+) minute\b/i, (_match, amount: string) =>
      amount === "1" ? "1 minute" : `${amount} minutes`
    )
    .replace(/\b(\d+) hour\b/i, (_match, amount: string) =>
      amount === "1" ? "1 hour" : `${amount} hours`
    )
    .replace(/^until /i, "Until ");
}

function mapDuration(record: Open5eSpellRecord, current?: CodexSpellEntry): string[] {
  const rawDuration = record.duration?.trim() ?? "";

  if (!rawDuration) {
    return current?.duration?.length ? current.duration : ["Special"];
  }

  if (record.concentration) {
    const durationWithoutConcentration = rawDuration.replace(/^concentration,\s*/i, "");
    return ["CONCENTRATION", `up to ${formatDurationText(durationWithoutConcentration)}`];
  }

  return [formatDurationText(rawDuration)];
}

function mapCastingTime(record: Open5eSpellRecord, current?: CodexSpellEntry): string[] {
  const castingTime = record.casting_time?.trim().toLowerCase();

  if (castingTime === "action") {
    return ["ACTION"];
  }

  if (castingTime === "bonus-action") {
    return ["BONUS_ACTION"];
  }

  if (castingTime === "reaction") {
    const reactionCondition = record.reaction_condition?.trim();
    return reactionCondition ? ["REACTION", reactionCondition] : ["REACTION"];
  }

  if (castingTime === "minute") {
    return current?.castingTime?.some((part) =>
      ["MINUTE", "TEN_MINUTES"].includes(part)
    )
      ? current.castingTime
      : ["MINUTE"];
  }

  if (castingTime === "hour") {
    return current?.castingTime?.some((part) =>
      ["HOUR", "EIGHT_HOURS", "TWELVE_HOURS", "TWENTY_FOUR_HOURS"].includes(part)
    )
      ? current.castingTime
      : ["HOUR"];
  }

  return current?.castingTime?.length ? current.castingTime : ["ACTION"];
}

function mapSavingThrowAbility(record: Open5eSpellRecord): string | null {
  const ability = record.saving_throw_ability?.trim().toLowerCase();

  switch (ability) {
    case "strength":
      return "STR";
    case "dexterity":
      return "DEX";
    case "constitution":
      return "CON";
    case "intelligence":
      return "INT";
    case "wisdom":
      return "WIS";
    case "charisma":
      return "CHA";
    default:
      return null;
  }
}

function mapSpellLists(record: Open5eSpellRecord): string[] {
  return [
    ...new Set(
      (record.classes ?? [])
        .map((spellClass) => spellClass.name?.trim().toUpperCase())
        .filter((spellClass): spellClass is string => !!spellClass)
    )
  ];
}

function normalizeDamageType(damageType: string): string | null {
  const normalizedDamageType = damageType.trim().toUpperCase();
  const validDamageTypes = new Set([
    "ACID",
    "BLUDGEONING",
    "COLD",
    "FIRE",
    "FORCE",
    "LIGHTNING",
    "NECROTIC",
    "PIERCING",
    "POISON",
    "PSYCHIC",
    "RADIANT",
    "SLASHING",
    "THUNDER"
  ]);

  return validDamageTypes.has(normalizedDamageType) ? normalizedDamageType : null;
}

function parseFormulaAmounts(formula: string): WeaponDamageAmount[] {
  const amounts: WeaponDamageAmount[] = [];
  const formulaParts = formula.split("+").map((part) => part.trim());

  formulaParts.forEach((part) => {
    const diceMatch = part.match(/^(\d*)d(4|6|8|10|12|20)$/i);

    if (diceMatch) {
      const count = Math.max(1, Number(diceMatch[1] || 1));
      const die = `D${diceMatch[2]}`;

      for (let index = 0; index < count; index += 1) {
        amounts.push(die);
      }

      return;
    }

    const numericPart = Number(part);

    if (Number.isFinite(numericPart) && numericPart > 0) {
      amounts.push(Math.floor(numericPart));
    }
  });

  return amounts;
}

function createDamageEntries(formula: string, damageType: WeaponDamageType): WeaponDamage {
  return parseFormulaAmounts(formula).map((amount) => [amount, damageType]);
}

function parseTypedDamageFromDescription(record: Open5eSpellRecord): WeaponDamage {
  const description = record.desc ?? "";
  const damage: WeaponDamage = [];
  const typedDamagePattern =
    /\b(\d+d(?:4|6|8|10|12|20)(?:\s*\+\s*\d+)?)\s+([A-Z][a-z]+)\s+damage\b/g;

  for (const match of description.matchAll(typedDamagePattern)) {
    const formula = match[1];
    const damageType = match[2] ? normalizeDamageType(match[2]) : null;

    if (!formula || !damageType) {
      continue;
    }

    damage.push(...createDamageEntries(formula.replace(/\s+/g, " "), damageType));
  }

  return damage;
}

function hasDamagingLanguage(record: Open5eSpellRecord): boolean {
  const text = `${record.desc ?? ""} ${record.higher_level ?? ""}`;

  return (
    /\b(?:takes?|take|deals?|deal|suffers?|suffer)\b.{0,120}\bdamage\b/i.test(text) ||
    /\bextra\s+\d+d(?:4|6|8|10|12|20).{0,80}\bdamage\b/i.test(text)
  );
}

function deriveDamage(record: Open5eSpellRecord, current?: CodexSpellEntry): WeaponDamage {
  if (record.name === "Sorcerous Burst") {
    return createDamageEntries("1d8", sorcerousBurstDamageTypes);
  }

  if (!hasDamagingLanguage(record)) {
    return [];
  }

  const typedDamage = parseTypedDamageFromDescription(record);

  if (typedDamage.length > 0) {
    return typedDamage;
  }

  const damageRoll = record.damage_roll?.trim();
  const damageTypes = (record.damage_types ?? [])
    .map(normalizeDamageType)
    .filter((damageType): damageType is string => !!damageType);

  if (damageRoll && damageTypes.length > 0) {
    const damageType: WeaponDamageType = damageTypes.length === 1 ? damageTypes[0]! : damageTypes;
    return createDamageEntries(damageRoll, damageType);
  }

  return current?.isDamagingSpell ? current.damage : [];
}

function deriveHealing(record: Open5eSpellRecord, current?: CodexSpellEntry): SpellHealing {
  const override = healingOverrides.get(record.name);

  if (override) {
    return override;
  }

  return current?.isHealingSpell ? current.healing : [];
}

function boldDiceText(text: string): string {
  return text.replace(/\b(\d+d(?:4|6|8|10|12|20)(?:\s*\+\s*\d+)?)\b/gi, "<strong>$1</strong>");
}

function normalizeInlineMarkdown(text: string): string {
  return boldDiceText(text)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>");
}

function pushParagraph(
  entries: SpellDescriptionEntry[],
  paragraphLines: string[],
  listItems: string[],
  listStyle: SpellDescriptionList["style"]
) {
  if (paragraphLines.length > 0) {
    entries.push(normalizeInlineMarkdown(paragraphLines.join(" ").trim()));
    paragraphLines.length = 0;
  }

  if (listItems.length > 0) {
    entries.push({
      type: "list",
      style: listStyle,
      items: [...listItems]
    });
    listItems.length = 0;
  }
}

function parseMarkdownDescription(markdown: string): SpellDescriptionEntry[] {
  const entries: SpellDescriptionEntry[] = [];
  const paragraphLines: string[] = [];
  const listItems: string[] = [];
  let listStyle: SpellDescriptionList["style"] = "bullet";

  markdown
    .replace(/\r/g, "")
    .split("\n")
    .forEach((rawLine) => {
      const line = rawLine.trim();

      if (!line) {
        pushParagraph(entries, paragraphLines, listItems, listStyle);
        return;
      }

      const bulletMatch = line.match(/^[-*]\s+(.+)$/);
      const numberMatch = line.match(/^\d+\.\s+(.+)$/);

      if (bulletMatch?.[1]) {
        if (paragraphLines.length > 0) {
          pushParagraph(entries, paragraphLines, listItems, listStyle);
        }

        listStyle = "bullet";
        listItems.push(normalizeInlineMarkdown(bulletMatch[1]));
        return;
      }

      if (numberMatch?.[1]) {
        if (paragraphLines.length > 0 || (listItems.length > 0 && listStyle !== "number")) {
          pushParagraph(entries, paragraphLines, listItems, listStyle);
        }

        listStyle = "number";
        listItems.push(normalizeInlineMarkdown(numberMatch[1]));
        return;
      }

      if (listItems.length > 0) {
        pushParagraph(entries, paragraphLines, listItems, listStyle);
      }

      paragraphLines.push(line);
    });

  pushParagraph(entries, paragraphLines, listItems, listStyle);

  return entries;
}

function createDescription(
  record: Open5eSpellRecord,
  current?: CodexSpellEntry
): SpellDescriptionEntry[] {
  const descriptionText = record.desc?.trim() ?? "";

  if (!descriptionText) {
    return current?.description?.length ? current.description : [];
  }

  const description = parseMarkdownDescription(descriptionText);
  const higherLevelText = record.higher_level?.trim();

  if (higherLevelText) {
    const heading = record.level === 0 ? "Cantrip Upgrade." : "Using a Higher-Level Spell Slot.";
    description.push(`<strong>${heading}</strong> ${normalizeInlineMarkdown(higherLevelText)}`);
  }

  return description;
}

function createSrdSpellEntry(
  record: Open5eSpellRecord,
  current: CodexSpellEntry | undefined,
  aliasMigration: SpellAliasMigration | undefined
): GeneratedSpellEntry {
  const id = slugifySpellName(record.name);
  const legacyId = aliasMigration ? slugifySpellName(aliasMigration.legacyName) : null;
  const legacyIds = legacyId && legacyId !== id ? [legacyId] : undefined;
  const legacyNames =
    aliasMigration && aliasMigration.legacyName !== record.name
      ? [aliasMigration.legacyName]
      : undefined;
  const savingThrowAbility = mapSavingThrowAbility(record);
  const damage = deriveDamage(record, current);
  const healing = deriveHealing(record, current);

  return {
    id,
    name: record.name,
    category: "SPELLS",
    source: createSourceFromOpen5e(record),
    ...(legacyIds ? { legacyIds } : {}),
    ...(legacyNames ? { legacyNames } : {}),
    trackingState: current?.trackingState ?? "not-tracked",
    magicSchool: mapSchool(record, current),
    castingTime: mapCastingTime(record, current),
    range: record.range_text?.trim() || current?.range || "Self",
    components: mapComponents(record),
    duration: mapDuration(record, current),
    description: createDescription(record, current),
    ...(savingThrowAbility ? { isSavingThrowSpell: true, savingThrowAbility } : {}),
    ...(record.attack_roll ? { isAttackSpell: true } : {}),
    ...(damage.length > 0 ? { isDamagingSpell: true } : {}),
    damage,
    ...(Array.isArray(healing) ? (healing.length > 0 ? { isHealingSpell: true } : {}) : { isHealingSpell: true }),
    healing,
    spellLists: mapSpellLists(record),
    spellLevel: record.level,
    ...(record.ritual ? { ritual: true } : {})
  };
}

function createLegacySpellEntry(current: CodexSpellEntry): GeneratedSpellEntry {
  return {
    ...current,
    source: normalizeLegacySource(current.source),
    legacyIds: current.legacyIds?.length ? current.legacyIds : undefined,
    legacyNames: current.legacyNames?.length ? current.legacyNames : undefined
  };
}

function enumRef(enumName: string, enumKey: string): string {
  return `${enumName}.${enumKey}`;
}

function serializeString(value: string): string {
  return JSON.stringify(value);
}

function serializeSource(source: SpellSourceMetadata): string {
  const parts = [
    `documentKey: ${serializeString(source.documentKey)}`,
    `documentName: ${serializeString(source.documentName)}`,
    `ruleset: ${serializeString(source.ruleset)}`
  ];

  if (source.open5eKey) {
    parts.push(`open5eKey: ${serializeString(source.open5eKey)}`);
  }

  if (source.publisherKey) {
    parts.push(`publisherKey: ${serializeString(source.publisherKey)}`);
  }

  if (source.permalink) {
    parts.push(`permalink: ${serializeString(source.permalink)}`);
  }

  return `{ ${parts.join(", ")} }`;
}

function serializeStringArray(values: string[]): string {
  return `[${values.map(serializeString).join(", ")}]`;
}

function serializeEnumArray(enumName: string, values: string[]): string {
  return `[${values.map((value) => enumRef(enumName, value)).join(", ")}]`;
}

function serializeCastingTime(values: string[]): string {
  return `[${values
    .map((value) =>
      [
        "ACTION",
        "BONUS_ACTION",
        "REACTION",
        "MINUTE",
        "TEN_MINUTES",
        "HOUR",
        "EIGHT_HOURS",
        "TWELVE_HOURS",
        "TWENTY_FOUR_HOURS"
      ].includes(value)
        ? enumRef("ACTION_TYPE", value)
        : serializeString(value)
    )
    .join(", ")}]`;
}

function serializeDuration(values: string[]): string {
  return `[${values
    .map((value) => (value === "CONCENTRATION" ? enumRef("DURATION", value) : serializeString(value)))
    .join(", ")}]`;
}

function serializeDescriptionEntry(entry: SpellDescriptionEntry): string {
  if (typeof entry === "string") {
    return serializeString(entry);
  }

  return `{ type: "list", style: ${serializeString(entry.style)}, items: ${serializeStringArray(
    entry.items
  )} }`;
}

function serializeDescription(entries: SpellDescriptionEntry[]): string {
  if (entries.length === 0) {
    return "[]";
  }

  return `[\n    ${entries.map(serializeDescriptionEntry).join(",\n    ")}\n  ]`;
}

function serializeDamageAmount(amount: WeaponDamageAmount): string {
  return typeof amount === "number" ? String(amount) : enumRef("DICE", amount);
}

function serializeDamageType(damageType: WeaponDamageType): string {
  return Array.isArray(damageType)
    ? `[${damageType.map((entry) => enumRef("DAMAGE_TYPE", entry)).join(", ")}]`
    : enumRef("DAMAGE_TYPE", damageType);
}

function serializeDamage(damage: WeaponDamage): string {
  if (damage.length === 0) {
    return "[]";
  }

  return `[\n    ${damage
    .map(([amount, damageType]) => `[${serializeDamageAmount(amount)}, ${serializeDamageType(damageType)}]`)
    .join(",\n    ")}\n  ]`;
}

function serializeHealing(healing: SpellHealing): string {
  if (!Array.isArray(healing)) {
    return `{ label: ${serializeString(healing.label)} }`;
  }

  if (healing.length === 0) {
    return "[]";
  }

  return `[${healing
    .map((amount) => {
      if (amount === "spellcastingAbility") {
        return serializeString(amount);
      }

      return serializeDamageAmount(amount);
    })
    .join(", ")}]`;
}

function serializeSpellEntry(entry: GeneratedSpellEntry): string {
  const trackerKeyByValue: Record<string, string> = {
    tracked: "TRACKED",
    "semi-tracked": "SEMI_TRACKED",
    "not-tracked": "NOT_TRACKED"
  };
  const properties = [
    `id: ${serializeString(entry.id)}`,
    `name: ${serializeString(entry.name)}`,
    "category: ENTRY_CATEGORIES.SPELLS",
    `source: ${serializeSource(entry.source)}`,
    ...(entry.legacyIds?.length ? [`legacyIds: ${serializeStringArray(entry.legacyIds)}`] : []),
    ...(entry.legacyNames?.length
      ? [`legacyNames: ${serializeStringArray(entry.legacyNames)}`]
      : []),
    `trackingState: ${enumRef("TRACKER", trackerKeyByValue[entry.trackingState] ?? "NOT_TRACKED")}`,
    `magicSchool: ${enumRef("MAGIC_SCHOOL", entry.magicSchool)}`,
    `castingTime: ${serializeCastingTime(entry.castingTime)}`,
    `range: ${serializeString(entry.range)}`,
    `components: ${serializeEnumArray("SPELL_COMPONENT", entry.components)}`,
    `duration: ${serializeDuration(entry.duration)}`,
    `description: ${serializeDescription(entry.description)}`,
    ...(entry.isHealingSpell ? ["isHealingSpell: true"] : []),
    ...(entry.isSavingThrowSpell ? ["isSavingThrowSpell: true"] : []),
    ...(entry.savingThrowAbility
      ? [`savingThrowAbility: ${enumRef("ABILITY_TYPES", entry.savingThrowAbility)}`]
      : []),
    ...(entry.isAttackSpell ? ["isAttackSpell: true"] : []),
    ...(entry.isDamagingSpell ? ["isDamagingSpell: true"] : []),
    `damage: ${serializeDamage(entry.damage)}`,
    `healing: ${serializeHealing(entry.healing)}`,
    `spellLists: ${serializeEnumArray("SPELL_LIST_CLASS", entry.spellLists)}`,
    `spellLevel: ${entry.spellLevel}`,
    ...(entry.ritual ? ["ritual: true"] : [])
  ];

  return `export const ${toVariableName(entry.name)}: SpellEntry = {\n  ${properties.join(
    ",\n  "
  )}\n};`;
}

function renderSpellLevelFile(level: number, entries: GeneratedSpellEntry[]): string {
  const variableNames = entries.map((entry) => toVariableName(entry.name));

  return `import {\n  ABILITY_TYPES,\n  ACTION_TYPE,\n  DURATION,\n  DAMAGE_TYPE,\n  DICE,\n  ENTRY_CATEGORIES,\n  MAGIC_SCHOOL,\n  SPELL_COMPONENT,\n  SPELL_LIST_CLASS,\n  TRACKER\n} from "../../entries/enums";\nimport type { SpellEntry } from "../../entries/types";\n\n${entries
    .map(serializeSpellEntry)
    .join("\n\n")}\n\nexport const spellEntries${level}: SpellEntry[] = [\n  ${variableNames.join(
    ",\n  "
  )}\n];\n`;
}

function groupEntriesByLevel(entries: GeneratedSpellEntry[]): Map<number, GeneratedSpellEntry[]> {
  const entriesByLevel = new Map<number, GeneratedSpellEntry[]>();

  for (let level = 0; level <= 9; level += 1) {
    entriesByLevel.set(level, []);
  }

  entries.forEach((entry) => {
    const entriesForLevel = entriesByLevel.get(entry.spellLevel);

    if (entriesForLevel) {
      entriesForLevel.push(entry);
    }
  });

  entriesByLevel.forEach((entriesForLevel) => {
    entriesForLevel.sort((left, right) => left.name.localeCompare(right.name));
  });

  return entriesByLevel;
}

function buildGeneratedSpellEntries(
  currentSpellEntries: CodexSpellEntry[],
  srd2024Records: Open5eSpellRecord[]
): GeneratedSpellEntry[] {
  const currentByName = new Map(
    currentSpellEntries.map((entry) => [normalizeLookupName(entry.name), entry] as const)
  );
  const aliasByCanonicalName = new Map(
    spellAliasMigrations.map((migration) => [
      normalizeLookupName(migration.canonicalName),
      migration
    ])
  );
  const consumedCurrentIds = new Set<string>();
  const generatedEntries: GeneratedSpellEntry[] = [];

  srd2024Records.forEach((record) => {
    const aliasMigration = aliasByCanonicalName.get(normalizeLookupName(record.name));
    const currentEntry =
      currentByName.get(normalizeLookupName(record.name)) ??
      (aliasMigration ? currentByName.get(normalizeLookupName(aliasMigration.legacyName)) : undefined);

    if (currentEntry) {
      consumedCurrentIds.add(currentEntry.id);
    }

    generatedEntries.push(createSrdSpellEntry(record, currentEntry, aliasMigration));
  });

  currentSpellEntries.forEach((entry) => {
    if (consumedCurrentIds.has(entry.id)) {
      return;
    }

    if (entry.source?.documentKey === srd2024DocumentKey) {
      return;
    }

    generatedEntries.push(createLegacySpellEntry(entry));
  });

  return generatedEntries.sort((left, right) => {
    if (left.spellLevel !== right.spellLevel) {
      return left.spellLevel - right.spellLevel;
    }

    return left.name.localeCompare(right.name);
  });
}

async function writeSpellFiles(entries: GeneratedSpellEntry[], dryRun: boolean) {
  const entriesByLevel = groupEntriesByLevel(entries);

  for (const [level, entriesForLevel] of entriesByLevel.entries()) {
    const levelDir = path.join(appSpellsRoot, `spells${level}`);
    const filePath = path.join(levelDir, "index.ts");
    const contents = renderSpellLevelFile(level, entriesForLevel);

    if (!dryRun) {
      await mkdir(levelDir, { recursive: true });
      await writeFile(filePath, contents, "utf8");
    }
  }
}

function createReport(entries: GeneratedSpellEntry[], srd2024Records: Open5eSpellRecord[]) {
  const srdEntries = entries.filter((entry) => entry.source.documentKey === srd2024DocumentKey);
  const legacyEntries = entries.filter((entry) => entry.source.documentKey !== srd2024DocumentKey);
  const aliasEntries = entries.filter(
    (entry) => (entry.legacyIds?.length ?? 0) > 0 || (entry.legacyNames?.length ?? 0) > 0
  );

  return {
    snapshotSrd2024Records: srd2024Records.length,
    generatedTotal: entries.length,
    generatedSrd2024: srdEntries.length,
    generatedLegacy: legacyEntries.length,
    generatedAliasMigrations: aliasEntries.length,
    expectedTotal: expectedSrd2024SpellCount + expectedLegacySpellCount,
    expectedSrd2024: expectedSrd2024SpellCount,
    expectedLegacy: expectedLegacySpellCount
  };
}

async function main() {
  const snapshotDir = await getSnapshotDir();
  const open5eRecords = await loadOpen5eSpellRecords(snapshotDir);
  const srd2024Records = open5eRecords
    .filter((record) => record.document?.key === srd2024DocumentKey)
    .sort((left, right) => left.name.localeCompare(right.name));
  const currentSpellEntries = await loadCurrentSpellEntries();
  const generatedEntries = buildGeneratedSpellEntries(currentSpellEntries, srd2024Records);
  const dryRun = hasDryRunArg();

  await writeSpellFiles(generatedEntries, dryRun);

  const report = createReport(generatedEntries, srd2024Records);
  console.log(JSON.stringify({ dryRun, snapshotDir, ...report }, null, 2));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
