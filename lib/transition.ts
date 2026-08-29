/**
 * Cinematic transition controller.
 *
 * A single mutable `heroMotion` object is tweened by a GSAP timeline and read
 * every frame by whichever renderer is active (the WebGL scene via useFrame, or
 * the CSS fallback via rAF). Keeping motion out of React state means the 60fps
 * animation never triggers a re-render.
 */
import { gsap } from "gsap";
import type { CategoryConfig } from "@/config";
import { sound } from "./sound";

export interface HeroMotion {
  /** world-space z of the hero group; negative = deep inside the screen */
  z: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  /** multiplier on the hero's configured base scale */
  scale: number;
  /** hero should render at all */
  visible: boolean;
  /** 0..1 progress along the emerge→return arc, for effects */
  progress: number;
  /** 0..1 "how far out of the glass" — peaks at the closest point */
  emergence: number;
  /** 0..1 portal / vignette intensity */
  portal: number;
  /** 0..1 short camera shake impulse at the peak */
  shake: number;
  /** which shape the renderer should show */
  shape: CategoryConfig["shape"];
  accent: string;
  /** configured base scale of the current hero */
  baseScale: number;
}

export const heroMotion: HeroMotion = {
  z: -12,
  rotX: 0,
  rotY: 0,
  rotZ: 0,
  scale: 1,
  visible: false,
  progress: 0,
  emergence: 0,
  portal: 0,
  shake: 0,
  shape: "pizza",
  accent: "#e8a13c",
  baseScale: 1,
};

export interface RunOptions {
  to: CategoryConfig;
  duration: number;
  reducedMotion: boolean;
  /** low tier skips the extra flourish beats */
  lite: boolean;
  /** swap the visible menu to the new category (call near the end of the arc) */
  onMenuSwap: () => void;
  /** transition fully finished, renderer can idle */
  onDone: () => void;
}

let tl: gsap.core.Timeline | null = null;

export function isTransitioning() {
  return tl !== null && tl.isActive();
}

export function killTransition() {
  tl?.kill();
  tl = null;
}

export function runTransition(opts: RunOptions) {
  const { to, duration, reducedMotion, lite, onMenuSwap, onDone } = opts;
  tl?.kill();

  const t = to.transition;
  heroMotion.shape = to.shape;
  heroMotion.accent = to.accent;
  heroMotion.baseScale = t.scale;
  heroMotion.visible = true;

  // start deep unless we're already mid-flight (rapid re-tap) — then glide from
  // wherever the hero currently is for continuity.
  const midFlight = heroMotion.progress > 0.02 && heroMotion.progress < 0.98;
  if (!midFlight) {
    heroMotion.z = t.depthStart;
    heroMotion.rotX = -0.5 + Math.random() * 0.4;
    heroMotion.rotY = -0.8 + Math.random() * 0.6;
    heroMotion.rotZ = -0.12 + Math.random() * 0.24;
    heroMotion.scale = 0.82;
    heroMotion.progress = 0;
    heroMotion.emergence = 0;
  }

  const D = Math.max(0.4, duration);
  tl = gsap.timeline({
    onComplete: () => {
      heroMotion.visible = false;
      heroMotion.progress = 0;
      heroMotion.emergence = 0;
      heroMotion.portal = 0;
      heroMotion.shake = 0;
      tl = null;
      onDone();
    },
  });

  if (reducedMotion) {
    // Respectful, near-instant: a brief portal flash and a shallow push.
    tl.to(heroMotion, { portal: 1, duration: D * 0.25, ease: "power2.out" }, 0)
      .to(
        heroMotion,
        {
          z: t.depthPeak * 0.35,
          scale: 1,
          emergence: 0.5,
          progress: 0.6,
          duration: D * 0.45,
          ease: "power2.inOut",
        },
        0,
      )
      .add(onMenuSwap, D * 0.5)
      .to(
        heroMotion,
        { z: t.depthStart, emergence: 0, progress: 1, duration: D * 0.4, ease: "power2.in" },
        D * 0.5,
      )
      .to(heroMotion, { portal: 0, duration: D * 0.25, ease: "power2.in" }, D * 0.75);
    return tl;
  }

  const spin = t.spin;
  const baseRotY = heroMotion.rotY;

  // ---- ACT 1 · portal opens, menu is already sliding out (React/CSS) --------
  tl.to(heroMotion, { portal: 1, duration: D * 0.18, ease: "power2.out" }, 0);

  // ---- ACT 2 · emergence: travel toward the viewer, growing by perspective --
  tl.to(
    heroMotion,
    {
      z: t.depthPeak,
      scale: 1,
      rotY: baseRotY + spin * 0.62,
      rotX: 0.15,
      rotZ: 0,
      progress: 0.58,
      emergence: 1,
      duration: D * 0.5,
      ease: "power3.inOut",
    },
    D * 0.06,
  );
  tl.call(() => sound?.play("emerge"), undefined, D * 0.06);

  // ---- ACT 3 · the peak beat: closest point, a body-thump + micro shake -----
  if (!lite) {
    tl.to(
      heroMotion,
      { scale: 1.06, duration: D * 0.09, ease: "power2.out" },
      D * 0.5,
    )
      .to(heroMotion, { scale: 1, duration: D * 0.12, ease: "power2.inOut" }, D * 0.59)
      .fromTo(
        heroMotion,
        { shake: 1 },
        { shake: 0, duration: D * 0.28, ease: "power2.out" },
        D * 0.5,
      );
    tl.call(() => sound?.play("peak"), undefined, D * 0.5);
  }

  // ---- ACT 4 · return: accelerate back through the glass, finish the spin ---
  tl.to(
    heroMotion,
    {
      z: t.depthStart - 2.5,
      scale: 0.8,
      rotY: baseRotY + spin,
      rotX: -0.3,
      progress: 1,
      emergence: 0,
      duration: D * 0.34,
      ease: "power2.in",
    },
    D * 0.62,
  );
  tl.call(() => sound?.play("return"), undefined, D * 0.66);

  // reveal the new menu just before the hero is fully gone
  tl.add(onMenuSwap, D * 0.78);

  // ---- ACT 5 · portal closes ---------------------------------------------------
  tl.to(heroMotion, { portal: 0, duration: D * 0.2, ease: "power2.in" }, D * 0.8);

  return tl;
}
