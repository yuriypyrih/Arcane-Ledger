export type RogueSneakAttackEffectKey =
  | "poison"
  | "trip"
  | "withdraw"
  | "terrify"
  | "daze"
  | "knock-out"
  | "obscure"
  | "stealth-attack";

export type RogueSneakAttackEffectDefinition = {
  key: RogueSneakAttackEffectKey;
  name: string;
  costDice: number;
  referenceDescription: string[];
};
