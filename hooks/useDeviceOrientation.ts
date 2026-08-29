"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface Tilt {
  /** -1..1 left/right */
  x: number;
  /** -1..1 up/down */
  y: number;
}

interface OrientationApi {
  tilt: React.RefObject<Tilt>;
  supported: boolean;
  permission: "unknown" | "granted" | "denied" | "unnecessary";
  request: () => Promise<void>;
}

type DOEvent = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

/**
 * Subtle gyroscope parallax. Values are written into a ref (no re-render) and
 * smoothed toward the target each event. iOS needs an explicit permission grant
 * from a user gesture — `request()` handles that and is a no-op elsewhere.
 */
export function useDeviceOrientation(enabled: boolean): OrientationApi {
  const tilt = useRef<Tilt>({ x: 0, y: 0 });
  const target = useRef<Tilt>({ x: 0, y: 0 });
  const raf = useRef<number | null>(null);
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] =
    useState<OrientationApi["permission"]>("unknown");

  useEffect(() => {
    const has =
      typeof window !== "undefined" && "DeviceOrientationEvent" in window;
    setSupported(has);
    const doe = has ? (window.DeviceOrientationEvent as DOEvent) : undefined;
    if (has && typeof doe?.requestPermission !== "function") {
      setPermission("unnecessary");
    }
  }, []);

  const request = useCallback(async () => {
    if (typeof window === "undefined") return;
    const doe = window.DeviceOrientationEvent as DOEvent | undefined;
    if (doe && typeof doe.requestPermission === "function") {
      try {
        const res = await doe.requestPermission();
        setPermission(res === "granted" ? "granted" : "denied");
      } catch {
        setPermission("denied");
      }
    } else {
      setPermission("unnecessary");
    }
  }, []);

  useEffect(() => {
    if (!enabled || !supported) return;
    if (permission === "denied") return;

    const onOrient = (e: DeviceOrientationEvent) => {
      // gamma: left/right [-90,90], beta: front/back [-180,180]
      const g = e.gamma ?? 0;
      const b = (e.beta ?? 0) - 45; // hold-phone-up neutral
      target.current.x = clamp(g / 35, -1, 1);
      target.current.y = clamp(b / 35, -1, 1);
    };

    const loop = () => {
      tilt.current.x += (target.current.x - tilt.current.x) * 0.08;
      tilt.current.y += (target.current.y - tilt.current.y) * 0.08;
      raf.current = requestAnimationFrame(loop);
    };

    window.addEventListener("deviceorientation", onOrient, true);
    raf.current = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("deviceorientation", onOrient, true);
      if (raf.current) cancelAnimationFrame(raf.current);
      target.current = { x: 0, y: 0 };
    };
  }, [enabled, supported, permission]);

  return { tilt, supported, permission, request };
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}
