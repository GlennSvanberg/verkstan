import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowUpDown,
  Bell,
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

type SpacingToken = {
  token: string;
  px: number;
  use: string;
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
  { id: "inteller", label: "Inteller", primary: "#47FF9A", infoColor: "#1FFFF8" },
  { id: "onboarder", label: "Onboarder", primary: "#1FFFF8", infoColor: "#9A4DFF" },
  { id: "shortcut", label: "Shortcut", primary: "#9A4DFF", infoColor: "#1FFFF8" },
];

const fiweAccents: ReadonlyArray<{ token: string; value: string }> = [
  { token: "purple", value: "#9A4DFF" },
  { token: "teal", value: "#1FFFF8" },
  { token: "mint", value: "#47FF9A" },
  { token: "orange", value: "#F36F16" },
  { token: "pink", value: "#E788CE" },
  { token: "yellow", value: "#F3F316" },
];

export const fiweSpacingScale: ReadonlyArray<SpacingToken> = [
  { token: "space-1", px: 4, use: "hairline" },
  { token: "space-2", px: 8, use: "icon→label" },
  { token: "space-3", px: 12, use: "control pad Y" },
  { token: "space-4", px: 16, use: "default unit" },
  { token: "space-5", px: 20, use: "comfortable control" },
  { token: "space-6", px: 24, use: "block/panel" },
  { token: "space-8", px: 32, use: "section gap desktop" },
  { token: "space-10", px: 40, use: "large section" },
  { token: "space-12", px: 48, use: "page sections" },
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
  status: "Aktiv" | "Utkast" | "Pausad" | "Fel" | "Info";
  owner: string;
  updated: string;
  isSelected?: boolean;
}> = [
  { name: "Attributregel / title-sync", status: "Aktiv", owner: "Team A", updated: "2m" },
  { name: "Batch-import / ERP feed", status: "Pausad", owner: "Team B", updated: "8m" },
  { name: "Prisexport / marketplace", status: "Info", owner: "Team C", updated: "11m" },
  { name: "Media fallback / CDN", status: "Utkast", owner: "Team A", updated: "22m" },
  { name: "SKU validator / nordics", status: "Fel", owner: "Team D", updated: "30m" },
  {
    name: "Kanalmapping / B2B",
    status: "Aktiv",
    owner: "Team B",
    updated: "37m",
    isSelected: true,
  },
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
  const statusNeutralSoft = isDarkTheme ? "#2A3343" : "#E2E8F0";
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
    "--status-neutral": "#64748B",
    "--status-neutral-soft": statusNeutralSoft,
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
        <header className={`${styles.panel} ${styles.heroPanel}`}>
          <p className={styles.kicker}>Fiwe Product Design System</p>
          <div className={styles.headerTitleRow}>
            <h1>Designsystem</h1>
            <span className={styles.markBadge}>
              <span className={styles.markDiamond} aria-hidden="true" />
              Produktläge
            </span>
          </div>
          <p className={styles.lead}>
            Regel: produktytor är ljusa; mörkt läge är slate i #0B0F1A-familjen, inte
            marketing-midnight.
          </p>
          <div className={styles.heroMeta}>
            <span>Skin: {skin.label}</span>
            <span>Aktiv primär: {activePrimary}</span>
            <span>Tema: {canvasTheme === "light" ? "Ljust" : "Mörkt"}</span>
          </div>
          <div className={styles.heroControlLayout}>
            <div className={styles.controlGrid}>
              <article className={styles.controlCard}>
                <h3>Produktskin</h3>
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
              </article>

              <article className={styles.controlCard}>
                <h3>Canvas-tema</h3>
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
                <h3>Primärfärg</h3>
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
              </article>
            </div>

            <div className={styles.customPrimaryPanel}>
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
            </div>
          </div>
        </header>

        <section className={`${styles.panel} ${styles.sectionPanel} ${styles.agentCallout}`}>
          <h2>Agents / Skill</h2>
          <p className={styles.ruleLine}>
            Agents ska följa skillen <code>fiwe-product-ui</code>.
          </p>
          <div className={styles.calloutMeta}>
            <a
              href="https://app.notion.com/p/3d7212bf181a81909b44c0c563d80b94"
              target="_blank"
              rel="noreferrer"
              className={styles.calloutLink}
            >
              Spec i Notion
            </a>
            <span className={styles.calloutChip}>
              Stack: shadcn/ui + Fiwe-tokens, inget eget komponentbibliotek
            </span>
          </div>
        </section>

        <section className={`${styles.panel} ${styles.sectionPanel}`}>
          <h2>Spacing</h2>
          <div className={styles.spacingLayout}>
            <article className={styles.spacingCard}>
              <div className={styles.spacingHeader}>
                <span>Token</span>
                <span>px</span>
                <span>Use</span>
                <span>Visual</span>
              </div>
              <div className={styles.spacingRows}>
                {fiweSpacingScale.map((entry) => (
                  <div key={entry.token} className={styles.spacingRow}>
                    <code>{entry.token}</code>
                    <span>{entry.px}px</span>
                    <span>{entry.use}</span>
                    <span className={styles.spacingVisualCell}>
                      <span
                        className={styles.spacingRuler}
                        style={{ "--space-px": String(entry.px) } as CSSProperties}
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className={`${styles.panel} ${styles.sectionPanel}`}>
          <h2>Färgskalor</h2>
          <div className={styles.scaleStack}>
            <ScaleStrip title={`Primär ${activePrimary}`} scale={primaryScale} />
            <ScaleStrip title="Neutrals" scale={neutralScale} />
            <ScaleStrip title="Status" scale={statusScale} />
          </div>
        </section>

        <section className={`${styles.panel} ${styles.sectionPanel}`}>
          <h2>Typografi</h2>
          <div className={styles.typographyCard}>
            <div className={styles.typographyStack}>
              <p className={styles.textDisplay}>Display / 48</p>
              <p className={styles.textTitle}>Title / 34</p>
              <p className={styles.textHeading}>Heading / 26</p>
              <p className={styles.textBody}>Body / 17</p>
              <p className={styles.textSmall}>Small / 15</p>
              <p className={styles.textLabel}>Label / 12</p>
            </div>
          </div>
        </section>

        <section className={`${styles.panel} ${styles.sectionPanel}`}>
          <h2>Knappar — användning</h2>
          <div className={styles.usageGrid}>
            <article className={styles.exampleCard}>
              <h3>Toolbar</h3>
              <div className={styles.toolbarPattern}>
                <button type="button" className={`${styles.button} ${styles.buttonSecondary}`}>
                  <ChevronDown size={18} />
                  Filter
                </button>
                <button type="button" className={`${styles.button} ${styles.buttonGhost}`}>
                  Exportera
                </button>
                <button type="button" className={`${styles.button} ${styles.buttonPrimary}`}>
                  <Plus size={18} />
                  Ny artikel
                </button>
                <button
                  type="button"
                  className={`${styles.button} ${styles.iconButton}`}
                  aria-label="Toolbar-inställningar"
                >
                  <Settings size={18} />
                </button>
              </div>
              <p className={styles.ruleLine}>Regel: en primär CTA per toolbar-zon.</p>
            </article>

            <article className={styles.exampleCard}>
              <h3>Formulärfooter</h3>
              <div className={styles.formPattern}>
                <label htmlFor="button-pattern-name" className={styles.inputLabel}>
                  Artikelnamn
                </label>
                <input
                  id="button-pattern-name"
                  className={styles.textInput}
                  placeholder="Skriv artikelnamn..."
                />
                <label htmlFor="button-pattern-channel" className={styles.inputLabel}>
                  Kanal
                </label>
                <button id="button-pattern-channel" type="button" className={styles.selectButton}>
                  Alla kanaler
                  <ChevronDown size={18} />
                </button>
                <div className={styles.formFooterSplit}>
                  <button type="button" className={`${styles.button} ${styles.buttonGhost}`}>
                    Avbryt
                  </button>
                  <div className={styles.formFooterActions}>
                    <button type="button" className={`${styles.button} ${styles.buttonSecondary}`}>
                      Spara utkast
                    </button>
                    <button type="button" className={`${styles.button} ${styles.buttonPrimary}`}>
                      <Save size={18} />
                      Publicera
                    </button>
                  </div>
                </div>
              </div>
              <p className={styles.ruleLine}>Regel: formulärfooter har primär CTA till höger, avbryt separat.</p>
            </article>

            <article className={styles.exampleCard}>
              <h3>Destruktivt flöde</h3>
              <div className={styles.dangerPattern}>
                <div className={styles.dangerCallout}>
                  <AlertTriangle size={18} />
                  Radering påverkar publicerad data.
                </div>
                <div className={styles.destructiveRow}>
                  <button type="button" className={`${styles.button} ${styles.buttonDanger}`}>
                    Ta bort artikel
                  </button>
                  <button type="button" className={`${styles.button} ${styles.buttonSecondary}`}>
                    Bekräfta manuellt
                  </button>
                </div>
              </div>
              <p className={styles.ruleLine}>
                Regel: danger är aldrig produktens primära action.
              </p>
            </article>
          </div>
        </section>

        <section className={`${styles.panel} ${styles.sectionPanel}`}>
          <h2>Ikoner — användning</h2>
          <div className={styles.usageGrid}>
            <article className={styles.exampleCard}>
              <h3>Pakethierarki</h3>
              <div className={styles.iconPackageRow}>
                <span className={styles.markBadge}>
                  <span className={styles.markDiamond} aria-hidden="true" />
                  Fiwe mark
                </span>
                <span className={styles.chip}>Produkt / nav / domän</span>
              </div>
              <div className={styles.iconPackageRow}>
                <span className={styles.chip}>
                  <Search size={16} />
                  Lucide
                </span>
                <span className={styles.chip}>CRUD / chrome</span>
              </div>
              <p className={styles.ruleLine}>
                Regel: Fiwe mark för produkt/domän, Lucide för CRUD/chrome.
              </p>
            </article>

            <article className={styles.exampleCard}>
              <h3>Ikoner i kontext</h3>
              <div className={styles.iconContextStack}>
                <button type="button" className={`${styles.button} ${styles.buttonPrimary}`}>
                  <Search size={18} />
                  Sök artikel
                </button>
                <div className={styles.iconOnlyRow}>
                  <button
                    type="button"
                    className={`${styles.button} ${styles.iconButton}`}
                    aria-label="Öppna notiser"
                  >
                    <Bell size={20} />
                  </button>
                  <button
                    type="button"
                    className={`${styles.button} ${styles.iconButton}`}
                    aria-label="Öppna inställningar"
                  >
                    <Settings size={20} />
                  </button>
                </div>
                <nav className={styles.inlineNav} aria-label="Navigering med ikon och text">
                  <button type="button" className={`${styles.navItem} ${styles.navItemActive}`}>
                    <Home size={20} />
                    Översikt
                  </button>
                  <button type="button" className={styles.navItem}>
                    <ListTodo size={20} />
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
          </div>
        </section>

        <section className={`${styles.panel} ${styles.sectionPanel}`}>
          <h2>Tabeller</h2>
          <div className={styles.componentStack}>
            <article className={styles.exampleCard}>
              <div className={styles.statusLegend}>
                <span className={`${styles.badge} ${styles.badgeSuccess}`}>Success</span>
                <span className={`${styles.badge} ${styles.badgeWarning}`}>Warning</span>
                <span className={`${styles.badge} ${styles.badgeDanger}`}>Danger</span>
                <span className={`${styles.badge} ${styles.badgeInfo}`}>Info</span>
                <span className={`${styles.badge} ${styles.badgeNeutral}`}>Neutral</span>
              </div>
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
                      <tr
                        key={row.name}
                        className={row.isSelected ? styles.tableRowSelected : undefined}
                      >
                        <td>{row.name}</td>
                        <td>
                          <span className={`${styles.badge} ${statusClassForRow(row.status, styles)}`}>
                            {row.status}
                          </span>
                        </td>
                        <td>{row.owner}</td>
                        <td>{row.updated}</td>
                        <td>
                          <div className={styles.tableActionRow}>
                            <button
                              type="button"
                              className={styles.rowAction}
                              aria-label={`Visa ${row.name}`}
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              type="button"
                              className={styles.rowAction}
                              aria-label={`Redigera ${row.name}`}
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              className={styles.rowAction}
                              aria-label={`Fler val för ${row.name}`}
                            >
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
                  <button
                    type="button"
                    className={`${styles.button} ${styles.buttonGhost} ${styles.buttonSm}`}
                  >
                    Föregående
                  </button>
                  <span>Sida 2 / 8</span>
                  <button
                    type="button"
                    className={`${styles.button} ${styles.buttonSecondary} ${styles.buttonSm}`}
                  >
                    Nästa
                  </button>
                </div>
              </div>
              <p className={styles.ruleLine}>Regel: statusfärg betyder semantik, inte dekor.</p>
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

function statusClassForRow(
  status: "Aktiv" | "Utkast" | "Pausad" | "Fel" | "Info",
  css: Record<string, string>,
): string {
  if (status === "Aktiv") return css.badgeSuccess;
  if (status === "Utkast") return css.badgeWarning;
  if (status === "Fel") return css.badgeDanger;
  if (status === "Info") return css.badgeInfo;
  return css.badgeNeutral;
}
