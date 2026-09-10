import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { createFileRoute } from "@tanstack/react-router";
import styles from "./index.module.css";

export const Route = createFileRoute("/apps/designsystem/")({
  component: DesignSystemRoute,
});

type ProductSkinId = "inteller" | "onboarder" | "shortcut";
type CanvasTheme = "light" | "dark";

type ProductSkin = {
  id: ProductSkinId;
  label: string;
  primary: string;
  primarySoft: string;
  primaryStrong: string;
  infoColor: string;
  infoSoft: string;
  note: string;
};

const skinStorageKey = "verkstan.designsystem.skin";
const themeStorageKey = "verkstan.designsystem.theme";

const productSkins: ReadonlyArray<ProductSkin> = [
  {
    id: "inteller",
    label: "Inteller",
    primary: "#47FF9A",
    primarySoft: "#DAFFEC",
    primaryStrong: "#27CC73",
    infoColor: "#1FFFF8",
    infoSoft: "#CBFFFD",
    note: "Mint är primär. Orange diamant (#F36F16) är mark, inte CTA.",
  },
  {
    id: "onboarder",
    label: "Onboarder",
    primary: "#1FFFF8",
    primarySoft: "#D3FFFD",
    primaryStrong: "#12CCC6",
    infoColor: "#9A4DFF",
    infoSoft: "#E9DBFF",
    note: "Teal är primär. Info byter till lila för tydlig status-separation.",
  },
  {
    id: "shortcut",
    label: "Shortcut",
    primary: "#9A4DFF",
    primarySoft: "#ECDFFF",
    primaryStrong: "#7D2EE8",
    infoColor: "#1FFFF8",
    infoSoft: "#CBFFFD",
    note: "Lila är primär för Shortcut och fallback för nya appar.",
  },
];

const neutralTokens: ReadonlyArray<{ token: string; value: string }> = [
  { token: "bg.app", value: "#FFFFFF" },
  { token: "bg.subtle", value: "#F7F7F2" },
  { token: "bg.muted", value: "#EEEEE6" },
  { token: "bg.inverse", value: "#00002C" },
  { token: "text.primary", value: "#00002C" },
  { token: "text.secondary", value: "#4A4A5C" },
  { token: "text.muted", value: "#8A8A96" },
  { token: "text.on-inverse", value: "#FFFEE8" },
  { token: "border.default", value: "#E2E2DA" },
  { token: "border.strong", value: "#C8C8BE" },
];

const accentTokens: ReadonlyArray<{ token: string; value: string }> = [
  { token: "purple", value: "#9A4DFF" },
  { token: "teal", value: "#1FFFF8" },
  { token: "mint", value: "#47FF9A" },
  { token: "orange", value: "#F36F16" },
  { token: "pink", value: "#E788CE" },
  { token: "yellow", value: "#F3F316" },
];

function DesignSystemRoute() {
  const [activeSkin, setActiveSkin] = useState<ProductSkinId>("shortcut");
  const [canvasTheme, setCanvasTheme] = useState<CanvasTheme>("light");

  useEffect(() => {
    const savedSkin = window.localStorage.getItem(skinStorageKey);
    if (savedSkin === "inteller" || savedSkin === "onboarder" || savedSkin === "shortcut") {
      setActiveSkin(savedSkin);
    }

    const savedTheme = window.localStorage.getItem(themeStorageKey);
    if (savedTheme === "light" || savedTheme === "dark") {
      setCanvasTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(skinStorageKey, activeSkin);
  }, [activeSkin]);

  useEffect(() => {
    window.localStorage.setItem(themeStorageKey, canvasTheme);
  }, [canvasTheme]);

  const skin = useMemo(
    () => productSkins.find((entry) => entry.id === activeSkin) ?? productSkins[2],
    [activeSkin],
  );

  const infoStatusToken =
    skin.id === "onboarder" ? "status.info (lila fallback)" : "status.info (teal)";

  const skinVariables = {
    "--product-primary": skin.primary,
    "--product-primary-soft": skin.primarySoft,
    "--product-primary-strong": skin.primaryStrong,
    "--status-success": "#47FF9A",
    "--status-warning": "#F3F316",
    "--status-danger": "#E11D48",
    "--status-info": skin.infoColor,
    "--status-info-soft": skin.infoSoft,
    "--text-on-accent": "#00002C",
  } as CSSProperties;

  const primaryScaleTokens: ReadonlyArray<{ token: string; value: string }> = [
    { token: "primary.soft", value: skin.primarySoft },
    { token: "primary.solid", value: skin.primary },
    { token: "primary.strong", value: skin.primaryStrong },
  ];
  const statusScaleTokens: ReadonlyArray<{ token: string; value: string }> = [
    { token: "status.success", value: "#47FF9A" },
    { token: "status.warning", value: "#F3F316" },
    { token: "status.danger", value: "#E11D48" },
    { token: "status.info", value: skin.infoColor },
  ];

  return (
    <section className={styles.showcaseRoot}>
      <div className={styles.showcaseCanvas} data-theme={canvasTheme} style={skinVariables}>
        <header className={styles.panel}>
          <p className={styles.kicker}>Fiwe Product Design System</p>
          <div className={styles.headerTitleRow}>
            <h1>Designsystem</h1>
            <span className={styles.markBadge}>
              <span className={styles.markDiamond} aria-hidden="true" />
              Produktläge
            </span>
          </div>
          <p className={styles.lead}>
            Detta är produkt-UI för Fiwe (workspace-first), inte den midnight-first profil som
            används i marknadsföring.
          </p>
        </header>

        <section className={styles.panel}>
          <div className={styles.controlGrid}>
            <div>
              <h2>Skin (primärfärg)</h2>
              <p>Byter produktens primära CTA-färg och relaterade soft-tints.</p>
              <div className={styles.segmented} role="radiogroup" aria-label="Produkt-skin">
                {productSkins.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    role="radio"
                    aria-checked={activeSkin === entry.id}
                    className={`${styles.segmentedItem} ${
                      activeSkin === entry.id ? styles.segmentedItemActive : ""
                    }`}
                    onClick={() => setActiveSkin(entry.id)}
                  >
                    {entry.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2>Canvas-tema</h2>
              <p>Växla mellan ljus och mörk produktcanvas utan att röra Verkstan-shellen.</p>
              <div className={styles.segmented} role="radiogroup" aria-label="Tema">
                <button
                  type="button"
                  role="radio"
                  aria-checked={canvasTheme === "light"}
                  className={`${styles.segmentedItem} ${
                    canvasTheme === "light" ? styles.segmentedItemActive : ""
                  }`}
                  onClick={() => setCanvasTheme("light")}
                >
                  Ljust
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={canvasTheme === "dark"}
                  className={`${styles.segmentedItem} ${
                    canvasTheme === "dark" ? styles.segmentedItemActive : ""
                  }`}
                  onClick={() => setCanvasTheme("dark")}
                >
                  Mörkt
                </button>
              </div>
              <p className={styles.skinNote}>{skin.note}</p>
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <h2>Färgpalett</h2>
          <div className={styles.paletteGrid}>
            <ColorColumn title="Core neutrals" tokens={neutralTokens} />
            <ColorColumn title="Brand accents" tokens={accentTokens} />
            <ColorColumn title={`Aktiv primärskala (${skin.label})`} tokens={primaryScaleTokens} />
            <ColorColumn title="Status" tokens={statusScaleTokens} />
          </div>
        </section>

        <section className={styles.panel}>
          <h2>Typografi</h2>
          <p className={styles.typographyMeta}>Rethink Sans (Regular / Medium / Bold) med Inter som fallback.</p>
          <div className={styles.typographyStack}>
            <p className={styles.textDisplay}>Display / 40</p>
            <p className={styles.textTitle}>Title / 32</p>
            <p className={styles.textHeading}>Heading / 24</p>
            <p className={styles.textBody}>
              Body / 16 — Produktgränssnittets standardtext för arbetsytor och paneler.
            </p>
            <p className={styles.textSmall}>Small / 14 — Hjälptext, metadata och sekundär info.</p>
            <p className={styles.textLabel}>Label / 12, medium, uppercase.</p>
          </div>
        </section>

        <section className={styles.panel}>
          <h2>Komponenter (live tokens)</h2>
          <div className={styles.componentGrid}>
            <article className={styles.componentCard}>
              <h3>Knappar</h3>
              <div className={styles.buttonRow}>
                <button type="button" className={`${styles.button} ${styles.buttonPrimary}`}>
                  Primär
                </button>
                <button type="button" className={`${styles.button} ${styles.buttonSecondary}`}>
                  Sekundär
                </button>
                <button type="button" className={`${styles.button} ${styles.buttonDanger}`}>
                  Fara
                </button>
                <button type="button" className={`${styles.button} ${styles.buttonPrimary}`} disabled>
                  Inaktiv
                </button>
              </div>
            </article>

            <article className={styles.componentCard}>
              <h3>Input + fokus</h3>
              <label htmlFor="demo-input" className={styles.inputLabel}>
                Kundnamn
              </label>
              <input id="demo-input" className={styles.textInput} placeholder="Skriv kundnamn..." />
            </article>

            <article className={styles.componentCard}>
              <h3>Sidebar-nav</h3>
              <nav aria-label="Demo-navigering" className={styles.sidebarNav}>
                <button type="button" className={`${styles.navItem} ${styles.navItemActive}`}>
                  Översikt
                </button>
                <button type="button" className={styles.navItem}>
                  Ärenden
                </button>
                <button type="button" className={styles.navItem}>
                  Inställningar
                </button>
              </nav>
            </article>

            <article className={styles.componentCard}>
              <h3>Tabellrad</h3>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Objekt</th>
                      <th>Status</th>
                      <th>Ansvarig</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Produktkort</td>
                      <td>Pågår</td>
                      <td>Team A</td>
                    </tr>
                    <tr className={styles.tableRowSelected}>
                      <td>Guideline sync</td>
                      <td>Vald rad</td>
                      <td>Team B</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>

            <article className={styles.componentCard}>
              <h3>Statusbadges</h3>
              <div className={styles.badgeRow}>
                <span className={`${styles.badge} ${styles.badgeSuccess}`}>Success</span>
                <span className={`${styles.badge} ${styles.badgeWarning}`}>Warning</span>
                <span className={`${styles.badge} ${styles.badgeDanger}`}>Danger</span>
                <span className={`${styles.badge} ${styles.badgeInfo}`}>Info</span>
              </div>
              <p className={styles.statusNote}>{infoStatusToken}</p>
            </article>

            <article className={styles.componentCard}>
              <h3>Tomt läge</h3>
              <div className={styles.emptyCard}>
                <p className={styles.emptyTitle}>Inga moduler ännu</p>
                <p className={styles.emptyBody}>
                  Lägg till en ny modul för att börja skapa innehåll i den här arbetsytan.
                </p>
                <button type="button" className={`${styles.button} ${styles.buttonPrimary}`}>
                  Skapa modul
                </button>
              </div>
            </article>
          </div>
        </section>

        <section className={styles.panel}>
          <h2>Korta riktlinjer</h2>
          <div className={styles.guidelinesGrid}>
            <div className={styles.guidelineList}>
              <ul>
                <li>DNA är låst: färger, typografi och spacing ska upplevas konsekvent.</li>
                <li>Skin styr primär CTA per produkt (Inteller/Mint, Onboarder/Teal, Shortcut/Lila).</li>
                <li>Orange diamant är Fiwe-markering, inte generell primär knappfärg.</li>
                <li>Danger är alltid separat röd (inte samma som produktens primärfärg).</li>
                <li>Ikoner: Fiwe-mark i produktytor, Lucide går bra för CRUD-gränssnitt.</li>
                <li>Spacing följer 4-pt-system. Radius: 8 för controls, 12-16 för paneler.</li>
                <li>Nyare Fiwe-appar byggs i TanStack Start; Onboarder/Inteller kör Next+shadcn idag.</li>
              </ul>
            </div>
            <div className={styles.skinTableWrap}>
              <table className={styles.skinTable}>
                <thead>
                  <tr>
                    <th>Produkt</th>
                    <th>Primär</th>
                    <th>Anmärkning</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Inteller</td>
                    <td>#47FF9A</td>
                    <td>Orange mark används endast som mark.</td>
                  </tr>
                  <tr>
                    <td>Onboarder</td>
                    <td>#1FFFF8</td>
                    <td>Info-ton flyttas till lila för separerad semantik.</td>
                  </tr>
                  <tr>
                    <td>Shortcut / default</td>
                    <td>#9A4DFF</td>
                    <td>Lila används för nya produkter som standard-skin.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <a
            href="https://app.notion.com/p/3d7212bf181a81909b44c0c563d80b94"
            target="_blank"
            rel="noreferrer"
            className={styles.specLink}
          >
            Läs fullständig spec i Notion
          </a>
        </section>
      </div>
    </section>
  );
}

function ColorColumn({
  title,
  tokens,
}: {
  title: string;
  tokens: ReadonlyArray<{ token: string; value: string }>;
}) {
  return (
    <article className={styles.colorColumn}>
      <h3>{title}</h3>
      <ul className={styles.swatchList}>
        {tokens.map((entry) => (
          <li key={`${title}-${entry.token}`} className={styles.swatchItem}>
            <span className={styles.swatchChip} style={{ backgroundColor: entry.value }} aria-hidden="true" />
            <div className={styles.swatchMeta}>
              <span>{entry.token}</span>
              <code>{entry.value}</code>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}
