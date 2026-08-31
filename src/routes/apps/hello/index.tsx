import { type FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "../../../../convex/_generated/api";
import { convexConfigured } from "../../../lib/convex-client";

export const Route = createFileRoute("/apps/hello/")({
  component: HelloRoute,
});

const HELLO_OWNER_TOKEN_STORAGE_KEY = "verkstan.hello.ownerToken";

function HelloRoute() {
  if (!convexConfigured) {
    return (
      <section className="page-column">
        <div className="card">
          <h1>Hello</h1>
          <p>
            Convex är inte konfigurerat ännu. Skapa en <code>.env.local</code>{" "}
            med <code>VITE_CONVEX_URL</code> och kör{" "}
            <code>CONVEX_OPEN_DEV=true npx convex dev</code>.
          </p>
        </div>
      </section>
    );
  }

  return <HelloNotesApp />;
}

function HelloNotesApp() {
  const [newNote, setNewNote] = useState("");
  const [ownerToken, setOwnerToken] = useState<string | null>(null);

  useEffect(() => {
    const existingToken = window.localStorage.getItem(HELLO_OWNER_TOKEN_STORAGE_KEY);
    if (existingToken) {
      setOwnerToken(existingToken);
      return;
    }

    const generatedToken =
      globalThis.crypto?.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    window.localStorage.setItem(HELLO_OWNER_TOKEN_STORAGE_KEY, generatedToken);
    setOwnerToken(generatedToken);
  }, []);

  const notes = useQuery(
    api.hello.hello_listNotes,
    ownerToken ? { ownerToken } : "skip",
  );
  const addNote = useMutation(api.hello.hello_addNote);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = newNote.trim();
    if (!trimmed) {
      return;
    }

    if (!ownerToken) {
      return;
    }

    await addNote({ ownerToken, text: trimmed });
    setNewNote("");
  }

  return (
    <section className="page-column">
      <div className="card">
        <p className="kicker">Proof miniapp</p>
        <h1>Hello</h1>
        <p>Spara en enkel anteckning i Convex-tabellen hello_notes.</p>
      </div>

      <div className="card">
        <form className="stack" onSubmit={handleSubmit}>
          <label htmlFor="hello-note-input" className="field-label">
            Ny anteckning
          </label>
          <textarea
            id="hello-note-input"
            value={newNote}
            onChange={(event) => setNewNote(event.target.value)}
            rows={3}
            placeholder="Skriv något kort..."
            className="text-input"
          />
          <button type="submit" className="action-link">
            Lägg till
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Senaste anteckningar</h2>
        {!ownerToken || !notes ? (
          <p>Laddar...</p>
        ) : notes.length === 0 ? (
          <p>Inga anteckningar ännu.</p>
        ) : (
          <ul className="note-list">
            {notes.map((note) => (
              <li key={note._id} className="note-list-item">
                <p>{note.text}</p>
                <time dateTime={new Date(note.createdAt).toISOString()}>
                  {new Date(note.createdAt).toLocaleString("sv-SE")}
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
