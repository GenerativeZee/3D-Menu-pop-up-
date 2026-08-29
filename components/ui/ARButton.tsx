"use client";

import { useEffect, useState } from "react";
import { categoryById } from "@/config";
import { useAppStore } from "@/store/useAppStore";
import { isARSupported, launchAR } from "@/lib/ar";

/**
 * "View on my table" — only renders when the device actually reports WebXR
 * immersive-ar support. Otherwise it stays hidden (no dead buttons).
 */
export function ARButton() {
  const active = useAppStore((s) => s.activeCategory);
  const [supported, setSupported] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    isARSupported().then((s) => alive && setSupported(s));
    return () => {
      alive = false;
    };
  }, []);

  if (!supported) return null;
  const cat = categoryById(active);

  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await launchAR({
            shape: cat.shape,
            modelUrl: cat.model,
            glbAvailable: false,
            accent: cat.accent,
            onEnd: () => setBusy(false),
            onError: () => setBusy(false),
          });
        } catch {
          setBusy(false);
        }
      }}
      className="flex items-center gap-2 rounded-full border border-hairline bg-white/5 px-4 py-2 text-xs font-medium text-fg backdrop-blur transition-colors active:bg-white/10 disabled:opacity-50"
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: "var(--accent)" }}
      />
      {busy ? "Opening AR…" : "View on my table"}
    </button>
  );
}
