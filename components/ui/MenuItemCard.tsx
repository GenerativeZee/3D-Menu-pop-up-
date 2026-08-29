"use client";

import { useMemo } from "react";
import { restaurant, type MenuItem } from "@/config";
import { foodArtDataUri } from "@/lib/art";

export function MenuItemCard({ item, index }: { item: MenuItem; index: number }) {
  const art = useMemo(
    () => item.image ?? foodArtDataUri({ hue: item.hue, seed: item.id, size: 240 }),
    [item.image, item.hue, item.id],
  );

  return (
    <li
      className="rise flex gap-4 rounded-2xl border border-hairline bg-bg-elevated p-3"
      style={{ animationDelay: `${Math.min(index * 55, 400)}ms` }}
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={art}
          alt={item.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
        {item.signature && (
          <span
            className="absolute left-1 top-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-black"
            style={{ background: "var(--accent)" }}
          >
            ★
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-[17px] leading-tight text-fg">
            {item.name}
          </h3>
          <span className="shrink-0 text-[15px] font-medium tabular-nums text-fg">
            {restaurant.currency}
            {item.price}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-muted">
          {item.description}
        </p>
        {item.tags && item.tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {item.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-hairline px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}
