"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { heroMotion } from "@/lib/transition";
import type { Tilt } from "@/hooks/useDeviceOrientation";
import type { DeviceProfile } from "@/lib/performance";

/**
 * Studio lighting + a locally-baked environment map (no CDN fetch) + camera
 * behaviour: gentle gyro/pointer parallax while idle, a decaying shake impulse
 * at the emergence peak.
 */
export function Rig({
  tilt,
  device,
}: {
  tilt: React.RefObject<Tilt>;
  device: DeviceProfile;
}) {
  const key = useRef<THREE.SpotLight>(null);
  const { camera } = useThree();
  const shakeSeed = useRef(Math.random() * 100);
  const basePos = useRef(new THREE.Vector3(0, 0, 6.5));

  useFrame(({ clock, pointer }) => {
    const px = (tilt.current?.x ?? 0) * 0.7 + pointer.x * 0.3;
    const py = (tilt.current?.y ?? 0) * 0.7 + pointer.y * 0.3;

    const t = clock.elapsedTime;
    const shake = heroMotion.shake;
    const sx =
      shake *
      0.16 *
      Math.sin(t * 60 + shakeSeed.current) *
      (0.5 + Math.random() * 0.5);
    const sy =
      shake *
      0.16 *
      Math.cos(t * 54 + shakeSeed.current) *
      (0.5 + Math.random() * 0.5);

    camera.position.x += (basePos.current.x + px * 0.45 + sx - camera.position.x) * 0.1;
    camera.position.y += (basePos.current.y + py * 0.4 + sy - camera.position.y) * 0.1;
    camera.position.z = basePos.current.z;
    camera.lookAt(0, 0.1, 0);

    if (key.current) {
      key.current.color.set(heroMotion.accent);
    }
  });

  return (
    <>
      <ambientLight intensity={0.35} />
      <hemisphereLight args={["#fff2df", "#0a0a12", 0.5]} />
      <spotLight
        ref={key}
        position={[4, 7, 5]}
        angle={0.5}
        penumbra={0.8}
        intensity={140}
        distance={30}
        castShadow={device.shadows}
        shadow-mapSize={device.tier === "high" ? 1024 : 512}
        shadow-bias={-0.0004}
      />
      <spotLight
        position={[-6, 3, -4]}
        angle={0.7}
        penumbra={1}
        intensity={60}
        color="#7fb0ff"
        distance={40}
      />
      <pointLight position={[0, -3, 4]} intensity={12} color="#ffd9a8" />

      <Environment resolution={128} frames={1}>
        <Lightformer
          intensity={2.2}
          position={[0, 3, 4]}
          scale={[8, 4, 1]}
          color="#fff0dc"
        />
        <Lightformer
          intensity={1.1}
          position={[-4, 1, -3]}
          scale={[4, 6, 1]}
          color="#9bc0ff"
        />
        <Lightformer
          intensity={1.4}
          position={[4, -2, 3]}
          scale={[5, 3, 1]}
          color="#ffbf87"
        />
      </Environment>

      {device.shadows && (
        <ContactShadows
          position={[0, -2.1, 0]}
          opacity={0.55}
          scale={14}
          blur={2.6}
          far={6}
          resolution={device.tier === "high" ? 512 : 256}
          color="#000000"
        />
      )}
    </>
  );
}
