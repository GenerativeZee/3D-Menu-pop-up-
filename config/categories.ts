/**
 * Category configuration.
 *
 * `model` points at an optional GLB/GLTF hero asset. If the file is not present
 * in /public the app automatically renders a hand-built procedural stand-in of
 * the same `shape`, so production models can be dropped in later with zero code
 * changes.
 *
 * `accent` drives the per-category colour theming across the whole UI.
 * `transition` lets art-direction tune the cinematic per hero object.
 */
export type CategoryId =
  | "pizza"
  | "burgers"
  | "sides"
  | "drinks"
  | "desserts";

export type HeroShape =
  | "pizza"
  | "burger"
  | "fries"
  | "drink"
  | "dessert";

export interface TransitionTuning {
  /** how far back into the screen the hero starts (world units, negative = deep) */
  depthStart: number;
  /** closest z the hero reaches — positive pushes it "past" the glass toward viewer */
  depthPeak: number;
  /** total spin in radians across the arc */
  spin: number;
  /** extra idle bob amplitude */
  bob: number;
  /** base uniform scale of the procedural / model hero */
  scale: number;
}

export interface CategoryConfig {
  id: CategoryId;
  label: string;
  /** short word shown huge behind the menu */
  wordmark: string;
  blurb: string;
  accent: string;
  accentSoft: string;
  model: string;
  shape: HeroShape;
  transition: TransitionTuning;
}

export const categories: CategoryConfig[] = [
  {
    id: "pizza",
    label: "Pizza",
    wordmark: "Pizza",
    blurb: "Naples-style, 60-second bake, charred leopard crust.",
    accent: "#e8a13c",
    accentSoft: "rgba(232, 161, 60, 0.16)",
    model: "/assets/3d/pizza.glb",
    shape: "pizza",
    transition: { depthStart: -9.5, depthPeak: 3.1, spin: 2.6, bob: 0.05, scale: 1 },
  },
  {
    id: "burgers",
    label: "Burgers",
    wordmark: "Burgers",
    blurb: "Dry-aged smash patties, potato buns, house pickles.",
    accent: "#d9793f",
    accentSoft: "rgba(217, 121, 63, 0.16)",
    model: "/assets/3d/burger.glb",
    shape: "burger",
    transition: { depthStart: -9, depthPeak: 3.3, spin: 2.2, bob: 0.05, scale: 1.05 },
  },
  {
    id: "sides",
    label: "Sides",
    wordmark: "Sides",
    blurb: "Triple-cooked, sea salt, smoked aioli on the side.",
    accent: "#e6c15a",
    accentSoft: "rgba(230, 193, 90, 0.16)",
    model: "/assets/3d/fries.glb",
    shape: "fries",
    transition: { depthStart: -9, depthPeak: 3.0, spin: 2.0, bob: 0.06, scale: 1 },
  },
  {
    id: "drinks",
    label: "Drinks",
    wordmark: "Drinks",
    blurb: "Cold-pressed sodas, barrel-aged spirits, zero-proof.",
    accent: "#6cb6a8",
    accentSoft: "rgba(108, 182, 168, 0.16)",
    model: "/assets/3d/drink.glb",
    shape: "drink",
    transition: { depthStart: -9.5, depthPeak: 3.2, spin: 2.4, bob: 0.05, scale: 1 },
  },
  {
    id: "desserts",
    label: "Desserts",
    wordmark: "Sweets",
    blurb: "Basque cheesecake, salted caramel, seasonal fruit.",
    accent: "#c98aa6",
    accentSoft: "rgba(201, 138, 166, 0.16)",
    model: "/assets/3d/dessert.glb",
    shape: "dessert",
    transition: { depthStart: -9, depthPeak: 3.1, spin: 2.3, bob: 0.05, scale: 1.05 },
  },
];

export const categoryById = (id: CategoryId): CategoryConfig =>
  categories.find((c) => c.id === id) ?? categories[0];

export const defaultCategory: CategoryId = "pizza";
