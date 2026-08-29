import type { CategoryId } from "./categories";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  /**
   * Optional real photograph. Drop optimised WebP/AVIF files into
   * /public/assets/menu/ and reference them here. When omitted, a generated
   * appetising art panel is used instead so the layout never breaks.
   */
  image?: string;
  tags?: string[];
  /** hue seed (0-360) for the generated art panel */
  hue: number;
  signature?: boolean;
}

export const menu: Record<CategoryId, MenuItem[]> = {
  pizza: [
    {
      id: "margherita",
      name: "Margherita",
      description: "Fior di latte, San Marzano, basil, Sorrento olive oil.",
      price: 299,
      hue: 14,
      signature: true,
      tags: ["Veg", "Classic"],
    },
    {
      id: "farmhouse",
      name: "Farmhouse",
      description: "Bell peppers, red onion, cremini mushroom, oregano.",
      price: 349,
      hue: 96,
      tags: ["Veg"],
    },
    {
      id: "bbq-chicken",
      name: "BBQ Chicken",
      description: "Smoked chicken, bourbon BBQ, charred onion, coriander.",
      price: 399,
      hue: 24,
    },
    {
      id: "diavola",
      name: "Diavola",
      description: "Spicy salami, Calabrian chilli honey, stracciatella.",
      price: 429,
      hue: 6,
      tags: ["Hot"],
    },
    {
      id: "tartufo",
      name: "Tartufo",
      description: "Black truffle cream, mozzarella, wild mushroom, thyme.",
      price: 549,
      hue: 34,
      signature: true,
      tags: ["Veg", "Chef"],
    },
  ],
  burgers: [
    {
      id: "the-ember",
      name: "The Ember",
      description: "Double smash, aged cheddar, burnt-onion jam, pickles.",
      price: 379,
      hue: 26,
      signature: true,
    },
    {
      id: "buttermilk-bird",
      name: "Buttermilk Bird",
      description: "Fried chicken thigh, kimchi slaw, gochujang mayo.",
      price: 359,
      hue: 40,
      tags: ["Hot"],
    },
    {
      id: "garden-stack",
      name: "Garden Stack",
      description: "Beetroot-black bean patty, smoked gouda, avocado.",
      price: 329,
      hue: 320,
      tags: ["Veg"],
    },
    {
      id: "truffle-royale",
      name: "Truffle Royale",
      description: "Wagyu blend, brie, truffle aioli, caramelised shallot.",
      price: 529,
      hue: 30,
      tags: ["Chef"],
    },
  ],
  sides: [
    {
      id: "triple-fries",
      name: "Triple-Cooked Fries",
      description: "Maris Piper, beef-dripping crisp, rosemary salt.",
      price: 179,
      hue: 44,
      signature: true,
    },
    {
      id: "truffle-fries",
      name: "Truffle Parmesan Fries",
      description: "Shaved parmesan, truffle oil, chive, garlic confit.",
      price: 229,
      hue: 40,
    },
    {
      id: "mac-bites",
      name: "Crispy Mac Bites",
      description: "Three-cheese mac, panko crust, smoked tomato dip.",
      price: 199,
      hue: 34,
      tags: ["Veg"],
    },
    {
      id: "charred-corn",
      name: "Street Corn Ribs",
      description: "Charred corn, cotija, lime crema, chilli-lime dust.",
      price: 189,
      hue: 48,
      tags: ["Veg", "Hot"],
    },
  ],
  drinks: [
    {
      id: "blood-orange",
      name: "Blood Orange Soda",
      description: "Cold-pressed blood orange, bitters, soda, rosemary.",
      price: 149,
      hue: 12,
      signature: true,
      tags: ["Zero-proof"],
    },
    {
      id: "yuzu-cooler",
      name: "Yuzu Cooler",
      description: "Yuzu, cucumber, elderflower, sparkling water.",
      price: 159,
      hue: 150,
      tags: ["Zero-proof"],
    },
    {
      id: "barrel-old-fashioned",
      name: "Barrel-Aged Old Fashioned",
      description: "Bourbon, demerara, orange, aromatic bitters.",
      price: 449,
      hue: 28,
    },
    {
      id: "espresso-tonic",
      name: "Espresso Tonic",
      description: "Double shot, tonic, orange peel, over clear ice.",
      price: 179,
      hue: 26,
    },
  ],
  desserts: [
    {
      id: "basque-cheesecake",
      name: "Basque Cheesecake",
      description: "Burnt top, vanilla bean, crème fraîche, sea salt.",
      price: 249,
      hue: 40,
      signature: true,
      tags: ["Veg"],
    },
    {
      id: "salted-caramel-tart",
      name: "Salted Caramel Tart",
      description: "Dark chocolate ganache, salted caramel, cacao nib.",
      price: 259,
      hue: 20,
      tags: ["Veg"],
    },
    {
      id: "tiramisu",
      name: "Wood-Fired Tiramisu",
      description: "Espresso-soaked sponge, mascarpone, smoked cocoa.",
      price: 239,
      hue: 30,
      tags: ["Veg"],
    },
    {
      id: "seasonal-sorbet",
      name: "Seasonal Sorbet",
      description: "Ask your server — churned to order, fruit-forward.",
      price: 189,
      hue: 320,
      tags: ["Vegan"],
    },
  ],
};
