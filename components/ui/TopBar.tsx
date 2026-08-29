"use client";

import { useEffect, useState } from "react";
import { restaurant } from "@/config";
import { useAppStore } from "@/store/useAppStore";

function IconSound({ on }: { on: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 9v6h4l5 4V5L8 9H4z"
        fill="currentColor"
      />
      {on ? (
        <path
          d="M16 8.5a4 4 0 0 1 0 7M18.5 6a7.5 7.5 0 0 1 0 12"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M17 9l4 6M21 9l-4 6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

function IconTilt({ on }: { on: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="7"
        y="3"
        width="10"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
        transform="rotate(-12 12 12)"
      />
      {on && (
        <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      )}
    </svg>
  );
}

export function TopBar() {
  const soundEnabled = useAppStore((s) => s.soundEnabled);
  const toggleSound = useAppStore((s) => s.toggleSound);
  const orientationEnabled = useAppStore((s) => s.orientationEnabled);
  const setOrientationEnabled = useAppStore((s) => s.setOrientationEnabled);
  const device = useAppStore((s) => s.device);
  const [table, setTable] = useState(restaurant.defaultTable);
  // Gate anything that depends on browser globals until after hydration so the
  // server and first client render produce identical markup.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const p = new URLSearchParams(window.location.search);
    const t = p.get("t") || p.get("table");
    if (t) setTable(t);
  }, []);

  const showTilt =
    mounted &&
    "DeviceOrientationEvent" in window &&
    !device?.reducedMotion;

  return (
    <header className="relative z-30 flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-2">
      <div className="min-w-0">
        <p className="truncate font-display text-base leading-tight text-fg">
          {restaurant.name}
        </p>
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
          Table {table}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {showTilt && (
          <button
            type="button"
            aria-pressed={orientationEnabled}
            aria-label="Toggle tilt parallax"
            onClick={() => setOrientationEnabled(!orientationEnabled)}
            className={`grid h-9 w-9 place-items-center rounded-full border transition-colors ${
              orientationEnabled
                ? "border-transparent bg-accent-soft text-accent"
                : "border-hairline text-muted"
            }`}
          >
            <IconTilt on={orientationEnabled} />
          </button>
        )}
        <button
          type="button"
          aria-pressed={soundEnabled}
          aria-label="Toggle sound"
          onClick={toggleSound}
          className={`grid h-9 w-9 place-items-center rounded-full border transition-colors ${
            soundEnabled
              ? "border-transparent bg-accent-soft text-accent"
              : "border-hairline text-muted"
          }`}
        >
          <IconSound on={soundEnabled} />
        </button>
      </div>
    </header>
  );
}
