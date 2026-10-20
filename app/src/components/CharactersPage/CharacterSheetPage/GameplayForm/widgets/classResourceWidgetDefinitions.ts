import {
  Flame,
  Brain,
  Wind,
  Hexagon,
  Pentagon,
  PawPrint,
  Music,
  Sparkles,
  Ghost
} from "lucide-react";
import type { CharacterSheetSectionProfilerId } from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetSectionProfiler";
import { namedResources } from "../../../../../pages/CharactersPage/managedClassResources";
import type { CounterResourceTarget } from "../../../../../pages/CharactersPage/resourceManagement";
import type { ResourceCountWidgetIcon } from "./ResourceCountWidget";
import pyromancyIcon from "../../../../../assets/svg/pyromancy.svg";

export type ClassResourceWidgetDefinition = Omit<CounterResourceTarget, "id"> & {
  id: CharacterSheetSectionProfilerId;
  icon: ResourceCountWidgetIcon;
};

export const classResourceWidgets: ClassResourceWidgetDefinition[] = [
  {
    ...namedResources["soul-trinkets"],
    id: "gameplay-soul-trinkets",
    icon: { kind: "lucide", icon: Ghost }
  },
  { ...namedResources["rage"], id: "gameplay-rage", icon: { kind: "lucide", icon: Flame } },
  { ...namedResources["focus"], id: "gameplay-focus", icon: { kind: "lucide", icon: Brain } },
  {
    ...namedResources["second-wind"],
    id: "gameplay-fighter-second-wind",
    icon: { kind: "lucide", icon: Wind }
  },
  {
    ...namedResources["psi-energy"],
    id: "gameplay-psi-energy",
    icon: { kind: "lucide", icon: Hexagon }
  },
  {
    ...namedResources["psionic-dice"],
    id: "gameplay-soulknife-psionic-dice",
    icon: { kind: "lucide", icon: Hexagon }
  },
  {
    ...namedResources["superiority-dice"],
    id: "gameplay-superiority-dice",
    icon: { kind: "lucide", icon: Pentagon }
  },
  {
    ...namedResources["wild-shape"],
    id: "gameplay-wild-shape",
    icon: { kind: "lucide", icon: PawPrint }
  },
  {
    ...namedResources["bardic-inspiration"],
    id: "gameplay-bardic-inspiration",
    icon: { kind: "lucide", icon: Music }
  },
  {
    ...namedResources["sorcery"],
    id: "gameplay-sorcery",
    icon: { kind: "lucide", icon: Sparkles }
  },
  {
    ...namedResources["divinity"],
    id: "gameplay-divinity",
    icon: { kind: "image", src: pyromancyIcon }
  }
];
