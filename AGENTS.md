# AGENTS.md

## Verkstan conventions

This repository is a miniapp workbench built with TanStack Start + Convex.

### Shipping (hard rule)

- Ship by merging to `main`. Do not leave draft PRs. Do not wait for Glenn to review or click Merge.
- If the workflow creates a PR, mark it ready and merge it yourself in the same run (`gh pr merge --merge` is fine). Wait only if GitHub blocks on required CI; otherwise merge even if optional Vercel preview checks are still pending.
- Prefer not creating draft PRs at all.

### Miniapp contract (must follow)

A miniapp is always three parts:

1. Routes under `src/routes/apps/<slug>/`
2. Convex functions/tables with prefix `<slug>_`
3. Registration in `src/lib/app-registry.ts`

### Hard rules

- Add new apps via a route folder + namespaced Convex.
- Never modify another app's tables or routes.
- Do not restyle the whole shell/layout for a single app.
- Shared layout/nav: `src/routes/__root.tsx`
- Shared styling: `src/styles.css`
- English in code. Swedish in all user-facing UI text.

### Convex

- Use the development workflow with `npx convex dev`.
- If linking is missing, use:
  ```bash
  CONVEX_OPEN_DEV=true npx convex dev
  ```
- Do not use `CONVEX_AGENT_MODE=anonymous` for this repo.

### Production note

- When `CONVEX_DEPLOY_KEY` exists in production:
  ```bash
  npx convex deploy --cmd 'npm run build'
  ```
