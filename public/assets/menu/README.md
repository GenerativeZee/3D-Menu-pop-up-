# Menu item photography

Optional. When absent, each card renders a generated warm "plated food" art
panel (`lib/art.ts`) so the layout never breaks.

To use real photos:

1. Export square images, optimised as **WebP or AVIF**, ~800×800, < 80 KB.
2. Save them here, e.g. `margherita.webp`.
3. Reference from `config/menu.ts`:

   ```ts
   { id: "margherita", name: "Margherita", image: "/assets/menu/margherita.webp", ... }
   ```

The card `<img>` is `loading="lazy"` / `decoding="async"`, so only images near
the viewport are fetched.
