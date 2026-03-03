import * as THREE from "three";
import type { FaceMeta } from "./types";

const D10_POLAR_STRETCH = 0.6;

export function buildFaces(geometry: THREE.BufferGeometry): FaceMeta[] {
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

export function createD10Geometry(): THREE.BufferGeometry {
  return createD10Data().geometry;
}

export function createD10Faces(): FaceMeta[] {
  return createD10Data().faces;
}

function createD10Data(): {
  geometry: THREE.BufferGeometry;
  faces: FaceMeta[];
} {
  const vertices = createPentagonalAntiprismVertices();
  const antiprismFaces = createPentagonalAntiprismFaces();
  const dualVertices = antiprismFaces.map((face) => createDualVertex(vertices, face));

  for (const vertex of dualVertices) {
    vertex.y *= D10_POLAR_STRETCH;
  }

  const d10Faces = vertices.map((vertex, index) => {
    const incidentFaces = antiprismFaces
      .map((face, faceIndex) => ({ face, faceIndex }))
      .filter(({ face }) => face.includes(index));

    const orderedDual = orderFaceVertices(
      vertex,
      incidentFaces.map(({ faceIndex }) => ({
        index: faceIndex,
        vertex: dualVertices[faceIndex]
      }))
    );

    return {
      indices: orderedDual,
      meta: createFaceMeta(dualVertices, orderedDual)
    };
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      d10Faces.flatMap(({ indices }) => triangulateFace(dualVertices, indices)),
      3
    )
  );
  geometry.computeVertexNormals();

  return {
    geometry,
    faces: d10Faces.map(({ meta }, index) => ({
      ...meta,
      value: index + 1
    }))
  };
}

function createPentagonalAntiprismVertices(): THREE.Vector3[] {
  const sides = 5;
  const radius = 1;
  const height =
    radius *
    Math.sqrt(
      4 * (Math.sin(Math.PI / sides) ** 2 - Math.sin(Math.PI / (2 * sides)) ** 2)
    );
  const halfHeight = height / 2;

  const top = Array.from({ length: sides }, (_, index) => {
    const angle = (index / sides) * Math.PI * 2;
    return new THREE.Vector3(
      Math.cos(angle) * radius,
      halfHeight,
      Math.sin(angle) * radius
    );
  });

  const bottom = Array.from({ length: sides }, (_, index) => {
    const angle = ((index + 0.5) / sides) * Math.PI * 2;
    return new THREE.Vector3(
      Math.cos(angle) * radius,
      -halfHeight,
      Math.sin(angle) * radius
    );
  });

  return [...top, ...bottom];
}

function createPentagonalAntiprismFaces(): number[][] {
  const sides = 5;
  const faces: number[][] = [];
  const topFace = Array.from({ length: sides }, (_, index) => index);
  const bottomFace = Array.from({ length: sides }, (_, index) => sides + (sides - 1 - index));

  faces.push(topFace, bottomFace);

  for (let index = 0; index < sides; index += 1) {
    const topCurrent = index;
    const topNext = (index + 1) % sides;
    const bottomCurrent = sides + index;
    const bottomPrevious = sides + ((index + sides - 1) % sides);

    faces.push([topCurrent, bottomCurrent, topNext]);
    faces.push([topCurrent, bottomPrevious, bottomCurrent]);
  }

  return faces;
}

function createDualVertex(vertices: THREE.Vector3[], face: number[]): THREE.Vector3 {
  const points = face.map((index) => vertices[index]);
  const center = averageVectors(points);
  const normal = new THREE.Vector3()
    .subVectors(points[1], points[0])
    .cross(new THREE.Vector3().subVectors(points[2], points[0]))
    .normalize();

  if (normal.dot(center) < 0) {
    normal.multiplyScalar(-1);
  }

  const planeDistance = Math.max(normal.dot(points[0]), 0.0001);
  return normal.divideScalar(planeDistance).multiplyScalar(1.18);
}

function orderFaceVertices(
  origin: THREE.Vector3,
  vertices: Array<{ index: number; vertex: THREE.Vector3 }>
): number[] {
  const vertexNormal = origin.clone().normalize();
  const tangent = new THREE.Vector3(0, 1, 0).cross(vertexNormal);

  if (tangent.lengthSq() < 0.0001) {
    tangent.set(1, 0, 0).cross(vertexNormal);
  }

  tangent.normalize();
  const bitangent = new THREE.Vector3().crossVectors(vertexNormal, tangent).normalize();

  return vertices
    .map(({ index, vertex }) => {
      const direction = vertex.clone().sub(origin).projectOnPlane(vertexNormal).normalize();

      return {
        index,
        angle: Math.atan2(direction.dot(bitangent), direction.dot(tangent))
      };
    })
    .sort((left, right) => left.angle - right.angle)
    .map(({ index }) => index);
}

function triangulateFace(vertices: THREE.Vector3[], face: number[]): number[] {
  const points = face.map((index) => vertices[index]);
  const first = points[0];
  const positions: number[] = [];

  for (let index = 1; index < points.length - 1; index += 1) {
    const second = points[index];
    const third = points[index + 1];
    positions.push(
      first.x,
      first.y,
      first.z,
      second.x,
      second.y,
      second.z,
      third.x,
      third.y,
      third.z
    );
  }

  return positions;
}

function createFaceMeta(vertices: THREE.Vector3[], face: number[]): Omit<FaceMeta, "value"> {
  const points = face.map((index) => vertices[index]);
  const center = averageVectors(points);
  const normal = new THREE.Vector3()
    .subVectors(points[1], points[0])
    .cross(new THREE.Vector3().subVectors(points[2], points[0]))
    .normalize();

  if (normal.dot(center) < 0) {
    normal.multiplyScalar(-1);
  }

  return {
    center,
    normal
  };
}

function averageVectors(points: THREE.Vector3[]): THREE.Vector3 {
  return points
    .reduce((sum, point) => sum.add(point), new THREE.Vector3())
    .divideScalar(points.length);
}
