"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { heroMotion, type HeroMotion } from "@/lib/transition";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Runs `fn(heroMotion)` on every animation frame without ever touching React
 * state — for DOM overlays that need to follow the cinematic (portal frame, CSS
 * fallback hero). The callback is kept in a ref so it can close over fresh props
 * without restarting the loop.
 */
export function useHeroMotionFrame(fn: (m: HeroMotion) => void, active = true) {
  const cb = useRef(fn);
  useIsomorphicLayoutEffect(() => {
    cb.current = fn;
  });

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const tick = () => {
      cb.current(heroMotion);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);
}
