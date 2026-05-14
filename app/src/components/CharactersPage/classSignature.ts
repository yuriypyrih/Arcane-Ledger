import type { CSSProperties } from "react";
import artificerSignatureTexture from "../../assets/img/artificer.jpg";
import barbarianSignatureTexture from "../../assets/img/barbarian.jpg";
import bardSignatureTexture from "../../assets/img/bard.jpg";
import clericSignatureTexture from "../../assets/img/cleric.jpg";
import druidSignatureTexture from "../../assets/img/druid.jpg";
import fighterSignatureTexture from "../../assets/img/fighter.jpg";
import monkSignatureTexture from "../../assets/img/monk.jpg";
import paladinSignatureTexture from "../../assets/img/paladin.jpg";
import rangerSignatureTexture from "../../assets/img/ranger.jpg";
import rogueSignatureTexture from "../../assets/img/rogue.jpg";
import sorcererSignatureTexture from "../../assets/img/sorcerer.jpg";
import warlockSignatureTexture from "../../assets/img/warlock.jpg";
import wizardSignatureTexture from "../../assets/img/wizard.jpg";

type ClassSignatureStyle = CSSProperties & {
  "--class-signature-row-gradient": string;
  "--class-signature-profile-gradient": string;
  "--class-signature-page-texture": string;
  "--class-signature-page-texture-opacity": string;
};

type ClassSignatureSpec = {
  texture?: string;
  rowGradient: string;
  profileGradient: string;
};

const signatureRowDarkLayer =
  "linear-gradient(140deg, rgba(13, 10, 9, 0.62) 0%, rgba(13, 10, 9, 0.34) 2.8%, rgba(13, 10, 9, 0) 11.2%)";
const signatureProfileDarkLayer =
  "linear-gradient(140deg, rgba(13, 10, 9, 0.66) 0%, rgba(13, 10, 9, 0.36) 2.4%, rgba(13, 10, 9, 0) 9.6%)";

function createClassSignature({
  texture,
  primary,
  secondary,
  transparent
}: {
  texture: string;
  primary: string;
  secondary: string;
  transparent: string;
}): ClassSignatureSpec {
  return {
    texture,
    rowGradient: `${signatureRowDarkLayer}, linear-gradient(140deg, ${primary} 0%, ${primary} 7.2%, ${secondary} 16%, ${transparent} 38.4%)`,
    profileGradient: `${signatureProfileDarkLayer}, linear-gradient(140deg, ${primary} 0%, ${primary} 5.6%, ${secondary} 12.8%, ${transparent} 35.2%)`
  };
}

const defaultClassSignatureStyle: ClassSignatureStyle = {
  "--class-signature-row-gradient": `${signatureRowDarkLayer}, linear-gradient(140deg, rgba(143, 91, 56, 0.26) 0%, rgba(143, 91, 56, 0.26) 7.2%, rgba(220, 178, 139, 0.14) 16%, rgba(220, 178, 139, 0) 38.4%)`,
  "--class-signature-profile-gradient": `${signatureProfileDarkLayer}, linear-gradient(140deg, rgba(143, 91, 56, 0.34) 0%, rgba(143, 91, 56, 0.34) 5.6%, rgba(220, 178, 139, 0.18) 12.8%, rgba(220, 178, 139, 0) 35.2%)`,
  "--class-signature-page-texture": "none",
  "--class-signature-page-texture-opacity": "0"
};

const classPageTextureByClass: Record<string, string> = {
  artificer: artificerSignatureTexture,
  barbarian: barbarianSignatureTexture,
  bard: bardSignatureTexture,
  cleric: clericSignatureTexture,
  druid: druidSignatureTexture,
  fighter: fighterSignatureTexture,
  monk: monkSignatureTexture,
  paladin: paladinSignatureTexture,
  ranger: rangerSignatureTexture,
  rogue: rogueSignatureTexture,
  sorcerer: sorcererSignatureTexture,
  warlock: warlockSignatureTexture,
  wizard: wizardSignatureTexture
};

const classSignatureByClass: Record<string, ClassSignatureSpec> = {
  artificer: createClassSignature({
    texture: artificerSignatureTexture,
    primary: "rgba(0, 112, 232, 0.42)",
    secondary: "rgba(188, 128, 52, 0.26)",
    transparent: "rgba(0, 112, 232, 0)"
  }),
  barbarian: createClassSignature({
    texture: barbarianSignatureTexture,
    primary: "rgba(218, 24, 12, 0.46)",
    secondary: "rgba(76, 12, 8, 0.32)",
    transparent: "rgba(218, 24, 12, 0)"
  }),
  bard: createClassSignature({
    texture: bardSignatureTexture,
    primary: "rgba(175, 28, 122, 0.44)",
    secondary: "rgba(212, 126, 72, 0.24)",
    transparent: "rgba(175, 28, 122, 0)"
  }),
  cleric: createClassSignature({
    texture: clericSignatureTexture,
    primary: "rgba(238, 190, 56, 0.48)",
    secondary: "rgba(255, 250, 224, 0.34)",
    transparent: "rgba(238, 190, 56, 0)"
  }),
  druid: createClassSignature({
    texture: druidSignatureTexture,
    primary: "rgba(36, 118, 48, 0.48)",
    secondary: "rgba(148, 172, 66, 0.28)",
    transparent: "rgba(36, 118, 48, 0)"
  }),
  fighter: createClassSignature({
    texture: fighterSignatureTexture,
    primary: "rgba(194, 42, 18, 0.48)",
    secondary: "rgba(158, 82, 42, 0.3)",
    transparent: "rgba(194, 42, 18, 0)"
  }),
  monk: createClassSignature({
    texture: monkSignatureTexture,
    primary: "rgba(224, 154, 0, 0.48)",
    secondary: "rgba(105, 76, 18, 0.3)",
    transparent: "rgba(224, 154, 0, 0)"
  }),
  paladin: createClassSignature({
    texture: paladinSignatureTexture,
    primary: "rgba(226, 176, 38, 0.46)",
    secondary: "rgba(58, 70, 76, 0.26)",
    transparent: "rgba(226, 176, 38, 0)"
  }),
  ranger: createClassSignature({
    texture: rangerSignatureTexture,
    primary: "rgba(52, 124, 48, 0.48)",
    secondary: "rgba(154, 168, 86, 0.28)",
    transparent: "rgba(52, 124, 48, 0)"
  }),
  rogue: createClassSignature({
    texture: rogueSignatureTexture,
    primary: "rgba(68, 58, 76, 0.46)",
    secondary: "rgba(18, 18, 24, 0.34)",
    transparent: "rgba(68, 58, 76, 0)"
  }),
  sorcerer: createClassSignature({
    texture: sorcererSignatureTexture,
    primary: "rgba(126, 54, 204, 0.46)",
    secondary: "rgba(214, 120, 74, 0.24)",
    transparent: "rgba(126, 54, 204, 0)"
  }),
  warlock: createClassSignature({
    texture: warlockSignatureTexture,
    primary: "rgba(112, 48, 182, 0.5)",
    secondary: "rgba(104, 156, 58, 0.26)",
    transparent: "rgba(112, 48, 182, 0)"
  }),
  wizard: createClassSignature({
    texture: wizardSignatureTexture,
    primary: "rgba(28, 106, 220, 0.48)",
    secondary: "rgba(72, 156, 244, 0.26)",
    transparent: "rgba(28, 106, 220, 0)"
  })
};

export function getClassSignatureStyle(className: string): ClassSignatureStyle {
  const normalizedClassName = className.trim().toLowerCase();
  const signature = classSignatureByClass[normalizedClassName];
  const classPageTexture = signature?.texture ?? classPageTextureByClass[normalizedClassName];

  if (!signature && !classPageTexture) {
    return defaultClassSignatureStyle;
  }

  return {
    "--class-signature-row-gradient":
      signature?.rowGradient ?? defaultClassSignatureStyle["--class-signature-row-gradient"],
    "--class-signature-profile-gradient":
      signature?.profileGradient ??
      defaultClassSignatureStyle["--class-signature-profile-gradient"],
    "--class-signature-page-texture": `url("${classPageTexture}")`,
    "--class-signature-page-texture-opacity": "0.9"
  };
}
