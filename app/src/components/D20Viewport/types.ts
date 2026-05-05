import * as THREE from "three";
import type { RolledDie } from "../../types";

export type D20ViewportProps = {
  dice: RolledDie[];
  rollToken: number;
  onRollComplete?: (dice: RolledDie[], rollToken: number) => void;
};

export type FaceMeta = {
  center: THREE.Vector3;
  normal: THREE.Vector3;
  value: number;
};

export type DieVisual = {
  root: THREE.Group;
  shape: THREE.Group;
  valueLabel: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  typeLabel: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  layoutIndex: number;
  layoutTotal: number;
  diceSides: number[];
  startJitterX: number;
  startJitterZ: number;
  startPosition: THREE.Vector3;
  endPosition: THREE.Vector3;
  targetQuaternion: THREE.Quaternion;
  spinVelocity: THREE.Vector3;
  delay: number;
  settleStarted: boolean;
  settleQuaternion: THREE.Quaternion;
};

export type AnimationState = {
  rolling: boolean;
  startedAt: number;
  completesAt: number;
  activeRollToken: number;
  dice: DieVisual[];
};
