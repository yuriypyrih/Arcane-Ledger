import * as THREE from "three";
import type { DieTheme, NaturalOutcome } from "../../types";
import { CRIMSON_RED_THEME, EMERALD_GREEN_THEME, ROYAL_BLUE_THEME } from "./constants";
import { createRoughnessTexture } from "./textures";

function getTheme(theme: DieTheme) {
  if (theme === "advantage") {
    return EMERALD_GREEN_THEME;
  }

  if (theme === "disadvantage") {
    return CRIMSON_RED_THEME;
  }

  return ROYAL_BLUE_THEME;
}

function getGlowStyle(
  resolvedTheme: ReturnType<typeof getTheme>,
  naturalOutcome: NaturalOutcome
): {
  color: THREE.ColorRepresentation;
  opacity: number;
} {
  if (naturalOutcome === "natural20") {
    return {
      color: 0xffd24d,
      opacity: 0.18
    };
  }

  if (naturalOutcome === "natural1") {
    return {
      color: 0x3a040a,
      opacity: 0.17
    };
  }

  return {
    color: resolvedTheme.glow,
    opacity: 0.04
  };
}

export function createMaterialSet(
  theme: DieTheme = "default",
  naturalOutcome: NaturalOutcome = null
) {
  const bodyRoughnessTexture = createRoughnessTexture();
  const lacquerRoughnessTexture = createRoughnessTexture();
  const resolvedTheme = getTheme(theme);
  const glowStyle = getGlowStyle(resolvedTheme, naturalOutcome);

  return {
    body: new THREE.MeshPhysicalMaterial({
      color: resolvedTheme.body,
      emissive: resolvedTheme.emissive,
      emissiveIntensity: 0.16,
      metalness: 0.24,
      roughness: 0.16,
      roughnessMap: bodyRoughnessTexture,
      clearcoat: 1,
      clearcoatRoughness: 0.16,
      reflectivity: 0.7,
      flatShading: true
    }),
    lacquer: new THREE.MeshPhysicalMaterial({
      color: resolvedTheme.lacquer,
      transparent: true,
      opacity: 0.06,
      metalness: 0.05,
      roughness: 0.06,
      roughnessMap: lacquerRoughnessTexture,
      clearcoat: 1,
      clearcoatRoughness: 0.12
    }),
    edge: new THREE.LineBasicMaterial({
      color: resolvedTheme.edge,
      transparent: true,
      opacity: 0.82
    }),
    glow: new THREE.MeshBasicMaterial({
      color: glowStyle.color,
      transparent: true,
      opacity: glowStyle.opacity
    })
  };
}

export function addSolidGeometry(
  parent: THREE.Group,
  geometry: THREE.BufferGeometry,
  materials: ReturnType<typeof createMaterialSet>,
  innerScale = 0.9
) {
  const body = new THREE.Mesh(geometry, materials.body);
  body.castShadow = true;
  body.receiveShadow = true;
  parent.add(body);

  const lacquer = new THREE.Mesh(geometry.clone(), materials.lacquer);
  lacquer.scale.setScalar(1.015);
  parent.add(lacquer);

  const edgeLines = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), materials.edge);
  edgeLines.renderOrder = 3;
  parent.add(edgeLines);

  const innerGlow = new THREE.Mesh(geometry.clone(), materials.glow);
  innerGlow.scale.setScalar(innerScale);
  parent.add(innerGlow);
}
