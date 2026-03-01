import type { LucideIcon } from "lucide-react";
import { BookOpen, Dices, Home, ScrollText } from "lucide-react";

export type NavigationLink = {
  to: string;
  label: string;
  icon: LucideIcon;
};

export const navigationLinks: NavigationLink[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/dice", label: "Dice", icon: Dices },
  { to: "/characters", label: "Characters", icon: ScrollText },
  { to: "/codex", label: "Codex", icon: BookOpen }
];
