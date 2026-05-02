import type { LucideIcon } from "lucide-react";
import { BookOpen, ScrollText } from "lucide-react";

export type NavigationLink = {
  to: string;
  label: string;
  icon: LucideIcon;
};

export const navigationLinks: NavigationLink[] = [
  { to: "/characters", label: "Characters", icon: ScrollText },
  { to: "/library", label: "Library", icon: BookOpen }
];
