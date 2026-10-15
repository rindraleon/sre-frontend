# Assets

Static assets imported by the code (bundled by Vite) live here:

- `images/` — images imported from components/pages (`import logo from "@/assets/images/..."`).
- `icons/` — custom SVG icons not covered by `lucide-react`.
- `fonts/` — local font files if a font is not provided by an npm package
  (Manrope currently comes from `@fontsource-variable/manrope`, no file needed here).

Files that must be served verbatim at a stable URL (downloads, templates)
belong in `public/` instead — e.g. `public/modele-import-contribuables-sre.xlsx`.
Do not reference `src/assets` files by URL string; import them so Vite hashes
and bundles them.
