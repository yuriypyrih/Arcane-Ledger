import * as THREE from "three";
import { DIE_Y, UP_AXIS, d20Faces, d4Faces, d6Faces, d8Faces, d10Faces, d12Faces } from "./constants";
import { addSolidGeometry, createMaterialSet } from "./materials";
import { createD10Geometry } from "./polyhedra";

function createD20Shape(): {
  group: THREE.Group;
  valueLabelY: number;
  typeLabelY: number;
  typeLabelZ: number;
} {
  const group = new THREE.Group();
  addSolidGeometry(
    group,
    new THREE.IcosahedronGeometry(1.22, 0).toNonIndexed(),
    createMaterialSet(),
    0.9
  );
  return { group, valueLabelY: 1.82, typeLabelY: 2.62, typeLabelZ: -1.22 };
}

function createD4Shape(): {
  group: THREE.Group;
  valueLabelY: number;
  typeLabelY: number;
  typeLabelZ: number;
} {
  const group = new THREE.Group();
  addSolidGeometry(
    group,
    new THREE.TetrahedronGeometry(1.22, 0).toNonIndexed(),
    createMaterialSet(),
    0.82
  );
  return { group, valueLabelY: 1.68, typeLabelY: 2.24, typeLabelZ: -0.98 };
}

function createD6Shape(): {
  group: THREE.Group;
  valueLabelY: number;
  typeLabelY: number;
  typeLabelZ: number;
} {
  const group = new THREE.Group();
  addSolidGeometry(group, new THREE.BoxGeometry(1.68, 1.68, 1.68).toNonIndexed(), createMaterialSet(), 0.84);
  return { group, valueLabelY: 1.62, typeLabelY: 2.24, typeLabelZ: -0.98 };
}

function createD8Shape(): {
  group: THREE.Group;
  valueLabelY: number;
  typeLabelY: number;
  typeLabelZ: number;
} {
  const group = new THREE.Group();
  addSolidGeometry(
    group,
    new THREE.OctahedronGeometry(1.34, 0).toNonIndexed(),
    createMaterialSet(),
    0.86
  );
  return { group, valueLabelY: 1.8, typeLabelY: 2.46, typeLabelZ: -1.08 };
}

function createD10Shape(): {
  group: THREE.Group;
  valueLabelY: number;
  typeLabelY: number;
  typeLabelZ: number;
} {
  const group = new THREE.Group();
  addSolidGeometry(group, createD10Geometry(), createMaterialSet(), 0.84);
  return { group, valueLabelY: 1.82, typeLabelY: 2.48, typeLabelZ: -1.08 };
}

function createD12Shape(): {
  group: THREE.Group;
  valueLabelY: number;
  typeLabelY: number;
  typeLabelZ: number;
} {
  const group = new THREE.Group();
  addSolidGeometry(
    group,
    new THREE.DodecahedronGeometry(1.18, 0).toNonIndexed(),
    createMaterialSet(),
    0.87
  );
  return { group, valueLabelY: 1.78, typeLabelY: 2.48, typeLabelZ: -1.08 };
}

export function createDieShape(sides: number): {
  group: THREE.Group;
  valueLabelY: number;
  typeLabelY: number;
  typeLabelZ: number;
} {
  if (sides === 4) {
    return createD4Shape();
  }

  if (sides === 6) {
    return createD6Shape();
  }

  if (sides === 8) {
    return createD8Shape();
  }

  if (sides === 10) {
    return createD10Shape();
  }

  if (sides === 12) {
    return createD12Shape();
  }

  return createD20Shape();
}

export function createPlaneMesh(
  texture: THREE.CanvasTexture,
  width: number,
  height: number,
  y: number,
  z = 0
): THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> {
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(0, y, z);
  mesh.renderOrder = 5;
  return mesh;
}

export function createRandomQuaternion(): THREE.Quaternion {
  return new THREE.Quaternion().setFromEuler(
    new THREE.Euler(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    )
  );
}

export function getTargetQuaternion(sides: number, value: number): THREE.Quaternion {
  const faces =
    sides === 4
      ? d4Faces
      : sides === 6
        ? d6Faces
        : sides === 8
          ? d8Faces
          : sides === 10
            ? d10Faces
            : sides === 12
              ? d12Faces
              : d20Faces;
  const maxValue =
    sides === 4 ? 4 : sides === 6 ? 6 : sides === 8 ? 8 : sides === 10 ? 10 : sides === 12 ? 12 : 20;
  const safeValue = Math.max(1, Math.min(maxValue, value));
  const targetFace = faces.find((face) => face.value === safeValue) ?? faces[0];
  const liftToTop = new THREE.Quaternion().setFromUnitVectors(
    targetFace.normal.clone().normalize(),
    UP_AXIS
  );
  const faceCenterAfterLift = targetFace.center.clone().applyQuaternion(liftToTop).normalize();
  const planarDirection = new THREE.Vector3(faceCenterAfterLift.x, 0, faceCenterAfterLift.z);

  if (planarDirection.lengthSq() < 0.0001) {
    return liftToTop;
  }

  planarDirection.normalize();
  const desiredDirection = new THREE.Vector3(0, 0, -1);
  const twistAngle = Math.atan2(
    planarDirection.x * desiredDirection.z - planarDirection.z * desiredDirection.x,
    planarDirection.x * desiredDirection.x + planarDirection.z * desiredDirection.z
  );

  return new THREE.Quaternion()
    .setFromAxisAngle(UP_AXIS, twistAngle)
    .multiply(liftToTop);
}

export function getDiePositions(index: number, total: number): {
  start: THREE.Vector3;
  end: THREE.Vector3;
} {
  const columns = Math.min(4, Math.max(1, Math.ceil(Math.sqrt(total))));
  const rows = Math.ceil(total / columns);
  const column = index % columns;
  const row = Math.floor(index / columns);
  const spacingX = 2.7;
  const spacingZ = 2.35;
  const width = (columns - 1) * spacingX;
  const depth = (rows - 1) * spacingZ;
  const end = new THREE.Vector3(
    -0.2 + column * spacingX - width / 2,
    DIE_Y,
    row * spacingZ - depth / 2
  );
  const start = new THREE.Vector3(
    -9 - row * 0.8 - Math.random() * 1.2,
    DIE_Y,
    end.z + (Math.random() - 0.5) * 1.4
  );

  return { start, end };
}
