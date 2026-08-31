import { ConvexReactClient } from "convex/react";

const convexUrl = import.meta.env.VITE_CONVEX_URL;

export const convexConfigured = Boolean(convexUrl);

// Keep the shell renderable even before local Convex wiring is complete.
export const convexClient = new ConvexReactClient(
  convexUrl ?? "https://placeholder.convex.cloud",
);
