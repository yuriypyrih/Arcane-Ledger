import * as THREE from "three";
import { ROYAL_BLUE_THEME } from "./constants";
import { createRoughnessTexture } from "./textures";

export function createMaterialSet() {
  const bodyRoughnessTexture = createRoughnessTexture();
  const lacquerRoughnessTexture = createRoughnessTexture();

  return {
    body: new THREE.MeshPhysicalMaterial({
      color: ROYAL_BLUE_THEME.body,
      emissive: ROYAL_BLUE_THEME.emissive,
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
      color: ROYAL_BLUE_THEME.lacquer,
      transparent: true,
      opacity: 0.06,
      metalness: 0.05,
      roughness: 0.06,
      roughnessMap: lacquerRoughnessTexture,
      clearcoat: 1,
      clearcoatRoughness: 0.12
    }),
    edge: new THREE.LineBasicMaterial({
      color: ROYAL_BLUE_THEME.edge,
      transparent: true,
      opacity: 0.82
    }),
    glow: new THREE.MeshBasicMaterial({
      color: ROYAL_BLUE_THEME.glow,
      transparent: true,
      opacity: 0.04
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
