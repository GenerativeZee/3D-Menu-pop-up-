"use client";

import { useRef } from "react";
import { useHeroMotionFrame } from "@/hooks/useHeroMotionFrame";

/**
 * The "phone glass" overlay. Sits above the WebGL canvas. Always shows a faint
 * screen bezel + sheen so the canvas reads as a window; during a transition the
 * `portal` value swells the inner shadow and lights an accent rim, which the
 * emerging hero visibly covers as it crosses the plane — the core of the
 * out-of-the-screen illusion.
 */
export function PortalFrame() {
  const ref = useRef<HTMLDivElement>(null);
  const rim = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);

  useHeroMotionFrame((m) => {
    const el = ref.current;
    if (!el) return;
    const p = m.portal;
    const e = m.emergence;
    el.style.opacity = String(0.5 + p * 0.5);
    el.style.setProperty(
      "--inner",
      `${18 + p * 46}px`,
    );
    el.style.setProperty("--inner-alpha", String(0.35 + p * 0.4));
    if (rim.current) {
      rim.current.style.opacity = String(p * (0.35 + e * 0.5));
    }
    if (glow.current) {
      glow.current.style.opacity = String(e * 0.5);
      glow.current.style.transform = `scale(${0.6 + e * 0.9})`;
    }
  });

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {/* centre bloom the hero pushes through */}
      <div
        ref={glow}
        className="absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 will-change-transform"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--accent) 55%, transparent) 0%, transparent 62%)",
          filter: "blur(24px)",
        }}
      />
      {/* bezel + inner shadow */}
      <div
        ref={ref}
        className="absolute inset-0"
        style={{
          boxShadow:
            "inset 0 0 var(--inner,18px) rgba(0,0,0,var(--inner-alpha,0.35)), inset 0 0 120px rgba(0,0,0,0.55)",
          background:
            "radial-gradient(130% 90% at 50% 8%, rgba(255,255,255,0.05), transparent 42%)",
        }}
      />
      {/* accent rim light */}
      <div
        ref={rim}
        className="absolute inset-0 opacity-0"
        style={{
          boxShadow:
            "inset 0 0 2px color-mix(in srgb, var(--accent) 90%, white), inset 0 0 40px color-mix(in srgb, var(--accent) 40%, transparent)",
        }}
      />
      {/* fixed top glass sheen */}
      <div
        className="absolute inset-x-0 top-0 h-40"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.06), transparent)",
        }}
      />
    </div>
  );
}
