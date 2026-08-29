# Ember & Oak — Immersive 3D QR Menu

A mobile-first restaurant menu whose signature interaction is a **cinematic
depth transition**: tap a category and a realistic hero dish rises _out of the
phone screen_ toward you, rotates, hits a peak, then recedes back through the
glass to reveal that category's menu.

Built with **Next.js 16 (App Router) · React Three Fiber · three.js ·
@react-three/postprocessing · GSAP · Zustand · Tailwind v4**.

---

## Run it

```bash
npm install
npm run dev          # http://localhost:3000  (add ?t=T12 to set a table id)
npm run build && npm start
```

Deploy: it's a stock Next.js app — `vercel` (or any Node host) with zero config.

---

## The out-of-the-screen illusion — how it's done

Not a 2D scale. A real perspective camera (`fov 40`, at `z = 6.5`) and a hero
object that travels in world space from `z ≈ -9.5` (deep inside the screen) to
`z ≈ +3.2` (past the near plane, "through" the glass) and back, in ~2.3 s.

| Layer | Contribution |
| --- | --- |
| `lib/transition.ts` | GSAP timeline tweening one mutable `heroMotion` object (z, spin, scale, emergence, portal, shake). Read every frame — never via React state. |
| `components/scene/HeroModel.tsx` | Maps `heroMotion` → transform each frame; adds gyro counter-parallax + idle spin. |
| `components/scene/Rig.tsx` | Studio 3-point lighting, a **locally-baked** env map (no CDN), contact shadows, camera parallax + a decaying shake impulse at the peak. |
| `components/scene/Effects.tsx` | Bloom that swells as the dish nears the lens, depth-of-field (soft deep-screen start → sharp on approach), chromatic aberration + vignette pulse on the peak beat. |
| `components/ui/PortalFrame.tsx` | The "phone glass": permanent bezel + sheen, and a swelling inner shadow + accent rim-light that the emerging dish visibly **covers** as it crosses the plane. |
| Perspective scale | The dish grows because it gets closer to the camera, with correct foreshortening — not because a texture is scaled. |

---

## Architecture (swap-a-file re-brand)

```
config/
  restaurant.ts     restaurant identity, currency
  categories.ts     per-category: accent theme, GLB path, hero shape, transition tuning
  menu.ts           menu items (name / description / price / tags / optional photo)
lib/
  performance.ts    device tier probe → dpr, postFx, dof, shadows, duration
  transition.ts     cinematic controller (GSAP timeline + shared motion state)
  sound.ts          procedural Web Audio cues (whoosh / thump), muted by default
  art.ts            generated "plated food" SVG panels (no external images)
  ar.ts             optional WebXR "View on my table" (hit-test, dynamic import)
store/useAppStore.ts   discrete state: active/menu category, phase, sound, device
hooks/
  useDeviceOrientation.ts   gyro parallax + iOS permission flow
  useModelExists.ts         HEAD probe so missing GLBs fall to procedural cleanly
  useHeroMotionFrame.ts     rAF bridge for DOM overlays
components/
  MenuApp.tsx        client orchestrator; lazy-loads the 3D bundle
  Stage3D.tsx        R3F <Canvas> (dynamic, ssr:false)
  scene/*            HeroModel, Rig, Effects, GLBHero, ProceduralModels, ErrorBoundary
  ui/*               TopBar, CategoryNav, MenuView, MenuItemCard, PortalFrame,
                     EntryVeil, ARButton, FallbackTransition
```

To reuse for another venue: edit the three `config/*` files and drop assets in
`public/assets/`. No component touches menu data directly.

### 3D assets

`public/assets/3d/{pizza,burger,fries,drink,dessert}.glb`. If a file is present
it's **lazy-loaded only when that category is first opened**, auto-centred and
scale-normalised. If absent, a hand-built procedural hero of the same shape is
used. See `public/assets/3d/README.md`.

---

## Performance & resilience

- 3D bundle is a lazy `dynamic(ssr:false)` import — initial paint is the menu.
- One GLB loads at a time, on demand; procedural heroes are geometry-only.
- Device tiers (`high / medium / low`) scale DPR (down to 0.75), post-processing,
  DOF, shadow maps and transition duration. Low tier drops the post stack.
- `prefers-reduced-motion` → a short, respectful portal flash instead.
- **No WebGL** → `FallbackTransition.tsx`: the same timeline drives a CSS 3D
  transform on a generated art panel. Menu stays fully usable.
- **WebGL context lost / model parse error** → `SceneErrorBoundary` degrades to
  procedural or to the menu; never a blank screen.
- No external network dependencies at runtime (fonts via `next/font`, env map
  baked locally, imagery generated as inline SVG).

---

## Verification status

- ✅ `next build` — TypeScript, compile and static generation all pass.
- ✅ SSR render of every UI component — no errors/warnings in the dev log.
- ✅ Transition controller simulated headlessly: emergence arc peaks at
  `z ≈ 3.1` (past the glass), portal cycles 0→1→0, menu swaps exactly once,
  timeline completes and hides the hero; a mid-flight category re-tap continues
  from the current position (no snap back) and settles cleanly.
- ⚠️ Live WebGL rendering, the visual quality of the illusion, gyroscope
  parallax and touch interaction need a real browser/device — the automated
  Chrome bridge was unavailable in this environment. Open `npm run dev` on a
  phone (or Chrome device-toolbar) to review.

---

## Optional AR

`ARButton` renders only where `navigator.xr` reports `immersive-ar` support
(Android Chrome). It starts a native WebXR hit-test session and places the hero
on a detected surface. iOS Safari (no WebXR) simply hides the button.
