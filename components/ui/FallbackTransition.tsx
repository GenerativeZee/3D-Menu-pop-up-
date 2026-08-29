"use client";

import { useMemo, useRef } from "react";
import { categories } from "@/config";
import { foodArtDataUri } from "@/lib/art";
import { useHeroMotionFrame } from "@/hooks/useHeroMotionFrame";

/**
 * No-WebGL / context-lost path. Still a genuine depth move — a CSS 3D transform
 * on a real perspective layer, driven by the exact same `heroMotion` timeline —
 * just without lighting, shadows or post. The menu stays fully usable.
 */
export function FallbackTransition() {
  const wrap = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);

  const art = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of categories) {
      map[c.shape] = foodArtDataUri({ hue: hueForShape(c.shape), seed: c.id, size: 512 });
    }
    return map;
  }, []);

  useHeroMotionFrame((m) => {
    const w = wrap.current;
    const i = img.current;
    if (!w || !i) return;
    w.style.opacity = m.visible ? "1" : "0";
    if (!m.visible) return;
    const e = m.emergence;
    const depth = -420 + e * 760;
    const scale = 0.6 + e * 1.05;
    const rotY = m.progress * 300;
    const blur = (1 - e) * 5;
    i.style.transform = `translate(-50%, -50%) translateZ(${depth}px) rotateY(${rotY}deg) rotateX(${
      m.rotX * 20
    }deg) scale(${scale})`;
    i.style.filter = `blur(${blur.toFixed(2)}px) saturate(1.1)`;
    i.style.opacity = String(Math.min(1, 0.3 + e * 1.4));
    if (i.dataset.shape !== m.shape) {
      i.dataset.shape = m.shape;
      i.src = art[m.shape] ?? art.pizza;
    }
  });

  return (
    <div
      ref={wrap}
      className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-200"
      style={{ perspective: "1000px", perspectiveOrigin: "50% 45%" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 60% at 50% 40%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={img}
        alt=""
        className="absolute left-1/2 top-1/2 h-[62vmin] w-[62vmin] rounded-[28%] object-cover will-change-transform"
        style={{
          transformStyle: "preserve-3d",
          boxShadow: "0 40px 120px -20px rgba(0,0,0,0.7)",
        }}
      />
    </div>
  );
}

function hueForShape(shape: string) {
  switch (shape) {
    case "pizza":
      return 16;
    case "burger":
      return 28;
    case "fries":
      return 44;
    case "drink":
      return 150;
    case "dessert":
      return 320;
    default:
      return 20;
  }
}
