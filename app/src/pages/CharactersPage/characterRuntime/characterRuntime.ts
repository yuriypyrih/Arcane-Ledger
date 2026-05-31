import type { Character } from "../../../types";
import {
  getCombatActionsForCharacter,
  type GameplayActionDefinition
} from "../combatActions";
import { collectActiveClassFeatureState } from "../classFeatures/modules";
import {
  getFeatureActionsForCharacter,
  type FeatureActionCard
} from "../classFeatures";
import {
  getSubclassDerivedFeatureState,
  type SubclassDerivedFeatureState
} from "../classFeatures/subclasses";
import type { ClassFeatureDerivedState } from "../classFeatures/types";
import {
  collectFeatDerivedState,
  type FeatDerivedState
} from "../feats/runtime";
import {
  getWeaponActionsForCharacter,
  type WeaponAction
} from "../gameplay";
import {
  getEquipmentRuntimeForCharacter,
  type EquipmentRuntime
} from "./equipmentRuntime";
import {
  getCharacterCustomEffectRuntime,
  type CharacterCustomEffectRuntime
} from "./customEffectRuntime";
import {
  getSpellcastingRuntimeForCharacter,
  type CharacterSpellcastingRuntime,
  type SpellcastingRuntimeOptions
} from "./spellcastingRuntime";
import {
  createCharacterSpellEntryTransformer,
  type CharacterSpellEntryTransformer
} from "./spellEntryTransformer";

export type FeatureGameplayActionDefinition = Extract<
  GameplayActionDefinition,
  { kind: "feature" }
>;
export type WeaponGameplayActionDefinition = Extract<
  GameplayActionDefinition,
  { kind: "weapon" }
>;

export type CharacterRuntime = {
  readonly character: Character;
  readonly classFeatures: ClassFeatureDerivedState;
  readonly subclassFeatures: SubclassDerivedFeatureState;
  readonly feats: FeatDerivedState;
  readonly customEffects: CharacterCustomEffectRuntime;
  readonly featureActions: FeatureActionCard[];
  readonly featureActionsByKey: Map<string, FeatureActionCard>;
  readonly spellEntryTransformer: CharacterSpellEntryTransformer;
  readonly spellcasting: CharacterSpellcastingRuntime;
  readonly spellcastingWithoutSubclassSlots: CharacterSpellcastingRuntime;
  readonly equipment: EquipmentRuntime;
  readonly weaponActions: WeaponAction[];
  readonly combatActions: GameplayActionDefinition[];
  readonly combatActionsByKey: Map<string, GameplayActionDefinition>;
  readonly featureCombatActionsByKey: Map<string, FeatureGameplayActionDefinition>;
  readonly weaponCombatActionsByKey: Map<string, WeaponGameplayActionDefinition>;
  getSpellcastingRuntime(options?: SpellcastingRuntimeOptions): CharacterSpellcastingRuntime;
  getFeatureActionByKey(actionKey: string): FeatureActionCard | null;
  getCombatActionByKey(actionKey: string): GameplayActionDefinition | null;
  getFeatureCombatActionByKey(actionKey: string): FeatureGameplayActionDefinition | null;
  getWeaponCombatActionByKey(actionKey: string): WeaponGameplayActionDefinition | null;
};

const characterRuntimeCache = new WeakMap<Character, CharacterRuntime>();

class CharacterRuntimeSnapshot implements CharacterRuntime {
  private classFeaturesSnapshot: ClassFeatureDerivedState | null = null;
  private subclassFeaturesSnapshot: SubclassDerivedFeatureState | null = null;
  private featsSnapshot: FeatDerivedState | null = null;
  private customEffectsSnapshot: CharacterCustomEffectRuntime | null = null;
  private featureActionsSnapshot: FeatureActionCard[] | null = null;
  private featureActionsByKeySnapshot: Map<string, FeatureActionCard> | null = null;
  private spellEntryTransformerSnapshot: CharacterSpellEntryTransformer | null = null;
  private spellcastingSnapshot: CharacterSpellcastingRuntime | null = null;
  private spellcastingWithoutSubclassSlotsSnapshot: CharacterSpellcastingRuntime | null = null;
  private equipmentSnapshot: EquipmentRuntime | null = null;
  private weaponActionsSnapshot: WeaponAction[] | null = null;
  private combatActionsSnapshot: GameplayActionDefinition[] | null = null;
  private combatActionsByKeySnapshot: Map<string, GameplayActionDefinition> | null = null;
  private featureCombatActionsByKeySnapshot: Map<string, FeatureGameplayActionDefinition> | null =
    null;
  private weaponCombatActionsByKeySnapshot: Map<string, WeaponGameplayActionDefinition> | null =
    null;

  constructor(readonly character: Character) {}

  get classFeatures(): ClassFeatureDerivedState {
    if (!this.classFeaturesSnapshot) {
      this.classFeaturesSnapshot = collectActiveClassFeatureState(this.character);
    }

    return this.classFeaturesSnapshot;
  }

  get subclassFeatures(): SubclassDerivedFeatureState {
    if (!this.subclassFeaturesSnapshot) {
      this.subclassFeaturesSnapshot = getSubclassDerivedFeatureState(this.character);
    }

    return this.subclassFeaturesSnapshot;
  }

  get feats(): FeatDerivedState {
    if (!this.featsSnapshot) {
      this.featsSnapshot = collectFeatDerivedState(this.character);
    }

    return this.featsSnapshot;
  }

  get customEffects(): CharacterCustomEffectRuntime {
    if (!this.customEffectsSnapshot) {
      this.customEffectsSnapshot = getCharacterCustomEffectRuntime(this.character);
    }

    return this.customEffectsSnapshot;
  }

  get featureActions(): FeatureActionCard[] {
    if (!this.featureActionsSnapshot) {
      this.featureActionsSnapshot = getFeatureActionsForCharacter(this.character);
    }

    return this.featureActionsSnapshot;
  }

  get featureActionsByKey(): Map<string, FeatureActionCard> {
    if (!this.featureActionsByKeySnapshot) {
      this.featureActionsByKeySnapshot = new Map(
        this.featureActions.map((action) => [action.key, action])
      );
    }

    return this.featureActionsByKeySnapshot;
  }

  get spellEntryTransformer(): CharacterSpellEntryTransformer {
    if (!this.spellEntryTransformerSnapshot) {
      this.spellEntryTransformerSnapshot = createCharacterSpellEntryTransformer({
        character: this.character,
        classFeatures: this.classFeatures,
        subclassFeatures: this.subclassFeatures,
        feats: this.feats
      });
    }

    return this.spellEntryTransformerSnapshot;
  }

  get spellcasting(): CharacterSpellcastingRuntime {
    if (!this.spellcastingSnapshot) {
      this.spellcastingSnapshot = getSpellcastingRuntimeForCharacter(this.character);
    }

    return this.spellcastingSnapshot;
  }

  get spellcastingWithoutSubclassSlots(): CharacterSpellcastingRuntime {
    if (!this.spellcastingWithoutSubclassSlotsSnapshot) {
      this.spellcastingWithoutSubclassSlotsSnapshot = getSpellcastingRuntimeForCharacter(
        this.character,
        { includeSubclassSlots: false }
      );
    }

    return this.spellcastingWithoutSubclassSlotsSnapshot;
  }

  get equipment(): EquipmentRuntime {
    if (!this.equipmentSnapshot) {
      this.equipmentSnapshot = getEquipmentRuntimeForCharacter(this.character);
    }

    return this.equipmentSnapshot;
  }

  get weaponActions(): WeaponAction[] {
    if (!this.weaponActionsSnapshot) {
      this.weaponActionsSnapshot = getWeaponActionsForCharacter(this.character);
    }

    return this.weaponActionsSnapshot;
  }

  get combatActions(): GameplayActionDefinition[] {
    if (!this.combatActionsSnapshot) {
      this.combatActionsSnapshot = getCombatActionsForCharacter(this.character);
    }

    return this.combatActionsSnapshot;
  }

  get combatActionsByKey(): Map<string, GameplayActionDefinition> {
    if (!this.combatActionsByKeySnapshot) {
      this.combatActionsByKeySnapshot = new Map(
        this.combatActions.map((action) => [action.key, action])
      );
    }

    return this.combatActionsByKeySnapshot;
  }

  get featureCombatActionsByKey(): Map<string, FeatureGameplayActionDefinition> {
    if (!this.featureCombatActionsByKeySnapshot) {
      this.featureCombatActionsByKeySnapshot = new Map(
        this.combatActions.flatMap((action) =>
          action.kind === "feature" ? [[action.key, action]] : []
        )
      );
    }

    return this.featureCombatActionsByKeySnapshot;
  }

  get weaponCombatActionsByKey(): Map<string, WeaponGameplayActionDefinition> {
    if (!this.weaponCombatActionsByKeySnapshot) {
      this.weaponCombatActionsByKeySnapshot = new Map(
        this.combatActions.flatMap((action) =>
          action.kind === "weapon" ? [[action.key, action]] : []
        )
      );
    }

    return this.weaponCombatActionsByKeySnapshot;
  }

  getSpellcastingRuntime(options?: SpellcastingRuntimeOptions): CharacterSpellcastingRuntime {
    return options?.includeSubclassSlots === false
      ? this.spellcastingWithoutSubclassSlots
      : this.spellcasting;
  }

  getFeatureActionByKey(actionKey: string): FeatureActionCard | null {
    return this.featureActionsByKey.get(actionKey) ?? null;
  }

  getCombatActionByKey(actionKey: string): GameplayActionDefinition | null {
    return this.combatActionsByKey.get(actionKey) ?? null;
  }

  getFeatureCombatActionByKey(actionKey: string): FeatureGameplayActionDefinition | null {
    return this.featureCombatActionsByKey.get(actionKey) ?? null;
  }

  getWeaponCombatActionByKey(actionKey: string): WeaponGameplayActionDefinition | null {
    return this.weaponCombatActionsByKey.get(actionKey) ?? null;
  }
}

export function getCharacterRuntime(character: Character): CharacterRuntime {
  const cachedRuntime = characterRuntimeCache.get(character);

  if (cachedRuntime) {
    return cachedRuntime;
  }

  const runtime = new CharacterRuntimeSnapshot(character);
  characterRuntimeCache.set(character, runtime);
  return runtime;
}
