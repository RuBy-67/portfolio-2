"use client";

import { useState, Suspense } from "react";
import { ConsoleMessage } from "./ConsoleMessage";
import { HiddenTerminal } from "./HiddenTerminal";
import { EasterEggCounter } from "./EasterEggCounter";
import { Tetris } from "./Tetris";
import { FlappyGame } from "./FlappyGame";

export function EasterEggProvider() {
  const [tetrisOpen, setTetrisOpen] = useState(false);
  const [flappyOpen, setFlappyOpen] = useState(false);

  return (
    <>
      <ConsoleMessage />
      <EasterEggCounter />
      <HiddenTerminal
        onOpenTetris={() => { setFlappyOpen(false); setTetrisOpen(true); }}
        onOpenFlappy={() => { setTetrisOpen(false); setFlappyOpen(true); }}
      />

      <Suspense fallback={null}>
        {tetrisOpen && (
          <Tetris onClose={() => setTetrisOpen(false)} />
        )}
        {flappyOpen && (
          <FlappyGame onClose={() => setFlappyOpen(false)} />
        )}
      </Suspense>
    </>
  );
}
