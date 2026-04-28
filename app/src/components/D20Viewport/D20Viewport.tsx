import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { RolledDie } from "../../types";
import { SETTLE_START, TABLE_Y, TOTAL_DURATION } from "./constants";
import {
  createDieShape,
  createPlaneMesh,
  createRandomQuaternion,
  getDiePositions,
  getTargetQuaternion
} from "./geometry";
import { easeOutQuint, disposeSceneObject } from "./sceneUtils";
import { createTypeTexture, createValueTexture, createWoodTexture } from "./textures";
import type { AnimationState, D20ViewportProps, DieVisual } from "./types";
import styles from "./D20Viewport.module.css";

function D20Viewport({ dice, rollToken, onRollComplete }: D20ViewportProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const diceRef = useRef(dice);
  const rollTokenRef = useRef(rollToken);
  const onRollCompleteRef = useRef(onRollComplete);
  const completedRollTokenRef = useRef(rollToken - 1);
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
    keyLight.position.set(2.35, 10.9, 2.05);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.left = -7;
    keyLight.shadow.camera.right = 7;
    keyLight.shadow.camera.top = 7;
    keyLight.shadow.camera.bottom = -7;
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x84b7ff, 4.4, 18, 2);
    rimLight.position.set(-5.1, 3.8, -4.4);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xc5976f, 3.4, 22, 2);
    fillLight.position.set(3.2, 3.5, 5.6);
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
        const spinScale = index < 4 ? 0.58 : 0.7;
        const naturalOutcome = die.naturalOutcome ?? null;
        const valueLabelSize = die.sides === 100 ? 1.72 : naturalOutcome ? 1.18 : 1.06;
        const root = new THREE.Group();
        const shapeData = createDieShape(die.sides, die.theme ?? "default", naturalOutcome);
        const valueLabel = createPlaneMesh(
          createValueTexture(die.value, naturalOutcome),
          valueLabelSize,
          valueLabelSize,
          shapeData.valueLabelY,
          0
        );
        const typeTexture = createTypeTexture(`d${die.sides}`);
        const typeLabelHeight = die.sides === 100 ? 0.7 : 0.48;
        const typeLabel = createPlaneMesh(
          typeTexture.texture,
          (die.sides === 100 ? 0.68 : 0.46) * typeTexture.aspect,
          typeLabelHeight,
          shapeData.typeLabelY,
          shapeData.typeLabelZ
        );
        const { start, end } = getDiePositions(
          index,
          nextDice.length,
          nextDice.map((entry) => entry.sides)
        );

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
          targetQuaternion: getTargetQuaternion(die.sides, die.value),
          spinVelocity: new THREE.Vector3(
            (0.15 + Math.random() * 0.05) * spinScale,
            (0.24 + Math.random() * 0.06) * spinScale,
            (0.13 + Math.random() * 0.05) * spinScale
          ),
          delay: index * 75,
          settleStarted: false,
          settleQuaternion: new THREE.Quaternion()
        } satisfies DieVisual;
      });

      animationRef.current = {
        rolling: true,
        startedAt: time,
        completesAt: time + TOTAL_DURATION + Math.max(0, (nextDice.length - 1) * 75),
        activeRollToken: nextRollToken,
        dice: visuals
      };
    }

    let rafId = 0;
    let lastRollToken = rollTokenRef.current;

    const renderFrame = (time: number) => {
      const animation = animationRef.current;

      const shouldStartRoll =
        diceRef.current.length > 0 &&
        (rollTokenRef.current !== lastRollToken ||
          (!animation.rolling &&
            animation.dice.length === 0 &&
            completedRollTokenRef.current !== rollTokenRef.current));

      if (shouldStartRoll) {
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

      keyLight.position.x = 2.35 + Math.sin(time * 0.00045) * 0.2;
      keyLight.position.z = 2.05 + Math.cos(time * 0.0004) * 0.18;
      rimLight.position.z = -4.4 + Math.cos(time * 0.00075) * 0.22;

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
