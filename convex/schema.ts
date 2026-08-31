import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  hello_notes: defineTable({
    ownerToken: v.string(),
    text: v.string(),
    createdAt: v.number(),
  }).index("by_owner_and_createdAt", ["ownerToken", "createdAt"]),
});
