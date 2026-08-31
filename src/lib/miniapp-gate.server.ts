import { createHmac, timingSafeEqual } from "node:crypto";
import { findMiniappByPath } from "./app-registry";
import {
  MINIAPP_GATE_SCOPE,
  type MiniappGateAccess,
  type MiniappGateUnlockResult,
  sanitizeGateTargetPath,
} from "./miniapp-gate";

function readGatePassword(): string | null {
  const configuredPassword = process.env.VERKSTAN_GATE_PASSWORD?.trim();
  if (!configuredPassword) {
    return null;
  }
  return configuredPassword;
}

function createGateToken(password: string): string {
  return createHmac("sha256", password).update(MINIAPP_GATE_SCOPE).digest("hex");
}

function compareInConstantTime(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function isPathLocked(pathname: string): boolean {
  return findMiniappByPath(pathname)?.isLocked === true;
}

export function evaluateMiniappGate(pathname: string, gateCookie: string | undefined): MiniappGateAccess {
  if (!isPathLocked(pathname)) {
    return { allowed: true };
  }

  const password = readGatePassword();
  if (!password) {
    return { allowed: false, reason: "not-configured" };
  }

  if (!gateCookie) {
    return { allowed: false, reason: "missing-cookie" };
  }

  const expectedCookie = createGateToken(password);
  if (!compareInConstantTime(gateCookie, expectedCookie)) {
    return { allowed: false, reason: "invalid-cookie" };
  }

  return { allowed: true };
}

export function unlockMiniappGate(pathname: string, attemptedPassword: string): MiniappGateUnlockResult {
  const targetPath = sanitizeGateTargetPath(pathname);
  const password = readGatePassword();

  if (!isPathLocked(targetPath)) {
    return { ok: true, redirectTo: targetPath };
  }

  if (!password) {
    return { ok: false, reason: "not-configured" };
  }

  if (!compareInConstantTime(attemptedPassword, password)) {
    return { ok: false, reason: "wrong-password" };
  }

  return { ok: true, redirectTo: targetPath };
}

export function createMiniappGateCookieValue(): string | null {
  const password = readGatePassword();
  if (!password) {
    return null;
  }
  return createGateToken(password);
}
