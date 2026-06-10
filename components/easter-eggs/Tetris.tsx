"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { submitScore, type ScoreEntry } from "@/lib/scores";

const COLS = 10;
const ROWS = 20;
const CELL = 28;

const TETROMINOES = {
  I: { shape: [[1,1,1,1]], color: "#00D4FF" },
  O: { shape: [[1,1],[1,1]], color: "#FFD700" },
  T: { shape: [[0,1,0],[1,1,1]], color: "#9B59B6" },
  S: { shape: [[0,1,1],[1,1,0]], color: "#00FF41" },
  Z: { shape: [[1,1,0],[0,1,1]], color: "#C41E3A" },
  J: { shape: [[1,0,0],[1,1,1]], color: "#00D4FF" },
  L: { shape: [[0,0,1],[1,1,1]], color: "#E8274B" },
} as const;

type TetrominoKey = keyof typeof TETROMINOES;
const KEYS = Object.keys(TETROMINOES) as TetrominoKey[];

function randomTetromino(): TetrominoKey {
  return KEYS[Math.floor(Math.random() * KEYS.length)];
}

function rotate(shape: number[][]): number[][] {
  return shape[0].map((_, i) => shape.map((row) => row[i]).reverse());
}

function createBoard(): (string | 0)[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

interface Piece {
  key: TetrominoKey;
  shape: number[][];
  x: number;
  y: number;
  color: string;
}

function newPiece(key: TetrominoKey): Piece {
  const t = TETROMINOES[key];
  return {
    key,
    shape: t.shape.map((row) => [...row]),
    x: Math.floor((COLS - t.shape[0].length) / 2),
    y: 0,
    color: t.color,
  };
}

function isValid(board: (string | 0)[][], shape: number[][], x: number, y: number): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nr = y + r;
      const nc = x + c;
      if (nr >= ROWS || nc < 0 || nc >= COLS) return false;
      if (nr >= 0 && board[nr][nc]) return false;
    }
  }
  return true;
}

function merge(board: (string | 0)[][], piece: Piece): (string | 0)[][] {
  const b = board.map((row) => [...row]);
  piece.shape.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell) b[piece.y + r][piece.x + c] = piece.color;
    });
  });
  return b;
}

function clearLines(board: (string | 0)[][]): { board: (string | 0)[][]; cleared: number } {
  const newBoard = board.filter((row) => row.some((cell) => !cell));
  const cleared = ROWS - newBoard.length;
  const empty = Array.from({ length: cleared }, () => Array<string | 0>(COLS).fill(0));
  return { board: [...empty, ...newBoard], cleared };
}

interface TetrisProps {
  onClose: () => void;
}

export function Tetris({ onClose }: TetrisProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardRef = useRef(createBoard());
  const pieceRef = useRef<Piece>(newPiece(randomTetromino()));
  const nextRef = useRef<TetrominoKey>(randomTetromino());
  const scoreRef = useRef(0);
  const linesRef = useRef(0);
  const levelRef = useRef(1);
  const gameOverRef = useRef(false);
  const pausedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [displayScore, setDisplayScore] = useState(0);
  const [displayLines, setDisplayLines] = useState(0);
  const [displayLevel, setDisplayLevel] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [namePhase, setNamePhase] = useState(false);
  const [savedPhase, setSavedPhase] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
  const [savingScore, setSavingScore] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#0D0D0D";
    ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);

    // Grid
    ctx.strokeStyle = "#1A1A1A";
    ctx.lineWidth = 0.5;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        ctx.strokeRect(c * CELL, r * CELL, CELL, CELL);
      }
    }

    // Board cells
    boardRef.current.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell) {
          ctx.fillStyle = cell as string;
          ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2);
          ctx.fillStyle = "rgba(255,255,255,0.15)";
          ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, 4);
        }
      });
    });

    // Current piece
    const p = pieceRef.current;
    p.shape.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell) {
          const px = (p.x + c) * CELL;
          const py = (p.y + r) * CELL;
          ctx.fillStyle = p.color;
          ctx.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
          ctx.fillStyle = "rgba(255,255,255,0.2)";
          ctx.fillRect(px + 1, py + 1, CELL - 2, 4);
        }
      });
    });

    // Ghost piece
    let ghostY = p.y;
    while (isValid(boardRef.current, p.shape, p.x, ghostY + 1)) ghostY++;
    if (ghostY !== p.y) {
      ctx.globalAlpha = 0.2;
      p.shape.forEach((row, r) => {
        row.forEach((cell, c) => {
          if (cell) {
            ctx.fillStyle = p.color;
            ctx.fillRect((p.x + c) * CELL + 1, (ghostY + r) * CELL + 1, CELL - 2, CELL - 2);
          }
        });
      });
      ctx.globalAlpha = 1;
    }
  }, []);

  const drop = useCallback(() => {
    if (gameOverRef.current || pausedRef.current) return;
    const p = pieceRef.current;
    if (isValid(boardRef.current, p.shape, p.x, p.y + 1)) {
      pieceRef.current = { ...p, y: p.y + 1 };
    } else {
      boardRef.current = merge(boardRef.current, p);
      const { board, cleared } = clearLines(boardRef.current);
      boardRef.current = board;
      linesRef.current += cleared;
      scoreRef.current += [0, 40, 100, 300, 1200][cleared] * levelRef.current;
      levelRef.current = Math.floor(linesRef.current / 10) + 1;
      setDisplayScore(scoreRef.current);
      setDisplayLines(linesRef.current);
      setDisplayLevel(levelRef.current);

      const next = nextRef.current;
      nextRef.current = randomTetromino();
      const np = newPiece(next);
      if (!isValid(boardRef.current, np.shape, np.x, np.y)) {
        gameOverRef.current = true;
        setIsGameOver(true);
        return;
      }
      pieceRef.current = np;
    }
    draw();
    const speed = Math.max(100, 800 - (levelRef.current - 1) * 70);
    timerRef.current = setTimeout(drop, speed);
  }, [draw]);

  const restart = useCallback(() => {
    boardRef.current = createBoard();
    pieceRef.current = newPiece(randomTetromino());
    nextRef.current = randomTetromino();
    scoreRef.current = 0;
    linesRef.current = 0;
    levelRef.current = 1;
    gameOverRef.current = false;
    pausedRef.current = false;
    setIsGameOver(false);
    setNamePhase(false);
    setSavedPhase(false);
    setLeaderboard([]);
    setPlayerName("");
    setDisplayScore(0);
    setDisplayLines(0);
    setDisplayLevel(1);
    if (timerRef.current) clearTimeout(timerRef.current);
    draw();
    timerRef.current = setTimeout(drop, 800);
    try { audioRef.current?.play().catch(() => {}); } catch {}
  }, [draw, drop]);

  useEffect(() => {
    // Start audio
    try {
      audioRef.current = new Audio("/song/tetris.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(() => {});
    } catch {}

    draw();
    timerRef.current = setTimeout(drop, 800);

    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT") return;

      if (gameOverRef.current) {
        if (e.key === " ") {
          e.preventDefault();
          if (!namePhase) restart();
          return;
        }
        if ((e.key === "s" || e.key === "S") && !namePhase && !savedPhase) {
          e.preventDefault();
          setNamePhase(true);
          return;
        }
        if (e.key === "Escape") {
          onClose();
        }
        return;
      }
      const p = pieceRef.current;
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          if (isValid(boardRef.current, p.shape, p.x - 1, p.y))
            pieceRef.current = { ...p, x: p.x - 1 };
          break;
        case "ArrowRight":
          e.preventDefault();
          if (isValid(boardRef.current, p.shape, p.x + 1, p.y))
            pieceRef.current = { ...p, x: p.x + 1 };
          break;
        case "ArrowDown":
          e.preventDefault();
          if (isValid(boardRef.current, p.shape, p.x, p.y + 1))
            pieceRef.current = { ...p, y: p.y + 1 };
          break;
        case "ArrowUp":
        case "x":
        case "X": {
          e.preventDefault();
          const rotated = rotate(p.shape);
          if (isValid(boardRef.current, rotated, p.x, p.y))
            pieceRef.current = { ...p, shape: rotated };
          break;
        }
        case " ":
          e.preventDefault();
          // Hard drop
          let dy = p.y;
          while (isValid(boardRef.current, p.shape, p.x, dy + 1)) dy++;
          pieceRef.current = { ...p, y: dy };
          break;
        case "p":
        case "P":
          pausedRef.current = !pausedRef.current;
          if (!pausedRef.current) {
            const resumeSpeed = Math.max(100, 800 - (levelRef.current - 1) * 70);
            timerRef.current = setTimeout(drop, resumeSpeed);
          }
          break;
        case "Escape":
          onClose();
          break;
      }
      draw();
    };

    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      if (timerRef.current) clearTimeout(timerRef.current);
      audioRef.current?.pause();
    };
  }, [draw, drop, onClose, namePhase, savedPhase, restart]);

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = playerName.trim() || "ANON";
    setSavingScore(true);
    try {
      const board = await submitScore("tetris", name, displayScore);
      setLeaderboard(board);
    } catch {
      setLeaderboard([]);
    } finally {
      setSavingScore(false);
      setNamePhase(false);
      setSavedPhase(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9995] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.9)" }}
    >
      <div className="flex gap-6 items-start">
        {/* Game canvas */}
        <div className="relative" style={{ border: "2px solid #C41E3A", boxShadow: "4px 4px 0 #C41E3A" }}>
          <canvas
            ref={canvasRef}
            width={COLS * CELL}
            height={ROWS * CELL}
          />
          {/* Game Over,SPACE relance direct */}
          {isGameOver && !namePhase && !savedPhase && (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.88)" }}>
              <p className="game-over font-pixel mb-2" style={{ fontSize: "16px" }}>GAME OVER</p>
              <p className="font-pixel text-yellow mb-4" style={{ fontSize: "10px" }}>SCORE: {displayScore}</p>
              <p className="font-pixel text-green mb-5 animate-blink" style={{ fontSize: "8px" }}>SPACE ↺ REPLAY</p>
              <button type="button" onClick={() => setNamePhase(true)} className="btn-pixel btn-pixel-cyan" style={{ fontSize: "8px" }}>
                ✎ SAVE SCORE (S)
              </button>
            </div>
          )}

          {/* Save score (optionnel) */}
          {namePhase && (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.88)" }}>
              <p className="game-over font-pixel mb-2" style={{ fontSize: "16px" }}>GAME OVER</p>
              <p className="font-pixel text-yellow mb-5" style={{ fontSize: "10px" }}>SCORE: {displayScore}</p>
              <form onSubmit={handleNameSubmit} className="flex flex-col items-center gap-3 w-full">
                <label className="font-pixel text-cyan" style={{ fontSize: "8px" }}>ENTER YOUR NAME:</label>
                <input
                  autoFocus
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  maxLength={12}
                  className="bg-bg border-2 border-cyan font-pixel text-text w-full px-3 py-2 text-center"
                  style={{ fontSize: "11px" }}
                  placeholder="PLAYER"
                />
                <div className="flex gap-3">
                  <button type="submit" className="btn-pixel" style={{ fontSize: "8px" }} disabled={savingScore}>
                    {savingScore ? "..." : "✓ SAVE"}
                  </button>
                  <button type="button" onClick={() => setNamePhase(false)} className="btn-pixel btn-pixel-cyan" style={{ fontSize: "8px" }}>
                    ↺ SKIP
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Leaderboard after save */}
          {savedPhase && (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.88)" }}>
              <p className="font-pixel text-cyan mb-3" style={{ fontSize: "9px" }}>═ TETRIS LEADERBOARD ═</p>
              <div className="w-full mb-5">
                {leaderboard.map((s, i) => (
                  <div key={i} className="flex justify-between font-mono text-sm mb-1">
                    <span style={{ color: i === 0 ? "#FFD700" : "#E8E8E8" }}>{i + 1}. {s.name}</span>
                    <span style={{ color: i === 0 ? "#FFD700" : "#888" }}>{s.score}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={restart} className="btn-pixel" style={{ fontSize: "8px" }}>↺ RETRY</button>
                <button onClick={onClose} className="btn-pixel btn-pixel-cyan" style={{ fontSize: "8px" }}>✕ QUIT</button>
              </div>
              <p className="font-pixel text-green mt-4 animate-blink" style={{ fontSize: "7px" }}>SPACE ↺ REPLAY</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ width: "140px" }}>
          <div className="pixel-card mb-4">
            <p className="font-pixel text-muted mb-2" style={{ fontSize: "7px" }}>SCORE</p>
            <p className="font-pixel text-yellow" style={{ fontSize: "11px" }}>{displayScore}</p>
          </div>
          <div className="pixel-card mb-4">
            <p className="font-pixel text-muted mb-1" style={{ fontSize: "7px" }}>LINES</p>
            <p className="font-pixel text-cyan" style={{ fontSize: "11px" }}>{displayLines}</p>
          </div>
          <div className="pixel-card mb-6">
            <p className="font-pixel text-muted mb-1" style={{ fontSize: "7px" }}>LEVEL</p>
            <p className="font-pixel text-ruby" style={{ fontSize: "11px" }}>{displayLevel}</p>
          </div>

          <div className="pixel-card mb-4" style={{ borderColor: "#888" }}>
            <p className="font-pixel text-muted mb-2" style={{ fontSize: "6px" }}>CONTROLS</p>
            <p className="font-mono text-muted text-sm">← → move</p>
            <p className="font-mono text-muted text-sm">↑ rotate</p>
            <p className="font-mono text-muted text-sm">↓ soft drop</p>
            <p className="font-mono text-muted text-sm">SPACE hard drop</p>
            <p className="font-mono text-muted text-sm">SPACE ↺ replay (GO)</p>
            <p className="font-mono text-muted text-sm">S save score (GO)</p>
            <p className="font-mono text-muted text-sm">P pause</p>
            <p className="font-mono text-muted text-sm">ESC quit</p>
          </div>

          <button
            onClick={onClose}
            className="btn-pixel w-full"
            style={{ fontSize: "8px" }}
          >
            ✕ QUIT
          </button>
        </div>
      </div>
    </div>
  );
}
