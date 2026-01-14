import React, { useEffect, useMemo, useState } from "react";
import { Movie, getMovies, createMovie, updateMovie, deleteMovie } from "./api";

type FormState = { title: string; year: string; genre: string };

export default function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>({ title: "", year: "", genre: "" });

  const isEditing = useMemo(() => editingId !== null, [editingId]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await getMovies();
      setMovies(data);
    } catch (e: any) {
      setError(e?.message ?? "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm({ title: "", year: "", genre: "" });
  }

  function startEdit(m: Movie) {
    setEditingId(m.id);
    setForm({ title: m.title, year: String(m.year), genre: m.genre });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      title: form.title.trim(),
      year: Number(form.year),
      genre: form.genre.trim()
    };

    if (!payload.title || !payload.genre || Number.isNaN(payload.year)) {
      setError("Vyplň název, rok a žánr.");
      return;
    }

    try {
      if (isEditing && editingId !== null) {
        await updateMovie(editingId, payload);
      } else {
        await createMovie(payload);
      }
      resetForm();
      await refresh();
    } catch (e: any) {
      setError(e?.message ?? "Error");
    }
  }

  async function onDelete(id: number) {
    if (!confirm("Opravdu smazat film?")) return;
    setError(null);
    try {
      await deleteMovie(id);
      await refresh();
    } catch (e: any) {
      setError(e?.message ?? "Error");
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ marginBottom: 8 }}>🎬 Movie Notebook</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        Jednoduchý zápisník filmů (přidat / upravit / smazat).
      </p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8, padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.5fr", gap: 8 }}>
          <input
            placeholder="Název filmu"
            value={form.title}
            onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
          />
          <input
            placeholder="Rok"
            value={form.year}
            onChange={(e) => setForm((s) => ({ ...s, year: e.target.value }))}
          />
          <input
            placeholder="Žánr"
            value={form.genre}
            onChange={(e) => setForm((s) => ({ ...s, genre: e.target.value }))}
          />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit">{isEditing ? "Uložit změny" : "Přidat film"}</button>
          {isEditing && <button type="button" onClick={resetForm}>Zrušit editaci</button>}
        </div>

        {error && <div style={{ color: "crimson" }}>{error}</div>}
      </form>

      <div style={{ marginTop: 16 }}>
        {loading ? (
          <div>Načítám…</div>
        ) : movies.length === 0 ? (
          <div style={{ opacity: 0.7 }}>Zatím tu nejsou žádné filmy.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {movies.map((m) => (
              <div
                key={m.id}
                style={{
                  border: "1px solid #e5e5e5",
                  borderRadius: 10,
                  padding: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{m.title}</div>
                  <div style={{ opacity: 0.75 }}>{m.year} • {m.genre}</div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => startEdit(m)}>Upravit</button>
                  <button onClick={() => onDelete(m.id)}>Smazat</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
