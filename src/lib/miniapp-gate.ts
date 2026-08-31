export const MINIAPP_GATE_COOKIE_NAME = "verkstan_miniapp_gate";
export const MINIAPP_GATE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
export const MINIAPP_GATE_SCOPE = "verkstan-miniapp-gate.v1";

export const miniappGateDenialReasons = [
  "not-configured",
  "missing-cookie",
  "invalid-cookie",
] as const;

export type MiniappGateDenialReason = (typeof miniappGateDenialReasons)[number];

export type MiniappGateAccess =
  | {
      allowed: true;
    }
  | {
      allowed: false;
      reason: MiniappGateDenialReason;
    };

export const miniappGateUnlockFailureReasons = [
  "not-configured",
  "wrong-password",
] as const;

export type MiniappGateUnlockFailureReason = (typeof miniappGateUnlockFailureReasons)[number];

export type MiniappGateUnlockResult =
  | {
      ok: true;
      redirectTo: string;
    }
  | {
      ok: false;
      reason: MiniappGateUnlockFailureReason;
    };

function normalizePath(pathname: string): string {
  if (pathname === "/") {
    return pathname;
  }
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

export function sanitizeGateTargetPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/")) {
    return "/";
  }
  return normalizePath(value);
}

export function isMiniappGateDenialReason(value: string | undefined): value is MiniappGateDenialReason {
  return miniappGateDenialReasons.some((reason) => reason === value);
}
