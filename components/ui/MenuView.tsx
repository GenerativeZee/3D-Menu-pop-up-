"use client";

import { useEffect, useRef } from "react";
import { categoryById, menu } from "@/config";
import { useAppStore } from "@/store/useAppStore";
import { MenuItemCard } from "./MenuItemCard";

/**
 * The actual menu. Keyed by `menuCategory` so the whole list re-mounts (and the
 * staggered `rise` animation replays) exactly when the hero disappears back into
 * the screen. Scrolls independently; the 3D stage stays fixed behind it.
 */
export function MenuView() {
  const menuCategory = useAppStore((s) => s.menuCategory);
  const phase = useAppStore((s) => s.phase);
  const cat = categoryById(menuCategory);
  const items = menu[menuCategory];
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [menuCategory]);

  return (
    <div
      ref={scroller}
      key={menuCategory}
      className="no-scrollbar relative z-10 flex-1 overflow-y-auto overscroll-contain px-4"
      style={{
        // dim + push back slightly while the cinematic runs
        opacity: phase === "transitioning" ? 0.12 : 1,
        transform: phase === "transitioning" ? "scale(0.96) translateY(8px)" : "none",
        filter: phase === "transitioning" ? "blur(2px)" : "none",
        transition: "opacity .45s var(--ease-cinematic), transform .55s var(--ease-cinematic), filter .45s",
      }}
      aria-hidden={phase === "transitioning"}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center overflow-hidden">
        <span
          className="rise select-none font-display text-[26vw] font-black leading-none text-fg opacity-[0.04]"
          style={{ letterSpacing: "-0.04em" }}
        >
          {cat.wordmark}
        </span>
      </div>

      <header className="rise pt-4">
        <p
          className="text-xs font-semibold uppercase tracking-[0.28em]"
          style={{ color: "var(--accent)" }}
        >
          {cat.label}
        </p>
        <p className="mt-2 max-w-[34ch] font-display text-lg leading-snug text-fg">
          {cat.blurb}
        </p>
      </header>

      <ul className="mt-5 flex flex-col gap-3 pb-6">
        {items.map((item, i) => (
          <MenuItemCard key={item.id} item={item} index={i} />
        ))}
      </ul>
    </div>
  );
}
