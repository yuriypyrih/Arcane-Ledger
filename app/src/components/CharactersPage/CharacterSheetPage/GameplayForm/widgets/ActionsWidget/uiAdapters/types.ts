import type { ReactNode } from "react";
import type { ActionsWidgetDrawerBodyContext, ActionsWidgetDrawerFooterContext } from "../types";
export type ActionFormBodyContext = ActionsWidgetDrawerBodyContext;
export type ActionFormFooterContext = ActionsWidgetDrawerFooterContext & {
  selectedFeaturePrimaryLabel: string;
  confirmSelectedActionToast: (callback: () => void) => () => void;
};
export type ActionFormAdapter = {
  body?: (context: ActionFormBodyContext) => ReactNode;
  footer?: (context: ActionFormFooterContext) => ReactNode;
};

export type { FeatureActionFormKind as ActionFormKind } from "../../../../../../../pages/CharactersPage/classFeatures/types";
