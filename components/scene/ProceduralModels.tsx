"use client";

/**
 * Hand-built hero stand-ins — one per category `shape`.
 *
 * They are intentionally low-to-mid poly, use physically-based materials and
 * read reasonably "photoreal at a glance" under the studio lighting rig. Drop a
 * real GLB at the configured path and these are bypassed automatically.
 */
import { useMemo } from "react";
import type { HeroShape } from "@/config";

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

/* -------------------------------------------------------------------------- */
/*  Pizza                                                                      */
/* -------------------------------------------------------------------------- */
function Pizza() {
  const toppings = useMemo(() => {
    const r = rng(7);
    const pepperoni = Array.from({ length: 9 }, () => {
      const a = r() * Math.PI * 2;
      const rad = 0.35 + r() * 0.95;
      return { x: Math.cos(a) * rad, z: Math.sin(a) * rad, s: 0.13 + r() * 0.05 };
    });
    const basil = Array.from({ length: 7 }, () => {
      const a = r() * Math.PI * 2;
      const rad = 0.3 + r() * 1.0;
      return {
        x: Math.cos(a) * rad,
        z: Math.sin(a) * rad,
        rot: r() * Math.PI,
        s: 0.12 + r() * 0.06,
      };
    });
    return { pepperoni, basil };
  }, []);

  return (
    <group>
      {/* charred base */}
      <mesh castShadow receiveShadow position={[0, -0.02, 0]}>
        <cylinderGeometry args={[1.62, 1.6, 0.14, 56]} />
        <meshStandardMaterial color="#c9903f" roughness={0.92} />
      </mesh>
      {/* puffed crust rim */}
      <mesh castShadow position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.17, 16, 56]} />
        <meshStandardMaterial color="#d7a24d" roughness={0.85} />
      </mesh>
      {/* sauce + cheese */}
      <mesh receiveShadow position={[0, 0.09, 0]}>
        <cylinderGeometry args={[1.44, 1.46, 0.07, 56]} />
        <meshStandardMaterial color="#e7ba5b" roughness={0.62} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[1.4, 1.42, 0.03, 56]} />
        <meshStandardMaterial
          color="#efc978"
          roughness={0.45}
          emissive="#3a2a10"
          emissiveIntensity={0.15}
        />
      </mesh>
      {toppings.pepperoni.map((p, i) => (
        <mesh key={`pp${i}`} castShadow position={[p.x, 0.16, p.z]}>
          <cylinderGeometry args={[p.s, p.s, 0.05, 20]} />
          <meshStandardMaterial color="#a5311d" roughness={0.55} />
        </mesh>
      ))}
      {toppings.basil.map((b, i) => (
        <mesh
          key={`bs${i}`}
          castShadow
          position={[b.x, 0.17, b.z]}
          rotation={[0, b.rot, 0]}
          scale={[b.s, b.s * 0.35, b.s * 1.5]}
        >
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color="#3f7d2e" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Burger                                                                     */
/* -------------------------------------------------------------------------- */
function Burger() {
  const sesame = useMemo(() => {
    const r = rng(21);
    return Array.from({ length: 14 }, () => {
      const a = r() * Math.PI * 2;
      const rad = r() * 0.8;
      return {
        x: Math.cos(a) * rad,
        z: Math.sin(a) * rad,
        y: Math.sqrt(Math.max(0, 1 - (rad / 1.05) ** 2)) * 0.8,
      };
    });
  }, []);

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, -0.78, 0]}>
        <cylinderGeometry args={[1.0, 1.06, 0.5, 40]} />
        <meshStandardMaterial color="#d99f5b" roughness={0.75} />
      </mesh>
      <mesh castShadow position={[0, -0.42, 0]}>
        <cylinderGeometry args={[1.08, 1.08, 0.34, 40]} />
        <meshStandardMaterial color="#4a2c1c" roughness={0.85} />
      </mesh>
      {/* cheese with a lean */}
      <mesh castShadow position={[0, -0.2, 0]} rotation={[0.03, 0.4, 0.03]}>
        <boxGeometry args={[1.85, 0.07, 1.85]} />
        <meshStandardMaterial color="#f0a92e" roughness={0.4} />
      </mesh>
      {/* lettuce ruffle */}
      <mesh castShadow position={[0, -0.06, 0]} scale={[1.12, 0.5, 1.12]}>
        <torusGeometry args={[0.95, 0.22, 10, 28]} />
        <meshStandardMaterial color="#5f9a3c" roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.95, 0.95, 0.12, 28]} />
        <meshStandardMaterial color="#c0392b" roughness={0.5} />
      </mesh>
      {/* top bun dome */}
      <mesh castShadow receiveShadow position={[0, 0.2, 0]} scale={[1.08, 0.9, 1.08]}>
        <sphereGeometry args={[1, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#dda45f" roughness={0.68} />
      </mesh>
      {sesame.map((s, i) => (
        <mesh key={i} position={[s.x, 0.2 + s.y * 0.9, s.z]} scale={[0.07, 0.04, 0.05]}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color="#f2e2c0" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Fries                                                                      */
/* -------------------------------------------------------------------------- */
function Fries() {
  const sticks = useMemo(() => {
    const r = rng(43);
    return Array.from({ length: 17 }, () => ({
      x: (r() - 0.5) * 1.2,
      z: (r() - 0.5) * 1.2,
      h: 1.5 + r() * 0.7,
      tx: (r() - 0.5) * 0.5,
      tz: (r() - 0.5) * 0.5,
      ry: r() * Math.PI,
      shade: 0.8 + r() * 0.35,
    }));
  }, []);

  return (
    <group>
      {/* carton */}
      {[
        [0, 0, 0.78, 0, -0.14],
        [0, 0, -0.78, 0, 0.14],
        [0.78, 0, 0, Math.PI / 2, -0.14],
        [-0.78, 0, 0, Math.PI / 2, 0.14],
      ].map(([x, y, z, ry, tilt], i) => (
        <mesh
          key={i}
          castShadow
          receiveShadow
          position={[x, y - 0.1, z]}
          rotation={[tilt, ry, 0]}
        >
          <boxGeometry args={[1.5, 1.4, 0.07]} />
          <meshStandardMaterial color="#b83223" roughness={0.6} />
        </mesh>
      ))}
      <mesh receiveShadow position={[0, -0.78, 0]}>
        <boxGeometry args={[1.45, 0.08, 1.45]} />
        <meshStandardMaterial color="#8f2418" roughness={0.7} />
      </mesh>
      {sticks.map((s, i) => (
        <mesh
          key={i}
          castShadow
          position={[s.x, s.h / 2 - 0.3, s.z]}
          rotation={[s.tz, s.ry, s.tx]}
        >
          <boxGeometry args={[0.14, s.h, 0.14]} />
          <meshStandardMaterial
            color={`rgb(${Math.round(227 * s.shade)}, ${Math.round(
              178 * s.shade,
            )}, ${Math.round(60 * s.shade)})`}
            roughness={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Drink                                                                      */
/* -------------------------------------------------------------------------- */
function Drink() {
  const ice = useMemo(() => {
    const r = rng(63);
    return Array.from({ length: 4 }, () => ({
      x: (r() - 0.5) * 0.7,
      y: 0.2 + r() * 0.6,
      z: (r() - 0.5) * 0.7,
      rx: r() * Math.PI,
      ry: r() * Math.PI,
      s: 0.28 + r() * 0.12,
    }));
  }, []);

  return (
    <group>
      {/* liquid */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.74, 0.64, 1.7, 40]} />
        <meshStandardMaterial
          color="#7c2f1b"
          roughness={0.18}
          metalness={0.0}
          transparent
          opacity={0.94}
        />
      </mesh>
      {ice.map((c, i) => (
        <mesh key={i} position={[c.x, c.y - 0.3, c.z]} rotation={[c.rx, c.ry, 0]}>
          <boxGeometry args={[c.s, c.s, c.s]} />
          <meshPhysicalMaterial
            color="#d6ecf5"
            roughness={0.05}
            transmission={0.7}
            transparent
            opacity={0.65}
            thickness={0.4}
          />
        </mesh>
      ))}
      {/* glass */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.82, 0.7, 2.0, 48, 1, true]} />
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.08}
          transmission={0.92}
          transparent
          opacity={0.55}
          thickness={0.5}
          ior={1.45}
          side={2}
        />
      </mesh>
      {/* straw */}
      <mesh castShadow position={[0.18, 0.55, 0.05]} rotation={[0.12, 0, 0.32]}>
        <cylinderGeometry args={[0.06, 0.06, 2.6, 16]} />
        <meshStandardMaterial color="#d94f70" roughness={0.4} />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Dessert — layered cake slice                                               */
/* -------------------------------------------------------------------------- */
function Dessert() {
  const theta = 1.05;
  const start = -theta / 2 + Math.PI / 2;
  const layer = (
    y: number,
    h: number,
    rad: number,
    color: string,
    rough = 0.6,
  ) => (
    <mesh castShadow receiveShadow position={[0, y, 0]}>
      <cylinderGeometry args={[rad, rad, h, 32, 1, false, start, theta]} />
      <meshStandardMaterial color={color} roughness={rough} />
    </mesh>
  );

  return (
    <group rotation={[0, -0.5, 0]}>
      <mesh receiveShadow position={[0, -0.78, 0]}>
        <cylinderGeometry args={[1.95, 1.95, 0.06, 48]} />
        <meshStandardMaterial color="#1e1e24" roughness={0.35} metalness={0.4} />
      </mesh>
      {layer(-0.5, 0.42, 1.4, "#caa06a")}
      {layer(-0.22, 0.16, 1.4, "#f3e9d2", 0.4)}
      {layer(0.06, 0.42, 1.4, "#7c4a30")}
      {layer(0.35, 0.2, 1.44, "#eccca0", 0.35)}
      {/* cherry */}
      <mesh castShadow position={[0.5, 0.6, 0.5]}>
        <sphereGeometry args={[0.19, 20, 16]} />
        <meshStandardMaterial color="#b3122b" roughness={0.25} />
      </mesh>
      <mesh position={[0.5, 0.78, 0.5]}>
        <cylinderGeometry args={[0.02, 0.02, 0.24, 8]} />
        <meshStandardMaterial color="#4a7a2c" roughness={0.5} />
      </mesh>
    </group>
  );
}

export function ProceduralHero({ shape }: { shape: HeroShape }) {
  switch (shape) {
    case "pizza":
      return <Pizza />;
    case "burger":
      return <Burger />;
    case "fries":
      return <Fries />;
    case "drink":
      return <Drink />;
    case "dessert":
      return <Dessert />;
    default:
      return <Pizza />;
  }
}
