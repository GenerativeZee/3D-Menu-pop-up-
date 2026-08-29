"use client";

import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

/**
 * Loads a production GLB/GLTF hero, normalises it to a consistent bounding size
 * and turns on shadow casting so it drops straight into the same lighting rig as
 * the procedural stand-ins. Suspends while loading; throws on parse failure so
 * the surrounding SceneErrorBoundary can fall back.
 */
export function GLBHero({ url, targetSize = 3.2 }: { url: string; targetSize?: number }) {
  const { scene } = useGLTF(url);

  const prepared = useMemo(() => {
    const root = scene.clone(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxAxis = Math.max(size.x, size.y, size.z) || 1;
    const s = targetSize / maxAxis;
    root.position.sub(center);
    const wrap = new THREE.Group();
    wrap.add(root);
    wrap.scale.setScalar(s);
    wrap.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    return wrap;
  }, [scene, targetSize]);

  useEffect(() => {
    return () => {
      prepared.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          m.geometry?.dispose?.();
          const mat = m.material;
          if (Array.isArray(mat)) mat.forEach((x) => x.dispose?.());
          else mat?.dispose?.();
        }
      });
    };
  }, [prepared]);

  return <primitive object={prepared} />;
}
