/**
 * Framework-agnostic hero geometry builder.
 *
 * One source of truth for the hand-built food stand-ins, used by BOTH the R3F
 * scene (`components/scene/ProceduralModels.tsx`) and the raw-three WebXR AR
 * session (`lib/ar.ts`). Pass in the `three` namespace so it works whether
 * `three` was imported statically or via `await import("three")`.
 */
import type { HeroShape } from "@/config";

type THREENS = typeof import("three");

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function std(
  THREE: THREENS,
  color: string,
  opts: { roughness?: number; metalness?: number; emissive?: string; emissiveIntensity?: number; transparent?: boolean; opacity?: number } = {},
) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: opts.roughness ?? 0.6,
    metalness: opts.metalness ?? 0,
    emissive: opts.emissive ? new THREE.Color(opts.emissive) : undefined,
    emissiveIntensity: opts.emissiveIntensity ?? 1,
    transparent: opts.transparent ?? false,
    opacity: opts.opacity ?? 1,
  });
}

function mesh(
  THREE: THREENS,
  geo: import("three").BufferGeometry,
  mat: import("three").Material,
  pos: [number, number, number] = [0, 0, 0],
  rot: [number, number, number] = [0, 0, 0],
  scale: [number, number, number] | number = 1,
) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(...pos);
  m.rotation.set(...rot);
  if (typeof scale === "number") m.scale.setScalar(scale);
  else m.scale.set(...scale);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/* -------------------------------------------------------------------------- */

function buildPizza(THREE: THREENS) {
  const g = new THREE.Group();
  const r = rng(7);
  g.add(mesh(THREE, new THREE.CylinderGeometry(1.62, 1.6, 0.14, 56), std(THREE, "#c9903f", { roughness: 0.92 }), [0, -0.02, 0]));
  g.add(mesh(THREE, new THREE.TorusGeometry(1.5, 0.17, 16, 56), std(THREE, "#d7a24d", { roughness: 0.85 }), [0, 0.02, 0], [-Math.PI / 2, 0, 0]));
  g.add(mesh(THREE, new THREE.CylinderGeometry(1.44, 1.46, 0.07, 56), std(THREE, "#e7ba5b", { roughness: 0.62 }), [0, 0.09, 0]));
  g.add(mesh(THREE, new THREE.CylinderGeometry(1.4, 1.42, 0.03, 56), std(THREE, "#efc978", { roughness: 0.45, emissive: "#3a2a10", emissiveIntensity: 0.15 }), [0, 0.12, 0]));
  for (let i = 0; i < 9; i++) {
    const a = r() * Math.PI * 2;
    const rad = 0.35 + r() * 0.95;
    const s = 0.13 + r() * 0.05;
    g.add(mesh(THREE, new THREE.CylinderGeometry(s, s, 0.05, 20), std(THREE, "#a5311d", { roughness: 0.55 }), [Math.cos(a) * rad, 0.16, Math.sin(a) * rad]));
  }
  for (let i = 0; i < 7; i++) {
    const a = r() * Math.PI * 2;
    const rad = 0.3 + r() * 1.0;
    const s = 0.12 + r() * 0.06;
    g.add(mesh(THREE, new THREE.SphereGeometry(1, 10, 8), std(THREE, "#3f7d2e", { roughness: 0.5 }), [Math.cos(a) * rad, 0.17, Math.sin(a) * rad], [0, r() * Math.PI, 0], [s, s * 0.35, s * 1.5]));
  }
  return g;
}

function buildBurger(THREE: THREENS) {
  const g = new THREE.Group();
  const r = rng(21);
  g.add(mesh(THREE, new THREE.CylinderGeometry(1.0, 1.06, 0.5, 40), std(THREE, "#d99f5b", { roughness: 0.75 }), [0, -0.78, 0]));
  g.add(mesh(THREE, new THREE.CylinderGeometry(1.08, 1.08, 0.34, 40), std(THREE, "#4a2c1c", { roughness: 0.85 }), [0, -0.42, 0]));
  g.add(mesh(THREE, new THREE.BoxGeometry(1.85, 0.07, 1.85), std(THREE, "#f0a92e", { roughness: 0.4 }), [0, -0.2, 0], [0.03, 0.4, 0.03]));
  g.add(mesh(THREE, new THREE.TorusGeometry(0.95, 0.22, 10, 28), std(THREE, "#5f9a3c", { roughness: 0.6 }), [0, -0.06, 0], [0, 0, 0], [1.12, 0.5, 1.12]));
  g.add(mesh(THREE, new THREE.CylinderGeometry(0.95, 0.95, 0.12, 28), std(THREE, "#c0392b", { roughness: 0.5 }), [0, 0.06, 0]));
  g.add(mesh(THREE, new THREE.SphereGeometry(1, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2), std(THREE, "#dda45f", { roughness: 0.68 }), [0, 0.2, 0], [0, 0, 0], [1.08, 0.9, 1.08]));
  for (let i = 0; i < 14; i++) {
    const a = r() * Math.PI * 2;
    const rad = r() * 0.8;
    const y = Math.sqrt(Math.max(0, 1 - (rad / 1.05) ** 2)) * 0.8;
    g.add(mesh(THREE, new THREE.SphereGeometry(1, 8, 6), std(THREE, "#f2e2c0", { roughness: 0.5 }), [Math.cos(a) * rad, 0.2 + y * 0.9, Math.sin(a) * rad], [0, 0, 0], [0.07, 0.04, 0.05]));
  }
  return g;
}

function buildFries(THREE: THREENS) {
  const g = new THREE.Group();
  const r = rng(43);
  const walls: [number, number, number, number, number][] = [
    [0, 0, 0.78, 0, -0.14],
    [0, 0, -0.78, 0, 0.14],
    [0.78, 0, 0, Math.PI / 2, -0.14],
    [-0.78, 0, 0, Math.PI / 2, 0.14],
  ];
  for (const [x, y, z, ry, tilt] of walls) {
    g.add(mesh(THREE, new THREE.BoxGeometry(1.5, 1.4, 0.07), std(THREE, "#b83223", { roughness: 0.6 }), [x, y - 0.1, z], [tilt, ry, 0]));
  }
  g.add(mesh(THREE, new THREE.BoxGeometry(1.45, 0.08, 1.45), std(THREE, "#8f2418", { roughness: 0.7 }), [0, -0.78, 0]));
  for (let i = 0; i < 17; i++) {
    const h = 1.5 + r() * 0.7;
    const shade = 0.8 + r() * 0.35;
    g.add(
      mesh(
        THREE,
        new THREE.BoxGeometry(0.14, h, 0.14),
        std(THREE, `rgb(${Math.round(227 * shade)}, ${Math.round(178 * shade)}, ${Math.round(60 * shade)})`, { roughness: 0.7 }),
        [(r() - 0.5) * 1.2, h / 2 - 0.3, (r() - 0.5) * 1.2],
        [(r() - 0.5) * 0.5, r() * Math.PI, (r() - 0.5) * 0.5],
      ),
    );
  }
  return g;
}

function buildDrink(THREE: THREENS) {
  const g = new THREE.Group();
  const r = rng(63);
  g.add(mesh(THREE, new THREE.CylinderGeometry(0.74, 0.64, 1.7, 40), std(THREE, "#7c2f1b", { roughness: 0.18, transparent: true, opacity: 0.94 }), [0, -0.15, 0]));
  for (let i = 0; i < 4; i++) {
    const s = 0.28 + r() * 0.12;
    const ice = new THREE.Mesh(
      new THREE.BoxGeometry(s, s, s),
      new THREE.MeshPhysicalMaterial({ color: new THREE.Color("#d6ecf5"), roughness: 0.05, transmission: 0.7, transparent: true, opacity: 0.65, thickness: 0.4 }),
    );
    ice.position.set((r() - 0.5) * 0.7, 0.2 + r() * 0.6 - 0.3, (r() - 0.5) * 0.7);
    ice.rotation.set(r() * Math.PI, r() * Math.PI, 0);
    g.add(ice);
  }
  const glass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.82, 0.7, 2.0, 48, 1, true),
    new THREE.MeshPhysicalMaterial({ color: new THREE.Color("#ffffff"), roughness: 0.08, transmission: 0.92, transparent: true, opacity: 0.55, thickness: 0.5, ior: 1.45, side: THREE.DoubleSide }),
  );
  glass.castShadow = true;
  g.add(glass);
  g.add(mesh(THREE, new THREE.CylinderGeometry(0.06, 0.06, 2.6, 16), std(THREE, "#d94f70", { roughness: 0.4 }), [0.18, 0.55, 0.05], [0.12, 0, 0.32]));
  return g;
}

function buildDessert(THREE: THREENS) {
  const g = new THREE.Group();
  g.rotation.y = -0.5;
  const theta = 1.05;
  const start = -theta / 2 + Math.PI / 2;
  const layer = (y: number, h: number, rad: number, color: string, rough = 0.6) =>
    mesh(THREE, new THREE.CylinderGeometry(rad, rad, h, 32, 1, false, start, theta), std(THREE, color, { roughness: rough }), [0, y, 0]);
  g.add(mesh(THREE, new THREE.CylinderGeometry(1.95, 1.95, 0.06, 48), std(THREE, "#1e1e24", { roughness: 0.35, metalness: 0.4 }), [0, -0.78, 0]));
  g.add(layer(-0.5, 0.42, 1.4, "#caa06a"));
  g.add(layer(-0.22, 0.16, 1.4, "#f3e9d2", 0.4));
  g.add(layer(0.06, 0.42, 1.4, "#7c4a30"));
  g.add(layer(0.35, 0.2, 1.44, "#eccca0", 0.35));
  g.add(mesh(THREE, new THREE.SphereGeometry(0.19, 20, 16), std(THREE, "#b3122b", { roughness: 0.25 }), [0.5, 0.6, 0.5]));
  g.add(mesh(THREE, new THREE.CylinderGeometry(0.02, 0.02, 0.24, 8), std(THREE, "#4a7a2c", { roughness: 0.5 }), [0.5, 0.78, 0.5]));
  return g;
}

export function buildFoodMesh(THREE: THREENS, shape: HeroShape): import("three").Group {
  switch (shape) {
    case "pizza":
      return buildPizza(THREE);
    case "burger":
      return buildBurger(THREE);
    case "fries":
      return buildFries(THREE);
    case "drink":
      return buildDrink(THREE);
    case "dessert":
      return buildDessert(THREE);
    default:
      return buildPizza(THREE);
  }
}

/** Recursively free geometry + materials for an object built here. */
export function disposeFoodMesh(object: import("three").Object3D) {
  object.traverse((o) => {
    const m = o as import("three").Mesh;
    if (!m.isMesh) return;
    m.geometry?.dispose?.();
    const mat = m.material;
    if (Array.isArray(mat)) mat.forEach((x) => x?.dispose?.());
    else mat?.dispose?.();
  });
}
