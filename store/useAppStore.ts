"use client";

import { create } from "zustand";
import {
  categoryById,
  defaultCategory,
  type CategoryId,
} from "@/config";
import { detectDevice, type DeviceProfile } from "@/lib/performance";
import {
  runTransition,
  killTransition,
  isTransitioning,
} from "@/lib/transition";
import { sound } from "@/lib/sound";

export type Phase = "idle" | "transitioning";

interface AppState {
  device: DeviceProfile | null;
  /** highlighted in the nav + drives accent theming, updates immediately on tap */
  activeCategory: CategoryId;
  /** the menu actually rendered behind the scene, swaps mid-transition */
  menuCategory: CategoryId;
  phase: Phase;
  soundEnabled: boolean;
  orientationEnabled: boolean;
  webglFailed: boolean;
  modelError: boolean;
  interacted: boolean;

  init: () => void;
  playIntro: () => void;
  selectCategory: (id: CategoryId) => void;
  toggleSound: () => void;
  setOrientationEnabled: (v: boolean) => void;
  reportWebglFailure: () => void;
  reportModelError: () => void;
  markInteracted: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  device: null,
  activeCategory: defaultCategory,
  menuCategory: defaultCategory,
  phase: "idle",
  soundEnabled: false,
  orientationEnabled: false,
  webglFailed: false,
  modelError: false,
  interacted: false,

  init: () => {
    if (get().device) return;
    const device = detectDevice();
    set({ device, webglFailed: !device.webgl });
  },

  playIntro: () => {
    const { device, activeCategory, phase } = get();
    if (!device || phase === "transitioning") return;
    const to = categoryById(activeCategory);
    applyAccent(to.accent, to.accentSoft);
    set({ phase: "transitioning" });
    runTransition({
      to,
      duration: device.transitionDuration,
      reducedMotion: device.reducedMotion,
      lite: device.tier === "low",
      onMenuSwap: () => set({ menuCategory: activeCategory }),
      onDone: () => set({ phase: "idle" }),
    });
  },

  selectCategory: (id) => {
    const { activeCategory, phase, device } = get();
    if (!device) return;
    if (id === activeCategory && phase === "idle") return;
    if (id === activeCategory && phase === "transitioning") return;

    const to = categoryById(id);
    set({ activeCategory: id, phase: "transitioning" });

    // apply the accent theme right away
    applyAccent(to.accent, to.accentSoft);

    if (isTransitioning()) killTransition();

    runTransition({
      to,
      duration: device.transitionDuration,
      reducedMotion: device.reducedMotion,
      lite: device.tier === "low",
      onMenuSwap: () => set({ menuCategory: id }),
      onDone: () => set({ phase: "idle" }),
    });
  },

  toggleSound: () => {
    const next = !get().soundEnabled;
    sound?.setEnabled(next);
    set({ soundEnabled: next });
  },

  setOrientationEnabled: (v) => set({ orientationEnabled: v }),
  reportWebglFailure: () => set({ webglFailed: true }),
  reportModelError: () => set({ modelError: true }),
  markInteracted: () => {
    if (get().interacted) return;
    sound?.unlock();
    set({ interacted: true });
  },
}));

function applyAccent(accent: string, soft: string) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--accent", accent);
  root.style.setProperty("--accent-soft", soft);
}
