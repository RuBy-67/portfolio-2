"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { submitScore, type ScoreEntry } from "@/lib/scores";
import { markEggFound, EGG_IDS } from "@/lib/easterEggs";

const W = 400;
const H = 500;
const GRAVITY = 0.18;
const JUMP = -6;
const PIPE_WIDTH = 48;
const PIPE_GAP_BASE = 190;   // gap initial (score 0)
const PIPE_GAP_MIN  = 148;   // gap plancher (score 100)
const PIPE_GAP_VAR  = 70;    // amplitude aléatoire (±35)
const PIPE_SPEED_BASE     = 1.85;
const PIPE_INTERVAL_BASE  = 2400; // ms entre deux tuyaux (score 0)
const PIPE_INTERVAL_MIN   = 1600;
const BIRD_HIT = 7;
const WIN_SCORE = 100;

interface Pipe {
  x: number;
  topH: number;
  gap: number;
  lvl: number;
  passed: boolean;
}

const PIPE_COLORS = [
  { body: "#1a3a1a", accent: "#00FF41" }, // lvl 1 — vert
  { body: "#2a2a00", accent: "#FFD700" }, // lvl 2 — jaune
  { body: "#2a1400", accent: "#FF8C00" }, // lvl 3 — orange
  { body: "#2a0000", accent: "#C41E3A" }, // lvl 4 — rouge
];

interface GameState {
  birdY: number;
  birdVy: number;
  pipes: Pipe[];
  score: number;
  frame: number;
  phase: "waiting" | "playing" | "dead" | "win";
  lastPipe: number;
}

function initState(): GameState {
  return {
    birdY: H / 2,
    birdVy: 0,
    pipes: [],
    score: 0,
    frame: 0,
    phase: "waiting",
    lastPipe: 0,
  };
}

interface FlappyGameProps {
  onClose: () => void;
}

export function FlappyGame({ onClose }: FlappyGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(initState());
  const rafRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [displayScore, setDisplayScore] = useState(0);
  const [phase, setPhase] = useState<"waiting" | "playing" | "dead" | "win" | "entry">("waiting");
  const [saveOpen, setSaveOpen] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [finalScore, setFinalScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
  const [savingScore, setSavingScore] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const winSparksRef = useRef<{ x: number; y: number; vx: number; vy: number; color: string; life: number }[]>([]);
  const phaseRef = useRef(phase);
  const saveOpenRef = useRef(saveOpen);
  phaseRef.current = phase;
  saveOpenRef.current = saveOpen;

  const drawBird = useCallback((ctx: CanvasRenderingContext2D, y: number, vy: number) => {
    const x = 80;
    const birdH = 22;
    const birdW = 38;
    const tilt = Math.max(-30, Math.min(30, vy * 3.5));

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((tilt * Math.PI) / 180);

    // Body
    ctx.fillStyle = "#E8E8E8";
    ctx.fillRect(-birdW / 2, -birdH / 2, birdW, birdH);
    // Cockpit
    ctx.fillStyle = "#00D4FF";
    ctx.fillRect(4, -birdH / 2, 10, 8);
    // Wing
    ctx.fillStyle = "#C41E3A";
    ctx.fillRect(-birdW / 2 - 12, -2, 16, 5);
    // Tail fin
    ctx.fillStyle = "#888";
    ctx.fillRect(-birdW / 2 - 6, -birdH / 2 - 4, 8, 6);

    ctx.restore();
  }, []);

  const drawPipe = useCallback((ctx: CanvasRenderingContext2D, pipe: Pipe) => {
    const { x, topH, gap, lvl } = pipe;
    const bottomY = topH + gap;
    const bottomH = H - bottomY;
    const { body, accent } = PIPE_COLORS[Math.min(lvl - 1, PIPE_COLORS.length - 1)];

    ctx.fillStyle = body;
    ctx.fillRect(x, 0, PIPE_WIDTH, topH);
    ctx.fillStyle = accent;
    ctx.fillRect(x - 4, topH - 14, PIPE_WIDTH + 8, 14);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, 0, PIPE_WIDTH, topH);

    ctx.fillStyle = body;
    ctx.fillRect(x, bottomY, PIPE_WIDTH, bottomH);
    ctx.fillStyle = accent;
    ctx.fillRect(x - 4, bottomY, PIPE_WIDTH + 8, 14);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, bottomY, PIPE_WIDTH, bottomH);
  }, []);

  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;
    const now = Date.now();

    if (s.phase === "playing") {
      s.frame++;
      // difficulté croissante selon le score
      const t = Math.min(s.score / WIN_SCORE, 1);
      const dynSpeed    = PIPE_SPEED_BASE + t * 1.35;
      const dynInterval = PIPE_INTERVAL_BASE - t * (PIPE_INTERVAL_BASE - PIPE_INTERVAL_MIN);

      s.birdVy += GRAVITY;
      s.birdY  += s.birdVy;
      // cap vitesse ascensionnelle (saut max)
      if (s.birdVy < JUMP) s.birdVy = JUMP;

      if (now - s.lastPipe > dynInterval) {
        const rawGap = PIPE_GAP_BASE
          + (Math.random() - 0.5) * PIPE_GAP_VAR
          - t * (PIPE_GAP_BASE - PIPE_GAP_MIN);
        const gap = Math.max(PIPE_GAP_MIN, Math.round(rawGap));
        const margin = 70;
        const topH = margin + Math.random() * (H - gap - margin * 2);
        const lvl = Math.min(4, Math.floor(s.score / 25) + 1);
        s.pipes.push({ x: W + 10, topH, gap, lvl, passed: false });
        s.lastPipe = now;
      }

      s.pipes.forEach((p) => { p.x -= dynSpeed; });
      s.pipes = s.pipes.filter((p) => p.x > -PIPE_WIDTH - 10);

      s.pipes.forEach((p) => {
        if (!p.passed && p.x + PIPE_WIDTH < 80) {
          p.passed = true;
          s.score++;
          setDisplayScore(s.score);
        }
      });

      if (s.score >= WIN_SCORE) {
        s.phase = "win";
        setFinalScore(s.score);
        setPhase("win");
        markEggFound(EGG_IDS.FLAPPY_WIN);
        window.dispatchEvent(new Event("rb-egg-found"));
        audioRef.current?.pause();
        winSparksRef.current = Array.from({ length: 60 }, () => ({
          x: W / 2 + (Math.random() - 0.5) * 80,
          y: H / 2 + (Math.random() - 0.5) * 60,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6 - 2,
          color: ["#FFD700", "#00FF41", "#00D4FF", "#C41E3A", "#fff"][Math.floor(Math.random() * 5)],
          life: 1,
        }));
      }

      const birdX = 80;
      const birdHalf = BIRD_HIT;
      if (s.phase !== "win") {
        if (s.birdY - birdHalf < 0 || s.birdY + birdHalf > H) {
          s.phase = "dead";
          setFinalScore(s.score);
          setPhase("dead");
        }
        for (const p of s.pipes) {
          if (birdX + birdHalf > p.x && birdX - birdHalf < p.x + PIPE_WIDTH) {
            if (s.birdY - birdHalf < p.topH || s.birdY + birdHalf > p.topH + p.gap) {
              s.phase = "dead";
              setFinalScore(s.score);
              setPhase("dead");
            }
          }
        }
      }
    }

    if (s.phase === "win") {
      winSparksRef.current.forEach((sp) => {
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vy += 0.12;
        sp.life -= 0.012;
      });
      winSparksRef.current = winSparksRef.current.filter((sp) => sp.life > 0);
    }

    // Draw
    ctx.fillStyle = "#0D0D0D";
    ctx.fillRect(0, 0, W, H);

    // Stars
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    for (let i = 0; i < 20; i++) {
      const sx = (i * 73 + s.frame * 0.08) % W;
      const sy = (i * 47 + i * 13) % (H * 0.7);
      ctx.fillRect(sx, sy, 1, 1);
    }

    // Ground
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, H - 28, W, 28);
    ctx.fillStyle = "#333";
    for (let i = 0; i < W; i += 20) {
      ctx.fillRect(i + (s.frame * PIPE_SPEED_BASE % 20) - 20, H - 28, 10, 4);
    }

    s.pipes.forEach((p) => drawPipe(ctx, p));
    if (s.phase !== "win") drawBird(ctx, s.birdY, s.birdVy);

    const lvl = Math.min(4, Math.floor(s.score / 25) + 1);
    const lvlColor = ["#00FF41", "#FFD700", "#FF8C00", "#C41E3A"][lvl - 1];
    ctx.fillStyle = "#E8E8E8";
    ctx.font = "bold 13px monospace";
    ctx.fillText(`SCORE: ${s.score}`, 12, 24);
    ctx.fillStyle = lvlColor;
    ctx.font = "bold 10px monospace";
    ctx.fillText(`SPD ${lvl}`, W - 58, 24);

    if (s.phase === "win") {
      ctx.fillStyle = "rgba(0,0,0,0.75)";
      ctx.fillRect(0, 0, W, H);
      winSparksRef.current.forEach((sp) => {
        ctx.save();
        ctx.globalAlpha = sp.life;
        ctx.fillStyle = sp.color;
        ctx.fillRect(sp.x, sp.y, 4, 4);
        ctx.restore();
      });
      ctx.textAlign = "center";
      ctx.fillStyle = "#FFD700";
      ctx.font = "bold 20px monospace";
      ctx.fillText("✈  YOU WIN  ✈", W / 2, H / 2 - 60);
      ctx.fillStyle = "#00D4FF";
      ctx.font = "bold 13px monospace";
      ctx.fillText("SCORE: 100,LEGENDARY", W / 2, H / 2 - 30);
      ctx.fillStyle = "#00FF41";
      ctx.font = "11px monospace";
      ctx.fillText("You flew 100 pipes.", W / 2, H / 2);
      ctx.fillStyle = "#E8E8E8";
      ctx.font = "10px monospace";
      ctx.fillText("Not many reach the end.", W / 2, H / 2 + 20);
      ctx.fillStyle = "#888";
      ctx.font = "9px monospace";
      ctx.fillText("Easter egg unlocked: FLAPPY LEGEND 🥚", W / 2, H / 2 + 44);
      ctx.textAlign = "left";
    }

    if (s.phase === "waiting") {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#00D4FF";
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "center";
      ctx.fillText("FLAPPY PLANNEUR", W / 2, H / 2 - 30);
      ctx.fillStyle = "#E8E8E8";
      ctx.font = "11px monospace";
      ctx.fillText("SPACE or tap to start", W / 2, H / 2 + 10);
      ctx.fillStyle = "#888";
      ctx.font = "10px monospace";
      ctx.fillText("Hold SPACE to stay airborne", W / 2, H / 2 + 30);
      ctx.textAlign = "left";
    }

    rafRef.current = requestAnimationFrame(loop);
  }, [drawBird, drawPipe]);

  const restart = useCallback(() => {
    stateRef.current = initState();
    stateRef.current.phase = "playing";
    stateRef.current.lastPipe = Date.now();
    setPhase("playing");
    setSaveOpen(false);
    setDisplayScore(0);
    setLeaderboard([]);
    winSparksRef.current = [];
    try { audioRef.current?.play().catch(() => {}); } catch {}
  }, []);

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (s.phase === "waiting") {
      s.phase = "playing";
      s.lastPipe = Date.now();
      setPhase("playing");
    }
    if (s.phase === "playing") {
      stateRef.current.birdVy = JUMP;
    }
  }, []);

  const handleAction = useCallback(() => {
    const p = phaseRef.current;
    // double-check stateRef : la boucle canvas le passe à "win" avant le re-render React
    if (p === "win" || stateRef.current.phase === "win") return;
    if ((p === "dead" && !saveOpenRef.current) || p === "entry") {
      restart();
      return;
    }
    jump();
  }, [restart, jump]);

  useEffect(() => {
    try {
      audioRef.current = new Audio("/song/flappy.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(() => {});
    } catch {}

    rafRef.current = requestAnimationFrame(loop);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === " " || e.key === "ArrowUp") {
        e.preventDefault();
        handleAction();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      audioRef.current?.pause();
    };
  }, [loop, handleAction, onClose]);

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = playerName.trim() || "ANON";
    setSavingScore(true);
    try {
      const board = await submitScore("flappy", name, finalScore);
      setLeaderboard(board);
      setPhase("entry");
      setSaveOpen(false);
    } catch {
      setLeaderboard([]);
      setPhase("entry");
      setSaveOpen(false);
    } finally {
      setSavingScore(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9995] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.92)" }}
    >
      <div className="flex flex-col items-center gap-4">
        <div style={{ position: "relative" }}>
          <div style={{ border: "2px solid #00D4FF", boxShadow: "4px 4px 0 #00D4FF" }}>
            <canvas
              ref={canvasRef}
              width={W}
              height={H}
              style={{ display: "block", cursor: phase === "win" ? "default" : "pointer" }}
              onClick={handleAction}
            />
          </div>

          {/* Win screen */}
          {phase === "win" && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-end pb-8 pointer-events-auto"
              style={{ background: "transparent" }}
            >
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setPhase("dead");
                    setFinalScore(WIN_SCORE);
                  }}
                  className="btn-pixel"
                  style={{ fontSize: "8px" }}
                >
                  ✎ SAVE SCORE
                </button>
                <button
                  onClick={restart}
                  className="btn-pixel"
                  style={{ fontSize: "8px" }}
                >
                  ↺ PLAY AGAIN
                </button>
                <button onClick={onClose} className="btn-pixel btn-pixel-cyan" style={{ fontSize: "8px" }}>
                  ✕ QUIT
                </button>
              </div>
            </div>
          )}

          {/* Game Over,SPACE relance direct */}
          {phase === "dead" && !saveOpen && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
              style={{ background: "rgba(0,0,0,0.82)" }}
            >
              <p className="font-pixel text-ruby mb-2" style={{ fontSize: "18px", textShadow: "2px 2px 0 #8B0000" }}>
                GAME OVER
              </p>
              <p className="font-pixel text-yellow mb-4" style={{ fontSize: "10px" }}>
                SCORE: {finalScore}
              </p>
              <p className="font-pixel text-green mb-5 animate-blink" style={{ fontSize: "8px" }}>
                TAP / SPACE ↺ REPLAY
              </p>
              <button
                type="button"
                onClick={() => setSaveOpen(true)}
                className="btn-pixel btn-pixel-cyan pointer-events-auto"
                style={{ fontSize: "8px" }}
              >
                ✎ SAVE SCORE
              </button>
            </div>
          )}

          {/* Save score (optionnel) */}
          {phase === "dead" && saveOpen && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ background: "rgba(0,0,0,0.82)" }}
            >
              <p className="font-pixel text-ruby mb-2" style={{ fontSize: "18px", textShadow: "2px 2px 0 #8B0000" }}>
                GAME OVER
              </p>
              <p className="font-pixel text-yellow mb-6" style={{ fontSize: "10px" }}>
                SCORE: {finalScore}
              </p>
              <form onSubmit={handleNameSubmit} className="flex flex-col items-center gap-3 w-64">
                <label className="font-pixel text-cyan" style={{ fontSize: "8px" }}>
                  ENTER YOUR NAME:
                </label>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  maxLength={12}
                  autoFocus
                  className="bg-bg border-2 border-cyan font-pixel text-text w-full px-3 py-2 text-center"
                  style={{ fontSize: "12px" }}
                  placeholder="PLAYER"
                />
                <div className="flex gap-3">
                  <button type="submit" className="btn-pixel" style={{ fontSize: "8px" }} disabled={savingScore}>
                    {savingScore ? "..." : "✓ SAVE"}
                  </button>
                  <button type="button" onClick={() => setSaveOpen(false)} className="btn-pixel btn-pixel-cyan" style={{ fontSize: "8px" }}>
                    ↺ SKIP
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Leaderboard after save */}
          {phase === "entry" && leaderboard.length > 0 && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center px-6 pointer-events-none"
              style={{ background: "rgba(0,0,0,0.88)" }}
            >
              <p className="font-pixel text-cyan mb-4" style={{ fontSize: "10px" }}>
                ═ LEADERBOARD ═
              </p>
              <div className="w-full mb-6">
                {leaderboard.map((s, i) => (
                  <div key={i} className="flex justify-between font-mono text-sm mb-1">
                    <span style={{ color: i === 0 ? "#FFD700" : "#E8E8E8" }}>
                      {i + 1}. {s.name}
                    </span>
                    <span style={{ color: i === 0 ? "#FFD700" : "#888" }}>{s.score}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pointer-events-auto">
                <button onClick={restart} className="btn-pixel" style={{ fontSize: "8px" }}>
                  ↺ RETRY
                </button>
                <button onClick={onClose} className="btn-pixel btn-pixel-cyan" style={{ fontSize: "8px" }}>
                  ✕ QUIT
                </button>
              </div>
              <p className="font-pixel text-green mt-4 animate-blink pointer-events-none" style={{ fontSize: "7px" }}>
                TAP / SPACE ↺ REPLAY
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          <span className="font-pixel text-muted" style={{ fontSize: "8px" }}>
            {phase === "win"
              ? "YOU WIN — use buttons below · ESC quit"
              : "SPACE / TAP · ESC quit · TAP / SPACE ↺ replay"}
          </span>
          {phase !== "dead" && phase !== "entry" && phase !== "win" && (
            <button onClick={onClose} className="btn-pixel btn-pixel-cyan" style={{ fontSize: "8px" }}>
              ✕ QUIT
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
