# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Commands

```bash
bun run dev       # Start dev server
bun run build     # Production build
bun run start     # Start production server (after build)
bun run lint      # Lint with oxlint
bun run format    # Format with oxfmt
bun run shadcn    # Add shadcn components
```

No test runner is configured yet.

## Stack

- **Next.js 16** (App Router) — see breaking changes above before writing any Next.js code
- **React 19**, TypeScript 6, Tailwind CSS v4
- **shadcn/ui** (`style: base-nova`) with `@base-ui/react` primitives — components live in `src/components/ui/`. Do not use Radix UI or headless-ui patterns; they don't apply here.
- **Runtime**: Bun (`bun --bun` flag used in all scripts)
- **Linter/Formatter**: oxlint + oxfmt (not ESLint/Prettier)

## Project Structure

```
src/
  app/           # Next.js App Router — layouts, pages, globals.css
    layout.tsx   # Root layout (fonts, providers)
    page.tsx     # Home page
    globals.css  # Tailwind theme variables (source of truth for design tokens)
  components/ui/ # shadcn/ui components
  lib/utils.ts   # cn() helper (clsx + tailwind-merge)
```

Path alias `@/` maps to `src/`.

## Tailwind CSS v4

Config is CSS-first — theme variables are defined in `src/app/globals.css` using `@theme inline { }`, not `tailwind.config.js`. There is no `tailwind.config.js`.

When adding new design tokens, add them inside the `@theme inline` block in `globals.css`.

## shadcn

Add components with `bun run shadcn add <component>`. The registry style is `base-nova` (not `default` or `new-york`).

**Available libraries:**

- Icons: `lucide-react` (already installed)
- Animations: `tw-animate-css` (already imported in `globals.css`)

## Environment

No environment variables are required to run the dev server.
