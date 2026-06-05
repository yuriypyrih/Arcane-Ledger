import type { SpellDescriptionEntry } from "../../codex/entries";
import type { Character } from "../../types";
import type { ActionCategory, EconomyType } from "./actionEconomy";
import { ACTION_CARD_THEME, resolveActionCardTheme } from "./actionCardTheme";
import { measureCharacterRuntime } from "./characterRuntime/performance";
import {
  createChargesHeaderTag,
  createFeatureActionHeaderTagPool,
  markUsageHeaderTagsAsFallback,
  createUsageHeaderTag
} from "./classFeatures/cardUsage";
import { createDefaultFeatureActionDescription } from "./classFeatures/featureActionDescription";
import { getFeatureDescriptionForCharacter } from "./classFeatures/featureDescriptions";
import {
  getFeatureActionOptionsForCharacter,
  getFeatureActionsForCharacter,
  type FeatureActionCard,
  type FeatureActionHeaderTag,
  type FeatureActionDrawerConfig,
  type FeatureActionExecuteConfig,
  type FeatureActionFact,
  type FeatureActionIcon,
  type FeatureActionOptionCard,
  type FeatureActionOptionSelection,
  type FeatureActionResource,
  type FeatureActionTone
} from "./classFeatures";
import { getWeaponActionsForCharacter, type WeaponAction } from "./gameplay";
import { getWeaponActionDrawerDescriptionAdditions } from "./weaponActionDrawerDescriptions";

type GameplayActionBase = {
  key: string;
  name: string;
  cardTheme?: ACTION_CARD_THEME;
  economyType: EconomyType;
  actionCategory: ActionCategory;
  economyMultiCount?: number;
  disabled?: boolean;
  disabledReason?: string;
};

export type GameplayActionExecuteDefinition =
  | FeatureActionExecuteConfig
  | {
      kind: "weapon-roll";
      label?: string;
    };

type GameplayActionDrawerBase = {
  eyebrow?: string;
  description: SpellDescriptionEntry[];
  descriptionAdditions: SpellDescriptionEntry[][];
  helperText?: string;
  helperTextTone?: FeatureActionTone;
  blockedReason?: string;
  facts: FeatureActionFact[];
  factsSectionTitle?: string | null;
  headerTags: FeatureActionHeaderTag[];
};

export type GameplayActionDrawerDefinition =
  | (GameplayActionDrawerBase & {
      kind: "confirm";
      confirmLabel?: string;
    })
  | (GameplayActionDrawerBase & {
      kind: "options";
      selection: FeatureActionOptionSelection;
      selectionLimit?: number;
      options: FeatureActionOptionCard[];
      confirmLabel?: string;
    })
  | (GameplayActionDrawerBase & {
      kind: "custom-form";
      formKind: NonNullable<FeatureActionDrawerConfig["formKind"]>;
      options?: FeatureActionOptionCard[];
    })
  | (GameplayActionDrawerBase & {
      kind: "spell-list";
      confirmLabel?: string;
    })
  | (GameplayActionDrawerBase & {
      kind: "weapon-roll";
      confirmLabel: string;
    });

export type GameplayActionDefinition =
  | (GameplayActionBase & {
      kind: "feature";
      action: FeatureActionCard;
      execute: GameplayActionExecuteDefinition;
      drawer: GameplayActionDrawerDefinition;
    })
  | (GameplayActionBase & {
      kind: "weapon";
      action: WeaponAction;
      execute: GameplayActionExecuteDefinition;
      drawer: GameplayActionDrawerDefinition;
    });

const combatActionsByCharacter = new WeakMap<Character, GameplayActionDefinition[]>();

function createTextResource(
  label: string,
  value: string,
  tone: FeatureActionTone = "default",
  icon?: FeatureActionIcon
): FeatureActionResource {
  return {
    kind: "text",
    label,
    value,
    tone,
    icon
  };
}

function createFeatureActionHeaderTags(action: FeatureActionCard): FeatureActionHeaderTag[] {
  const headerTags = action.drawer?.headerTags ?? action.headerTags;

  if (headerTags && headerTags.length > 0) {
    return action.cardUsage?.mode === "charges-or-resource"
      ? markUsageHeaderTagsAsFallback(headerTags)
      : headerTags;
  }

  const normalizedHeaderTags: FeatureActionHeaderTag[] = [];

  const appendUsageTag = () => {
    if (
      !action.cardUsage ||
      action.cardUsage.mode === "charges" ||
      action.cardUsage.mode === "free" ||
      action.cardUsage.mode === "text"
    ) {
      return;
    }

    const usageCost = action.cardUsage.cost;

    if (action.usesTotal && action.usesTotal > 0) {
      normalizedHeaderTags.push(
        createUsageHeaderTag(
          usageCost,
          createFeatureActionHeaderTagPool(action.usesRemaining ?? 0, action.usesTotal, {
            icon: usageCost.icon
          }),
          {
            isFallback: action.cardUsage?.mode === "charges-or-resource"
          }
        )
      );
    }
  };

  if (action.cardUsage) {
    switch (action.cardUsage.mode) {
      case "charges":
        normalizedHeaderTags.push(
          createChargesHeaderTag(action.cardUsage.charges.current, action.cardUsage.charges.total)
        );
        break;
      case "charges-and-resource":
      case "charges-or-resource":
        normalizedHeaderTags.push(
          createChargesHeaderTag(action.cardUsage.charges.current, action.cardUsage.charges.total)
        );
        appendUsageTag();
        break;
      case "named-resource":
        appendUsageTag();
        break;
      case "free":
      default:
        break;
    }
  }

  return normalizedHeaderTags;
}

function createFeatureActionFacts(action: FeatureActionCard): FeatureActionFact[] {
  if (action.facts && action.facts.length > 0) {
    return action.facts;
  }

  const facts: FeatureActionFact[] = [];

  if (action.valueLabel) {
    facts.push({
      label: "Value",
      value: action.valueLabel
    });
  }

  return facts;
}

function createOptionDescription(option: FeatureActionOptionCard): SpellDescriptionEntry[] {
  if (option.description && option.description.length > 0) {
    return option.description;
  }

  return createDefaultFeatureActionDescription(option);
}

function createOptionFacts(option: FeatureActionOptionCard): FeatureActionFact[] {
  if (option.facts && option.facts.length > 0) {
    return option.facts;
  }

  const facts: FeatureActionFact[] = [];

  if (option.resultLabel) {
    facts.push({
      label: "Result",
      value: option.resultLabel
    });
  }

  if (option.rangeResultLabel) {
    facts.push({
      label: "Range",
      value: option.rangeResultLabel
    });
  }

  return facts;
}

function createOptionResources(option: FeatureActionOptionCard): FeatureActionResource[] {
  if (option.resources && option.resources.length > 0) {
    return option.resources;
  }

  if (option.usesLabel) {
    return [createTextResource("Usage", option.usesLabel, "default", option.usesIcon)];
  }

  return [];
}

function createFeatureActionExecute(
  action: FeatureActionCard,
  options: FeatureActionOptionCard[]
): GameplayActionExecuteDefinition {
  if (action.execute) {
    return action.execute;
  }

  if (action.drawer?.kind === "custom-form" && action.drawer.formKind) {
    return {
      kind: "custom-form",
      formKind: action.drawer.formKind
    };
  }

  if (options.length > 0) {
    return {
      kind: "option"
    };
  }

  return {
    kind: "activate"
  };
}

function formatFeatureActionSourceEyebrow(action: FeatureActionCard): string | undefined {
  const actionSource = action.actionSource;

  if (!actionSource) {
    return undefined;
  }

  const sourceName = actionSource.name.trim();

  if (!sourceName) {
    return undefined;
  }

  switch (actionSource.type) {
    case "class":
      return `CLASS: ${sourceName.toUpperCase()}`;
    case "subclass":
      return `SUBCLASS: ${sourceName.toUpperCase()}`;
    case "species":
      return `SPECIES: ${sourceName.toUpperCase()}`;
    case "feat":
      return `FEAT: ${sourceName.toUpperCase()}`;
    default:
      return undefined;
  }
}

function mergeUniqueDescriptionAdditions(
  sections: Array<readonly SpellDescriptionEntry[] | undefined>
): SpellDescriptionEntry[][] {
  const seenSections = new Set<string>();

  return sections.flatMap((section) => {
    if (!section || section.length <= 0) {
      return [];
    }

    const serializedSection = JSON.stringify(section);

    if (seenSections.has(serializedSection)) {
      return [];
    }

    seenSections.add(serializedSection);
    return [[...section]];
  });
}

function createFeatureActionDrawer(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>,
  action: FeatureActionCard,
  options: FeatureActionOptionCard[],
  execute: GameplayActionExecuteDefinition
): GameplayActionDrawerDefinition {
  const drawerKind =
    action.drawer?.kind ??
    (execute.kind === "custom-form"
      ? "custom-form"
      : execute.kind === "spell" && execute.spellSource !== "fixed"
        ? "spell-list"
        : options.length > 0
          ? "options"
          : "confirm");
  const hasExplicitActionDescription = Boolean(action.description && action.description.length > 0);
  const sourcedDescription =
    !action.drawer?.description && !hasExplicitActionDescription && action.sourceFeature
      ? getFeatureDescriptionForCharacter(character, action.sourceFeature)
      : [];
  const description =
    action.drawer?.description ??
    action.description ??
    (sourcedDescription.length > 0
      ? sourcedDescription
      : createDefaultFeatureActionDescription(action));
  const descriptionAdditions = mergeUniqueDescriptionAdditions([
    ...(action.descriptionAdditions ?? []),
    ...(action.drawer?.descriptionAdditions ?? [])
  ]);
  const helperText = action.drawer?.helperText;
  const helperTextTone = action.drawer?.helperTextTone;
  const blockedReason = action.drawer?.blockedReason;
  const facts = action.drawer?.facts ?? createFeatureActionFacts(action);
  const factsSectionTitle = action.drawer?.factsSectionTitle;
  const headerTags = createFeatureActionHeaderTags(action);
  const eyebrow = formatFeatureActionSourceEyebrow(action) ?? action.drawer?.eyebrow;
  const confirmLabel = action.drawer?.confirmLabel ?? execute.label;

  if (drawerKind === "options") {
    return {
      kind: "options",
      eyebrow,
      description,
      descriptionAdditions,
      helperText,
      helperTextTone,
      blockedReason,
      facts,
      factsSectionTitle,
      headerTags,
      selection: action.drawer?.optionSelection ?? "single-immediate",
      selectionLimit: action.drawer?.optionSelectionLimit,
      options: options.map((option) => {
        const preparedOption = {
          ...option,
          cardTheme: resolveActionCardTheme(option, action.cardTheme),
          description: createOptionDescription(option),
          facts: createOptionFacts(option),
          resources: createOptionResources(option)
        };

        return preparedOption;
      }),
      confirmLabel
    };
  }

  if (drawerKind === "custom-form") {
    return {
      kind: "custom-form",
      eyebrow,
      description,
      descriptionAdditions,
      helperText,
      helperTextTone,
      blockedReason,
      facts,
      factsSectionTitle,
      headerTags,
      formKind:
        action.drawer?.formKind ??
        (execute.kind === "custom-form" ? execute.formKind : "lay-on-hands"),
      options: options.map((option) => ({
        ...option,
        cardTheme: resolveActionCardTheme(option, action.cardTheme),
        description: createOptionDescription(option),
        facts: createOptionFacts(option),
        resources: createOptionResources(option)
      }))
    };
  }

  if (drawerKind === "spell-list") {
    return {
      kind: "spell-list",
      eyebrow,
      description,
      descriptionAdditions,
      helperText,
      helperTextTone,
      blockedReason,
      facts,
      factsSectionTitle,
      headerTags,
      confirmLabel
    };
  }

  return {
    kind: "confirm",
    eyebrow,
    description,
    descriptionAdditions,
    helperText,
    helperTextTone,
    blockedReason,
    facts,
    factsSectionTitle,
    headerTags,
    confirmLabel
  };
}

function createFeatureActionDefinition(
  character: Character,
  action: FeatureActionCard
): GameplayActionDefinition {
  const preparedAction: FeatureActionCard = {
    ...action,
    cardTheme: resolveActionCardTheme(action)
  };
  const options = getFeatureActionOptionsForCharacter(character, preparedAction.key);
  const execute = createFeatureActionExecute(preparedAction, options);

  return {
    kind: "feature",
    key: preparedAction.key,
    name: preparedAction.name,
    cardTheme: preparedAction.cardTheme,
    economyType: preparedAction.economyType,
    actionCategory: preparedAction.actionCategory,
    economyMultiCount: preparedAction.economyMultiCount,
    disabled: preparedAction.disabled,
    disabledReason: preparedAction.disabledReason,
    action: preparedAction,
    execute,
    drawer: createFeatureActionDrawer(character, preparedAction, options, execute)
  };
}

function createWeaponActionFacts(action: WeaponAction): FeatureActionFact[] {
  return [
    {
      label: "Attack Roll",
      value: action.rollFormulaDisplay
    },
    {
      label: "Damage",
      value: action.rollDisplay
    },
    {
      label: "Ability",
      value: `${action.ability} ${action.abilityModifier >= 0 ? "+" : ""}${action.abilityModifier}`
    }
  ];
}

function createWeaponActionDefinition(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "feats" | "statusEntries" | "subclassId">>,
  action: WeaponAction
): GameplayActionDefinition {
  const descriptionAdditions = mergeUniqueDescriptionAdditions(
    getWeaponActionDrawerDescriptionAdditions(character, action)
  );
  const preparedAction: WeaponAction = {
    ...action,
    cardTheme: action.cardTheme ?? ACTION_CARD_THEME.WEAPON,
    descriptionAdditions
  };

  return {
    kind: "weapon",
    key: preparedAction.key,
    name: preparedAction.name,
    cardTheme: preparedAction.cardTheme,
    economyType: preparedAction.economyType,
    actionCategory: preparedAction.actionCategory,
    economyMultiCount: preparedAction.economyMultiCount,
    action: preparedAction,
    execute: {
      kind: "weapon-roll",
      label: "Roll Attack"
    },
    drawer: {
      kind: "weapon-roll",
      eyebrow: preparedAction.drawerEyebrow ?? "Weapon Attack",
      description: preparedAction.description ?? [],
      descriptionAdditions: preparedAction.descriptionAdditions ?? [],
      facts: createWeaponActionFacts(preparedAction),
      headerTags: [],
      confirmLabel: "Roll Attack"
    }
  };
}

export function getCombatActionsForCharacter(character: Character): GameplayActionDefinition[] {
  const cachedActions = combatActionsByCharacter.get(character);

  if (cachedActions) {
    return cachedActions;
  }

  const actions = measureCharacterRuntime("character-sheet:combat-actions", () => {
    const featureActions = getFeatureActionsForCharacter(character).map((action) =>
      createFeatureActionDefinition(character, action)
    );
    const weaponActions = getWeaponActionsForCharacter(character).map((action) =>
      createWeaponActionDefinition(character, action)
    );

    return [...featureActions, ...weaponActions];
  });

  combatActionsByCharacter.set(character, actions);
  return actions;
}
