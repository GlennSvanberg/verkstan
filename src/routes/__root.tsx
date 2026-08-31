import { HeadContent, Link, Scripts, createRootRoute, redirect } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { ConvexProvider } from "convex/react";
import { findMiniappByPath } from "../lib/app-registry";
import { convexClient } from "../lib/convex-client";
import { checkMiniappGateAccess } from "../lib/miniapp-gate.functions";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    const miniapp = findMiniappByPath(location.pathname);
    if (!miniapp?.isLocked) {
      return;
    }

    const gateResult = await checkMiniappGateAccess({ data: { pathname: location.pathname } });
    if (gateResult.allowed) {
      return;
    }

    throw redirect({
      to: "/las",
      search: {
        till: location.pathname,
        reason: gateResult.reason,
      },
    });
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Verkstan",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="shell-root">
          <header className="shell-header">
            <div className="shell-inner">
              <Link to="/" className="brand-link">
                Verkstan
              </Link>
              <nav className="shell-nav" aria-label="Huvudnavigering">
                <Link to="/" className="shell-nav-link" activeProps={{ className: "shell-nav-link active" }}>
                  Hem
                </Link>
                <Link
                  to="/apps/hello"
                  className="shell-nav-link"
                  activeProps={{ className: "shell-nav-link active" }}
                >
                  Hello
                </Link>
              </nav>
            </div>
          </header>
          <main className="shell-main">
            <ConvexProvider client={convexClient}>{children}</ConvexProvider>
          </main>
        </div>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "TanStack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
