import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import {
  MINIAPP_GATE_COOKIE_MAX_AGE_SECONDS,
  MINIAPP_GATE_COOKIE_NAME,
  type MiniappGateAccess,
  type MiniappGateUnlockResult,
  sanitizeGateTargetPath,
} from "./miniapp-gate";
import { createMiniappGateCookieValue, evaluateMiniappGate, unlockMiniappGate } from "./miniapp-gate.server";

type GatePathInput = {
  pathname: string;
};

function validateGatePathInput(data: unknown): GatePathInput {
  if (!data || typeof data !== "object" || !("pathname" in data) || typeof data.pathname !== "string") {
    throw new Error("Ogiltig begäran");
  }

  return { pathname: sanitizeGateTargetPath(data.pathname) };
}

type UnlockGateInput = {
  pathname: string;
  password: string;
};

function validateUnlockGateInput(data: unknown): UnlockGateInput {
  if (!data || typeof data !== "object") {
    throw new Error("Ogiltig begäran");
  }

  const pathnameValue = "pathname" in data ? data.pathname : undefined;
  const passwordValue = "password" in data ? data.password : undefined;

  if (typeof pathnameValue !== "string" || typeof passwordValue !== "string") {
    throw new Error("Ogiltig begäran");
  }

  return {
    pathname: sanitizeGateTargetPath(pathnameValue),
    password: passwordValue,
  };
}

export const checkMiniappGateAccess = createServerFn({ method: "GET" })
  .validator(validateGatePathInput)
  .handler(({ data }): MiniappGateAccess => {
    const gateCookie = getCookie(MINIAPP_GATE_COOKIE_NAME);
    return evaluateMiniappGate(data.pathname, gateCookie);
  });

export const submitMiniappGatePassword = createServerFn({ method: "POST" })
  .validator(validateUnlockGateInput)
  .handler(({ data }): MiniappGateUnlockResult => {
    const result = unlockMiniappGate(data.pathname, data.password);
    if (!result.ok) {
      return result;
    }

    const gateCookieValue = createMiniappGateCookieValue();
    if (!gateCookieValue) {
      return { ok: false, reason: "not-configured" };
    }

    setCookie(MINIAPP_GATE_COOKIE_NAME, gateCookieValue, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: MINIAPP_GATE_COOKIE_MAX_AGE_SECONDS,
    });

    return result;
  });
