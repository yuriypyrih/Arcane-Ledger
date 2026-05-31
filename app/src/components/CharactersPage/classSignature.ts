import type { CSSProperties } from "react";

type ClassSignatureStyle = CSSProperties & {
  "--class-signature-corner-image": string;
  "--class-signature-corner-opacity": string;
  "--class-signature-corner-size": string;
  "--class-signature-page-texture": string;
  "--class-signature-page-texture-opacity": string;
};

type ClassCornerArtSpec = {
  getCornerImage: () => string;
};

const defaultClassSignatureStyle: ClassSignatureStyle = {
  "--class-signature-corner-image": "none",
  "--class-signature-corner-opacity": "0",
  "--class-signature-corner-size": "250px",
  "--class-signature-page-texture": "none",
  "--class-signature-page-texture-opacity": "0"
};

const classPageTextureByClass: Record<string, () => string> = {
  artificer: () => new URL("../../assets/img/artificer.webp", import.meta.url).href,
  barbarian: () => new URL("../../assets/img/barbarian.webp", import.meta.url).href,
  bard: () => new URL("../../assets/img/bard.webp", import.meta.url).href,
  cleric: () => new URL("../../assets/img/cleric.webp", import.meta.url).href,
  druid: () => new URL("../../assets/img/druid.webp", import.meta.url).href,
  fighter: () => new URL("../../assets/img/fighter.webp", import.meta.url).href,
  monk: () => new URL("../../assets/img/monk.webp", import.meta.url).href,
  paladin: () => new URL("../../assets/img/paladin.webp", import.meta.url).href,
  ranger: () => new URL("../../assets/img/ranger.webp", import.meta.url).href,
  rogue: () => new URL("../../assets/img/rogue.webp", import.meta.url).href,
  sorcerer: () => new URL("../../assets/img/sorcerer.webp", import.meta.url).href,
  warlock: () => new URL("../../assets/img/warlock.webp", import.meta.url).href,
  wizard: () => new URL("../../assets/img/wizard.webp", import.meta.url).href
};

const classCornerArtByClass: Record<string, ClassCornerArtSpec> = {
  artificer: {
    getCornerImage: () =>
      new URL("../../assets/img/class-corners/artificer-corner.webp", import.meta.url).href
  },
  barbarian: {
    getCornerImage: () =>
      new URL("../../assets/img/class-corners/barbarian-corner.webp", import.meta.url).href
  },
  bard: {
    getCornerImage: () =>
      new URL("../../assets/img/class-corners/bard-corner.webp", import.meta.url).href
  },
  cleric: {
    getCornerImage: () =>
      new URL("../../assets/img/class-corners/cleric-corner.webp", import.meta.url).href
  },
  druid: {
    getCornerImage: () =>
      new URL("../../assets/img/class-corners/druid-corner.webp", import.meta.url).href
  },
  fighter: {
    getCornerImage: () =>
      new URL("../../assets/img/class-corners/fighter-corner.webp", import.meta.url).href
  },
  monk: {
    getCornerImage: () =>
      new URL("../../assets/img/class-corners/monk-corner.webp", import.meta.url).href
  },
  paladin: {
    getCornerImage: () =>
      new URL("../../assets/img/class-corners/paladin-corner.webp", import.meta.url).href
  },
  ranger: {
    getCornerImage: () =>
      new URL("../../assets/img/class-corners/ranger-corner.webp", import.meta.url).href
  },
  rogue: {
    getCornerImage: () =>
      new URL("../../assets/img/class-corners/rogue-corner.webp", import.meta.url).href
  },
  sorcerer: {
    getCornerImage: () =>
      new URL("../../assets/img/class-corners/sorcerer-corner.webp", import.meta.url).href
  },
  warlock: {
    getCornerImage: () =>
      new URL("../../assets/img/class-corners/warlock-corner.webp", import.meta.url).href
  },
  wizard: {
    getCornerImage: () =>
      new URL("../../assets/img/class-corners/wizard-corner.webp", import.meta.url).href
  }
};

export function getClassSignatureStyle(className: string): ClassSignatureStyle {
  const normalizedClassName = className.trim().toLowerCase();
  const cornerImage = classCornerArtByClass[normalizedClassName]?.getCornerImage();
  const classPageTexture = classPageTextureByClass[normalizedClassName]?.();

  if (!cornerImage && !classPageTexture) {
    return defaultClassSignatureStyle;
  }

  return {
    "--class-signature-corner-image": cornerImage ? `url("${cornerImage}")` : "none",
    "--class-signature-corner-opacity": cornerImage ? "1" : "0",
    "--class-signature-corner-size": defaultClassSignatureStyle["--class-signature-corner-size"],
    "--class-signature-page-texture": classPageTexture ? `url("${classPageTexture}")` : "none",
    "--class-signature-page-texture-opacity": classPageTexture ? "0.9" : "0"
  };
}
