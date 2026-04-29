import { createElement, type ReactNode } from "react";
import { Brain, Flame, Hexagon, Music, PawPrint, Pentagon, Sparkles, Wind } from "lucide-react";
import animaIcon from "../../../assets/svg/anima.svg";
import pyromancyIcon from "../../../assets/svg/pyromancy.svg";
import type { FeatureActionIcon } from "../../../pages/CharactersPage/classFeatures";

export type FeatureUsageIconOptions = {
  iconClassName?: string;
  imageIconClassName?: string;
};

export function renderFeatureUsageIcon(
  icon?: FeatureActionIcon,
  { iconClassName, imageIconClassName }: FeatureUsageIconOptions = {}
): ReactNode {
  if (icon === "anima") {
    return createElement("img", { src: animaIcon, alt: "", className: imageIconClassName });
  }

  if (icon === "brain") {
    return createElement(Brain, { size: 14, strokeWidth: 2.1, className: iconClassName });
  }

  if (icon === "sparkles") {
    return createElement(Sparkles, { size: 14, strokeWidth: 2.1, className: iconClassName });
  }

  if (icon === "music") {
    return createElement(Music, { size: 14, strokeWidth: 2.1, className: iconClassName });
  }

  if (icon === "flame") {
    return createElement(Flame, { size: 14, strokeWidth: 2.1, className: iconClassName });
  }

  if (icon === "superiority") {
    return createElement(Pentagon, { size: 14, strokeWidth: 2.1, className: iconClassName });
  }

  if (icon === "wind") {
    return createElement(Wind, { size: 14, strokeWidth: 2.1, className: iconClassName });
  }

  if (icon === "paw") {
    return createElement(PawPrint, { size: 14, strokeWidth: 2.1, className: iconClassName });
  }

  if (icon === "psi") {
    return createElement(Hexagon, { size: 14, strokeWidth: 2.1, className: iconClassName });
  }

  if (icon === "pyromancy") {
    return createElement("img", { src: pyromancyIcon, alt: "", className: imageIconClassName });
  }

  return null;
}
