import type { LucideIcon } from "lucide-react";
import { BookOpen, ScrollText, Users } from "lucide-react";

export type NavigationLink = {
  to: string;
  label: string;
  icon: LucideIcon;
  requiresAuth?: boolean;
};

export const navigationLinks: NavigationLink[] = [
  { to: "/gm-tools", label: "GM", icon: ScrollText, requiresAuth: true },
  { to: "/characters", label: "Characters", icon: Users },
  { to: "/compendium", label: "Compendium", icon: BookOpen }
];
