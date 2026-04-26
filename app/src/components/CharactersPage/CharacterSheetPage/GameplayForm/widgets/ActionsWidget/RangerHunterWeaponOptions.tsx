import FeatureOptInToggle from "../../../FeatureOptInToggle/FeatureOptInToggle";
import type {
  RangerHunterColossusSlayerOptionState,
  RangerHunterHordeBreakerOptionState
} from "../../../../../../pages/CharactersPage/classFeatures/ranger/subclasses/rangerHunter";

type RangerHunterWeaponOptionsProps = {
  colossusSlayerState: RangerHunterColossusSlayerOptionState | null;
  hordeBreakerState: RangerHunterHordeBreakerOptionState | null;
  isColossusSlayerSelected: boolean;
  isHordeBreakerSelected: boolean;
  colossusSlayerDisabled: boolean;
  hordeBreakerDisabled: boolean;
  onColossusSlayerChange: (checked: boolean) => void;
  onHordeBreakerChange: (checked: boolean) => void;
};

function RangerHunterWeaponOptions({
  colossusSlayerState,
  hordeBreakerState,
  isColossusSlayerSelected,
  isHordeBreakerSelected,
  colossusSlayerDisabled,
  hordeBreakerDisabled,
  onColossusSlayerChange,
  onHordeBreakerChange
}: RangerHunterWeaponOptionsProps) {
  return (
    <>
      {colossusSlayerState ? (
        <FeatureOptInToggle
          label="Colossus Slayer"
          checked={isColossusSlayerSelected}
          disabled={colossusSlayerDisabled}
          muted={colossusSlayerDisabled}
          onCheckedChange={onColossusSlayerChange}
          title={colossusSlayerState.disabledReason ?? undefined}
          application={{
            qualifierText: "Once per turn",
            targetLabel: "Damage"
          }}
          usageKey="colossus-slayer"
        />
      ) : null}
      {hordeBreakerState ? (
        <FeatureOptInToggle
          label="Horde Breaker"
          checked={isHordeBreakerSelected}
          disabled={hordeBreakerDisabled}
          muted={hordeBreakerDisabled}
          onCheckedChange={onHordeBreakerChange}
          title={hordeBreakerState.disabledReason ?? undefined}
          application={{
            qualifierText: "Once per turn",
            targetLabel: "Attack"
          }}
          usageKey="horde-breaker"
        />
      ) : null}
    </>
  );
}

export default RangerHunterWeaponOptions;
