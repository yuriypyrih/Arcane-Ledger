import type { CSSProperties } from "react";

type ClassSignatureStyle = CSSProperties & {
  "--class-signature-row-gradient": string;
  "--class-signature-profile-gradient": string;
  "--class-signature-page-texture": string;
  "--class-signature-page-texture-opacity": string;
};

type ClassSignatureSpec = {
  getTexture: () => string;
  rowGradient: string;
  profileGradient: string;
};

const signatureRowDarkLayer =
  "linear-gradient(140deg, rgba(13, 10, 9, 0.62) 0%, rgba(13, 10, 9, 0.34) 2.8%, rgba(13, 10, 9, 0) 11.2%)";
const signatureProfileDarkLayer =
  "linear-gradient(140deg, rgba(13, 10, 9, 0.66) 0%, rgba(13, 10, 9, 0.36) 2.4%, rgba(13, 10, 9, 0) 9.6%)";

function createClassSignature({
  getTexture,
  primary,
  secondary,
  transparent
}: {
  getTexture: () => string;
  primary: string;
  secondary: string;
  transparent: string;
}): ClassSignatureSpec {
  return {
    getTexture,
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

const classPageTextureByClass: Record<string, () => string> = {
  artificer: () => new URL("../../assets/img/artificer.jpg", import.meta.url).href,
  barbarian: () => new URL("../../assets/img/barbarian.jpg", import.meta.url).href,
  bard: () => new URL("../../assets/img/bard.jpg", import.meta.url).href,
  cleric: () => new URL("../../assets/img/cleric.jpg", import.meta.url).href,
  druid: () => new URL("../../assets/img/druid.jpg", import.meta.url).href,
  fighter: () => new URL("../../assets/img/fighter.jpg", import.meta.url).href,
  monk: () => new URL("../../assets/img/monk.jpg", import.meta.url).href,
  paladin: () => new URL("../../assets/img/paladin.jpg", import.meta.url).href,
  ranger: () => new URL("../../assets/img/ranger.jpg", import.meta.url).href,
  rogue: () => new URL("../../assets/img/rogue.jpg", import.meta.url).href,
  sorcerer: () => new URL("../../assets/img/sorcerer.jpg", import.meta.url).href,
  warlock: () => new URL("../../assets/img/warlock.jpg", import.meta.url).href,
  wizard: () => new URL("../../assets/img/wizard.jpg", import.meta.url).href
};

const classSignatureByClass: Record<string, ClassSignatureSpec> = {
  artificer: createClassSignature({
    getTexture: classPageTextureByClass.artificer,
    primary: "rgba(0, 112, 232, 0.42)",
    secondary: "rgba(188, 128, 52, 0.26)",
    transparent: "rgba(0, 112, 232, 0)"
  }),
  barbarian: createClassSignature({
    getTexture: classPageTextureByClass.barbarian,
    primary: "rgba(218, 24, 12, 0.46)",
    secondary: "rgba(76, 12, 8, 0.32)",
    transparent: "rgba(218, 24, 12, 0)"
  }),
  bard: createClassSignature({
    getTexture: classPageTextureByClass.bard,
    primary: "rgba(175, 28, 122, 0.44)",
    secondary: "rgba(212, 126, 72, 0.24)",
    transparent: "rgba(175, 28, 122, 0)"
  }),
  cleric: createClassSignature({
    getTexture: classPageTextureByClass.cleric,
    primary: "rgba(238, 190, 56, 0.48)",
    secondary: "rgba(255, 250, 224, 0.34)",
    transparent: "rgba(238, 190, 56, 0)"
  }),
  druid: createClassSignature({
    getTexture: classPageTextureByClass.druid,
    primary: "rgba(36, 118, 48, 0.48)",
    secondary: "rgba(148, 172, 66, 0.28)",
    transparent: "rgba(36, 118, 48, 0)"
  }),
  fighter: createClassSignature({
    getTexture: classPageTextureByClass.fighter,
    primary: "rgba(194, 42, 18, 0.48)",
    secondary: "rgba(158, 82, 42, 0.3)",
    transparent: "rgba(194, 42, 18, 0)"
  }),
  monk: createClassSignature({
    getTexture: classPageTextureByClass.monk,
    primary: "rgba(224, 154, 0, 0.48)",
    secondary: "rgba(105, 76, 18, 0.3)",
    transparent: "rgba(224, 154, 0, 0)"
  }),
  paladin: createClassSignature({
    getTexture: classPageTextureByClass.paladin,
    primary: "rgba(226, 176, 38, 0.46)",
    secondary: "rgba(58, 70, 76, 0.26)",
    transparent: "rgba(226, 176, 38, 0)"
  }),
  ranger: createClassSignature({
    getTexture: classPageTextureByClass.ranger,
    primary: "rgba(52, 124, 48, 0.48)",
    secondary: "rgba(154, 168, 86, 0.28)",
    transparent: "rgba(52, 124, 48, 0)"
  }),
  rogue: createClassSignature({
    getTexture: classPageTextureByClass.rogue,
    primary: "rgba(68, 58, 76, 0.46)",
    secondary: "rgba(18, 18, 24, 0.34)",
    transparent: "rgba(68, 58, 76, 0)"
  }),
  sorcerer: createClassSignature({
    getTexture: classPageTextureByClass.sorcerer,
    primary: "rgba(126, 54, 204, 0.46)",
    secondary: "rgba(214, 120, 74, 0.24)",
    transparent: "rgba(126, 54, 204, 0)"
  }),
  warlock: createClassSignature({
    getTexture: classPageTextureByClass.warlock,
    primary: "rgba(112, 48, 182, 0.5)",
    secondary: "rgba(104, 156, 58, 0.26)",
    transparent: "rgba(112, 48, 182, 0)"
  }),
  wizard: createClassSignature({
    getTexture: classPageTextureByClass.wizard,
    primary: "rgba(28, 106, 220, 0.48)",
    secondary: "rgba(72, 156, 244, 0.26)",
    transparent: "rgba(28, 106, 220, 0)"
  })
};

export function getClassSignatureStyle(className: string): ClassSignatureStyle {
  const normalizedClassName = className.trim().toLowerCase();
  const signature = classSignatureByClass[normalizedClassName];
  const classPageTexture =
    signature?.getTexture() ?? classPageTextureByClass[normalizedClassName]?.();

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
