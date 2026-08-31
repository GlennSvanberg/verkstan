# Verkstan

Glenn Svanbergs personliga miniapp-workbench byggd med **TanStack Start + Convex**.

Källkodens sanning finns i denna publika GitHub-repo:  
**https://github.com/GlennSvanberg/verkstan**

---

## Stack

- TanStack Start (React, TypeScript, Vite)
- Convex (funktioner + databas)
- npm

---

## Lokal utveckling

### 1) Installera

```bash
npm install
```

### 2) Miljövariabler

Kopiera exempel:

```bash
cp .env.local.example .env.local
```

Sätt:

```env
VITE_CONVEX_URL=...
```

### 3) Starta Convex i utvecklingsläge

> Do **not** use `CONVEX_AGENT_MODE=anonymous` for this project.

Om projektet ännu inte är länkat till ett konto/deployment:

```bash
CONVEX_OPEN_DEV=true npx convex dev
```

När Convex är igång kan du starta frontend:

```bash
npm run dev
```

Dev-servern kör på port **43123**.

---

## Produktionsnotering (Vercel/host)

Skapa inte Vercel-projektet här.  
När `CONVEX_DEPLOY_KEY` finns i produktionsmiljön ska build/deploy använda:

```bash
npx convex deploy --cmd 'npm run build'
```

---

## Arkitektur för miniappar

En miniapp är alltid tre delar:

1. Routes under `src/routes/apps/<slug>/`
2. Convex-funktioner/tabeller med prefix `<slug>_`
3. Registrering i `src/lib/app-registry.ts` så appen syns på startsidan

### Hårda regler

- Lägg till ny app genom att skapa en route-mapp + namespaced Convex.
- Redigera aldrig en annan apps tabeller eller routes.
- Restyla inte hela skalet för en enskild app.
- Delad layout/navigation finns i `src/routes/__root.tsx`.
- Delad styling finns i `src/styles.css`.
- Engelska i kod, svenska i användartext.

---

## Befintlig proof miniapp

- Route: `/apps/hello`
- Convex mutation: `hello_addNote`
- Convex query: `hello_listNotes`
- Tabell: `hello_notes`

---

## Lägg till en ny miniapp (checklista)

1. Skapa `src/routes/apps/<slug>/index.tsx`
2. Lägg till Convex-filer/funktioner med `<slug>_`-prefix
3. Lägg till tabeller/index i `convex/schema.ts` med `<slug>_`-prefix
4. Registrera appen i `src/lib/app-registry.ts`
5. Kör:
   ```bash
   npm run generate-routes
   ```

