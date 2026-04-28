import type { Character } from "../../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../../pages/CharactersPage/CharacterSheetPage/types";

export type RoundTrackerAvailability = {
  isInCombat?: boolean;
  actionAvailable: boolean;
  bonusActionAvailable: boolean;
  reactionAvailable: boolean;
};

export type ActionsWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

export type FontOfMagicSelection =
  | {
      kind: "slot-to-points";
      spellSlotLevel: number;
    }
  | {
      kind: "points-to-slot";
      spellSlotLevel: number;
    };

export type WildCompanionResourceKind = "wild-shape" | "spell-slot";

export type WildResurgenceMode = "spell-slot-to-wild-shape" | "wild-shape-to-slot";

export type BlessingOfTheTricksterTarget = "self" | "other";
