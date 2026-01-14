declare global {
  interface Window {
    __ENV__?: {
      VITE_API_URL?: string;
    };
  }
}

const API_URL =
  window.__ENV__?.VITE_API_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000";

export type Movie = {
  id: number;
  title: string;
  year: number;
  genre: string;
};

export async function getMovies(): Promise<Movie[]> {
  const res = await fetch(`${API_URL}/api/movies`);
  if (!res.ok) throw new Error("Failed to load movies");
  return res.json();
}

export async function createMovie(payload: Omit<Movie, "id">): Promise<Movie> {
  const res = await fetch(`${API_URL}/api/movies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to create movie");
  return res.json();
}

export async function updateMovie(id: number, payload: Omit<Movie, "id">): Promise<Movie> {
  const res = await fetch(`${API_URL}/api/movies/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to update movie");
  return res.json();
}

export async function deleteMovie(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/movies/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete movie");
}
