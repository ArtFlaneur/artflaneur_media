# Frontend style (Art Flaneur Web)

## Where the global style is defined

The global styling setup for the web app is currently defined in:

- `apps/web/index.html`
  - Tailwind is loaded via CDN: `https://cdn.tailwindcss.com`
  - Theme tokens (fonts/colors) are defined inline via `tailwind.config = { theme: { extend: ... } }`
  - A small amount of global CSS is defined in an inline `<style>` tag (body smoothing/background + helper utilities)

There is **no** dedicated `tailwind.config.*` or global CSS file in this project at the moment.

## Tech stack (styling)

- **Tailwind (CDN runtime config)**
  - Utility-first styling is applied directly via `className` in React components.
  - Custom tokens are provided via `theme.extend` in the inline Tailwind config.
- **Fonts** are loaded from Google Fonts in `apps/web/index.html`.

## Theme tokens

### Fonts

Configured in `apps/web/index.html` Tailwind `extend.fontFamily`:

- `font-sans`: `Inter`
- `font-serif`: `Playfair Display`
- `font-mono`: `JetBrains Mono`

### Colors

Configured in `apps/web/index.html` Tailwind `extend.colors`:

The project uses a custom `art.*` palette (available via Tailwind class names like `bg-art-paper`, `text-art-blue`, etc):

- `art.black`: `#1a1a1a`
- `art.paper`: `#F9F7F5` (warm off-white background)
- `art.red`: `#D93025`
- `art.blue`: `#2539e9` (primary accent)
- `art.yellow`: `#FFD700`
- `art.gray`: `#E5E5E5`

### Border widths

Configured in `apps/web/index.html` Tailwind `extend.borderWidth`:

- `border-3`: `3px`

## Global CSS utilities

Defined inline in `apps/web/index.html`:

- `body` smoothing + default background color
- `.hide-scrollbar` helper (cross-browser scrollbar hiding)
- `@keyframes marquee` + `.animate-marquee` helper

## Common UI patterns in components

The UI is implemented in a “bold editorial / print-like” style primarily via Tailwind utilities:

- **High-contrast borders**: frequent usage of `border-2 border-black`, section dividers, and boxed layouts.
- **Uppercase headings**: `uppercase` combined with heavy weights (`font-black`, `font-bold`).
- **Typography roles**:
  - Editorial text: `font-serif`
  - Navigation/meta/labels: `font-mono` + `uppercase` + tracking (`tracking-widest`, `tracking-[0.3em]`, etc)
  - Default UI: `font-sans`
- **Accents**:
  - Primary interactive accent often uses `text-art-blue`, `hover:bg-art-blue`, or `border-art-blue`.
  - Secondary highlights use `bg-art-yellow`.
- **Cards**:
  - Square media with hard borders (`aspect-square`, `border-b-2 border-black`)
  - Hover treatments: custom shadow like `hover:shadow-[8px_8px_0px_0px_rgba(...)]`

## Notes / constraints for future work

- Since Tailwind is loaded via CDN, any additional global tokens are currently easiest to add in `apps/web/index.html` under the existing `tailwind.config` block.
- Most styling should continue to be done via Tailwind utility classes to match the existing patterns.
- Prefer using `art.*` palette classes instead of hard-coded hex values in components.
