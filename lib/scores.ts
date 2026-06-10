export interface ScoreEntry {
  name: string;
  score: number;
  date: string;
}

export type GameId = "tetris" | "flappy";

export async function fetchTopScores(
  game: GameId,
  limit = 10
): Promise<ScoreEntry[]> {
  try {
    const res = await fetch(`/api/scores/${game}?limit=${limit}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function submitScore(
  game: GameId,
  name: string,
  score: number
): Promise<ScoreEntry[]> {
  const res = await fetch(`/api/scores/${game}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, score }),
  });

  if (!res.ok) {
    throw new Error("Score save failed");
  }

  const data = (await res.json()) as { leaderboard?: ScoreEntry[] };
  return data.leaderboard ?? [];
}

export function formatLeaderboardLines(
  tetris: ScoreEntry[],
  flappy: ScoreEntry[]
): { type: "output" | "success" | "error"; text: string }[] {
  return [
    { type: "success", text: "═══ TETRIS LEADERBOARD (global) ═══" },
    ...(tetris.length === 0
      ? [{ type: "output" as const, text: "  No scores yet." }]
      : tetris.map((s, i) => ({
          type: "output" as const,
          text: `  ${i + 1}. ${s.name.padEnd(12)} ${String(s.score).padStart(8)} pts`,
        }))),
    { type: "success", text: "" },
    { type: "success", text: "═══ FLAPPY LEADERBOARD (global) ═══" },
    ...(flappy.length === 0
      ? [{ type: "output" as const, text: "  No scores yet." }]
      : flappy.map((s, i) => ({
          type: "output" as const,
          text: `  ${i + 1}. ${s.name.padEnd(12)} ${String(s.score).padStart(8)} pts`,
        }))),
  ];
}
