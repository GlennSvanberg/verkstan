export type MiniappDefinition = {
  slug: string;
  name: string;
  summary: string;
  route: `/apps/${string}`;
  isLocked?: boolean;
};

export const appRegistry: ReadonlyArray<MiniappDefinition> = [
  {
    slug: "hello",
    name: "Hello",
    summary: "Bevisapp som sparar anteckningar med Convex.",
    route: "/apps/hello",
  },
  {
    slug: "pimvaggen",
    name: "PIM-väggen",
    summary: "Mockad morgonvägg i Syntux-stil för PIM-insyn och dashboardflöde.",
    route: "/apps/pimvaggen",
  },
  {
    slug: "designsystem",
    name: "Designsystem",
    summary: "Fiwe product UI — tokens, komponenter och theme switcher.",
    route: "/apps/designsystem",
    isLocked: false,
  },
  {
    slug: "valv",
    name: "Valv",
    summary: "Låst demo-miniapp för små hemligheter.",
    route: "/apps/valv",
    isLocked: true,
  },
];

function normalizePath(pathname: string): string {
  if (pathname === "/") {
    return pathname;
  }
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

export function findMiniappByPath(pathname: string): MiniappDefinition | undefined {
  const normalizedPath = normalizePath(pathname);
  return appRegistry.find((miniapp) => {
    const normalizedRoute = normalizePath(miniapp.route);
    return normalizedPath === normalizedRoute || normalizedPath.startsWith(`${normalizedRoute}/`);
  });
}
