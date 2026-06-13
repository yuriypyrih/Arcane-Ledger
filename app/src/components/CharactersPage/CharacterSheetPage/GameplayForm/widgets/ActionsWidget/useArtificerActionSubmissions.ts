import { useState } from "react";
import { captureAppError } from "../../../../../../lib/sentry";
import type { Character, ItemRecord } from "../../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../../pages/CharactersPage/CharacterSheetPage/types";
import type { GameplayActionDefinition } from "../../../../../../pages/CharactersPage/combatActions";
import {
  addArtificerExperimentalElixirToInventory,
  addArtificerReplicateMagicItemToInventory,
  addArtificerTinkersMagicItemToInventory,
  artificerArcaneFirearmActionKey,
  artificerChargeMagicItemActionKey,
  artificerDrainMagicItemActionKey,
  artificerEldritchCannonActionKey,
  artificerExperimentalElixirActionKey,
  artificerReplicateMagicItemActionKey,
  artificerSteelDefenderActionKey,
  artificerTinkersMagicActionKey,
  artificerTransmuteMagicItemActionKey,
  chargeArtificerMagicItemForCharacter,
  consumeArtificerTinkersMagicUse,
  createArtificerEldritchCannonForCharacter,
  createArtificerSteelDefenderForCharacter,
  drainArtificerMagicItemForCharacter,
  setArtificerArcaneFirearmForCharacter,
  transmuteArtificerMagicItemForCharacter,
  type ArtificerEldritchCannonOptionKey,
  type ArtificerExperimentalElixirOptionKey
} from "../../../../../../pages/CharactersPage/classFeatures/artificer/artificer";
import type { FeatureActionCard } from "../../../../../../pages/CharactersPage/classFeatures";
import { getRoundTrackerResourceForEconomyType } from "../../../../../../pages/CharactersPage/actionEconomy";
import type { RoundTrackerResource } from "../../../../../../pages/CharactersPage/combat";
import { consumeRoundTrackerResourceForCharacter } from "../../gameplayStateUtils";

type UseArtificerActionSubmissionsArgs = {
  selectedAction: GameplayActionDefinition | null;
  selectedFeatureAction: FeatureActionCard | null;
  onPersistCharacter: PersistCharacterUpdater;
  closeActionDrawer: () => void;
  prepareCharacterForResourceConsumption: (
    character: Character,
    resource: RoundTrackerResource | null
  ) => Character;
};

function isSelectedFeatureAction(
  selectedAction: GameplayActionDefinition | null,
  selectedFeatureAction: FeatureActionCard | null,
  actionKey: string
): selectedFeatureAction is FeatureActionCard {
  return (
    selectedAction?.kind === "feature" &&
    selectedFeatureAction !== null &&
    selectedFeatureAction.key === actionKey
  );
}

export function useArtificerActionSubmissions({
  selectedAction,
  selectedFeatureAction,
  onPersistCharacter,
  closeActionDrawer,
  prepareCharacterForResourceConsumption
}: UseArtificerActionSubmissionsArgs) {
  const [isTinkersMagicSubmitting, setIsTinkersMagicSubmitting] = useState(false);
  const [isReplicateMagicItemSubmitting, setIsReplicateMagicItemSubmitting] = useState(false);
  const [isArcaneFirearmSubmitting, setIsArcaneFirearmSubmitting] = useState(false);
  const [isEldritchCannonSubmitting, setIsEldritchCannonSubmitting] = useState(false);
  const [isSteelDefenderSubmitting, setIsSteelDefenderSubmitting] = useState(false);
  const [isExperimentalElixirSubmitting, setIsExperimentalElixirSubmitting] = useState(false);
  const [isArtificerMagicItemTinkerSubmitting, setIsArtificerMagicItemTinkerSubmitting] =
    useState(false);

  function applySelectedFeatureAction(
    updateCharacter: (character: Character) => Character
  ): boolean {
    if (!selectedFeatureAction) {
      return false;
    }

    let didApply = false;

    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(
        selectedFeatureAction.economyType
      );
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter = updateCharacter(preparedCharacter);

      if (nextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      didApply = true;

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(nextCharacter, roundTrackerResource)
        : nextCharacter;
    });

    return didApply;
  }

  async function submitArtificerTinkersMagic(item: ItemRecord) {
    if (
      !isSelectedFeatureAction(
        selectedAction,
        selectedFeatureAction,
        artificerTinkersMagicActionKey
      )
    ) {
      return;
    }

    if (!item.key) {
      throw new Error("Choose an item for Tinker's Magic.");
    }

    setIsTinkersMagicSubmitting(true);

    try {
      const didApply = applySelectedFeatureAction((preparedCharacter) => {
        const chargedCharacter = consumeArtificerTinkersMagicUse(preparedCharacter);

        return chargedCharacter === preparedCharacter
          ? preparedCharacter
          : addArtificerTinkersMagicItemToInventory(chargedCharacter, item);
      });

      if (!didApply) {
        throw new Error("Tinker's Magic has no uses remaining.");
      }

      closeActionDrawer();
    } catch (error) {
      console.error("Failed to conjure Tinker's Magic item.", error);
      captureAppError(error, {
        area: "gameplay-actions",
        action: "tinkers-magic"
      });
      throw error;
    } finally {
      setIsTinkersMagicSubmitting(false);
    }
  }

  async function submitArtificerReplicateMagicItem(item: ItemRecord, planKey: string | null) {
    if (
      !isSelectedFeatureAction(
        selectedAction,
        selectedFeatureAction,
        artificerReplicateMagicItemActionKey
      )
    ) {
      return;
    }

    if (!item.key) {
      throw new Error("Choose an item for Replicate Magic Item.");
    }

    setIsReplicateMagicItemSubmitting(true);

    try {
      let didApply = false;

      onPersistCharacter((currentCharacter) => {
        const nextCharacter = addArtificerReplicateMagicItemToInventory(currentCharacter, item, {
          planKey
        });

        if (nextCharacter === currentCharacter) {
          return currentCharacter;
        }

        didApply = true;
        return nextCharacter;
      });

      if (!didApply) {
        throw new Error("Replicate Magic Item is at its maximum active creations.");
      }

      closeActionDrawer();
    } catch (error) {
      console.error("Failed to create Replicate Magic Item.", error);
      captureAppError(error, {
        area: "gameplay-actions",
        action: "replicate-magic-item"
      });
      throw error;
    } finally {
      setIsReplicateMagicItemSubmitting(false);
    }
  }

  async function submitArtificerExperimentalElixir(
    optionKey: ArtificerExperimentalElixirOptionKey,
    spellSlotLevel: number | null
  ) {
    if (
      !isSelectedFeatureAction(
        selectedAction,
        selectedFeatureAction,
        artificerExperimentalElixirActionKey
      )
    ) {
      return;
    }

    setIsExperimentalElixirSubmitting(true);

    try {
      const didApply = applySelectedFeatureAction((preparedCharacter) =>
        addArtificerExperimentalElixirToInventory(preparedCharacter, optionKey, spellSlotLevel)
      );

      if (!didApply) {
        throw new Error("Experimental Elixir could not be created.");
      }

      closeActionDrawer();
    } catch (error) {
      console.error("Failed to create Experimental Elixir.", error);
      captureAppError(error, {
        area: "gameplay-actions",
        action: "experimental-elixir"
      });
      throw error;
    } finally {
      setIsExperimentalElixirSubmitting(false);
    }
  }

  async function submitArtificerEldritchCannon(
    optionKey: ArtificerEldritchCannonOptionKey,
    spellSlotLevel: number | null
  ) {
    if (
      !isSelectedFeatureAction(
        selectedAction,
        selectedFeatureAction,
        artificerEldritchCannonActionKey
      )
    ) {
      return;
    }

    setIsEldritchCannonSubmitting(true);

    try {
      const didApply = applySelectedFeatureAction((preparedCharacter) =>
        createArtificerEldritchCannonForCharacter(preparedCharacter, optionKey, spellSlotLevel)
      );

      if (!didApply) {
        throw new Error("Eldritch Cannon could not be created.");
      }

      closeActionDrawer();
    } catch (error) {
      console.error("Failed to create Eldritch Cannon.", error);
      captureAppError(error, {
        area: "gameplay-actions",
        action: "eldritch-cannon"
      });
      throw error;
    } finally {
      setIsEldritchCannonSubmitting(false);
    }
  }

  async function submitArtificerSteelDefender(spellSlotLevel: number | null) {
    if (
      !isSelectedFeatureAction(
        selectedAction,
        selectedFeatureAction,
        artificerSteelDefenderActionKey
      )
    ) {
      return;
    }

    setIsSteelDefenderSubmitting(true);

    try {
      const didApply = applySelectedFeatureAction((preparedCharacter) =>
        createArtificerSteelDefenderForCharacter(preparedCharacter, spellSlotLevel)
      );

      if (!didApply) {
        throw new Error("Steel Defender could not be created.");
      }

      closeActionDrawer();
    } catch (error) {
      console.error("Failed to create Steel Defender.", error);
      captureAppError(error, {
        area: "gameplay-actions",
        action: "steel-defender"
      });
      throw error;
    } finally {
      setIsSteelDefenderSubmitting(false);
    }
  }

  async function submitArtificerArcaneFirearm(stackId: string) {
    if (
      !isSelectedFeatureAction(
        selectedAction,
        selectedFeatureAction,
        artificerArcaneFirearmActionKey
      )
    ) {
      return;
    }

    if (!stackId) {
      throw new Error("Choose an item for Arcane Firearm.");
    }

    setIsArcaneFirearmSubmitting(true);

    try {
      const didApply = applySelectedFeatureAction((preparedCharacter) =>
        setArtificerArcaneFirearmForCharacter(preparedCharacter, stackId)
      );

      if (!didApply) {
        throw new Error("Arcane Firearm could not be applied.");
      }

      closeActionDrawer();
    } catch (error) {
      console.error("Failed to apply Arcane Firearm.", error);
      captureAppError(error, {
        area: "gameplay-actions",
        action: "arcane-firearm"
      });
      throw error;
    } finally {
      setIsArcaneFirearmSubmitting(false);
    }
  }

  async function submitArtificerChargeMagicItem(stackId: string, spellSlotLevel: number) {
    if (
      !isSelectedFeatureAction(
        selectedAction,
        selectedFeatureAction,
        artificerChargeMagicItemActionKey
      )
    ) {
      return;
    }

    setIsArtificerMagicItemTinkerSubmitting(true);

    try {
      const didApply = applySelectedFeatureAction((preparedCharacter) =>
        chargeArtificerMagicItemForCharacter(preparedCharacter, stackId, spellSlotLevel)
      );

      if (!didApply) {
        throw new Error("Charge Magic Item could not be used.");
      }

      closeActionDrawer();
    } catch (error) {
      console.error("Failed to charge magic item.", error);
      captureAppError(error, {
        area: "gameplay-actions",
        action: "charge-magic-item"
      });
      throw error;
    } finally {
      setIsArtificerMagicItemTinkerSubmitting(false);
    }
  }

  async function submitArtificerDrainMagicItem(stackId: string) {
    if (
      !isSelectedFeatureAction(
        selectedAction,
        selectedFeatureAction,
        artificerDrainMagicItemActionKey
      )
    ) {
      return;
    }

    setIsArtificerMagicItemTinkerSubmitting(true);

    try {
      const didApply = applySelectedFeatureAction((preparedCharacter) =>
        drainArtificerMagicItemForCharacter(preparedCharacter, stackId)
      );

      if (!didApply) {
        throw new Error("Drain Magic Item could not be used.");
      }

      closeActionDrawer();
    } catch (error) {
      console.error("Failed to drain magic item.", error);
      captureAppError(error, {
        area: "gameplay-actions",
        action: "drain-magic-item"
      });
      throw error;
    } finally {
      setIsArtificerMagicItemTinkerSubmitting(false);
    }
  }

  async function submitArtificerTransmuteMagicItem(
    stackId: string,
    item: ItemRecord,
    planKey: string | null
  ) {
    if (
      !isSelectedFeatureAction(
        selectedAction,
        selectedFeatureAction,
        artificerTransmuteMagicItemActionKey
      )
    ) {
      return;
    }

    if (!item.key) {
      throw new Error("Choose an item for Transmute Magic Item.");
    }

    setIsArtificerMagicItemTinkerSubmitting(true);

    try {
      const didApply = applySelectedFeatureAction((preparedCharacter) =>
        transmuteArtificerMagicItemForCharacter(preparedCharacter, stackId, item, planKey)
      );

      if (!didApply) {
        throw new Error("Transmute Magic Item could not be used.");
      }

      closeActionDrawer();
    } catch (error) {
      console.error("Failed to transmute magic item.", error);
      captureAppError(error, {
        area: "gameplay-actions",
        action: "transmute-magic-item"
      });
      throw error;
    } finally {
      setIsArtificerMagicItemTinkerSubmitting(false);
    }
  }

  return {
    isArcaneFirearmSubmitting,
    isArtificerMagicItemTinkerSubmitting,
    isEldritchCannonSubmitting,
    isExperimentalElixirSubmitting,
    isReplicateMagicItemSubmitting,
    isSteelDefenderSubmitting,
    isTinkersMagicSubmitting,
    submitArtificerArcaneFirearm,
    submitArtificerChargeMagicItem,
    submitArtificerDrainMagicItem,
    submitArtificerEldritchCannon,
    submitArtificerExperimentalElixir,
    submitArtificerReplicateMagicItem,
    submitArtificerSteelDefender,
    submitArtificerTinkersMagic,
    submitArtificerTransmuteMagicItem
  };
}
