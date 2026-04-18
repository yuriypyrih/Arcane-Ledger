import type { SpellDescriptionEntry } from "../../codex/entries";
import type { Character } from "../../types";
import type { ActionCategory, EconomyType } from "./actionEconomy";
import { createDefaultFeatureActionDescription } from "./classFeatures/featureActionDescription";
import { getFeatureDescriptionForCharacter } from "./classFeatures/featureDescriptions";
import {
  getFeatureActionOptionsForCharacter,
  getFeatureActionsForCharacter,
  type FeatureActionCard,
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

type GameplayActionBase = {
  key: string;
  name: string;
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
  resources: FeatureActionResource[];
};

export type GameplayActionDrawerDefinition =
  | (GameplayActionDrawerBase & {
      kind: "confirm";
      confirmLabel: string;
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

function createFeatureActionResources(action: FeatureActionCard): FeatureActionResource[] {
  if (action.resources && action.resources.length > 0) {
    return action.resources;
  }

  if (action.usesTotal && action.usesTotal > 0) {
    return [
      {
        kind: "tracker",
        label: action.usesSupplementaryLabel ? "Charges" : "Uses",
        current: Math.max(0, action.usesRemaining ?? 0),
        total: action.usesTotal,
        value: action.usesLabel,
        tone: action.usesTone ?? "default",
        icon: action.usesIcon,
        supplementary: [action.usesInlineLabel, action.usesInlineSuffix]
          .filter((entry): entry is string => Boolean(entry))
          .join(" ")
      }
    ];
  }

  if (action.usesLabel) {
    return [
      createTextResource("Usage", action.usesLabel, action.usesTone ?? "default", action.usesIcon)
    ];
  }

  if (action.valueLabel) {
    return [createTextResource("Value", action.valueLabel)];
  }

  return [];
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
  const resources = action.drawer?.resources ?? createFeatureActionResources(action);
  const eyebrow = action.drawer?.eyebrow;
  const confirmLabel = action.drawer?.confirmLabel ?? execute.label ?? action.name;

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
      resources,
      selection: action.drawer?.optionSelection ?? "single-immediate",
      selectionLimit: action.drawer?.optionSelectionLimit,
      options: options.map((option) => ({
        ...option,
        description: createOptionDescription(option),
        facts: createOptionFacts(option),
        resources: createOptionResources(option)
      })),
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
      resources,
      formKind:
        action.drawer?.formKind ??
        (execute.kind === "custom-form" ? execute.formKind : "lay-on-hands"),
      options: options.map((option) => ({
        ...option,
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
      resources,
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
    resources,
    confirmLabel
  };
}

function createFeatureActionDefinition(
  character: Character,
  action: FeatureActionCard
): GameplayActionDefinition {
  const options = getFeatureActionOptionsForCharacter(character, action.key);
  const execute = createFeatureActionExecute(action, options);

  return {
    kind: "feature",
    key: action.key,
    name: action.name,
    economyType: action.economyType,
    actionCategory: action.actionCategory,
    economyMultiCount: action.economyMultiCount,
    disabled: action.disabled,
    disabledReason: action.disabledReason,
    action,
    execute,
    drawer: createFeatureActionDrawer(character, action, options, execute)
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

function createWeaponActionDefinition(action: WeaponAction): GameplayActionDefinition {
  return {
    kind: "weapon",
    key: action.key,
    name: action.name,
    economyType: action.economyType,
    actionCategory: action.actionCategory,
    economyMultiCount: action.economyMultiCount,
    action,
    execute: {
      kind: "weapon-roll",
      label: "Roll Attack"
    },
    drawer: {
      kind: "weapon-roll",
      eyebrow: action.drawerEyebrow ?? "Weapon Attack",
      description: action.description ?? [],
      descriptionAdditions: action.descriptionAdditions ?? [],
      facts: createWeaponActionFacts(action),
      resources: [],
      confirmLabel: "Roll Attack"
    }
  };
}

export function getCombatActionsForCharacter(character: Character): GameplayActionDefinition[] {
  const featureActions = getFeatureActionsForCharacter(character).map((action) =>
    createFeatureActionDefinition(character, action)
  );
  const weaponActions = getWeaponActionsForCharacter(character).map((action) =>
    createWeaponActionDefinition(action)
  );

  return [...featureActions, ...weaponActions];
}
