"use client";

import { useEffect, useState } from "react";

const cache = new Map<string, boolean>();

/**
 * Cheap HEAD probe so we only ever call `useGLTF` for assets that are actually
 * deployed. Missing GLBs therefore fall straight through to procedural heroes
 * instead of throwing inside Suspense.
 *
 * Returns: undefined = still checking, true/false = resolved.
 */
export function useModelExists(url: string): boolean | undefined {
  const [exists, setExists] = useState<boolean | undefined>(
    cache.has(url) ? cache.get(url) : undefined,
  );

  useEffect(() => {
    if (cache.has(url)) {
      setExists(cache.get(url));
      return;
    }
    let alive = true;
    fetch(url, { method: "HEAD" })
      .then((r) => {
        const ok =
          r.ok &&
          !(r.headers.get("content-type") ?? "").includes("text/html");
        cache.set(url, ok);
        if (alive) setExists(ok);
      })
      .catch(() => {
        cache.set(url, false);
        if (alive) setExists(false);
      });
    return () => {
      alive = false;
    };
  }, [url]);

  return exists;
}
