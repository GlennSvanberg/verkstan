import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import styles from "./index.module.css";

export type ProductSkinId = "inteller" | "onboarder" | "shortcut";
export type CanvasTheme = "light" | "dark";
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

export type ScaleStep = {
  step: string;
  value: string;
};

export type SpacingToken = {
  token: string;
  px: number;
  use: string;
};

type RgbColor = {
  r: number;
  g: number;
  b: number;
};

export type DesignsystemViewId = "foundations" | "components" | "patterns";

export const designsystemViewLinks: ReadonlyArray<{
  id: DesignsystemViewId;
  label: string;
  to: "/apps/designsystem" | "/apps/designsystem/components" | "/apps/designsystem/patterns";
}> = [
  { id: "foundations", label: "Foundations", to: "/apps/designsystem" },
  { id: "components", label: "Components", to: "/apps/designsystem/components" },
  { id: "patterns", label: "Patterns", to: "/apps/designsystem/patterns" },
];

const skinStorageKey = "verkstan.designsystem.skin";
const themeStorageKey = "verkstan.designsystem.theme";
const primaryModeStorageKey = "verkstan.designsystem.primarymode";
const customPrimaryStorageKey = "verkstan.designsystem.customprimary";

const productSkins: ReadonlyArray<ProductSkin> = [
  { id: "inteller", label: "Inteller", primary: "#47FF9A", infoColor: "#1FFFF8" },
  { id: "onboarder", label: "Onboarder", primary: "#1FFFF8", infoColor: "#9A4DFF" },
  { id: "shortcut", label: "Shortcut", primary: "#9A4DFF", infoColor: "#1FFFF8" },
];

export const fiweAccents: ReadonlyArray<{ token: string; value: string }> = [
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

export type TableStatus = "Aktiv" | "Utkast" | "Pausad" | "Fel" | "Info";

export const tableRows: ReadonlyArray<{
  name: string;
  status: TableStatus;
  owner: string;
  updated: string;
  isSelected?: boolean;
}> = [
  { name: "Exempelobjekt 001", status: "Aktiv", owner: "Team A", updated: "2m" },
  { name: "Exempelobjekt 002", status: "Pausad", owner: "Team B", updated: "8m" },
  { name: "Exempelobjekt 003", status: "Info", owner: "Team C", updated: "11m" },
  { name: "Exempelobjekt 004", status: "Utkast", owner: "Team A", updated: "22m" },
  { name: "Exempelobjekt 005", status: "Fel", owner: "Team D", updated: "30m" },
  {
    name: "Exempelobjekt 006",
    status: "Aktiv",
    owner: "Team B",
    updated: "37m",
    isSelected: true,
  },
  { name: "Exempelobjekt 007", status: "Utkast", owner: "Team C", updated: "45m" },
  { name: "Exempelobjekt 008", status: "Aktiv", owner: "Team A", updated: "1h" },
];

export function DesignsystemViewTabs({ activeView }: { activeView: DesignsystemViewId }) {
  return (
    <nav className={styles.viewTabs} aria-label="Designsystem-vyer">
      {designsystemViewLinks.map((entry) => (
        <Link
          key={entry.id}
          to={entry.to}
          className={`${styles.viewTab} ${activeView === entry.id ? styles.viewTabActive : ""}`}
        >
          {entry.label}
        </Link>
      ))}
    </nav>
  );
}

export function useDesignsystemState() {
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
  const neutralScale = isDarkTheme ? neutralScaleDark : neutralScaleLight;
  const statusScale: ReadonlyArray<ScaleStep> = [
    { step: "success", value: "#47FF9A" },
    { step: "warning", value: "#F3F316" },
    { step: "danger", value: "#E11D48" },
    { step: "info", value: skin.infoColor },
  ];
  const selectedPresetAccent = fiweAccents.find((entry) => entry.value === customPrimary)?.token;

  const skinVariables = useMemo(
    () =>
      ({
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
      }) as CSSProperties,
    [
      activePrimary,
      productPrimarySoft,
      productPrimaryStrong,
      skin.infoColor,
      statusDangerSoft,
      statusInfoSoft,
      statusNeutralSoft,
      statusSuccessSoft,
      statusWarningSoft,
      textOnAccent,
      themeTokens.bgApp,
      themeTokens.bgInverse,
      themeTokens.bgMuted,
      themeTokens.bgSubtle,
      themeTokens.borderDefault,
      themeTokens.borderStrong,
      themeTokens.textMuted,
      themeTokens.textOnInverse,
      themeTokens.textPrimary,
      themeTokens.textSecondary,
    ],
  );

  return {
    activeSkin,
    setActiveSkin,
    canvasTheme,
    setCanvasTheme,
    primaryMode,
    setPrimaryMode,
    customPrimary,
    setCustomPrimary,
    customPrimaryInput,
    setCustomPrimaryInput,
    skin,
    activePrimary,
    primaryScale,
    neutralScale,
    statusScale,
    selectedPresetAccent,
    skinVariables,
  };
}

export function statusClassForRow(status: TableStatus, css: Record<string, string>): string {
  if (status === "Aktiv") return css.badgeSuccess;
  if (status === "Utkast") return css.badgeWarning;
  if (status === "Fel") return css.badgeDanger;
  if (status === "Info") return css.badgeInfo;
  return css.badgeNeutral;
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
