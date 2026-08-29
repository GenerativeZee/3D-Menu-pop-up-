"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { categoryById } from "@/config";
import { useAppStore } from "@/store/useAppStore";
import { foodArtDataUri } from "@/lib/art";
import { useModelExists } from "@/hooks/useModelExists";
import {
  detectWebXR,
  supportsQuickLook,
  usdzExists,
  launchWebXR,
  type ARMode,
  type ARStatus,
  type ARHandle,
} from "@/lib/ar";

const STATUS_COPY: Record<ARStatus, string> = {
  starting: "Starting camera…",
  scanning: "Move your phone slowly across the table",
  ready: "Tap anywhere to place it",
  placed: "Tap the floor again to move it",
  unsupported: "AR isn’t available on this device",
  insecure: "AR needs a secure page — open the https:// link",
  error: "Couldn’t start AR",
};

/**
 * "View on my table". Renders only when the device can actually do AR:
 *  - WebXR  → launches an immersive session with an in-session overlay.
 *  - iOS Quick Look → a native <a rel="ar"> link to a .usdz (when one exists).
 * Anything else: nothing (no dead buttons).
 */
export function ARButton() {
  const active = useAppStore((s) => s.activeCategory);
  const cat = categoryById(active);

  const glbReady = useModelExists(cat.model) === true;
  const usdzUrl = `/assets/3d/${cat.shape}.usdz`;

  const [mode, setMode] = useState<ARMode>("none");
  const [usdzOk, setUsdzOk] = useState(false);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<ARStatus>("starting");

  const overlayRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<ARHandle | null>(null);
  const wantStartRef = useRef(false);

  // one-time capability probe
  useEffect(() => {
    let alive = true;
    (async () => {
      if (await detectWebXR()) {
        if (alive) setMode("webxr");
      } else if (supportsQuickLook()) {
        if (alive) setMode("quicklook");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // re-check the .usdz whenever the category changes (Quick Look path)
  useEffect(() => {
    if (mode !== "quicklook") return;
    let alive = true;
    usdzExists(usdzUrl).then((ok) => alive && setUsdzOk(ok));
    return () => {
      alive = false;
    };
  }, [mode, usdzUrl]);

  // when we flip `running` on, the overlay has mounted — now open the session
  useEffect(() => {
    if (!running || !wantStartRef.current) return;
    wantStartRef.current = false;
    const root = overlayRef.current;
    if (!root) return;

    let cancelled = false;
    launchWebXR({
      shape: cat.shape,
      modelUrl: cat.model,
      glbAvailable: glbReady,
      accent: cat.accent,
      overlayRoot: root,
      onStatus: (s) => !cancelled && setStatus(s),
      onEnd: () => {
        if (!cancelled) {
          setRunning(false);
          handleRef.current = null;
        }
      },
      onError: () => {
        if (!cancelled) {
          setStatus((s) => (s === "insecure" || s === "unsupported" ? s : "error"));
          window.setTimeout(() => setRunning(false), 2600);
        }
      },
    })
      .then((h) => {
        if (cancelled) h.end();
        else handleRef.current = h;
      })
      .catch(() => {
        if (!cancelled) {
          setStatus((s) => (s === "insecure" || s === "unsupported" ? s : "error"));
          window.setTimeout(() => setRunning(false), 2600);
        }
      });

    return () => {
      cancelled = true;
      handleRef.current?.end();
      handleRef.current = null;
    };
  }, [running, cat.shape, cat.model, cat.accent, glbReady]);

  const startWebXR = useCallback(() => {
    setStatus("starting");
    wantStartRef.current = true;
    setRunning(true);
  }, []);

  if (mode === "none") return null;
  if (mode === "quicklook" && !usdzOk) return null;

  const label = (
    <>
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: "var(--accent)" }}
      />
      View on my table
    </>
  );
  const btnClass =
    "flex items-center gap-2 rounded-full border border-hairline bg-white/5 px-4 py-2 text-xs font-medium text-fg backdrop-blur transition-colors active:bg-white/10";

  if (mode === "quicklook") {
    return (
      <a rel="ar" href={usdzUrl} className={btnClass}>
        {/* Quick Look requires an <img> child */}
        <img
          src={foodArtDataUri({ hue: 20, seed: cat.id, size: 64 })}
          alt=""
          width={1}
          height={1}
          style={{ width: 1, height: 1, opacity: 0, position: "absolute" }}
        />
        {label}
      </a>
    );
  }

  return (
    <>
      <button type="button" onClick={startWebXR} disabled={running} className={btnClass}>
        {running ? "AR running…" : label}
      </button>

      {running && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[100] flex flex-col justify-between p-4"
          style={{ pointerEvents: "none" }}
        >
          <div className="flex justify-end" style={{ pointerEvents: "auto" }}>
            <button
              type="button"
              onClick={() => handleRef.current?.end()}
              className="rounded-full bg-black/55 px-4 py-2 text-sm font-medium text-white backdrop-blur"
            >
              Close
            </button>
          </div>
          <div className="mx-auto mb-6 rounded-full bg-black/55 px-4 py-2 text-center text-sm text-white backdrop-blur">
            {STATUS_COPY[status]}
          </div>
        </div>
      )}
    </>
  );
}
