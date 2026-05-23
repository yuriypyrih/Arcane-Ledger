const undefinedArtificerPlanScopeKey = "undefined";

export function createArtificerPlanScopeKey(artificerPlans?: string[]): string {
  return artificerPlans === undefined
    ? undefinedArtificerPlanScopeKey
    : JSON.stringify(artificerPlans);
}

export function getArtificerPlansFromScopeKey(scopeKey: string): string[] | undefined {
  return scopeKey === undefinedArtificerPlanScopeKey ? undefined : JSON.parse(scopeKey);
}
