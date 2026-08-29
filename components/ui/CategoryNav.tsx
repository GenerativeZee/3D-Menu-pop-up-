"use client";

import { categories } from "@/config";
import { useAppStore } from "@/store/useAppStore";

/**
 * Always-visible category rail. Horizontally scrollable on narrow phones,
 * generous 44px+ touch targets, active chip themed with the category accent.
 * Taps are accepted even mid-transition so rapid switching feels instant.
 */
export function CategoryNav() {
  const active = useAppStore((s) => s.activeCategory);
  const phase = useAppStore((s) => s.phase);
  const select = useAppStore((s) => s.selectCategory);

  return (
    <nav
      className="no-scrollbar relative z-30 flex gap-2 overflow-x-auto px-4 pb-[calc(env(safe-area-inset-bottom,0px)+14px)] pt-3"
      aria-label="Menu categories"
    >
      {categories.map((c) => {
        const isActive = c.id === active;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => select(c.id)}
            aria-pressed={isActive}
            className={`relative shrink-0 rounded-full px-5 py-3 text-sm font-medium tracking-wide transition-all duration-300 ${
              isActive
                ? "chip-active text-fg"
                : "text-muted hover:text-fg"
            }`}
            style={
              isActive
                ? {
                    background: `color-mix(in srgb, ${c.accent} 16%, transparent)`,
                  }
                : { background: "rgba(255,255,255,0.04)" }
            }
          >
            {c.label}
            {isActive && phase === "transitioning" && (
              <span className="ml-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent align-middle" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
