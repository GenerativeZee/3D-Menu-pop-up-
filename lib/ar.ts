/**
 * Optional "View on my table" WebAR.
 *
 * Uses the native WebXR immersive-ar session with hit-testing (Android Chrome /
 * other WebXR UAs). No third-party runtime, no extra bundle unless invoked —
 * three is already in the graph. iOS Safari has no WebXR and no USDZ asset here,
 * so `isARSupported()` returns false there and the entry point simply hides.
 *
 * Everything is dynamically imported so this file costs nothing until used.
 */
import type { HeroShape } from "@/config";

export async function isARSupported(): Promise<boolean> {
  if (typeof navigator === "undefined") return false;
  const xr = (navigator as Navigator & { xr?: XRSystem }).xr;
  if (!xr?.isSessionSupported) return false;
  try {
    return await xr.isSessionSupported("immersive-ar");
  } catch {
    return false;
  }
}

export interface ARLaunchOptions {
  shape: HeroShape;
  modelUrl?: string;
  glbAvailable?: boolean;
  accent: string;
  onEnd?: () => void;
  onError?: (e: unknown) => void;
}

export async function launchAR(opts: ARLaunchOptions): Promise<void> {
  const THREE = await import("three");
  const xr = (navigator as Navigator & { xr?: XRSystem }).xr;
  if (!xr) throw new Error("WebXR unavailable");

  const session = await xr.requestSession("immersive-ar", {
    requiredFeatures: ["hit-test"],
    optionalFeatures: ["dom-overlay"],
    domOverlay:
      typeof document !== "undefined" && document.getElementById("ar-overlay")
        ? { root: document.getElementById("ar-overlay")! }
        : undefined,
  });

  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl", { xrCompatible: true })!;
  const renderer = new THREE.WebGLRenderer({ canvas, context: gl, alpha: true });
  renderer.autoClear = false;
  renderer.xr.enabled = true;
  await renderer.xr.setSession(session as unknown as XRSession);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera();

  scene.add(new THREE.HemisphereLight(0xffffff, 0x222233, 1.4));
  const dir = new THREE.DirectionalLight(0xffffff, 2);
  dir.position.set(1, 3, 2);
  scene.add(dir);

  // reticle
  const reticle = new THREE.Mesh(
    new THREE.RingGeometry(0.07, 0.09, 32).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(opts.accent) }),
  );
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle);

  // hero: reuse the procedural builder via a tiny inline mesh set is heavy to
  // import from a TSX module here, so use a compact stand-in that still reads as
  // the right food silhouette. Real GLBs load directly when present.
  let hero: import("three").Object3D;
  if (opts.glbAvailable && opts.modelUrl) {
    const { GLTFLoader } = await import(
      "three/examples/jsm/loaders/GLTFLoader.js"
    );
    const gltf = await new GLTFLoader().loadAsync(opts.modelUrl);
    hero = gltf.scene;
    const box = new THREE.Box3().setFromObject(hero);
    const size = new THREE.Vector3();
    box.getSize(size);
    const s = 0.22 / (Math.max(size.x, size.y, size.z) || 1);
    hero.scale.setScalar(s);
  } else {
    hero = buildStandIn(THREE, opts.shape, opts.accent);
  }
  hero.visible = false;
  scene.add(hero);

  const refSpace = await session.requestReferenceSpace("local");
  const viewerSpace = await session.requestReferenceSpace("viewer");
  const hitTestSource = await (
    session as unknown as {
      requestHitTestSource: (o: {
        space: XRReferenceSpace;
      }) => Promise<XRHitTestSource>;
    }
  ).requestHitTestSource({ space: viewerSpace });

  const onSelect = () => {
    if (reticle.visible) {
      hero.visible = true;
      hero.position.setFromMatrixPosition(reticle.matrix);
      hero.quaternion.setFromRotationMatrix(reticle.matrix);
    }
  };
  session.addEventListener("select", onSelect);

  renderer.setAnimationLoop((_t, frame) => {
    if (!frame) return;
    const results = frame.getHitTestResults(hitTestSource);
    if (results.length) {
      const pose = results[0].getPose(refSpace);
      if (pose) {
        reticle.visible = true;
        reticle.matrix.fromArray(pose.transform.matrix);
      }
    } else {
      reticle.visible = false;
    }
    if (hero.visible) hero.rotation.y += 0.01;
    renderer.render(scene, camera);
  });

  const cleanup = () => {
    session.removeEventListener("select", onSelect);
    renderer.setAnimationLoop(null);
    renderer.dispose();
    opts.onEnd?.();
  };
  session.addEventListener("end", cleanup);
}

function buildStandIn(
  THREE: typeof import("three"),
  shape: HeroShape,
  accent: string,
): import("three").Object3D {
  const g = new THREE.Group();
  const mat = (c: number | string, rough = 0.6) =>
    new THREE.MeshStandardMaterial({ color: new THREE.Color(c), roughness: rough });
  const add = (
    geo: import("three").BufferGeometry,
    m: import("three").Material,
    y = 0,
  ) => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.y = y;
    g.add(mesh);
    return mesh;
  };
  switch (shape) {
    case "pizza":
      add(new THREE.CylinderGeometry(0.13, 0.13, 0.012, 40), mat("#d7a24d"));
      add(new THREE.CylinderGeometry(0.115, 0.115, 0.006, 40), mat("#e7ba5b"), 0.01);
      break;
    case "burger":
      add(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 32), mat("#d99f5b"), -0.03);
      add(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 32), mat("#4a2c1c"), 0.005);
      add(
        new THREE.SphereGeometry(0.1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        mat("#dda45f"),
        0.03,
      );
      break;
    case "fries":
      add(new THREE.BoxGeometry(0.13, 0.14, 0.13), mat("#b83223"), -0.04);
      for (let i = 0; i < 8; i++) {
        const s = add(new THREE.BoxGeometry(0.014, 0.16, 0.014), mat("#e3b23c"), 0.04);
        s.position.x = (Math.random() - 0.5) * 0.1;
        s.position.z = (Math.random() - 0.5) * 0.1;
        s.rotation.z = (Math.random() - 0.5) * 0.4;
      }
      break;
    case "drink":
      add(
        new THREE.CylinderGeometry(0.07, 0.06, 0.2, 24),
        mat("#7c2f1b", 0.2),
      );
      break;
    case "dessert":
      add(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 32, 1, false, 0, 1.2), mat("#caa06a"), -0.02);
      add(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 32, 1, false, 0, 1.2), mat("#7c4a30"), 0.03);
      break;
  }
  const glow = new THREE.PointLight(new THREE.Color(accent), 0.6, 1);
  glow.position.set(0, 0.2, 0);
  g.add(glow);
  return g;
}
