"use client";

import { useState } from "react";
import { restaurant } from "@/config";
import { useAppStore } from "@/store/useAppStore";

/**
 * First-load veil. Doubles as the required user gesture: the tap unlocks audio
 * (kept muted regardless until the sound toggle is on) and kicks off the opening
 * cinematic for the default category.
 */
export function EntryVeil() {
  const markInteracted = useAppStore((s) => s.markInteracted);
  const playIntro = useAppStore((s) => s.playIntro);
  const device = useAppStore((s) => s.device);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  if (gone) return null;

  return (
    <button
      type="button"
      onClick={() => {
        markInteracted();
        setLeaving(true);
        window.setTimeout(() => playIntro(), 240);
        window.setTimeout(() => setGone(true), 900);
      }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 px-8 text-center transition-opacity duration-500"
      style={{
        opacity: leaving ? 0 : 1,
        background:
          "radial-gradient(120% 80% at 50% 30%, rgba(20,20,26,0.92), rgba(8,8,11,0.98))",
        backdropFilter: "blur(6px)",
      }}
    >
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.4em]"
        style={{ color: "var(--accent)" }}
      >
        Immersive Menu
      </p>
      <h1 className="font-display text-4xl leading-tight text-fg">
        {restaurant.name}
      </h1>
      <p className="max-w-[30ch] text-sm leading-relaxed text-muted">
        {restaurant.tagline}
      </p>
      <span className="mt-2 inline-flex items-center gap-2 rounded-full border border-hairline px-5 py-3 text-sm font-medium text-fg">
        <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
        Tap to open
      </span>
      {device && device.tier === "low" && (
        <p className="text-[11px] text-muted">
          Lite mode — effects reduced for this device
        </p>
      )}
    </button>
  );
}
