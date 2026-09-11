import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpDown,
  Bell,
  Check,
  ChevronDown,
  Eye,
  Home,
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
type PrimaryMode = "preset" | "custom";

type ProductSkin = {
  id: ProductSkinId;
  label: string;
  primary: string;
  infoColor: string;
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
};

type ScaleStep = {
  step: string;
  value: string;
};

type RgbColor = {
  r: number;
  g: number;
  b: number;
};

const skinStorageKey = "verkstan.designsystem.skin";
const themeStorageKey = "verkstan.designsystem.theme";
const primaryModeStorageKey = "verkstan.designsystem.primarymode";
const customPrimaryStorageKey = "verkstan.designsystem.customprimary";

const productSkins: ReadonlyArray<ProductSkin> = [
  {
    id: "inteller",
    label: "Inteller",
    primary: "#47FF9A",
    infoColor: "#1FFFF8",
    note: "Mint primär. Orange mark används som domänmarkör.",
  },
  {
    id: "onboarder",
    label: "Onboarder",
    primary: "#1FFFF8",
    infoColor: "#9A4DFF",
    note: "Teal primär. Info får lila för tydlig semantik.",
  },
  {
    id: "shortcut",
    label: "Shortcut",
    primary: "#9A4DFF",
    infoColor: "#1FFFF8",
    note: "Lila primär och fallback för nya appar.",
  },
];

const fiweAccents: ReadonlyArray<{ token: string; value: string }> = [
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
};

const neutralScaleLight: ReadonlyArray<ScaleStep> = [
  { step: "0", value: "#FFFFFF" },
  { step: "50", value: "#F8FAFC" },
  { step: "100", value: "#F1F5F9" },
  { step: "200", value: "#E2E8F0" },
  { step: "300", value: "#CBD5E1" },
  { step: "400", value: "#94A3B8" },
  { step: "500", value: "#64748B" },
  { step: "700", value: "#334155" },
  { step: "900", value: "#0B0F1A" },
];

const neutralScaleDark: ReadonlyArray<ScaleStep> = [
  { step: "50", value: "#ECF0F8" },
  { step: "100", value: "#CBD5E1" },
  { step: "200", value: "#94A3B8" },
  { step: "300", value: "#64748B" },
  { step: "400", value: "#334155" },
  { step: "500", value: "#273449" },
  { step: "600", value: "#1F2937" },
  { step: "700", value: "#111827" },
  { step: "900", value: "#0B0F1A" },
];

const tableRows: ReadonlyArray<{
  name: string;
  status: "Aktiv" | "Utkast" | "Pausad" | "Fel";
  owner: string;
  updated: string;
  isSelected?: boolean;
}> = [
  { name: "Attributregel / title-sync", status: "Aktiv", owner: "Team A", updated: "2m" },
  { name: "Batch-import / ERP feed", status: "Pausad", owner: "Team B", updated: "8m" },
  { name: "Prisexport / marketplace", status: "Aktiv", owner: "Team C", updated: "11m" },
  { name: "Media fallback / CDN", status: "Utkast", owner: "Team A", updated: "22m" },
  { name: "SKU validator / nordics", status: "Fel", owner: "Team D", updated: "30m" },
  { name: "Kanalmapping / B2B", status: "Aktiv", owner: "Team B", updated: "37m", isSelected: true },
  { name: "Diff-rapport / nightly", status: "Utkast", owner: "Team C", updated: "45m" },
  { name: "Tagg-normalisering", status: "Aktiv", owner: "Team A", updated: "1h" },
];

function DesignSystemRoute() {
  const [activeSkin, setActiveSkin] = useState<ProductSkinId>("shortcut");
  const [canvasTheme, setCanvasTheme] = useState<CanvasTheme>("light");
  const [primaryMode, setPrimaryMode] = useState<PrimaryMode>("preset");
  const [customPrimary, setCustomPrimary] = useState<string>("#F36F16");
  const [customPrimaryInput, setCustomPrimaryInput] = useState<string>("#F36F16");

  useEffect(() => {
    const savedSkin = window.localStorage.getItem(skinStorageKey);
    if (savedSkin === "inteller" || savedSkin === "onboarder" || savedSkin === "shortcut") {
      setActiveSkin(savedSkin);
    }

    const savedTheme = window.localStorage.getItem(themeStorageKey);
    if (savedTheme === "light" || savedTheme === "dark") {
      setCanvasTheme(savedTheme);
    }

    const savedPrimaryMode = window.localStorage.getItem(primaryModeStorageKey);
    if (savedPrimaryMode === "preset" || savedPrimaryMode === "custom") {
      setPrimaryMode(savedPrimaryMode);
    }

    const savedCustomPrimary = window.localStorage.getItem(customPrimaryStorageKey);
    const normalizedSavedCustom = normalizeHex(savedCustomPrimary);
    if (normalizedSavedCustom) {
      setCustomPrimary(normalizedSavedCustom);
      setCustomPrimaryInput(normalizedSavedCustom);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(skinStorageKey, activeSkin);
  }, [activeSkin]);

  useEffect(() => {
    window.localStorage.setItem(themeStorageKey, canvasTheme);
  }, [canvasTheme]);

  useEffect(() => {
    window.localStorage.setItem(primaryModeStorageKey, primaryMode);
  }, [primaryMode]);

  useEffect(() => {
    window.localStorage.setItem(customPrimaryStorageKey, customPrimary);
  }, [customPrimary]);

  const skin = useMemo(
    () => productSkins.find((entry) => entry.id === activeSkin) ?? productSkins[2],
    [activeSkin],
  );

  const activePrimary = primaryMode === "custom" ? customPrimary : skin.primary;
  const primaryScale = useMemo(() => buildPrimaryScale(activePrimary), [activePrimary]);
  const productPrimarySoftLight = getScaleValue(primaryScale, "100", activePrimary);
  const productPrimaryStrong = getScaleValue(primaryScale, "700", activePrimary);
  const themeTokens = canvasTheme === "dark" ? darkThemeTokens : lightThemeTokens;
  const isDarkTheme = canvasTheme === "dark";
  const productPrimarySoft = isDarkTheme
    ? mixHex("#0B0F1A", activePrimary, 0.24)
    : productPrimarySoftLight;
  const statusInfoSoft = isDarkTheme
    ? mixHex("#0B0F1A", skin.infoColor, 0.22)
    : mixHex("#FFFFFF", skin.infoColor, 0.22);
  const statusSuccessSoft = isDarkTheme ? "#163726" : "#DAFFEC";
  const statusWarningSoft = isDarkTheme ? "#3A3715" : "#F8F7C9";
  const statusDangerSoft = isDarkTheme ? "#3A1725" : "#FBD5DF";
  const textOnAccent = getReadableTextColor(activePrimary);

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
    "--product-primary": activePrimary,
    "--product-primary-soft": productPrimarySoft,
    "--product-primary-strong": productPrimaryStrong,
    "--status-success": "#47FF9A",
    "--status-success-soft": statusSuccessSoft,
    "--status-warning": "#F3F316",
    "--status-warning-soft": statusWarningSoft,
    "--status-danger": "#E11D48",
    "--status-danger-soft": statusDangerSoft,
    "--status-info": skin.infoColor,
    "--status-info-soft": statusInfoSoft,
    "--text-on-accent": textOnAccent,
  } as CSSProperties;

  const neutralScale = isDarkTheme ? neutralScaleDark : neutralScaleLight;
  const statusScale: ReadonlyArray<ScaleStep> = [
    { step: "success", value: "#47FF9A" },
    { step: "warning", value: "#F3F316" },
    { step: "danger", value: "#E11D48" },
    { step: "info", value: skin.infoColor },
  ];

  const selectedPresetAccent = fiweAccents.find((entry) => entry.value === customPrimary)?.token;

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
            Ljust läge: workspace-first canvas. Mörkt läge: #0B0F1A-familjen.
          </p>
        </header>

        <section className={styles.panel}>
          <div className={styles.controlGrid}>
            <article className={styles.controlCard}>
              <h2>Produktskin</h2>
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
              <p className={styles.skinNote}>{skin.note}</p>
            </article>

            <article className={styles.controlCard}>
              <h2>Canvas-tema</h2>
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
            </article>

            <article className={styles.controlCard}>
              <h2>Primärfärg</h2>
              <div className={styles.segmented} role="radiogroup" aria-label="Primärfärg-läge">
                <button
                  type="button"
                  role="radio"
                  aria-checked={primaryMode === "preset"}
                  className={`${styles.segmentedItem} ${
                    primaryMode === "preset" ? styles.segmentedItemActive : ""
                  }`}
                  onClick={() => setPrimaryMode("preset")}
                >
                  Produktskin
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={primaryMode === "custom"}
                  className={`${styles.segmentedItem} ${
                    primaryMode === "custom" ? styles.segmentedItemActive : ""
                  }`}
                  onClick={() => setPrimaryMode("custom")}
                >
                  Egen
                </button>
              </div>
              <div className={styles.customPickerRow}>
                {fiweAccents.map((entry) => (
                  <button
                    key={entry.token}
                    type="button"
                    className={`${styles.accentChip} ${
                      selectedPresetAccent === entry.token ? styles.accentChipActive : ""
                    }`}
                    onClick={() => {
                      setPrimaryMode("custom");
                      setCustomPrimary(entry.value);
                      setCustomPrimaryInput(entry.value);
                    }}
                  >
                    <span
                      className={styles.accentChipSwatch}
                      style={{ backgroundColor: entry.value }}
                      aria-hidden="true"
                    />
                    {entry.token}
                  </button>
                ))}
              </div>
              <div className={styles.customColorRow}>
                <input
                  type="color"
                  value={customPrimary}
                  aria-label="Välj custom primärfärg"
                  onChange={(event) => {
                    setPrimaryMode("custom");
                    setCustomPrimary(event.target.value.toUpperCase());
                    setCustomPrimaryInput(event.target.value.toUpperCase());
                  }}
                />
                <input
                  type="text"
                  value={customPrimaryInput}
                  aria-label="Skriv custom hex"
                  className={styles.hexInput}
                  onChange={(event) => setCustomPrimaryInput(event.target.value)}
                  onBlur={() => {
                    const normalized = normalizeHex(customPrimaryInput);
                    if (normalized) {
                      setPrimaryMode("custom");
                      setCustomPrimary(normalized);
                      setCustomPrimaryInput(normalized);
                    } else {
                      setCustomPrimaryInput(customPrimary);
                    }
                  }}
                />
              </div>
            </article>
          </div>
        </section>

        <section className={styles.panel}>
          <h2>Färgskalor</h2>
          <div className={styles.scaleGrid}>
            <ScaleStrip title={`Primär ${activePrimary}`} scale={primaryScale} />
            <ScaleStrip title="Neutrals (aktivt tema)" scale={neutralScale} />
            <ScaleStrip title="Status" scale={statusScale} />
          </div>
        </section>

        <section className={styles.panel}>
          <h2>Typografi</h2>
          <div className={styles.typographyStack}>
            <p className={styles.textDisplay}>Display / 36</p>
            <p className={styles.textTitle}>Title / 28</p>
            <p className={styles.textHeading}>Heading / 22</p>
            <p className={styles.textBody}>Body / 16</p>
            <p className={styles.textSmall}>Small / 14</p>
            <p className={styles.textLabel}>Label / 12</p>
          </div>
        </section>

        <section className={styles.panel}>
          <h2>Knappar</h2>
          <div className={styles.exampleGrid}>
            <article className={styles.exampleCard}>
              <div className={styles.buttonRow}>
                <button type="button" className={`${styles.button} ${styles.buttonPrimary}`}>
                  <Plus size={16} />
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
                <button type="button" className={`${styles.button} ${styles.iconButton}`} aria-label="Spara">
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
              <p className={styles.caption}>
                Toolbar: sekundär + primär. Formfooter: högerjusterad CTA. Destruktiv handling hålls separat.
              </p>
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
                  Bekräfta
                </button>
              </div>
            </article>
          </div>
        </section>

        <section className={styles.panel}>
          <h2>Ikoner</h2>
          <div className={styles.exampleGrid}>
            <article className={styles.exampleCard}>
              <div className={styles.iconSizeRow}>
                {[16, 20, 24].map((size) => (
                  <div key={size} className={styles.iconSizeItem}>
                    <span className={styles.iconSwatch}>
                      <Settings size={size} />
                    </span>
                    <span>{size}px</span>
                  </div>
                ))}
              </div>
              <div className={styles.patternStack}>
                <button type="button" className={`${styles.button} ${styles.buttonPrimary}`}>
                  <Search size={16} />
                  Sök artikel
                </button>
                <div className={styles.iconOnlyRow}>
                  <button type="button" className={`${styles.button} ${styles.iconButton}`} aria-label="Notiser">
                    <Bell size={16} />
                  </button>
                  <button type="button" className={`${styles.button} ${styles.iconButton}`} aria-label="Inställningar">
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
              <p className={styles.caption}>
                Lucide för CRUD/chrome. Färg styrs via <code>currentColor</code>.
              </p>
            </article>

            <article className={styles.exampleCard}>
              <h3>Ikonpaket</h3>
              <div className={styles.brandMarkRow}>
                <span className={styles.markBadge}>
                  <span className={styles.markDiamond} aria-hidden="true" />
                  Fiwe mark
                </span>
                <span className={styles.caption}>Produkt/nav/domän: Fiwe SVG-set</span>
              </div>
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
              <p className={styles.caption}>CRUD/chrome: lucide-react.</p>
            </article>
          </div>
        </section>

        <section className={styles.panel}>
          <h2>Tabeller</h2>
          <div className={styles.exampleGrid}>
            <article className={styles.exampleCard}>
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
                      <th>Senast</th>
                      <th>Åtgärder</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((row) => (
                      <tr key={row.name} className={row.isSelected ? styles.tableRowSelected : undefined}>
                        <td>{row.name}</td>
                        <td>
                          <span
                            className={`${styles.badge} ${
                              row.status === "Aktiv"
                                ? styles.badgeSuccess
                                : row.status === "Utkast"
                                  ? styles.badgeWarning
                                  : row.status === "Fel"
                                    ? styles.badgeDanger
                                    : styles.badgeInfo
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td>{row.owner}</td>
                        <td>{row.updated}</td>
                        <td>
                          <div className={styles.tableActionRow}>
                            <button type="button" className={styles.rowAction} aria-label={`Visa ${row.name}`}>
                              <Eye size={16} />
                            </button>
                            <button type="button" className={styles.rowAction} aria-label={`Redigera ${row.name}`}>
                              <Pencil size={16} />
                            </button>
                            <button type="button" className={styles.rowAction} aria-label={`Fler val för ${row.name}`}>
                              <MoreHorizontal size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={styles.tableFooter}>
                <span>Tomt läge: visa filterorsak + CTA “Skapa ny”.</span>
                <div className={styles.paginationRow}>
                  <button type="button" className={`${styles.button} ${styles.buttonGhost} ${styles.buttonSm}`}>
                    Föregående
                  </button>
                  <span>Sida 2 / 8</span>
                  <button type="button" className={`${styles.button} ${styles.buttonSecondary} ${styles.buttonSm}`}>
                    Nästa
                  </button>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className={styles.panel}>
          <h2>Övriga komponenter</h2>
          <div className={styles.componentsMosaic}>
            <article className={styles.miniCard}>
              <h3>Input</h3>
              <label htmlFor="demo-input" className={styles.inputLabel}>
                Kundnamn
              </label>
              <input id="demo-input" className={styles.textInput} placeholder="Skriv kundnamn..." />
              <p className={styles.helperText}>Hjälptext under fältet.</p>
              <p className={styles.errorText}>Fel: minst 3 tecken.</p>
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
              <h3>Select</h3>
              <button type="button" className={styles.selectButton}>
                Alla kanaler
                <ChevronDown size={16} />
              </button>
            </article>

            <article className={styles.miniCard}>
              <h3>Tabs</h3>
              <div className={styles.tabsRow} role="tablist" aria-label="Demo-tabbar">
                <button
                  type="button"
                  className={`${styles.tabItem} ${styles.tabItemActive}`}
                  role="tab"
                  aria-selected="true"
                >
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
              <h3>Banner / toast</h3>
              <div className={`${styles.banner} ${styles.bannerInfo}`}>
                <Bell size={16} />
                Synkning pågår
              </div>
              <div className={`${styles.banner} ${styles.bannerSuccess}`}>
                <Check size={16} />
                Artikel publicerad
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
            </article>

            <article className={styles.miniCard}>
              <h3>Kort</h3>
              <div className={styles.contentCard}>
                <p className={styles.contentCardTitle}>Importstatus</p>
                <p className={styles.contentCardMeta}>Senast uppdaterad för 2 min sedan</p>
                <button
                  type="button"
                  className={`${styles.button} ${styles.buttonSecondary} ${styles.buttonSm}`}
                >
                  Visa detaljer
                </button>
              </div>
            </article>

            <article className={styles.miniCard}>
              <h3>Dialog-shell</h3>
              <div className={styles.dialogShell}>
                <div className={styles.dialogHeader}>
                  <strong>Bekräfta borttagning</strong>
                  <button type="button" className={styles.rowAction} aria-label="Stäng dialog">
                    <X size={16} />
                  </button>
                </div>
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
              <h3>Sidebar-nav</h3>
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
              <h3>Listdensitet</h3>
              <div className={styles.densityList}>
                <span>01 · SKU-AX194 · Aktiv</span>
                <span>02 · SKU-AX195 · Utkast</span>
                <span>03 · SKU-AX196 · Aktiv</span>
                <span>04 · SKU-AX197 · Pausad</span>
              </div>
            </article>
          </div>
        </section>
      </div>
    </section>
  );
}

function ScaleStrip({ title, scale }: { title: string; scale: ReadonlyArray<ScaleStep> }) {
  return (
    <article className={styles.scaleCard}>
      <h3>{title}</h3>
      <div className={styles.scaleStrip} role="list" aria-label={title}>
        {scale.map((entry) => (
          <div key={`${title}-${entry.step}`} className={styles.scaleSwatch} role="listitem">
            <span className={styles.scaleColor} style={{ backgroundColor: entry.value }} aria-hidden="true" />
            <span className={styles.scaleStep}>{entry.step}</span>
            <code>{entry.value}</code>
          </div>
        ))}
      </div>
    </article>
  );
}

function normalizeHex(value: string | null): string | null {
  if (!value) return null;
  const candidate = value.trim();
  const normalized = candidate.startsWith("#") ? candidate : `#${candidate}`;
  const shortHexMatch = /^#([0-9a-fA-F]{3})$/.exec(normalized);
  if (shortHexMatch) {
    const [r, g, b] = shortHexMatch[1].split("");
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  const longHexMatch = /^#([0-9a-fA-F]{6})$/.exec(normalized);
  if (longHexMatch) {
    return `#${longHexMatch[1].toUpperCase()}`;
  }
  return null;
}

function hexToRgb(value: string): RgbColor | null {
  const normalized = normalizeHex(value);
  if (!normalized) return null;
  const hex = normalized.slice(1);
  const parsed = Number.parseInt(hex, 16);
  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  };
}

function rgbToHex(color: RgbColor): string {
  const toHex = (channel: number) => channel.toString(16).padStart(2, "0");
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`.toUpperCase();
}

function mixHex(baseHex: string, targetHex: string, targetWeight: number): string {
  const base = hexToRgb(baseHex);
  const target = hexToRgb(targetHex);
  if (!base || !target) return "#000000";
  const ratio = Math.max(0, Math.min(1, targetWeight));
  const mixed: RgbColor = {
    r: Math.round(base.r * (1 - ratio) + target.r * ratio),
    g: Math.round(base.g * (1 - ratio) + target.g * ratio),
    b: Math.round(base.b * (1 - ratio) + target.b * ratio),
  };
  return rgbToHex(mixed);
}

function buildPrimaryScale(primaryHex: string): ReadonlyArray<ScaleStep> {
  return [
    { step: "50", value: mixHex("#FFFFFF", primaryHex, 0.12) },
    { step: "100", value: mixHex("#FFFFFF", primaryHex, 0.22) },
    { step: "200", value: mixHex("#FFFFFF", primaryHex, 0.34) },
    { step: "300", value: mixHex("#FFFFFF", primaryHex, 0.48) },
    { step: "400", value: mixHex("#FFFFFF", primaryHex, 0.68) },
    { step: "500", value: normalizeHex(primaryHex) ?? primaryHex },
    { step: "600", value: mixHex(primaryHex, "#000000", 0.1) },
    { step: "700", value: mixHex(primaryHex, "#000000", 0.2) },
    { step: "800", value: mixHex(primaryHex, "#000000", 0.32) },
    { step: "900", value: mixHex(primaryHex, "#000000", 0.46) },
  ];
}

function getScaleValue(scale: ReadonlyArray<ScaleStep>, step: string, fallback: string): string {
  return scale.find((entry) => entry.step === step)?.value ?? fallback;
}

function relativeLuminance(hexColor: string): number {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return 0;
  const srgb = [rgb.r, rgb.g, rgb.b].map((value) => value / 255);
  const linear = srgb.map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

function contrastRatio(a: string, b: string): number {
  const first = relativeLuminance(a);
  const second = relativeLuminance(b);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

function getReadableTextColor(backgroundHex: string): string {
  const darkText = "#0B0F1A";
  const lightText = "#F8FAFC";
  return contrastRatio(backgroundHex, darkText) >= contrastRatio(backgroundHex, lightText)
    ? darkText
    : lightText;
}
