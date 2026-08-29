"use client";

import { Suspense, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { categories } from "@/config";
import { heroMotion } from "@/lib/transition";
import type { Tilt } from "@/hooks/useDeviceOrientation";
import { ProceduralHero } from "./ProceduralModels";
import { GLBHero } from "./GLBHero";
import { SceneErrorBoundary } from "./ErrorBoundary";

interface Props {
  tilt: React.RefObject<Tilt>;
  glbAvailable: Record<string, boolean>;
  onModelError: () => void;
}

/**
 * The single hero object. Every frame it reads the mutable `heroMotion` values
 * that the GSAP timeline is tweening and maps them onto its transform, adds a
 * touch of life (idle spin) and a gyroscope-driven counter-parallax so the food
 * feels anchored in real space as the phone tilts.
 */
export function HeroModel({ tilt, glbAvailable, onModelError }: Props) {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    g.visible = heroMotion.visible;
    if (!heroMotion.visible) return;

    const px = tilt.current?.x ?? 0;
    const py = tilt.current?.y ?? 0;

    // depth + spin straight from the timeline
    g.position.z = heroMotion.z;
    g.position.x = -px * 0.5 * (0.4 + heroMotion.emergence);
    g.position.y = 0.1 + py * 0.35 * (0.4 + heroMotion.emergence);
    g.rotation.x = heroMotion.rotX + py * 0.12;
    g.rotation.y = heroMotion.rotY - px * 0.14;
    g.rotation.z = heroMotion.rotZ;

    const s = heroMotion.baseScale * heroMotion.scale;
    g.scale.setScalar(s);

    // idle life on the inner group so it doesn't fight the timeline spin
    if (inner.current) {
      inner.current.rotation.y += dt * 0.35;
    }
  });

  const shapeCat =
    categories.find((c) => c.shape === heroMotion.shape) ?? categories[0];
  const useGlb = glbAvailable[shapeCat.model] === true;

  return (
    <group ref={group} visible={false} position={[0, 0.1, -12]}>
      <group ref={inner}>
        {useGlb ? (
          <SceneErrorBoundary
            onError={onModelError}
            fallback={<ProceduralHero shape={heroMotion.shape} />}
          >
            <Suspense fallback={<ProceduralHero shape={heroMotion.shape} />}>
              <GLBHero url={shapeCat.model} />
            </Suspense>
          </SceneErrorBoundary>
        ) : (
          <ProceduralHero shape={heroMotion.shape} />
        )}
      </group>
    </group>
  );
}
