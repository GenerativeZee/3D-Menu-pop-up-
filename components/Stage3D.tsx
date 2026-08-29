"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { categories } from "@/config";
import { useAppStore } from "@/store/useAppStore";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import { useModelExists } from "@/hooks/useModelExists";
import type { DeviceProfile } from "@/lib/performance";
import { HeroModel } from "./scene/HeroModel";
import { Rig } from "./scene/Rig";
import { Effects } from "./scene/Effects";
import { SceneErrorBoundary } from "./scene/ErrorBoundary";

/**
 * WebGL stage. Full-bleed, transparent canvas that sits between the CSS "deep
 * screen" background and the portal frame overlay, so a hero travelling from
 * z≈-9 to z≈+3 genuinely appears to rise out through the glass.
 */
function GlbProbe({
  url,
  onResult,
}: {
  url: string;
  onResult: (url: string, ok: boolean) => void;
}) {
  const exists = useModelExists(url);
  useEffect(() => {
    if (exists !== undefined) onResult(url, exists);
  }, [exists, url, onResult]);
  return null;
}

export default function Stage3D({ device }: { device: DeviceProfile }) {
  const orientationEnabled = useAppStore((s) => s.orientationEnabled);
  const reportWebglFailure = useAppStore((s) => s.reportWebglFailure);
  const reportModelError = useAppStore((s) => s.reportModelError);
  const { tilt } = useDeviceOrientation(orientationEnabled && !device.reducedMotion);

  const [glb, setGlb] = useState<Record<string, boolean>>({});
  const onResult = useMemo(
    () => (url: string, ok: boolean) =>
      setGlb((prev) => (prev[url] === ok ? prev : { ...prev, [url]: ok })),
    [],
  );

  return (
    <div className="absolute inset-0">
      {categories.map((c) => (
        <GlbProbe key={c.model} url={c.model} onResult={onResult} />
      ))}
      <SceneErrorBoundary onError={reportWebglFailure} fallback={null}>
        <Canvas
          dpr={device.dpr}
          gl={{
            antialias: !device.postFx,
            alpha: true,
            powerPreference: "high-performance",
            stencil: false,
            depth: true,
          }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener(
              "webglcontextlost",
              (e) => {
                e.preventDefault();
                reportWebglFailure();
              },
              { once: true },
            );
          }}
          style={{ position: "absolute", inset: 0 }}
        >
          <PerspectiveCamera makeDefault fov={40} near={0.1} far={100} position={[0, 0, 6.5]} />
          <Suspense fallback={null}>
            <Rig tilt={tilt} device={device} />
            <HeroModel
              tilt={tilt}
              glbAvailable={glb}
              onModelError={reportModelError}
            />
          </Suspense>
          {device.postFx && <Effects device={device} />}
        </Canvas>
      </SceneErrorBoundary>
    </div>
  );
}
