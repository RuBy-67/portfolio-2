import { NextRequest, NextResponse } from "next/server";
import {
  addScore,
  getTopScores,
  isValidGame,
  sanitizeName,
  sanitizeScore,
  type GameId,
} from "@/lib/scoresDb";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ game: string }> }
) {
  const { game } = await context.params;

  if (!isValidGame(game)) {
    return NextResponse.json({ error: "Invalid game" }, { status: 400 });
  }

  const scores = getTopScores(game as GameId, 10);
  return NextResponse.json(scores);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ game: string }> }
) {
  const { game } = await context.params;

  if (!isValidGame(game)) {
    return NextResponse.json({ error: "Invalid game" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = body as { name?: string; score?: unknown };
  const name = sanitizeName(payload.name ?? "");
  const score = sanitizeScore(payload.score);

  if (score === null) {
    return NextResponse.json({ error: "Invalid score" }, { status: 400 });
  }

  const leaderboard = addScore(game as GameId, name, score);

  return NextResponse.json({ ok: true, name, score, leaderboard });
}
