import type { LucideIcon } from "lucide-react";
import { BookOpen, Dices, ScrollText } from "lucide-react";

export type HomeCard = {
  title: string;
  description: string;
  to: string;
  icon: LucideIcon;
};

export const homeCards: HomeCard[] = [
  {
    title: "Dice Roller",
    description: "Throw quick dice, enter formulas, and track a short in-session history.",
    to: "/dice",
    icon: Dices
  },
  {
    title: "Character Sheets",
    description: "Create and adjust lightweight character records without leaving the table.",
    to: "/characters",
    icon: ScrollText
  },
  {
    title: "Codex",
    description: "Search placeholder rules content for spells, weapons, armor, and core rules.",
    to: "/codex",
    icon: BookOpen
  }
];
