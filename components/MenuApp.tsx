"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { restaurant } from "@/config";
import { TopBar } from "./ui/TopBar";
import { CategoryNav } from "./ui/CategoryNav";
import { MenuView } from "./ui/MenuView";
import { PortalFrame } from "./ui/PortalFrame";
import { EntryVeil } from "./ui/EntryVeil";
import { ARButton } from "./ui/ARButton";
import { FallbackTransition } from "./ui/FallbackTransition";

const Stage3D = dynamic(() => import("./Stage3D"), {
  ssr: false,
  loading: () => null,
});

/**
 * Client root / orchestrator. Wires device detection → renderer choice →
 * cinematic transition controller → menu, keeping the 3D bundle out of the
 * initial payload via a lazy dynamic import.
 */
export function MenuApp() {
  const init = useAppStore((s) => s.init);
  const device = useAppStore((s) => s.device);
  const webglFailed = useAppStore((s) => s.webglFailed);
  const markInteracted = useAppStore((s) => s.markInteracted);

  useEffect(() => {
    init();
  }, [init]);

  const use3D = !!device && device.webgl && !webglFailed;

  return (
    <main
      className="app-shell"
      onPointerDownCapture={markInteracted}
    >
      {/* deep-screen backdrop — the "inside" of the phone */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 60% at 50% 32%, color-mix(in srgb, var(--accent) 10%, #0b0b10) 0%, #06060a 70%)",
        }}
      />

      {/* WebGL stage or CSS fallback, both driven by the same timeline */}
      {use3D ? <Stage3D device={device} /> : <FallbackTransition />}

      <PortalFrame />

      {/* UI layer */}
      <div className="relative z-30 flex h-full flex-col">
        <TopBar />
        <MenuView />
        <div className="pointer-events-none flex justify-center px-4 pb-1">
          <div className="pointer-events-auto">
            <ARButton />
          </div>
        </div>
        <CategoryNav />
      </div>

      <p className="pointer-events-none absolute inset-x-0 bottom-1 z-40 text-center text-[10px] text-muted/60">
        {restaurant.legal}
      </p>

      <EntryVeil />
    </main>
  );
}
