import { query } from "./_generated/server";
import { v } from "convex/values";

export const valv_getIntro = query({
  args: {},
  returns: v.object({
    title: v.string(),
    body: v.string(),
  }),
  handler: async () => {
    return {
      title: "Valv",
      body: "Den här miniappen är låst bakom ett delat lösenord.",
    };
  },
});
