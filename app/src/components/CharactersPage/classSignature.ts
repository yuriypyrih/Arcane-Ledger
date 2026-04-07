import type { CSSProperties } from "react";
import type { ClassName } from "../../pages/CharactersPage/proficiencyClassData";

type ClassSignatureStyle = CSSProperties & {
  "--class-signature-gradient": string;
};

const defaultClassSignatureGradient =
  "linear-gradient(165deg, rgba(143, 91, 56, 0.32) 0px, rgba(220, 178, 139, 0.18) 60px, rgba(220, 178, 139, 0) 100px)";

const classSignatureGradientByClass: Record<ClassName, string> = {
  Artificer:
    "linear-gradient(165deg, rgba(185, 95, 47, 0.38) 0px, rgba(62, 151, 145, 0.2) 60px, rgba(62, 151, 145, 0) 100px)",
  Barbarian:
    "linear-gradient(165deg, rgba(170, 36, 24, 0.46) 0px, rgba(96, 61, 38, 0.24) 60px, rgba(96, 61, 38, 0) 100px)",
  Bard: "linear-gradient(165deg, rgba(225, 118, 24, 0.42) 0px, rgba(126, 76, 176, 0.24) 60px, rgba(126, 76, 176, 0) 100px)",
  Cleric:
    "linear-gradient(165deg, rgba(228, 191, 79, 0.38) 0px, rgba(255, 250, 236, 0.28) 60px, rgba(255, 250, 236, 0) 100px)",
  Druid:
    "linear-gradient(165deg, rgba(46, 120, 57, 0.42) 0px, rgba(213, 196, 79, 0.22) 60px, rgba(213, 196, 79, 0) 100px)",
  Fighter:
    "linear-gradient(165deg, rgba(216, 103, 26, 0.42) 0px, rgba(34, 34, 34, 0.26) 60px, rgba(34, 34, 34, 0) 100px)",
  Monk: "linear-gradient(165deg, rgba(232, 132, 36, 0.4) 0px, rgba(255, 251, 242, 0.3) 60px, rgba(255, 251, 242, 0) 100px)",
  Paladin:
    "linear-gradient(165deg, rgba(246, 242, 229, 0.3) 0px, rgba(219, 177, 64, 0.32) 60px, rgba(219, 177, 64, 0) 100px)",
  Ranger:
    "linear-gradient(165deg, rgba(52, 120, 70, 0.4) 0px, rgba(107, 79, 52, 0.24) 60px, rgba(107, 79, 52, 0) 100px)",
  Rogue:
    "linear-gradient(165deg, rgba(20, 20, 20, 0.34) 0px, rgba(156, 28, 44, 0.28) 60px, rgba(156, 28, 44, 0) 100px)",
  Sorcerer:
    "linear-gradient(165deg, rgba(42, 102, 214, 0.4) 0px, rgba(215, 180, 72, 0.24) 60px, rgba(215, 180, 72, 0) 100px)",
  Warlock:
    "linear-gradient(165deg, rgba(112, 64, 156, 0.42) 0px, rgba(84, 153, 65, 0.22) 60px, rgba(84, 153, 65, 0) 100px)",
  Wizard:
    "linear-gradient(165deg, rgba(58, 114, 217, 0.38) 0px, rgba(248, 252, 255, 0.28) 60px, rgba(248, 252, 255, 0) 100px)"
};

export function getClassSignatureStyle(className: string): ClassSignatureStyle {
  return {
    "--class-signature-gradient":
      classSignatureGradientByClass[className as ClassName] ?? defaultClassSignatureGradient
  };
}
