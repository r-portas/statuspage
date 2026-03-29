
## Quick Reference

- This project uses Bun, use `bun` instead of `npm` or `yarn`
- This project uses `shadcn` for styling, always prefer to leverage shadcn components and utilities instead of custom styles
- The `shadcn` cli tool is available through `bun shadcn`
- shadcn style: `radix-mira`, icon library: `lucide`

## Commands

```bash
bun dev       # Start dev server
bun build     # Production build
bun start     # Run production build
bun lint      # oxlint
bun format    # oxfmt
```

## Architecture

```
src/
  app/
    page.tsx                  # Client component — polls /api/containers every 10s
    api/containers/route.ts   # GET — reads Docker daemon, returns grouped services
  lib/
    docker.ts                 # dockerode client + getComposeGroups()
  components/
    service-status-card.tsx   # shadcn Card + Badge per container state
```

## Runtime Requirements

- Docker must be running and `/var/run/docker.sock` must be accessible
- Only Docker Compose services are shown (containers with `com.docker.compose.project` label)

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->
