import { resolveActionCardTheme } from "./actionCardTheme";
import type { FeatureActionCard } from "./classFeatures/types";
import type { GameplayActionDefinition } from "./combatActions";

export function getFeatureActionDrawerPrimaryLabel(
  action: Pick<FeatureActionCard, "name">
): string {
  const normalizedName = action.name.trim();

  return normalizedName ? `Use ${normalizedName}` : "Use";
}

export function createCommonActionDefinition(action: FeatureActionCard): GameplayActionDefinition {
  const preparedAction: FeatureActionCard = {
    ...action,
    cardTheme: resolveActionCardTheme(action)
  };

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
    execute: {
      kind: "activate"
    },
    drawer: {
      kind: "confirm",
      eyebrow: "Common Action",
      description: preparedAction.description ?? [],
      descriptionAdditions: preparedAction.descriptionAdditions ?? [],
      helperText: preparedAction.drawer?.helperText,
      helperTextTone: preparedAction.drawer?.helperTextTone,
      blockedReason: preparedAction.drawer?.blockedReason,
      facts: preparedAction.drawer?.facts ?? preparedAction.facts ?? [],
      factsSectionTitle: preparedAction.drawer?.factsSectionTitle,
      headerTags: preparedAction.drawer?.headerTags ?? preparedAction.headerTags ?? [],
      confirmLabel:
        preparedAction.drawer?.confirmLabel ?? getFeatureActionDrawerPrimaryLabel(preparedAction)
    }
  };
}
