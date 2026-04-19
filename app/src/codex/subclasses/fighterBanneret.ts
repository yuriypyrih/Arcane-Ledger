function createBanneretGroupRecoveryDescription(rangeLabel: string) {
  return [
    `When you use your Second Wind to regain Hit Points, you can choose a number of allies within a ${rangeLabel} <link:Emanation>Emanation</link> originating from yourself, up to a number of allies equal to your <link:CHA>Charisma</link> modifier (minimum of one).`,
    "Each of those allies regains Hit Points equal to <strong>1d4</strong> plus your Fighter level.",
    "Once you use this ability, you can't use it again until you finish a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link>."
  ] as const;
}

function createBanneretRallyingSurgeDescription(rangeLabel: string) {
  return [
    `When you use your Action Surge, you can choose allies within a ${rangeLabel} <link:Emanation>Emanation</link> originating from yourself, up to a number of allies equal to your <link:CHA>Charisma</link> modifier (minimum of one).`,
    "Each of those allies can immediately take a Reaction to use one of the following options.",
    "<strong>Attack.</strong> The ally makes one attack with a weapon or an Unarmed Strike.",
    "<strong>Move.</strong> The ally moves up to half its <link:Speed>Speed</link> without provoking an Opportunity Attack."
  ] as const;
}

export const banneretGroupRecoveryDescription =
  createBanneretGroupRecoveryDescription("30-foot");

export const banneretBolsteredGroupRecoveryDescription =
  createBanneretGroupRecoveryDescription("<strong>60-foot</strong>");

export const banneretTeamTacticsDescription = [
  "When you use Group Recovery, each chosen ally has <link:Advantage>Advantage</link> on <strong>D20</strong> Tests until the start of your next turn."
] as const;

export const banneretRallyingSurgeDescription =
  createBanneretRallyingSurgeDescription("30-foot");

export const banneretBolsteredRallyingSurgeDescription =
  createBanneretRallyingSurgeDescription("<strong>60-foot</strong>");

export const banneretSharedResilienceDescription = [
  "When an ally you can see within 60 feet of yourself fails a saving throw, you can take a Reaction to expend a use of your Indomitable feature.",
  "The ally can immediately reroll the saving throw with a bonus equal to your Fighter level.",
  "The ally must use the new roll."
] as const;
