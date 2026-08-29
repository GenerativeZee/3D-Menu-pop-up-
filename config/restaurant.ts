/**
 * Restaurant-level configuration.
 * Swap this file (plus menu.ts and the /public/assets) to re-brand the
 * whole platform for another venue.
 */
export interface RestaurantConfig {
  name: string;
  tagline: string;
  currency: string;
  /** table identifier is read from the QR url ?t= param, this is the fallback */
  defaultTable: string;
  /** shown in the footer */
  legal: string;
}

export const restaurant: RestaurantConfig = {
  name: "Ember & Oak",
  tagline: "Wood-fired kitchen — scan, tilt, and watch it come to the table.",
  currency: "₹",
  defaultTable: "—",
  legal: "An immersive QR menu. Prices inclusive of taxes.",
};
