"use client";

/**
 * R3F wrapper around the shared hero geometry builder (`lib/foodMesh.ts`), so
 * the in-app hero and the WebXR AR session render byte-for-byte the same
 * stand-in. Drop a real GLB at the configured path and this is bypassed.
 */
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { HeroShape } from "@/config";
import { buildFoodMesh, disposeFoodMesh } from "@/lib/foodMesh";

export function ProceduralHero({ shape }: { shape: HeroShape }) {
  const object = useMemo(() => buildFoodMesh(THREE, shape), [shape]);

  useEffect(() => {
    return () => disposeFoodMesh(object);
  }, [object]);

  return <primitive object={object} />;
}
