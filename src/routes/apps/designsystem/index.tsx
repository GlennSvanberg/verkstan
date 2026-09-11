import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpDown,
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  Home,
  Info,
  ListTodo,
  MoreHorizontal,
  Pencil,
  Plus,
  Save,
  Search,
  Settings,
  Trash2,
  X,
} from "lucide-react";
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
  primarySoftLight: string;
  primarySoftDark: string;
  primaryStrong: string;
  infoColor: string;
  infoSoftLight: string;
  infoSoftDark: string;
  note: string;
};

type ThemeTokens = {
  bgApp: string;
  bgSubtle: string;
  bgMuted: string;
  bgInverse: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textOnInverse: string;
  borderDefault: string;
  borderStrong: string;
  textOnAccent: string;
};

const skinStorageKey = "verkstan.designsystem.skin";
const themeStorageKey = "verkstan.designsystem.theme";

const productSkins: ReadonlyArray<ProductSkin> = [
  {
    id: "inteller",
    label: "Inteller",
    primary: "#47FF9A",
    primarySoftLight: "#DAFFEC",
    primarySoftDark: "#133726",
    primaryStrong: "#27CC73",
    infoColor: "#1FFFF8",
    infoSoftLight: "#CBFFFD",
    infoSoftDark: "#163640",
    note: "Mint är primär. Orange diamant (#F36F16) är mark, inte CTA.",
  },
  {
    id: "onboarder",
    label: "Onboarder",
    primary: "#1FFFF8",
    primarySoftLight: "#D3FFFD",
    primarySoftDark: "#153742",
    primaryStrong: "#12CCC6",
    infoColor: "#9A4DFF",
    infoSoftLight: "#E9DBFF",
    infoSoftDark: "#2E214A",
    note: "Teal är primär. Info byter till lila för tydlig status-separation.",
  },
  {
    id: "shortcut",
    label: "Shortcut",
    primary: "#9A4DFF",
    primarySoftLight: "#ECDFFF",
    primarySoftDark: "#2B2144",
    primaryStrong: "#7D2EE8",
    infoColor: "#1FFFF8",
    infoSoftLight: "#CBFFFD",
    infoSoftDark: "#163640",
    note: "Lila är primär för Shortcut och fallback för nya appar.",
  },
];

const accentTokens: ReadonlyArray<{ token: string; value: string }> = [
  { token: "purple", value: "#9A4DFF" },
  { token: "teal", value: "#1FFFF8" },
  { token: "mint", value: "#47FF9A" },
  { token: "orange", value: "#F36F16" },
  { token: "pink", value: "#E788CE" },
  { token: "yellow", value: "#F3F316" },
];

const lightThemeTokens: ThemeTokens = {
  bgApp: "#FFFFFF",
  bgSubtle: "#F7F9FC",
  bgMuted: "#EEF2F8",
  bgInverse: "#0B0F1A",
  textPrimary: "#111827",
  textSecondary: "#334155",
  textMuted: "#64748B",
  textOnInverse: "#F8FAFC",
  borderDefault: "#DCE2EC",
  borderStrong: "#C2CDD9",
  textOnAccent: "#0B0F1A",
};

const darkThemeTokens: ThemeTokens = {
  bgApp: "#0B0F1A",
  bgSubtle: "#111827",
  bgMuted: "#1F2937",
  bgInverse: "#F8FAFC",
  textPrimary: "#ECF0F8",
  textSecondary: "#CBD5E1",
  textMuted: "#9CA3B6",
  textOnInverse: "#0B0F1A",
  borderDefault: "#273449",
  borderStrong: "#334155",
  textOnAccent: "#0B0F1A",
};

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
    skin.id === "onboarder" ? "status.info blir lila i Onboarder" : "status.info är teal";

  const themeTokens = canvasTheme === "dark" ? darkThemeTokens : lightThemeTokens;
  const isDarkTheme = canvasTheme === "dark";
  const productPrimarySoft = isDarkTheme ? skin.primarySoftDark : skin.primarySoftLight;
  const statusInfoSoft = isDarkTheme ? skin.infoSoftDark : skin.infoSoftLight;
  const statusSuccessSoft = isDarkTheme ? "#163726" : "#DAFFEC";
  const statusWarningSoft = isDarkTheme ? "#3A3715" : "#F8F7C9";
  const statusDangerSoft = isDarkTheme ? "#3A1725" : "#FBD5DF";

  const skinVariables = {
    "--bg-app": themeTokens.bgApp,
    "--bg-subtle": themeTokens.bgSubtle,
    "--bg-muted": themeTokens.bgMuted,
    "--bg-inverse": themeTokens.bgInverse,
    "--text-primary": themeTokens.textPrimary,
    "--text-secondary": themeTokens.textSecondary,
    "--text-muted": themeTokens.textMuted,
    "--text-on-inverse": themeTokens.textOnInverse,
    "--border-default": themeTokens.borderDefault,
    "--border-strong": themeTokens.borderStrong,
    "--product-primary": skin.primary,
    "--product-primary-soft": productPrimarySoft,
    "--product-primary-strong": skin.primaryStrong,
    "--status-success": "#47FF9A",
    "--status-success-soft": statusSuccessSoft,
    "--status-warning": "#F3F316",
    "--status-warning-soft": statusWarningSoft,
    "--status-danger": "#E11D48",
    "--status-danger-soft": statusDangerSoft,
    "--status-info": skin.infoColor,
    "--status-info-soft": statusInfoSoft,
    "--text-on-accent": themeTokens.textOnAccent,
  } as CSSProperties;

  const neutralTokens: ReadonlyArray<{ token: string; value: string }> = [
    { token: "bg.app", value: themeTokens.bgApp },
    { token: "bg.subtle", value: themeTokens.bgSubtle },
    { token: "bg.muted", value: themeTokens.bgMuted },
    { token: "bg.inverse", value: themeTokens.bgInverse },
    { token: "text.primary", value: themeTokens.textPrimary },
    { token: "text.secondary", value: themeTokens.textSecondary },
    { token: "text.muted", value: themeTokens.textMuted },
    { token: "text.on-inverse", value: themeTokens.textOnInverse },
    { token: "border.default", value: themeTokens.borderDefault },
    { token: "border.strong", value: themeTokens.borderStrong },
  ];

  const primaryScaleTokens: ReadonlyArray<{ token: string; value: string }> = [
    { token: "primary.soft", value: productPrimarySoft },
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
    <section className={styles.workspaceRoot} data-theme={canvasTheme} style={skinVariables}>
      <div className={styles.workspaceInner}>
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
            Detta är produkt-UI för Fiwe (workspace-first), inte midnight-first uttrycket för
            marknadsföring. Ljust läge ska vara full-bleed arbetsyta och mörkt läge bygger på
            #0B0F1A-familjen.
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
            <ColorColumn title="Core neutrals (aktivt tema)" tokens={neutralTokens} />
            <ColorColumn title="Brand accents" tokens={accentTokens} />
            <ColorColumn title={`Aktiv primärskala (${skin.label})`} tokens={primaryScaleTokens} />
            <ColorColumn title="Status" tokens={statusScaleTokens} />
          </div>
        </section>

        <section className={styles.panel}>
          <h2>Typografi</h2>
          <p className={styles.typographyMeta}>
            Rethink Sans (Regular / Medium / Bold) med Inter som fallback.
          </p>
          <div className={styles.typographyStack}>
            <p className={styles.textDisplay}>Display / 36</p>
            <p className={styles.textTitle}>Title / 28</p>
            <p className={styles.textHeading}>Heading / 22</p>
            <p className={styles.textBody}>
              Body / 16 — produktgränssnittets standardtext för arbetsytor och paneler.
            </p>
            <p className={styles.textSmall}>Small / 14 — hjälptext, metadata och sekundär info.</p>
            <p className={styles.textLabel}>Label / 12, medium, uppercase.</p>
          </div>
        </section>

        <section className={styles.panel}>
          <h2>Knappar</h2>
          <div className={styles.exampleGrid}>
            <article className={styles.exampleCard}>
              <h3>Varianter och storlekar</h3>
              <div className={styles.buttonRow}>
                <button type="button" className={`${styles.button} ${styles.buttonPrimary}`}>
                  <Plus size={16} aria-hidden="true" />
                  Primär
                </button>
                <button type="button" className={`${styles.button} ${styles.buttonSecondary}`}>
                  Sekundär
                </button>
                <button type="button" className={`${styles.button} ${styles.buttonDanger}`}>
                  Fara
                </button>
                <button type="button" className={`${styles.button} ${styles.buttonGhost}`}>
                  Ghost
                </button>
                <button
                  type="button"
                  className={`${styles.button} ${styles.iconButton}`}
                  aria-label="Spara utkast"
                >
                  <Save size={16} />
                </button>
              </div>
              <div className={styles.buttonRow}>
                <button type="button" className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSm}`}>
                  Sm
                </button>
                <button type="button" className={`${styles.button} ${styles.buttonPrimary}`}>
                  Md
                </button>
                <button type="button" className={`${styles.button} ${styles.buttonPrimary}`} disabled>
                  Inaktiv
                </button>
              </div>
            </article>

            <article className={styles.exampleCard}>
              <h3>Placering i produktflöden</h3>
              <div className={styles.patternStack}>
                <div className={styles.toolbarRow}>
                  <button type="button" className={`${styles.button} ${styles.buttonSecondary}`}>
                    Filter
                  </button>
                  <button type="button" className={`${styles.button} ${styles.buttonPrimary}`}>
                    <Plus size={16} aria-hidden="true" />
                    Ny artikel
                  </button>
                </div>
                <div className={styles.formFooter}>
                  <button type="button" className={`${styles.button} ${styles.buttonGhost}`}>
                    Avbryt
                  </button>
                  <button type="button" className={`${styles.button} ${styles.buttonPrimary}`}>
                    Spara ändringar
                  </button>
                </div>
                <div className={styles.destructiveRow}>
                  <button type="button" className={`${styles.button} ${styles.buttonDanger}`}>
                    Ta bort
                  </button>
                  <button type="button" className={`${styles.button} ${styles.buttonSecondary}`}>
                    Behåll post
                  </button>
                </div>
              </div>
            </article>

            <article className={styles.guidelineCard}>
              <h4>Bra</h4>
              <ul>
                <li>En tydlig primär CTA per zon (toolbar eller footer).</li>
                <li>Danger står avskilt och får alltid tydlig konsekvenstext.</li>
                <li>Sm används i täta tabeller, md i formulär och paneler.</li>
              </ul>
            </article>

            <article className={styles.guidelineCard}>
              <h4>Undvik</h4>
              <ul>
                <li>Två primära knappar bredvid varandra i samma beslutspunkt.</li>
                <li>Att gömma destruktiva val i samma färg som primär.</li>
                <li>Överdoserad luft som bryter tät produktdensitet.</li>
              </ul>
            </article>
          </div>
        </section>

        <section className={styles.panel}>
          <h2>Ikoner (lucide-react)</h2>
          <div className={styles.exampleGrid}>
            <article className={styles.exampleCard}>
              <h3>Storlekar och färgstyrning</h3>
              <div className={styles.iconSizeRow}>
                {[16, 20, 24].map((size) => (
                  <div key={size} className={styles.iconSizeItem}>
                    <span className={styles.iconSwatch}>
                      <Settings size={size} aria-hidden="true" />
                    </span>
                    <span>{size}px</span>
                  </div>
                ))}
              </div>
              <p className={styles.inlineHint}>
                Lucide följer <code>currentColor</code>: färga via textfärg eller primär, aldrig
                slumpmässiga nyanser.
              </p>
            </article>

            <article className={styles.exampleCard}>
              <h3>Mönster i UI</h3>
              <div className={styles.patternStack}>
                <button type="button" className={`${styles.button} ${styles.buttonPrimary}`}>
                  <Search size={16} />
                  Sök artikel
                </button>
                <div className={styles.iconOnlyRow}>
                  <button
                    type="button"
                    className={`${styles.button} ${styles.iconButton}`}
                    aria-label="Visa notiser"
                  >
                    <Bell size={16} />
                  </button>
                  <button
                    type="button"
                    className={`${styles.button} ${styles.iconButton}`}
                    aria-label="Öppna inställningar"
                  >
                    <Settings size={16} />
                  </button>
                </div>
                <nav className={styles.inlineNav} aria-label="Navigering med ikon och text">
                  <button type="button" className={`${styles.navItem} ${styles.navItemActive}`}>
                    <Home size={16} />
                    Översikt
                  </button>
                  <button type="button" className={styles.navItem}>
                    <ListTodo size={16} />
                    Ärenden
                  </button>
                </nav>
                <div className={styles.tableActionRow}>
                  <button type="button" className={styles.rowAction} aria-label="Visa rad">
                    <Eye size={16} />
                  </button>
                  <button type="button" className={styles.rowAction} aria-label="Redigera rad">
                    <Pencil size={16} />
                  </button>
                  <button type="button" className={styles.rowAction} aria-label="Fler val">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
            </article>

            <article className={styles.guidelineCard}>
              <h4>Bra</h4>
              <ul>
                <li>Ikon före etikett i knapp när den tillför kontext.</li>
                <li>Icon-only får alltid aria-label och tydlig hover/fokus.</li>
                <li>Radåtgärder hålls i samma ikonfamilj för snabb scanning.</li>
              </ul>
            </article>

            <article className={styles.guidelineCard}>
              <h4>Undvik</h4>
              <ul>
                <li>Mix av flera CRUD-ikonbibliotek i samma vy.</li>
                <li>Ikoner utan text i primära beslutslägen.</li>
                <li>Hårdkodade färger direkt på ikonens SVG.</li>
              </ul>
            </article>
          </div>
        </section>

        <section className={styles.panel}>
          <h2>Ikonpaket i Fiwe</h2>
          <div className={styles.iconPackageGrid}>
            <article className={styles.exampleCard}>
              <h3>Produkt / domänmarkering</h3>
              <div className={styles.brandMarkRow}>
                <span className={styles.markBadge}>
                  <span className={styles.markDiamond} aria-hidden="true" />
                  Fiwe mark
                </span>
                <span className={styles.brandInlineMark} aria-hidden="true">
                  <span className={styles.markDiamond} />
                  <span className={styles.brandBar} />
                </span>
              </div>
              <p className={styles.inlineHint}>
                Navigeringsmärken och domänmarkörer använder Fiwe brand-SVG-set.
              </p>
            </article>
            <article className={styles.exampleCard}>
              <h3>CRUD / chrome</h3>
              <div className={styles.buttonRow}>
                <span className={styles.chip}>
                  <Plus size={16} />
                  Lägg till
                </span>
                <span className={styles.chip}>
                  <Pencil size={16} />
                  Redigera
                </span>
                <span className={styles.chip}>
                  <Trash2 size={16} />
                  Ta bort
                </span>
              </div>
              <p className={styles.inlineHint}>
                CRUD, tabeller och topbar använder Lucide via <code>lucide-react</code>. Ingen
                andra ikonfamilj ska introduceras för dessa ytor.
              </p>
            </article>
          </div>
        </section>

        <section className={styles.panel}>
          <h2>Tabeller (tät listvy)</h2>
          <div className={styles.exampleGrid}>
            <article className={styles.exampleCard}>
              <h3>Tät tabell med status och radåtgärder</h3>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.sortableHeader}>
                        Objekt
                        <ArrowUpDown size={14} />
                      </th>
                      <th>Status</th>
                      <th>Ansvarig</th>
                      <th>Åtgärder</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Attributregel</td>
                      <td>Klar</td>
                      <td>Team A</td>
                      <td>
                        <div className={styles.tableActionRow}>
                          <button type="button" className={styles.rowAction} aria-label="Visa attributregel">
                            <Eye size={16} />
                          </button>
                          <button type="button" className={styles.rowAction} aria-label="Redigera attributregel">
                            <Pencil size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr className={styles.tableRowSelected}>
                      <td>Batch-import</td>
                      <td>Vald rad</td>
                      <td>Team B</td>
                      <td>
                        <div className={styles.tableActionRow}>
                          <button type="button" className={styles.rowAction} aria-label="Visa batch-import">
                            <Eye size={16} />
                          </button>
                          <button type="button" className={styles.rowAction} aria-label="Fler val för batch-import">
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className={styles.tableEmpty}>
                <Info size={16} />
                <span>Tomt läge: inga träffar. Visa filtertips + “Skapa ny”.</span>
              </div>
            </article>

            <article className={styles.guidelineCard}>
              <h4>Bra</h4>
              <ul>
                <li>Header visar sorteringscue där sortering är möjlig.</li>
                <li>Radhover och vald rad skiljs tydligt men diskret.</li>
                <li>Åtgärdsknappar ligger längst till höger för snabb muskelminne.</li>
              </ul>
            </article>

            <article className={styles.guidelineCard}>
              <h4>Undvik</h4>
              <ul>
                <li>Överdrivet höga radhöjder som minskar informationsdensitet.</li>
                <li>Flera olika ikonstorlekar inom samma action-kolumn.</li>
                <li>Tomma lägen utan väg framåt.</li>
              </ul>
            </article>
          </div>
        </section>

        <section className={styles.panel}>
          <h2>Övriga vanliga komponenter</h2>
          <div className={styles.componentsMosaic}>
            <article className={styles.miniCard}>
              <h3>Input + hjälptext + fel</h3>
              <label htmlFor="demo-input" className={styles.inputLabel}>
                Kundnamn
              </label>
              <input id="demo-input" className={styles.textInput} placeholder="Skriv kundnamn..." />
              <p className={styles.helperText}>Hjälptext: visas alltid under fältet.</p>
              <p className={styles.errorText}>Fel: Namn måste innehålla minst 3 tecken.</p>
            </article>

            <article className={styles.miniCard}>
              <h3>Checkbox + switch</h3>
              <label className={styles.checkboxRow}>
                <input type="checkbox" defaultChecked />
                <span>Visa endast aktiva artiklar</span>
              </label>
              <div className={styles.switchRow}>
                <span>Auto-spara</span>
                <button type="button" className={styles.switchButton} aria-pressed="true">
                  <span className={styles.switchThumb} />
                </button>
              </div>
            </article>

            <article className={styles.miniCard}>
              <h3>Select / dropdown cue</h3>
              <button type="button" className={styles.selectButton}>
                Alla kanaler
                <ChevronDown size={16} />
              </button>
            </article>

            <article className={styles.miniCard}>
              <h3>Tabs</h3>
              <div className={styles.tabsRow} role="tablist" aria-label="Demo-tabbar">
                <button type="button" className={`${styles.tabItem} ${styles.tabItemActive}`} role="tab" aria-selected="true">
                  Artiklar
                </button>
                <button type="button" className={styles.tabItem} role="tab" aria-selected="false">
                  Regler
                </button>
                <button type="button" className={styles.tabItem} role="tab" aria-selected="false">
                  Historik
                </button>
              </div>
            </article>

            <article className={styles.miniCard}>
              <h3>Toast + banner</h3>
              <div className={`${styles.banner} ${styles.bannerInfo}`}>
                <Info size={16} />
                Synkning pågår i bakgrunden.
              </div>
              <div className={`${styles.banner} ${styles.bannerSuccess}`}>
                <Check size={16} />
                Artikel publicerad.
              </div>
            </article>

            <article className={styles.miniCard}>
              <h3>Badge / chip</h3>
              <div className={styles.badgeRow}>
                <span className={`${styles.badge} ${styles.badgeSuccess}`}>Aktiv</span>
                <span className={`${styles.badge} ${styles.badgeWarning}`}>Utkast</span>
                <span className={`${styles.badge} ${styles.badgeDanger}`}>Fel</span>
                <span className={`${styles.badge} ${styles.badgeInfo}`}>Info</span>
              </div>
              <p className={styles.statusNote}>{infoStatusToken}</p>
            </article>

            <article className={styles.miniCard}>
              <h3>Kortmönster</h3>
              <div className={styles.contentCard}>
                <p className={styles.contentCardTitle}>Importstatus</p>
                <p className={styles.contentCardMeta}>Senast uppdaterad för 2 min sedan</p>
                <button type="button" className={`${styles.button} ${styles.buttonSecondary} ${styles.buttonSm}`}>
                  Visa detaljer
                </button>
              </div>
            </article>

            <article className={styles.miniCard}>
              <h3>Dialog-shell (statisk)</h3>
              <div className={styles.dialogShell}>
                <div className={styles.dialogHeader}>
                  <strong>Bekräfta borttagning</strong>
                  <button type="button" className={styles.rowAction} aria-label="Stäng dialog">
                    <X size={16} />
                  </button>
                </div>
                <p>Detta tar bort kopplingen för vald artikel.</p>
                <div className={styles.formFooter}>
                  <button type="button" className={`${styles.button} ${styles.buttonGhost}`}>
                    Avbryt
                  </button>
                  <button type="button" className={`${styles.button} ${styles.buttonDanger}`}>
                    Ta bort
                  </button>
                </div>
              </div>
            </article>

            <article className={styles.miniCard}>
              <h3>Sidebar-nav mönster</h3>
              <nav aria-label="Demo-sidnavigering" className={styles.sidebarNav}>
                <button type="button" className={`${styles.navItem} ${styles.navItemActive}`}>
                  <Home size={16} />
                  Översikt
                </button>
                <button type="button" className={styles.navItem}>
                  <ListTodo size={16} />
                  Ärenden
                </button>
                <button type="button" className={styles.navItem}>
                  <Settings size={16} />
                  Inställningar
                </button>
              </nav>
            </article>

            <article className={styles.miniCard}>
              <h3>Pagination / listdensitet</h3>
              <div className={styles.densityList}>
                <span>01 · SKU-AX194 · Aktiv</span>
                <span>02 · SKU-AX195 · Utkast</span>
                <span>03 · SKU-AX196 · Aktiv</span>
              </div>
              <div className={styles.paginationRow}>
                <button type="button" className={`${styles.button} ${styles.buttonGhost} ${styles.buttonSm}`}>
                  Föregående
                </button>
                <span>Sida 2 / 8</span>
                <button type="button" className={`${styles.button} ${styles.buttonSecondary} ${styles.buttonSm}`}>
                  Nästa
                </button>
              </div>
            </article>
          </div>
        </section>

        <section className={styles.panel}>
          <h2>Animationer i produkt-UI</h2>
          <div className={styles.animationLayout}>
            <article className={styles.guidelineCard}>
              <h4>Riktlinjer</h4>
              <ul>
                <li>Animation används för feedback och state-förändring, inte dekoration.</li>
                <li>UI-transitioner: cirka 120–200ms. Paneler/accordion: max 300ms.</li>
                <li>Ease-out som standard för in/expand; undvik långa loopar och parallax.</li>
                <li>Bygg med CSS transitions eller små keyframes, inget tungt ramverk.</li>
                <li>Respektera alltid <code>prefers-reduced-motion</code>.</li>
              </ul>
            </article>

            <div className={styles.animationGrid}>
              <article className={styles.animationDemo}>
                <h3>Toast enter (mjuk)</h3>
                <div className={styles.toastMotionDemo}>
                  <Check size={16} />
                  Sparat i arbetsyta
                </div>
              </article>
              <article className={styles.animationDemo}>
                <h3>Fokusring</h3>
                <button type="button" className={`${styles.button} ${styles.buttonSecondary} ${styles.focusRingDemo}`}>
                  Fokusdemo
                </button>
              </article>
              <article className={styles.animationDemo}>
                <h3>Panel expand/collapse</h3>
                <div className={styles.expandDemo}>
                  <div className={styles.expandHeader}>
                    <ChevronRight size={16} />
                    Filterpanel
                  </div>
                  <div className={styles.expandPanel}>
                    <span>Kanaler: 3 valda</span>
                    <span>Status: Aktiv + Utkast</span>
                  </div>
                </div>
              </article>
            </div>
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
                <li>Ikoner: Fiwe-mark för produkt/domän, Lucide för CRUD/chrome.</li>
                <li>Ljust läge är workspace-first full-bleed, inte midnight-marknadsläge.</li>
                <li>Spacing följer 4-pt-system. Radius: 6-8 för controls, 8-10 för paneler.</li>
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
            <span
              className={styles.swatchChip}
              style={{ backgroundColor: entry.value }}
              aria-hidden="true"
            />
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
