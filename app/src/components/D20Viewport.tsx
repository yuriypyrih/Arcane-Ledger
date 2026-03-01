import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { RolledDie } from "../lib/dice";
import styles from "./D20Viewport.module.css";

type D20ViewportProps = {
  dice: RolledDie[];
  rollToken: number;
  onRollComplete?: (dice: RolledDie[], rollToken: number) => void;
};

type FaceMeta = {
  center: THREE.Vector3;
  normal: THREE.Vector3;
  value: number;
};

type DieVisual = {
  root: THREE.Group;
  shape: THREE.Group;
  valueLabel: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  typeLabel: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  startPosition: THREE.Vector3;
  endPosition: THREE.Vector3;
  targetQuaternion: THREE.Quaternion;
  spinVelocity: THREE.Vector3;
  delay: number;
  settleStarted: boolean;
  settleQuaternion: THREE.Quaternion;
};

type AnimationState = {
  rolling: boolean;
  startedAt: number;
  completesAt: number;
  activeRollToken: number;
  dice: DieVisual[];
};

const TABLE_Y = -1.65;
const DIE_Y = TABLE_Y + 1.38;
const TOTAL_DURATION = 2150;
const SETTLE_START = 0.68;
const UP_AXIS = new THREE.Vector3(0, 1, 0);
const ROYAL_BLUE_THEME = {
  body: "#3559e0",
  emissive: "#14235f",
  lacquer: "#aab9ff",
  edge: "#eef2ff",
  glow: "#7e95ff"
};

function easeOutQuint(progress: number): number {
  return 1 - (1 - progress) ** 5;
}

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
const d20Faces = buildFaces(faceGeometry);
faceGeometry.dispose();

function createValueTexture(value: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("2D canvas context is unavailable.");
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.translate(canvas.width / 2, canvas.height / 2);
  context.font = "700 128px Georgia";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.lineJoin = "round";
  context.lineWidth = 14;
  context.strokeStyle = "rgba(11, 20, 39, 0.68)";
  context.strokeText(String(value), 0, 3);
  context.fillStyle = "#fff3d7";
  context.shadowColor = "rgba(21, 10, 5, 0.28)";
  context.shadowBlur = 5;
  context.fillText(String(value), 0, 3);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  return texture;
}

function createTypeTexture(text: string): {
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
  const horizontalPadding = 24;
  const verticalPadding = 12;
  const canvas = document.createElement("canvas");
  canvas.width = textWidth + horizontalPadding * 2;
  canvas.height = 62 + verticalPadding * 2;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("2D canvas context is unavailable.");
  }

  const radius = Math.min(22, canvas.height / 2 - 6);
  context.fillStyle = "rgba(17, 12, 9, 0.78)";
  context.beginPath();
  context.moveTo(radius, verticalPadding);
  context.lineTo(canvas.width - radius, verticalPadding);
  context.quadraticCurveTo(
    canvas.width - horizontalPadding,
    verticalPadding,
    canvas.width - horizontalPadding,
    radius
  );
  context.lineTo(canvas.width - horizontalPadding, canvas.height - radius);
  context.quadraticCurveTo(
    canvas.width - horizontalPadding,
    canvas.height - verticalPadding,
    canvas.width - radius,
    canvas.height - verticalPadding
  );
  context.lineTo(radius, canvas.height - verticalPadding);
  context.quadraticCurveTo(
    horizontalPadding,
    canvas.height - verticalPadding,
    horizontalPadding,
    canvas.height - radius
  );
  context.lineTo(horizontalPadding, radius);
  context.quadraticCurveTo(horizontalPadding, verticalPadding, radius, verticalPadding);
  context.closePath();
  context.fill();

  context.strokeStyle = "rgba(255, 243, 222, 0.18)";
  context.lineWidth = 2.5;
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

function createWoodTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 2048;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("2D canvas context is unavailable.");
  }

  const base = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  base.addColorStop(0, "#5b3822");
  base.addColorStop(0.38, "#7a4b2f");
  base.addColorStop(0.68, "#8c5836");
  base.addColorStop(1, "#56331f");
  context.fillStyle = base;
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let index = 0; index < 220; index += 1) {
    const y = (index / 220) * canvas.height;
    const thickness = 2 + Math.random() * 8;
    const alpha = 0.02 + Math.random() * 0.035;
    const offset = Math.random() * canvas.width;

    context.strokeStyle = `rgba(43, 22, 11, ${alpha})`;
    context.lineWidth = thickness;
    context.beginPath();
    context.moveTo(0, y + Math.sin(offset * 0.0012) * 8);

    for (let x = 0; x <= canvas.width; x += 28) {
      const wave = Math.sin((x + offset) * 0.006) * 7 + Math.sin((x + offset) * 0.021) * 2;
      context.lineTo(x, y + wave);
    }

    context.stroke();
  }

  for (let knotIndex = 0; knotIndex < 4; knotIndex += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = 70 + Math.random() * 90;

    const knot = context.createRadialGradient(x, y, radius * 0.2, x, y, radius);
    knot.addColorStop(0, "rgba(61, 29, 12, 0.14)");
    knot.addColorStop(0.45, "rgba(88, 48, 22, 0.08)");
    knot.addColorStop(1, "rgba(88, 48, 22, 0)");
    context.fillStyle = knot;
    context.beginPath();
    context.ellipse(x, y, radius, radius * 0.55, Math.random() * Math.PI, 0, Math.PI * 2);
    context.fill();
  }

  const sheen = context.createRadialGradient(
    canvas.width * 0.35,
    canvas.height * 0.25,
    canvas.width * 0.04,
    canvas.width * 0.35,
    canvas.height * 0.25,
    canvas.width * 0.75
  );
  sheen.addColorStop(0, "rgba(255, 214, 166, 0.08)");
  sheen.addColorStop(1, "rgba(255, 214, 166, 0)");
  context.fillStyle = sheen;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  return texture;
}

function createRoughnessTexture(): THREE.CanvasTexture {
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

function createMaterialSet() {
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

function addSolidGeometry(
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

function createDieShape(): {
  group: THREE.Group;
  valueLabelY: number;
  typeLabelY: number;
  typeLabelZ: number;
} {
  const group = new THREE.Group();
  addSolidGeometry(
    group,
    new THREE.IcosahedronGeometry(1.14, 0).toNonIndexed(),
    createMaterialSet(),
    0.9
  );
  return { group, valueLabelY: 1.72, typeLabelY: 2.52, typeLabelZ: -1.16 };
}

function createPlaneMesh(
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

function createRandomQuaternion(): THREE.Quaternion {
  return new THREE.Quaternion().setFromEuler(
    new THREE.Euler(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    )
  );
}

function getTargetQuaternion(value: number): THREE.Quaternion {
  const targetFace = d20Faces.find((face) => face.value === value) ?? d20Faces[0];
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

function getDiePositions(index: number, total: number): {
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

function disposeSceneObject(object: THREE.Object3D) {
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

function D20Viewport({ dice, rollToken, onRollComplete }: D20ViewportProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const diceRef = useRef(dice);
  const rollTokenRef = useRef(rollToken);
  const onRollCompleteRef = useRef(onRollComplete);
  const completedRollTokenRef = useRef(rollToken);
  const animationRef = useRef<AnimationState>({
    rolling: false,
    startedAt: 0,
    completesAt: 0,
    activeRollToken: rollToken,
    dice: []
  });

  diceRef.current = dice;
  rollTokenRef.current = rollToken;
  onRollCompleteRef.current = onRollComplete;

  useEffect(() => {
    const mount = hostRef.current;

    if (!mount) {
      return;
    }

    const host = mount;
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const camera = new THREE.OrthographicCamera(-8, 8, 8, -8, 0.1, 100);
    camera.position.set(0, 12.5, 0.01);
    camera.up.set(0, 0, -1);
    camera.lookAt(0, TABLE_Y, 0);

    const ambientLight = new THREE.AmbientLight(0xf6ead8, 1.05);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff1de, 3.1);
    keyLight.position.set(1.35, 11.3, 1.15);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.left = -7;
    keyLight.shadow.camera.right = 7;
    keyLight.shadow.camera.top = 7;
    keyLight.shadow.camera.bottom = -7;
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x84b7ff, 4.4, 18, 2);
    rimLight.position.set(-4.2, 3.4, -3.2);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xc5976f, 3.4, 22, 2);
    fillLight.position.set(2.4, 3.1, 4.5);
    scene.add(fillLight);

    const woodTexture = createWoodTexture();
    const tabletopMaterial = new THREE.MeshStandardMaterial({
      map: woodTexture,
      color: 0xffffff,
      roughness: 0.92,
      metalness: 0.02
    });
    const tabletop = new THREE.Mesh(new THREE.PlaneGeometry(34, 34), tabletopMaterial);
    tabletop.rotation.x = -Math.PI / 2;
    tabletop.position.y = TABLE_Y;
    tabletop.receiveShadow = true;
    scene.add(tabletop);

    const diceLayer = new THREE.Group();
    scene.add(diceLayer);

    host.appendChild(renderer.domElement);

    function resize() {
      const bounds = host.getBoundingClientRect();
      renderer.setSize(bounds.width, bounds.height, false);
      const aspect = bounds.width / Math.max(bounds.height, 1);
      const viewHeight = 13;
      camera.left = (-viewHeight * aspect) / 2;
      camera.right = (viewHeight * aspect) / 2;
      camera.top = viewHeight / 2;
      camera.bottom = -viewHeight / 2;
      camera.updateProjectionMatrix();
    }

    resize();

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(host);

    function clearDiceLayer() {
      for (const child of [...diceLayer.children]) {
        diceLayer.remove(child);
        disposeSceneObject(child);
      }
      animationRef.current.dice = [];
    }

    function buildRoll(nextDice: RolledDie[], nextRollToken: number, time: number) {
      clearDiceLayer();

      const visuals = nextDice.map((die, index) => {
        const root = new THREE.Group();
        const shapeData = createDieShape();
        const valueLabel = createPlaneMesh(
          createValueTexture(die.value),
          1.06,
          1.06,
          shapeData.valueLabelY,
          0
        );
        const typeTexture = createTypeTexture(`d${die.sides}`);
        const typeLabel = createPlaneMesh(
          typeTexture.texture,
          0.46 * typeTexture.aspect,
          0.48,
          shapeData.typeLabelY,
          shapeData.typeLabelZ
        );
        const { start, end } = getDiePositions(index, nextDice.length);

        valueLabel.visible = false;
        root.position.copy(start);
        shapeData.group.quaternion.copy(createRandomQuaternion());
        root.add(shapeData.group);
        root.add(valueLabel);
        root.add(typeLabel);
        diceLayer.add(root);

        return {
          root,
          shape: shapeData.group,
          valueLabel,
          typeLabel,
          startPosition: start,
          endPosition: end,
          targetQuaternion: getTargetQuaternion(Math.max(1, Math.min(20, die.value))),
          spinVelocity: new THREE.Vector3(
            0.16 + Math.random() * 0.08,
            0.28 + Math.random() * 0.08,
            0.14 + Math.random() * 0.06
          ),
          delay: index * 70,
          settleStarted: false,
          settleQuaternion: new THREE.Quaternion()
        } satisfies DieVisual;
      });

      animationRef.current = {
        rolling: true,
        startedAt: time,
        completesAt: time + TOTAL_DURATION + Math.max(0, (nextDice.length - 1) * 70),
        activeRollToken: nextRollToken,
        dice: visuals
      };
    }

    let rafId = 0;
    let lastRollToken = rollTokenRef.current;

    const renderFrame = (time: number) => {
      const animation = animationRef.current;

      if (rollTokenRef.current !== lastRollToken && diceRef.current.length > 0) {
        lastRollToken = rollTokenRef.current;
        buildRoll(diceRef.current, rollTokenRef.current, time);
      }

      if (animation.rolling) {
        let allComplete = true;

        for (const visual of animation.dice) {
          const localStart = animation.startedAt + visual.delay;
          const rawProgress = Math.max(0, time - localStart) / TOTAL_DURATION;
          const progress = Math.min(rawProgress, 1);

          if (progress < 1) {
            allComplete = false;
          }

          visual.root.position.lerpVectors(
            visual.startPosition,
            visual.endPosition,
            easeOutQuint(progress)
          );

          if (progress < SETTLE_START) {
            visual.shape.rotation.x += visual.spinVelocity.x;
            visual.shape.rotation.y += visual.spinVelocity.y;
            visual.shape.rotation.z += visual.spinVelocity.z;
          } else {
            if (!visual.settleStarted) {
              visual.settleStarted = true;
              visual.settleQuaternion.copy(visual.shape.quaternion);
            }

            const settleProgress = Math.min(
              (progress - SETTLE_START) / Math.max(1 - SETTLE_START, 0.0001),
              1
            );

            visual.shape.quaternion.slerpQuaternions(
              visual.settleQuaternion,
              visual.targetQuaternion,
              easeOutQuint(settleProgress)
            );
          }

          visual.valueLabel.visible = progress >= 0.92;
          visual.typeLabel.material.opacity = progress >= 0.92 ? 0.92 : 0.7;
        }

        if (allComplete || time >= animation.completesAt) {
          animation.rolling = false;

          if (completedRollTokenRef.current !== animation.activeRollToken) {
            completedRollTokenRef.current = animation.activeRollToken;
            onRollCompleteRef.current?.(diceRef.current, animation.activeRollToken);
          }
        }
      }

      keyLight.position.x = 1.35 + Math.sin(time * 0.00045) * 0.16;
      keyLight.position.z = 1.15 + Math.cos(time * 0.0004) * 0.14;
      rimLight.position.z = -3.2 + Math.cos(time * 0.00075) * 0.18;

      renderer.render(scene, camera);
      rafId = window.requestAnimationFrame(renderFrame);
    };

    rafId = window.requestAnimationFrame(renderFrame);

    return () => {
      window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      clearDiceLayer();
      woodTexture.dispose();
      tabletop.geometry.dispose();
      tabletopMaterial.dispose();
      renderer.dispose();
      host.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className={styles.viewport}>
      <div ref={hostRef} className={styles.canvasHost} aria-label="3D dice board preview" />
      <div className={styles.frameGlow} aria-hidden="true" />
    </div>
  );
}

export default D20Viewport;
