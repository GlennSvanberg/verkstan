import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { checkMiniappGateAccess, submitMiniappGatePassword } from "../lib/miniapp-gate.functions";
import {
  isMiniappGateDenialReason,
  sanitizeGateTargetPath,
  type MiniappGateDenialReason,
  type MiniappGateUnlockFailureReason,
} from "../lib/miniapp-gate";

type GateSearch = {
  till?: string;
  reason?: MiniappGateDenialReason;
};

function validateGateSearch(rawSearch: Record<string, unknown>): GateSearch {
  const till = typeof rawSearch.till === "string" ? sanitizeGateTargetPath(rawSearch.till) : undefined;
  const reason = typeof rawSearch.reason === "string" && isMiniappGateDenialReason(rawSearch.reason)
    ? rawSearch.reason
    : undefined;

  return { till, reason };
}

export const Route = createFileRoute("/las")({
  validateSearch: validateGateSearch,
  loaderDeps: ({ search }) => ({ till: search.till, reason: search.reason }),
  loader: async ({ deps }) => {
    if (!deps.till) {
      return {
        targetPath: null,
        reason: deps.reason,
      };
    }

    const gateAccess = await checkMiniappGateAccess({ data: { pathname: deps.till } });
    if (gateAccess.allowed) {
      throw redirect({ to: deps.till });
    }

    return {
      targetPath: deps.till,
      reason: gateAccess.reason,
    };
  },
  component: MiniappGateRoute,
});

function MiniappGateRoute() {
  const { targetPath, reason } = Route.useLoaderData();
  const submitPassword = useServerFn(submitMiniappGatePassword);
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!targetPath || !password.trim()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await submitPassword({ data: { pathname: targetPath, password } });
      if (result.ok) {
        window.location.assign(result.redirectTo);
        return;
      }

      setErrorMessage(getUnlockErrorMessage(result.reason));
    } catch {
      setErrorMessage("Något gick fel. Försök igen.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!targetPath) {
    return (
      <section className="page-column">
        <div className="card">
          <h1>Lås upp miniapp</h1>
          <p>Ingen låst miniapp angavs. Öppna en låst miniapp från startsidan.</p>
          <Link to="/" className="action-link">
            Till startsidan
          </Link>
        </div>
      </section>
    );
  }

  if (reason === "not-configured") {
    return (
      <section className="page-column">
        <div className="card">
          <h1>Lås upp miniapp</h1>
          <p>
            Låset är inte konfigurerat ännu. Sätt <code>VERKSTAN_GATE_PASSWORD</code> i Vercel för att öppna
            låsta miniappar.
          </p>
          <Link to="/" className="action-link">
            Till startsidan
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-column">
      <div className="card">
        <p className="kicker">Skyddad miniapp</p>
        <h1>Lösenord krävs</h1>
        <p>
          Skriv det delade lösenordet för att fortsätta till <code>{targetPath}</code>.
        </p>
      </div>

      <div className="card">
        <form className="stack" onSubmit={handleSubmit}>
          <label htmlFor="gate-password-input" className="field-label">
            Delat lösenord
          </label>
          <input
            id="gate-password-input"
            type="password"
            className="text-input"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {errorMessage ? <p className="gate-error-text">{errorMessage}</p> : null}

          <button type="submit" className="action-link" disabled={isSubmitting}>
            {isSubmitting ? "Kontrollerar..." : "Lås upp"}
          </button>
        </form>
      </div>
    </section>
  );
}

function getUnlockErrorMessage(reason: MiniappGateUnlockFailureReason): string {
  if (reason === "wrong-password") {
    return "Fel lösenord. Försök igen.";
  }
  return "Låset är inte konfigurerat.";
}
