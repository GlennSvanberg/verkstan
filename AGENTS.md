# AGENTS.md

## Verkstan-konventioner

Detta repo är en miniapp-workbench med TanStack Start + Convex.

### Miniapp-kontrakt (måste följas)

En miniapp är alltid tre delar:

1. Routes under `src/routes/apps/<slug>/`
2. Convex-funktioner/tabeller med prefix `<slug>_`
3. Registrering i `src/lib/app-registry.ts`

### Hårda regler

- Lägg till ny app genom route-mapp + namespaced Convex.
- Ändra aldrig annan apps tabeller eller routes.
- Restyla inte hela shell/layout för en enskild app.
- Delad layout/nav: `src/routes/__root.tsx`
- Delad styling: `src/styles.css`
- Engelska i kod. Svenska i all användarsynlig UI-text.

### Convex

- Använd utvecklingsflödet med `npx convex dev`.
- Om länkning saknas, använd:
  ```bash
  CONVEX_OPEN_DEV=true npx convex dev
  ```
- Använd inte `CONVEX_AGENT_MODE=anonymous` för detta repo.

### Production note

- När `CONVEX_DEPLOY_KEY` finns i produktionsmiljön:
  ```bash
  npx convex deploy --cmd 'npm run build'
  ```
