"use client";

import { useEffect } from "react";
import { markEggFound, EGG_IDS } from "@/lib/easterEggs";

const ASCII_RUBY = `
██████╗ ██╗   ██╗██████╗ ██╗   ██╗
██╔══██╗██║   ██║██╔══██╗╚██╗ ██╔╝
██████╔╝██║   ██║██████╔╝ ╚████╔╝ 
██╔══██╗██║   ██║██╔══██╗  ╚██╔╝  
██║  ██║╚██████╔╝██████╔╝   ██║   
╚═╝  ╚═╝ ╚═════╝ ╚═════╝    ╚═╝   
`;

export function ConsoleMessage() {
  useEffect(() => {
    console.log(
      "%c" + ASCII_RUBY,
      "color: #C41E3A; font-size: 10px; font-family: monospace; text-shadow: 0 0 10px #C41E3A;"
    );
    console.log(
      "%c// Connection established. Ready for command.",
      "color: #00FF41; font-size: 14px; font-family: monospace; font-weight: bold;"
    );
    console.log(
      "%crb-rubydev.fr",
      "color: #00D4FF; font-size: 12px; font-family: monospace;"
    );
    console.log(
      "%c// Hint: there's more to explore on this page. Look around.",
      "color: #FFD700; font-size: 11px; font-family: monospace;"
    );
    console.log(
      "%c// RA 05h 34m 32s,Dec +22° 00' 52\",M1, Nébuleuse du Crabe",
      "color: #1a1a1a; font-size: 10px; font-family: monospace;"
    );
    markEggFound(EGG_IDS.CONSOLE_F12);
  }, []);

  return null;
}
