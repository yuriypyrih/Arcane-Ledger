import * as THREE from "three";

export function easeOutQuint(progress: number): number {
  return 1 - (1 - progress) ** 5;
}

export function disposeSceneObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();

      if (Array.isArray(child.material)) {
        for (const material of child.material) {
          if ("map" in material && material.map) {
            material.map.dispose();
          }
          if ("roughnessMap" in material && material.roughnessMap) {
            material.roughnessMap.dispose();
          }
          material.dispose();
        }
      } else {
        if ("map" in child.material && child.material.map) {
          child.material.map.dispose();
        }
        if ("roughnessMap" in child.material && child.material.roughnessMap) {
          child.material.roughnessMap.dispose();
        }
        child.material.dispose();
      }
    }

    if (child instanceof THREE.LineSegments) {
      child.geometry.dispose();

      if (!Array.isArray(child.material)) {
        child.material.dispose();
      }
    }
  });
}
