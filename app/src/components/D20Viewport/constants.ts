import * as THREE from "three";
import type { FaceMeta } from "./types";
import { buildFaces, createD10Faces } from "./polyhedra";

export const TABLE_Y = -1.65;
export const DIE_Y = TABLE_Y + 1.38;
export const TOTAL_DURATION = 2325;
export const SETTLE_START = 0.74;
export const UP_AXIS = new THREE.Vector3(0, 1, 0);

export const ROYAL_BLUE_THEME = {
  body: "#3559e0",
  emissive: "#14235f",
  lacquer: "#aab9ff",
  edge: "#eef2ff",
  glow: "#7e95ff"
};

export const EMERALD_GREEN_THEME = {
  body: "#2f9a5a",
  emissive: "#103a24",
  lacquer: "#b8ffd0",
  edge: "#f0fff5",
  glow: "#86efac"
};

export const CRIMSON_RED_THEME = {
  body: "#c94a4a",
  emissive: "#4b1515",
  lacquer: "#ffc2c2",
  edge: "#fff0f0",
  glow: "#fca5a5"
};

export const WILD_MAGIC_PURPLE_THEME = {
  body: "#7c3aed",
  emissive: "#2e1065",
  lacquer: "#ddd6fe",
  edge: "#f5f3ff",
  glow: "#c084fc"
};

export const CUSTOM_YELLOW_THEME = {
  body: "#eab308",
  emissive: "#4a3100",
  lacquer: "#fef3c7",
  edge: "#fff7d6",
  glow: "#fde047"
};

const d20FaceGeometry = new THREE.IcosahedronGeometry(1.14, 0).toNonIndexed();
export const d20Faces = buildFaces(d20FaceGeometry);
d20FaceGeometry.dispose();

const d4FaceGeometry = new THREE.TetrahedronGeometry(1.38, 0).toNonIndexed();
export const d4Faces = buildFaces(d4FaceGeometry);
d4FaceGeometry.dispose();

const d8FaceGeometry = new THREE.OctahedronGeometry(1.34, 0).toNonIndexed();
export const d8Faces = buildFaces(d8FaceGeometry);
d8FaceGeometry.dispose();

export const d6Faces: FaceMeta[] = [
  {
    center: new THREE.Vector3(0, 1, 0),
    normal: new THREE.Vector3(0, 1, 0),
    value: 1
  },
  {
    center: new THREE.Vector3(1, 0, 0),
    normal: new THREE.Vector3(1, 0, 0),
    value: 2
  },
  {
    center: new THREE.Vector3(0, 0, 1),
    normal: new THREE.Vector3(0, 0, 1),
    value: 3
  },
  {
    center: new THREE.Vector3(0, 0, -1),
    normal: new THREE.Vector3(0, 0, -1),
    value: 4
  },
  {
    center: new THREE.Vector3(-1, 0, 0),
    normal: new THREE.Vector3(-1, 0, 0),
    value: 5
  },
  {
    center: new THREE.Vector3(0, -1, 0),
    normal: new THREE.Vector3(0, -1, 0),
    value: 6
  }
];

export const d10Faces = createD10Faces();

const d12FaceGeometry = new THREE.DodecahedronGeometry(1.18, 0).toNonIndexed();
export const d12Faces = buildFaces(d12FaceGeometry);
d12FaceGeometry.dispose();
