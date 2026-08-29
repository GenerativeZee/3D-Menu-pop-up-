/**
 * Deterministic "plated food" art panels rendered as inline SVG data URIs.
 *
 * These keep the build fully self-contained (no external image hosts, no bundle
 * weight) while still looking warm and appetising. When a real photograph is set
 * on a menu item via `image`, that wins and this is never called.
 */

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export interface ArtOptions {
  hue: number;
  seed: string;
  /** output square size */
  size?: number;
}

/**
 * Build an SVG string — a soft-lit plate with layered organic blobs in a warm
 * palette derived from `hue`, plus film grain.
 */
export function foodArtSvg({ hue, seed, size = 640 }: ArtOptions): string {
  const rnd = mulberry32(hashString(seed));
  const h = ((hue % 360) + 360) % 360;
  const bg1 = `hsl(${(h + 8) % 360} 32% 12%)`;
  const bg2 = `hsl(${(h + 24) % 360} 40% 6%)`;
  const plate = `hsl(${h} 18% 20%)`;
  const food1 = `hsl(${h} 68% 52%)`;
  const food2 = `hsl(${(h + 18) % 360} 74% 44%)`;
  const food3 = `hsl(${(h - 14 + 360) % 360} 58% 60%)`;
  const cx = size / 2;
  const cy = size / 2;

  const blobs: string[] = [];
  const count = 5 + Math.floor(rnd() * 4);
  for (let i = 0; i < count; i++) {
    const a = rnd() * Math.PI * 2;
    const r = (0.05 + rnd() * 0.24) * size;
    const dist = rnd() * size * 0.17;
    const x = cx + Math.cos(a) * dist;
    const y = cy + Math.sin(a) * dist;
    const fill = [food1, food2, food3][i % 3];
    const op = 0.55 + rnd() * 0.4;
    blobs.push(
      `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(
        1,
      )}" fill="${fill}" opacity="${op.toFixed(2)}" />`,
    );
  }

  const specks: string[] = [];
  for (let i = 0; i < 26; i++) {
    const a = rnd() * Math.PI * 2;
    const dist = rnd() * size * 0.26;
    const x = cx + Math.cos(a) * dist;
    const y = cy + Math.sin(a) * dist;
    specks.push(
      `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(
        1 +
        rnd() * 3.4
      ).toFixed(1)}" fill="hsl(${(h + 40) % 360} 80% 72%)" opacity="${(
        0.25 +
        rnd() * 0.5
      ).toFixed(2)}" />`,
    );
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="bg" cx="42%" cy="34%" r="75%">
      <stop offset="0%" stop-color="${bg1}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </radialGradient>
    <radialGradient id="spot" cx="40%" cy="30%" r="60%">
      <stop offset="0%" stop-color="hsl(${(h + 30) % 360} 90% 78%)" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="hsl(${(h + 30) % 360} 90% 78%)" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="${size * 0.014}"/></filter>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.06 0"/>
      <feComposite operator="over" in2="SourceGraphic"/>
    </filter>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#bg)"/>
  <g filter="url(#grain)">
    <ellipse cx="${cx}" cy="${cy + size * 0.03}" rx="${size * 0.4}" ry="${
      size * 0.37
    }" fill="#000" opacity="0.45" filter="url(#soft)"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${size * 0.36}" ry="${size * 0.34}" fill="${plate}"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${size * 0.30}" ry="${size * 0.28}" fill="hsl(${h} 16% 15%)"/>
    <g filter="url(#soft)">${blobs.join("")}</g>
    ${specks.join("")}
    <ellipse cx="${cx - size * 0.08}" cy="${cy - size * 0.1}" rx="${
      size * 0.26
    }" ry="${size * 0.2}" fill="url(#spot)"/>
  </g>
</svg>`;
}

export function foodArtDataUri(opts: ArtOptions): string {
  const svg = foodArtSvg(opts);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
