import { v } from "convex/values";
import { query } from "./_generated/server";

export const designsystem_getDefaults = query({
  args: {},
  returns: v.object({
    defaultSkin: v.union(v.literal("inteller"), v.literal("onboarder"), v.literal("shortcut")),
    defaultTheme: v.union(v.literal("light"), v.literal("dark")),
    note: v.string(),
  }),
  handler: async () => {
    return {
      defaultSkin: "shortcut",
      defaultTheme: "light",
      note: "Designsystem-demo sparar val lokalt i webbläsaren.",
    };
  },
});
