import { customMutation, customQuery } from "convex-helpers/server/customFunctions";
import type { UserIdentity } from "convex/server";
import { mutation, query } from "../_generated/server";

async function requireIdentity(
  auth: { getUserIdentity: () => Promise<UserIdentity | null> },
): Promise<UserIdentity> {
  const identity = await auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity;
}

export const authedQuery = customQuery(query, {
  args: {},
  input: async (ctx, args) => {
    const identity = await requireIdentity(ctx.auth);
    return { ctx: { ...ctx, identity }, args };
  },
});

export const authedMutation = customMutation(mutation, {
  args: {},
  input: async (ctx, args) => {
    const identity = await requireIdentity(ctx.auth);
    return { ctx: { ...ctx, identity }, args };
  },
});
