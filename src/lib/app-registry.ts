export type MiniappDefinition = {
  slug: string;
  name: string;
  summary: string;
  route: `/apps/${string}`;
};

export const appRegistry: ReadonlyArray<MiniappDefinition> = [
  {
    slug: "hello",
    name: "Hello",
    summary: "Bevisapp som sparar anteckningar med Convex.",
    route: "/apps/hello",
  },
];
