/**
 * Device capability detection.
 *
 * Produces a coarse tier that the renderer, post-processing stack and the
 * transition timing all read from. Deliberately cheap: one WebGL probe plus a
 * few navigator hints, memoised for the session.
 */

export type PerfTier = "high" | "medium" | "low";

export interface DeviceProfile {
  tier: PerfTier;
  /** capped device pixel ratio for the renderer */
  dpr: [number, number];
  /** whether the heavy post-processing stack should mount */
  postFx: boolean;
  /** whether depth of field is affordable */
  dof: boolean;
  /** whether shadow maps should render */
  shadows: boolean;
  /** total cinematic duration in seconds */
  transitionDuration: number;
  /** honour reduced-motion */
  reducedMotion: boolean;
  /** gpu renderer string if we could read it */
  gpu: string | null;
  webgl: boolean;
}

let cached: DeviceProfile | null = null;

function readGpu(): { webgl: boolean; gpu: string | null } {
  if (typeof document === "undefined") return { webgl: false, gpu: null };
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return { webgl: false, gpu: null };
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    const gpu = dbg
      ? (gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) as string)
      : null;
    return { webgl: true, gpu };
  } catch {
    return { webgl: false, gpu: null };
  }
}

export function detectDevice(): DeviceProfile {
  if (cached) return cached;

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

  const { webgl, gpu } = readGpu();

  const nav = typeof navigator !== "undefined" ? navigator : ({} as Navigator);
  const cores = nav.hardwareConcurrency ?? 4;
  // deviceMemory is Chromium-only
  const memory = (nav as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const coarse =
    typeof window !== "undefined" &&
    window.matchMedia?.("(pointer: coarse)").matches === true;

  const gpuLower = (gpu ?? "").toLowerCase();
  const weakGpu =
    /(apple a[789]|mali-4|mali-t|adreno [23]|powervr|videocore|swiftshader|llvmpipe|intel.*hd graphics [23-5]0{2})/.test(
      gpuLower,
    );
  const strongGpu =
    /(apple m[1-9]|apple a1[4-9]|apple a[2-9]\d|rtx|radeon rx|adreno 7|adreno 6[5-9]|mali-g7|mali-g([89]\d))/.test(
      gpuLower,
    );

  let tier: PerfTier;
  if (!webgl) {
    tier = "low";
  } else if (weakGpu || cores <= 4 || memory <= 3) {
    tier = "low";
  } else if (strongGpu && cores >= 8 && memory >= 6 && !coarse) {
    tier = "high";
  } else if (strongGpu || (cores >= 6 && memory >= 4)) {
    tier = "high";
  } else {
    tier = "medium";
  }

  const profile: DeviceProfile = {
    tier,
    webgl,
    gpu,
    reducedMotion,
    dpr:
      tier === "high" ? [1, 2] : tier === "medium" ? [1, 1.5] : [0.75, 1],
    postFx: tier !== "low" && !reducedMotion,
    dof: tier === "high" && !reducedMotion,
    shadows: tier !== "low",
    transitionDuration: reducedMotion
      ? 0.7
      : tier === "high"
        ? 2.3
        : tier === "medium"
          ? 1.9
          : 1.5,
  };

  cached = profile;
  return profile;
}

/** test-only reset */
export function _resetDeviceProfile() {
  cached = null;
}
