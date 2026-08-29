/**
 * Optional "View on my table" AR.
 *
 * Two delivery paths, feature-detected at runtime — no third-party runtime, and
 * nothing here is imported until the button is actually tapped:
 *
 *  - **WebXR** (`immersive-ar` + hit-test): Android Chrome and other WebXR UAs.
 *    Full session below — surface detection, a reticle, tap-to-place with a
 *    grow-in, real-world light estimation when offered, and a soft contact
 *    shadow so the dish looks grounded.
 *  - **Quick Look** (`<a rel="ar">` + a `.usdz`): iOS Safari, which has no
 *    WebXR. Only offered when `/assets/3d/<shape>.usdz` exists.
 *  - Otherwise the entry point hides itself.
 */
import type { HeroShape } from "@/config";
import { buildFoodMesh, disposeFoodMesh } from "./foodMesh";

export type ARMode = "webxr" | "quicklook" | "none";

// `light-estimation` isn't in the bundled WebXR type defs — model just what we read.
interface XRLightProbeLike {
  readonly _lightProbe?: never;
}
interface Vec3Like {
  x: number;
  y: number;
  z: number;
}
interface XRLightEstimateLike {
  primaryLightDirection: Vec3Like;
  primaryLightIntensity: Vec3Like;
}

/** Real dinner-plate-ish footprint, metres. */
const PLACEMENT_DIAMETER = 0.26;

export async function detectWebXR(): Promise<boolean> {
  if (typeof navigator === "undefined") return false;
  const xr = (navigator as Navigator & { xr?: XRSystem }).xr;
  if (!xr?.isSessionSupported) return false;
  try {
    return await xr.isSessionSupported("immersive-ar");
  } catch {
    return false;
  }
}

/** iOS AR Quick Look: <a rel="ar"> is honoured and the relList reports "ar". */
export function supportsQuickLook(): boolean {
  if (typeof document === "undefined") return false;
  const a = document.createElement("a");
  return a.relList?.supports?.("ar") === true;
}

export async function usdzExists(url: string): Promise<boolean> {
  try {
    const r = await fetch(url, { method: "HEAD" });
    return r.ok && !(r.headers.get("content-type") ?? "").includes("text/html");
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/*  WebXR session                                                             */
/* -------------------------------------------------------------------------- */

export type ARStatus = "starting" | "scanning" | "placed" | "unsupported" | "error";

export interface WebXRLaunchOptions {
  shape: HeroShape;
  modelUrl?: string;
  glbAvailable?: boolean;
  accent: string;
  /** element passed to WebXR `domOverlay`; also where we mount the exit button */
  overlayRoot: HTMLElement;
  onStatus?: (status: ARStatus) => void;
  onEnd?: () => void;
  onError?: (e: unknown) => void;
}

export interface ARHandle {
  end: () => void;
}

export async function launchWebXR(opts: WebXRLaunchOptions): Promise<ARHandle> {
  const {
    shape,
    modelUrl,
    glbAvailable,
    accent,
    overlayRoot,
    onStatus,
    onEnd,
    onError,
  } = opts;

  onStatus?.("starting");
  const THREE = await import("three");
  const xr = (navigator as Navigator & { xr?: XRSystem }).xr;
  if (!xr) {
    onStatus?.("unsupported");
    throw new Error("WebXR unavailable");
  }

  let session: XRSession;
  try {
    session = await xr.requestSession("immersive-ar", {
      requiredFeatures: ["hit-test"],
      optionalFeatures: ["light-estimation", "dom-overlay", "local-floor"],
      domOverlay: { root: overlayRoot },
    });
  } catch (e) {
    onStatus?.("error");
    onError?.(e);
    throw e;
  }

  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl", {
    xrCompatible: true,
    alpha: true,
    antialias: true,
  }) as WebGLRenderingContext;

  const renderer = new THREE.WebGLRenderer({ canvas, context: gl, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.xr.enabled = true;
  await renderer.xr.setSession(session as unknown as XRSession);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera();

  // --- lighting (updated by light estimation if the UA offers it) -----------
  const hemi = new THREE.HemisphereLight(0xffffff, 0x223344, 1.1);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(0.6, 2.4, 0.4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 0.05;
  key.shadow.camera.far = 6;
  const c = key.shadow.camera as import("three").OrthographicCamera;
  c.left = c.bottom = -1;
  c.right = c.top = 1;
  c.updateProjectionMatrix();
  scene.add(key);
  scene.add(key.target);

  // --- reticle ------------------------------------------------------------------
  const reticle = new THREE.Mesh(
    new THREE.RingGeometry(0.07, 0.09, 40).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(accent),
      transparent: true,
      opacity: 0.95,
    }),
  );
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle);

  // --- the dish + a shadow catcher that travels with it ----------------------
  const placed = new THREE.Group();
  placed.visible = false;
  scene.add(placed);

  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2).rotateX(-Math.PI / 2),
    new THREE.ShadowMaterial({ opacity: 0.32 }),
  );
  shadowPlane.receiveShadow = true;
  placed.add(shadowPlane);

  const dishHolder = new THREE.Group();
  placed.add(dishHolder);

  let dish: import("three").Object3D | null = null;
  let disposeDish: (() => void) | null = null;

  if (glbAvailable && modelUrl) {
    try {
      const { GLTFLoader } = await import(
        "three/examples/jsm/loaders/GLTFLoader.js"
      );
      const gltf = await new GLTFLoader().loadAsync(modelUrl);
      dish = gltf.scene;
      dish.traverse((o) => {
        const m = o as import("three").Mesh;
        if (m.isMesh) {
          m.castShadow = true;
          m.receiveShadow = true;
        }
      });
    } catch (e) {
      onError?.(e);
    }
  }
  if (!dish) {
    dish = buildFoodMesh(THREE, shape);
    disposeDish = () => disposeFoodMesh(dish!);
  }

  // normalise to the placement footprint and sit it on the surface
  const box = new THREE.Box3().setFromObject(dish);
  const size = new THREE.Vector3();
  box.getSize(size);
  const norm = PLACEMENT_DIAMETER / (Math.max(size.x, size.z) || 1);
  const inner = new THREE.Group();
  inner.scale.setScalar(norm);
  box.getCenter(size);
  dish.position.sub(size); // centre
  dish.position.y += (box.max.y - box.min.y) / 2; // lift so base ≈ y0
  inner.add(dish);
  dishHolder.add(inner);

  // --- XR spaces + hit testing ------------------------------------------------
  const localSpace = await session.requestReferenceSpace("local");
  const viewerSpace = await session.requestReferenceSpace("viewer");
  const hitTestSource = await (
    session as unknown as {
      requestHitTestSource: (o: { space: XRReferenceSpace }) => Promise<XRHitTestSource>;
    }
  ).requestHitTestSource({ space: viewerSpace });

  // --- optional real-world light estimation ---------------------------------
  let lightProbe: XRLightProbeLike | null = null;
  try {
    const reqProbe = (
      session as unknown as {
        requestLightProbe?: () => Promise<XRLightProbeLike>;
      }
    ).requestLightProbe;
    if (reqProbe) lightProbe = await reqProbe.call(session);
  } catch {
    lightProbe = null;
  }

  let placedAt = 0;
  const placeAtReticle = () => {
    if (!reticle.visible) return;
    placed.visible = true;
    placed.position.setFromMatrixPosition(reticle.matrix);
    const q = new THREE.Quaternion();
    reticle.matrix.decompose(new THREE.Vector3(), q, new THREE.Vector3());
    placed.quaternion.copy(q);
    placedAt = performance.now();
    onStatus?.("placed");
  };
  session.addEventListener("select", placeAtReticle);

  onStatus?.("scanning");

  const easeOutBack = (x: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  };

  renderer.setAnimationLoop((_t, frame) => {
    if (!frame) return;

    const results = frame.getHitTestResults(hitTestSource);
    if (results.length) {
      const pose = results[0].getPose(localSpace);
      if (pose) {
        reticle.visible = !placed.visible || performance.now() - placedAt > 400;
        reticle.matrix.fromArray(pose.transform.matrix);
      }
    } else {
      reticle.visible = false;
    }

    if (lightProbe) {
      const est = (
        frame as unknown as {
          getLightEstimate?: (p: XRLightProbeLike) => XRLightEstimateLike | null;
        }
      ).getLightEstimate?.(lightProbe);
      if (est) {
        const i = est.primaryLightIntensity;
        const mag = Math.max(0.15, (i.x + i.y + i.z) / 3);
        key.intensity = Math.min(4, mag * 2.2);
        key.color.setRGB(
          i.x / mag || 1,
          i.y / mag || 1,
          i.z / mag || 1,
        );
        const d = est.primaryLightDirection;
        key.position.set(-d.x, Math.max(0.5, -d.y), -d.z).multiplyScalar(3);
        key.target.position.set(0, 0, 0);
        hemi.intensity = 0.6 + mag * 0.6;
      }
    }

    if (placed.visible) {
      const k = Math.min(1, (performance.now() - placedAt) / 420);
      dishHolder.scale.setScalar(Math.max(0.001, easeOutBack(k)));
      dishHolder.rotation.y += 0.006;
    }

    renderer.render(scene, camera);
  });

  const end = () => {
    session.end().catch(() => {});
  };

  const cleanup = () => {
    session.removeEventListener("select", placeAtReticle);
    renderer.setAnimationLoop(null);
    try {
      (hitTestSource as unknown as { cancel?: () => void }).cancel?.();
    } catch {
      /* noop */
    }
    disposeDish?.();
    reticle.geometry.dispose();
    (reticle.material as import("three").Material).dispose();
    shadowPlane.geometry.dispose();
    (shadowPlane.material as import("three").Material).dispose();
    renderer.dispose();
    onEnd?.();
  };
  session.addEventListener("end", cleanup);

  return { end };
}
