import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const hello_addNote = mutation({
  args: {
    ownerToken: v.string(),
    text: v.string(),
  },
  returns: v.id("hello_notes"),
  handler: async (ctx, args) => {
    const text = args.text.trim();
    const ownerToken = args.ownerToken.trim();
    if (!text) {
      throw new Error("Anteckningen får inte vara tom");
    }
    if (!ownerToken) {
      throw new Error("Ogiltig ägartoken");
    }

    return await ctx.db.insert("hello_notes", {
      ownerToken,
      text,
      createdAt: Date.now(),
    });
  },
});

export const hello_listNotes = query({
  args: {
    ownerToken: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("hello_notes"),
      _creationTime: v.number(),
      text: v.string(),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const ownerToken = args.ownerToken.trim();
    if (!ownerToken) {
      return [];
    }

    const notes = await ctx.db
      .query("hello_notes")
      .withIndex("by_owner_and_createdAt", (queryBuilder) =>
        queryBuilder.eq("ownerToken", ownerToken),
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
