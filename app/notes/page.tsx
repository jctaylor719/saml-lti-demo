"use client";

import { useEffect, useState } from "react";

type Note = {
  id: number;
  user_email: string | null;
  body: string;
  created_at: string;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [body, setBody] = useState("");
  const [email, setEmail] = useState("");

  async function loadNotes() {
    const res = await fetch("/api/notes");
    const data = await res.json();
    setNotes(data);
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!body) return;
    await fetch("/api/notes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ user_email: email || null, body }),
    });
    setBody("");
    await loadNotes();
  }

  useEffect(() => {
    loadNotes();
  }, []);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-4">PostgreSQL Notes Demo</h1>

      <form
        onSubmit={addNote}
        className="bg-base-100 shadow-md rounded p-4 space-y-3"
      >
        <input
          type="email"
          placeholder="Your email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input input-bordered w-full"
        />
        <textarea
          placeholder="Write a note…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="textarea textarea-bordered w-full"
        />
        <button className="btn btn-primary w-full" type="submit">
          Add Note
        </button>
      </form>

      <div className="space-y-4">
        {notes.map((note) => (
          <div key={note.id} className="bg-base-100 shadow rounded p-4">
            <div className="flex justify-between text-sm opacity-60">
              <span>{note.user_email || "Anonymous"}</span>
              <span>{new Date(note.created_at).toLocaleString()}</span>
            </div>
            <p className="mt-1">{note.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
