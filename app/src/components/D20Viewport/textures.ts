import * as THREE from "three";
import type { NaturalOutcome } from "../../types";

type ValueTexturePalette = {
  fill: string;
  stroke: string;
  shadowColor: string;
  shadowBlur: number;
  fontSize: number;
  lineWidth: number;
  glowFill: string;
  glowFontSize: number;
  glowBlur: number;
};

function getValueTexturePalette(naturalOutcome: NaturalOutcome): ValueTexturePalette {
  if (naturalOutcome === "natural20") {
    return {
      fill: "#ffd54d",
      stroke: "rgba(116, 68, 8, 0.96)",
      shadowColor: "rgba(255, 219, 92, 0.94)",
      shadowBlur: 30,
      fontSize: 142,
      lineWidth: 16,
      glowFill: "rgba(255, 238, 162, 0.98)",
      glowFontSize: 158,
      glowBlur: 48
    };
  }

  if (naturalOutcome === "natural1") {
    return {
      fill: "#ff6767",
      stroke: "rgba(18, 7, 11, 0.96)",
      shadowColor: "rgba(74, 6, 14, 0.92)",
      shadowBlur: 34,
      fontSize: 142,
      lineWidth: 16,
      glowFill: "rgba(255, 141, 141, 0.96)",
      glowFontSize: 158,
      glowBlur: 52
    };
  }

  return {
    fill: "#fff3d7",
    stroke: "rgba(11, 20, 39, 0.68)",
    shadowColor: "rgba(21, 10, 5, 0.28)",
    shadowBlur: 5,
    fontSize: 128,
    lineWidth: 14,
    glowFill: "rgba(255, 243, 215, 0.62)",
    glowFontSize: 128,
    glowBlur: 5
  };
}

export function createValueTexture(
  value: number,
  naturalOutcome: NaturalOutcome = null
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("2D canvas context is unavailable.");
  }

  const palette = getValueTexturePalette(naturalOutcome);
  const label = String(value);

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.translate(canvas.width / 2, canvas.height / 2);
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.lineJoin = "round";
  context.font = `900 ${palette.glowFontSize}px Georgia`;
  context.fillStyle = palette.glowFill;
  context.shadowColor = palette.shadowColor;
  context.shadowBlur = palette.glowBlur;
  context.fillText(label, 0, 3);
  context.font = `800 ${palette.fontSize}px Georgia`;
  context.shadowBlur = 0;
  context.lineWidth = palette.lineWidth;
  context.strokeStyle = palette.stroke;
  context.strokeText(label, 0, 3);
  context.fillStyle = palette.fill;
  context.shadowColor = palette.shadowColor;
  context.shadowBlur = palette.shadowBlur;
  context.fillText(label, 0, 3);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  return texture;
}

function drawRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const safeRadius = Math.min(radius, width / 2, height / 2);

  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
}

export function createTypeTexture(text: string): {
  texture: THREE.CanvasTexture;
  aspect: number;
} {
  const measureCanvas = document.createElement("canvas");
  const measureContext = measureCanvas.getContext("2d");

  if (!measureContext) {
    throw new Error("2D canvas context is unavailable.");
  }

  measureContext.font = "700 62px Trebuchet MS";
  const textWidth = Math.ceil(measureContext.measureText(text).width);
  const horizontalPadding = 20;
  const verticalPadding = 8;
  const badgeInset = 4;
  const badgeHeight = 62 + verticalPadding * 2;
  const canvas = document.createElement("canvas");
  canvas.width = textWidth + horizontalPadding * 2 + badgeInset * 2;
  canvas.height = badgeHeight + badgeInset * 2;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("2D canvas context is unavailable.");
  }

  drawRoundedRect(
    context,
    badgeInset,
    badgeInset,
    canvas.width - badgeInset * 2,
    badgeHeight,
    18
  );
  context.fillStyle = "rgba(17, 12, 9, 0.74)";
  context.fill();

  context.strokeStyle = "rgba(255, 243, 222, 0.28)";
  context.lineWidth = 2;
  context.stroke();

  context.font = "700 62px Trebuchet MS";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "rgba(255, 243, 222, 0.9)";
  context.fillText(text, canvas.width / 2, canvas.height / 2 + 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  return {
    texture,
    aspect: canvas.width / canvas.height
  };
}

export function createRoughnessTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("2D canvas context is unavailable.");
  }

  context.fillStyle = "rgb(112,112,112)";
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let index = 0; index < 2200; index += 1) {
    const shade = 88 + Math.floor(Math.random() * 68);
    const alpha = 0.12 + Math.random() * 0.2;
    context.fillStyle = `rgba(${shade}, ${shade}, ${shade}, ${alpha})`;
    const size = 1 + Math.random() * 3;
    context.fillRect(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      size,
      size
    );
  }

  for (let band = 0; band < 24; band += 1) {
    context.strokeStyle = `rgba(150,150,150,${0.04 + Math.random() * 0.04})`;
    context.lineWidth = 8 + Math.random() * 10;
    context.beginPath();
    const startY = (band / 24) * canvas.height + (Math.random() - 0.5) * 10;
    context.moveTo(0, startY);

    for (let x = 0; x <= canvas.width; x += 18) {
      context.lineTo(x, startY + Math.sin((x + band * 13) * 0.07) * 4);
    }

    context.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  texture.needsUpdate = true;
  return texture;
}
