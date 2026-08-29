# Hero 3D assets

Drop production models here using these exact names:

```
pizza.glb
burger.glb
fries.glb
drink.glb
dessert.glb
```

## Rules

- **Format:** `.glb` (binary glTF 2.0), Draco or Meshopt compression recommended.
- **Budget:** aim for < 1.5 MB each, < 60k triangles, one 2K base-colour /
  ORM texture set. These are viewed on phones over cellular.
- **Orientation:** model "hero face" pointing +Z, upright on +Y, roughly
  centred on the origin. The loader auto-centres and normalises scale to a
  ~3.2 unit bounding box, so absolute size does not matter.
- **Materials:** standard PBR (metallic-roughness). They are lit by the app's
  studio rig + a locally-baked environment map.

## How the swap works

`config/categories.ts` sets `model: "/assets/3d/<name>.glb"` per category.
On load the app does a `HEAD` request for each path:

- **200** → the GLB is streamed lazily only when that category is first opened
  (`components/scene/GLBHero.tsx` via `useGLTF`), then centred / scaled / shadowed.
- **404** → the hand-built procedural hero in
  `components/scene/ProceduralModels.tsx` is used instead.

No code changes are needed to switch from placeholders to real assets — just
add the files.
