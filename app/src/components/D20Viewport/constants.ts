import * as THREE from "three";
import type { FaceMeta } from "./types";

export const TABLE_Y = -1.65;
export const DIE_Y = TABLE_Y + 1.38;
export const TOTAL_DURATION = 2150;
export const SETTLE_START = 0.68;
export const UP_AXIS = new THREE.Vector3(0, 1, 0);

export const ROYAL_BLUE_THEME = {
  body: "#3559e0",
  emissive: "#14235f",
  lacquer: "#aab9ff",
  edge: "#eef2ff",
  glow: "#7e95ff"
};

function buildFaces(geometry: THREE.BufferGeometry): FaceMeta[] {
  const positions = geometry.getAttribute("position");
  const faces: FaceMeta[] = [];

  for (let index = 0; index < positions.count; index += 3) {
    const a = new THREE.Vector3().fromBufferAttribute(positions, index);
    const b = new THREE.Vector3().fromBufferAttribute(positions, index + 1);
    const c = new THREE.Vector3().fromBufferAttribute(positions, index + 2);

    const center = new THREE.Vector3().add(a).add(b).add(c).divideScalar(3);
    const normal = new THREE.Vector3()
      .subVectors(b, a)
      .cross(new THREE.Vector3().subVectors(c, a))
      .normalize();

    if (normal.dot(center) < 0) {
      normal.multiplyScalar(-1);
    }

    faces.push({
      center,
      normal,
      value: faces.length + 1
    });
  }

  return faces;
}

const faceGeometry = new THREE.IcosahedronGeometry(1.14, 0).toNonIndexed();
export const d20Faces = buildFaces(faceGeometry);
faceGeometry.dispose();
