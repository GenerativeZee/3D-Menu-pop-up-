"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  DepthOfField,
  Vignette,
  Noise,
  ChromaticAberration,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { heroMotion } from "@/lib/transition";
import type { DeviceProfile } from "@/lib/performance";

/**
 * Post stack that sells the "through the glass" feel:
 *  - Bloom lifts specular highlights as the food nears the lens
 *  - Depth of field keeps the deep-screen start soft, snaps focus on approach
 *  - Chromatic aberration + a vignette pulse punctuate the peak beat
 * All of it is gated by the device tier upstream.
 */
export function Effects({ device }: { device: DeviceProfile }) {
  const bloom = useRef<{ intensity: number }>(null);
  const ca = useRef<{ offset: THREE.Vector2 }>(null);
  const vignette = useRef<{ darkness: number }>(null);

  useFrame(() => {
    const e = heroMotion.emergence;
    const shake = heroMotion.shake;
    if (bloom.current) bloom.current.intensity = 0.5 + e * 1.5 + shake * 0.6;
    if (ca.current) {
      const o = 0.0006 + shake * 0.004 + e * 0.0008;
      ca.current.offset.set(o, o);
    }
    if (vignette.current) {
      vignette.current.darkness = 0.5 + heroMotion.portal * 0.35 + shake * 0.15;
    }
  });

  return (
    <EffectComposer
      multisampling={device.tier === "high" ? 4 : 0}
      enableNormalPass={false}
    >
      {device.dof && (
        <DepthOfField
          focusDistance={0.015}
          focalLength={0.05}
          bokehScale={3.5}
          height={480}
        />
      )}
      <Bloom
        ref={bloom as never}
        mipmapBlur
        intensity={0.6}
        luminanceThreshold={0.6}
        luminanceSmoothing={0.2}
        radius={0.7}
      />
      <ChromaticAberration
        ref={ca as never}
        blendFunction={BlendFunction.NORMAL}
        offset={[0.0006, 0.0006]}
        radialModulation={false}
        modulationOffset={0}
      />
      <Vignette
        ref={vignette as never}
        eskil={false}
        offset={0.28}
        darkness={0.55}
      />
      {device.tier === "high" && (
        <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.035} />
      )}
    </EffectComposer>
  );
}
