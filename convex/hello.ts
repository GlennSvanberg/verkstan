import { v } from "convex/values";
import { authedMutation, authedQuery } from "./lib/customFunctions";

export const hello_addNote = authedMutation({
  args: {
    text: v.string(),
  },
  returns: v.id("hello_notes"),
  handler: async (ctx, args) => {
    const text = args.text.trim();
    if (!text) {
      throw new Error("Anteckningen får inte vara tom");
    }

    return await ctx.db.insert("hello_notes", {
      ownerToken: ctx.identity.tokenIdentifier,
      text,
      createdAt: Date.now(),
    });
  },
});

export const hello_listNotes = authedQuery({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("hello_notes"),
      _creationTime: v.number(),
      text: v.string(),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const notes = await ctx.db
      .query("hello_notes")
      .withIndex("by_owner_and_createdAt", (queryBuilder) =>
        queryBuilder.eq("ownerToken", ctx.identity.tokenIdentifier),
      )
      .order("desc")
      .take(50);

    return notes.map((note) => ({
      _id: note._id,
      _creationTime: note._creationTime,
      text: note.text,
      createdAt: note.createdAt,
    }));
  },
});
