"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { markEggFound, discoverEgg, EGG_IDS } from "@/lib/easterEggs";
import { fetchTopScores, formatLeaderboardLines } from "@/lib/scores";
import {
  HOME,
  buildTree,
  changeDir,
  listDir,
  readFile,
  resolveExecutable,
} from "@/lib/virtualFs";

interface TerminalLine {
  type: "input" | "output" | "error" | "success" | "system" | "progress";
  text: string;
}

const BOOT_DURATION_MS = 7300;
const TERMINAL_BOOT_KEY = "rb-terminal-booted";

const HELP_COL = 22;

function helpRow(left: string, right = "", type: TerminalLine["type"] = "output"): TerminalLine {
  if (!right) return { type, text: `  ${left}` };
  return { type, text: `  ${left.padEnd(HELP_COL)} │ ${right}` };
}

function buildHelpLines(isRoot: boolean): TerminalLine[] {
  const lines: TerminalLine[] = [
    { type: "system", text: "═══ RuBy Terminal,command reference ═══" },
    helpRow("SYSTEM", "FUN / NET"),
    helpRow("help", "neofetch"),
    helpRow("clear", "ping <host>"),
    helpRow("pwd · cd · ls", "history"),
    helpRow("tree · cat · head", "scores"),
    helpRow("whoami · uname", "./bin/tetris.sh"),
    helpRow("date · uptime", "./bin/flappy.sh"),
    helpRow("ps · top · free", "git -h"),
    helpRow("echo · coffee", "npm run build"),
    { type: "output", text: "" },
    { type: "system", text: "  // cat README.md · tree secrets · su -" },
  ];

  if (isRoot) {
    lines.push(
      { type: "output", text: "" },
      { type: "success", text: "═══ ⚡ ROOT ONLY ═══" },
      helpRow("hack · ./bin/hack.sh", "drop database", "error"),
      helpRow("reboot", "shutdown -h now", "error"),
      helpRow("systemctl status", "journalctl -n 5", "error"),
      helpRow("passwd · visudo", "iptables -L", "error")
    );
  }

  return lines;
}

function buildGitHelpLines(): TerminalLine[] {
  return [
    { type: "system", text: "═══ git,usage ═══" },
    helpRow("git status", "working tree state"),
    helpRow("git log", "commit history"),
    helpRow("git log --oneline", "compact log"),
    helpRow("git pull", "fetch + merge (safe-ish)"),
    helpRow("git pull --force", "⚠  don't"),
    helpRow("git push", "send to remote"),
    helpRow("git push --force", "⚠  please no"),
    { type: "output", text: "" },
    { type: "system", text: "  Protip: git push ≠ git pray. Review before merge." },
  ];
}

function formatPromptPath(cwd: string): string {
  if (cwd === HOME) return "~";
  if (cwd.startsWith(HOME + "/")) return "~" + cwd.slice(HOME.length);
  return cwd;
}

function isSecretsFile(filePath: string): boolean {
  return /secrets(?:_root)?\.enc$/i.test(filePath.trim());
}

function astroLinesFromRead(filePath: string, base: TerminalLine[]): TerminalLine[] {
  if (!isSecretsFile(filePath)) return base;
  const isNew = discoverEgg(EGG_IDS.ASTRO_FOUND);
  if (!isNew) return base;
  return [
    ...base,
    { type: "success", text: "🥚 Coordinates decoded — ASTRO egg unlocked." },
  ];
}

function processCommand(
  cmd: string,
  dropDbCount: number,
  isRoot: boolean,
  cwd: string
): {
  lines: TerminalLine[];
  newDropDbCount: number;
  newCwd: string;
  action?: "hack" | "tetris" | "flappy" | "wipe" | "su";
  grantRoot?: boolean;
  revokeRoot?: boolean;
} {
  const normalized = cmd.trim().toLowerCase();
  const raw = cmd.trim();
  let lines: TerminalLine[] = [];
  let newDropDbCount = dropDbCount;
  let newCwd = cwd;
  let action: "hack" | "tetris" | "flappy" | "wipe" | "su" | undefined;
  let grantRoot = false;
  let revokeRoot = false;

  switch (normalized) {
    case "help":
      lines = buildHelpLines(isRoot);
      break;

    case "git -h":
    case "git help":
    case "git --help":
    case "git h":
      lines = buildGitHelpLines();
      break;

    case "git":
      lines = [
        { type: "output", text: "usage: git <command> [<args>]" },
        { type: "system", text: 'Try "git -h" for available commands.' },
      ];
      break;

    case "su -":
      action = "su";
      lines = [
        { type: "system", text: "Switching to root..." },
        { type: "system", text: "Password: ••••••••" },
        { type: "success", text: "root@rb-rubydev:~#,Welcome, superuser." },
        { type: "success", text: 'Type "help" to see classified commands.' },
      ];
      grantRoot = true;
      break;

    case "exit root":
    case "su - exit":
      if (isRoot) {
        lines = [{ type: "system", text: "Dropping root privileges." }];
        revokeRoot = true;
      } else {
        lines = [{ type: "error", text: "You are not root." }];
      }
      break;

    case "pwd":
      lines = [{ type: "output", text: cwd }];
      break;

    case "uname":
    case "uname -a":
      lines = [
        {
          type: "output",
          text: "RuByOS rb-rubydev 2.5.1 #2026 x86_64 GNU/Linux",
        },
      ];
      break;

    case "date":
      lines = [{ type: "output", text: new Date().toString() }];
      break;

    case "uptime":
      lines = [
        {
          type: "output",
          text: `up ${Math.floor(Math.random() * 200 + 10)} days, ${Math.floor(Math.random() * 23)}h ${Math.floor(Math.random() * 59)}m,load: 0.0${Math.floor(Math.random() * 9)} 0.0${Math.floor(Math.random() * 9)} 0.00`,
        },
      ];
      break;

    case "free":
    case "free -h":
      lines = [
        { type: "output", text: "              total    used    free   shared" },
        { type: "output", text: "Mem:           16Gi    4.2Gi   9.8Gi    320Mi" },
        { type: "output", text: "Swap:           4Gi    0Bi      4Gi" },
      ];
      break;

    case "ps":
    case "ps aux": {
      lines = [
        { type: "output", text: "USER       PID  %CPU  %MEM  COMMAND" },
        { type: "success", text: "ruby         1   0.0   0.1  /sbin/init" },
        { type: "success", text: "ruby       142   0.3   2.1  node server.js" },
        { type: "success", text: "ruby       143   0.1   1.8  pm2: rb-rubydev" },
        { type: "success", text: "ruby       210   0.0   0.5  nginx: worker" },
        { type: "output", text: "ruby       512   0.0   0.2  ./agent.py --daemon" },
        { type: "output", text: "ruby       999   0.0   0.1  bash" },
        { type: "system", text: "ruby      1337   4.2  12.1  [autonomous_agent]  ← curious" },
      ];
      break;
    }

    case "top":
      lines = [
        { type: "system", text: "top,RuByOS process monitor" },
        { type: "output", text: "" },
        { type: "output", text: "  PID  USER     %CPU  COMMAND" },
        { type: "error",  text: " 1337  ruby     42.0  autonomous_agent (thinking...)" },
        { type: "success", text: "  143  ruby      3.1  pm2: rb-rubydev" },
        { type: "output", text: "  142  ruby      0.3  node server.js" },
        { type: "output", text: "  210  ruby      0.0  nginx" },
        { type: "output", text: "" },
        { type: "system", text: "q to quit,(there is no q here. just vibes.)" },
      ];
      break;

    case "neofetch":
    case "fastfetch":
      lines = [
        { type: "success", text: "       ██████╗ ██╗   ██╗██████╗ ██╗   ██╗" },
        { type: "success", text: "       ██╔══██╗██║   ██║██╔══██╗╚██╗ ██╔╝" },
        { type: "success", text: "       ██████╔╝██║   ██║██████╔╝ ╚████╔╝ " },
        { type: "success", text: "       ██╔══██╗██║   ██║██╔══██╗  ╚██╔╝  " },
        { type: "error",   text: "       ██║  ██║╚██████╔╝██████╔╝   ██║   " },
        { type: "error",   text: "       ╚═╝  ╚═╝ ╚═════╝ ╚═════╝    ╚═╝   " },
        { type: "output", text: "" },
        { type: "output", text: `  OS:       RuByOS 2.5.1 (Crab Nebula)` },
        { type: "output", text: `  Host:     rb-rubydev.fr` },
        { type: "output", text: `  Kernel:   Next.js 15 + React 19` },
        { type: "output", text: `  Shell:    bash 5.2.21` },
        { type: "output", text: `  Terminal: RuBy Terminal v1.0` },
        { type: "output", text: `  CPU:      curiosity × 8 cores` },
        { type: "output", text: `  Memory:   4.2 GiB / 16 GiB` },
        { type: "system", text: `  Stack:    TS · React · ERP · AI · Aviation` },
      ];
      break;

    case "history":
      lines = [
        { type: "output", text: "  1  ssh root@rb-rubydev.fr" },
        { type: "output", text: "  2  pm2 restart rb-rubydev" },
        { type: "output", text: "  3  git push --force" },
        { type: "error",  text: "  4  drop database" },
        { type: "output", text: "  5  ./hack.sh" },
        { type: "output", text: "  6  cat secrets/secrets.enc" },
        { type: "output", text: "  7  neofetch" },
        { type: "output", text: "  8  history" },
      ];
      break;

    case "alias":
      lines = [
        { type: "output", text: "alias ll='ls -la'" },
        { type: "output", text: "alias gs='git status'" },
        { type: "output", text: "alias gp='git push'" },
        { type: "output", text: "alias ..='cd ..'" },
        { type: "system", text: "alias coffee='echo brewing... ☕'" },
      ];
      break;

    case "coffee":
      lines = [
        { type: "system", text: "Brewing..." },
        { type: "success", text: "☕ Done. Enjoy." },
      ];
      break;

    case "vim":
    case "vi":
    case "nano":
      lines = [
        { type: "error", text: `${normalized}: interactive editor not supported here.` },
        { type: "system", text: "PROTIP: to exit vim, type   :q!   and pray." },
      ];
      break;

    case ":q!":
    case ":q":
    case ":wq":
      lines = [{ type: "success", text: "Vim exited successfully. You survived." }];
      break;

    case "python3":
    case "python":
      lines = [
        { type: "system", text: "Python 3.12.3 (RuByOS build)" },
        { type: "output", text: ">>> (interactive mode not available here)" },
        { type: "output", text: ">>> but have you read ~/agent.py ?" },
      ];
      break;

    case "ssh":
      lines = [
        { type: "error",  text: "ssh: missing destination" },
        { type: "system", text: "Usage: ssh user@host" },
        { type: "output", text: "Try:   ssh ruby@rb-rubydev.fr" },
      ];
      break;

    case "ssh ruby@rb-rubydev.fr":
    case "ssh root@rb-rubydev.fr":
      lines = [
        { type: "system", text: `Connecting to rb-rubydev.fr...` },
        { type: "system", text: `Host key fingerprint: SHA256:7xRuBy/crab-nebula` },
        { type: "success", text: `Welcome back. You're already here.` },
        { type: "output", text: `(this is a terminal inside a portfolio inside a server)` },
      ];
      break;

    case "ping":
      lines = [
        { type: "error", text: "ping: missing destination" },
        { type: "system", text: "Usage: ping <host>" },
      ];
      break;

    case "ping rb-rubydev.fr":
    case "ping localhost":
    case "ping 127.0.0.1": {
      const host = raw.split(" ")[1];
      lines = [
        { type: "system", text: `PING ${host} (127.0.0.1): 56 data bytes` },
        { type: "success", text: `64 bytes from ${host}: icmp_seq=0 ttl=64 time=0.${Math.floor(Math.random()*9+1)} ms` },
        { type: "success", text: `64 bytes from ${host}: icmp_seq=1 ttl=64 time=0.${Math.floor(Math.random()*9+1)} ms` },
        { type: "success", text: `64 bytes from ${host}: icmp_seq=2 ttl=64 time=0.${Math.floor(Math.random()*9+1)} ms` },
        { type: "output",  text: `--- ${host} ping statistics ---` },
        { type: "output",  text: `3 packets transmitted, 3 received, 0% packet loss` },
      ];
      break;
    }

    case "curl ifconfig.me":
    case "curl icanhazip.com":
      lines = [{ type: "output", text: "🤫  nope." }];
      break;

    case "git status":
      lines = [
        { type: "system", text: "On branch main" },
        { type: "success", text: "Your branch is up to date with 'origin/main'." },
        { type: "output", text: "" },
        { type: "output", text: "nothing to commit, working tree clean" },
        { type: "system", text: "(for once)" },
      ];
      break;

    case "git log":
    case "git log --oneline": {
      const short = normalized.includes("oneline");
      lines = short
        ? [
            { type: "success", text: "a1b2c3d fix: production finally works" },
            { type: "output", text: "9f8e7d6 refactor: rename variables to real names" },
            { type: "output", text: "5c4b3a2 feat: add easter eggs nobody asked for" },
            { type: "error",  text: "1a2b3c4 chore: remove console.log (whoops)" },
            { type: "output", text: "deadbee initial commit" },
          ]
        : [
            { type: "success", text: "commit a1b2c3d,fix: production finally works" },
            { type: "output", text: "Author: RuBy <rb@rb-rubydev.fr>   Date: today" },
            { type: "output", text: "" },
            { type: "output", text: "commit 9f8e7d6,refactor: rename variables" },
            { type: "output", text: "Author: RuBy <rb@rb-rubydev.fr>   Date: yesterday" },
          ];
      break;
    }

    case "npm install":
      lines = [
        { type: "system", text: "npm warn deprecated vibes@1.0.0: install coffee instead" },
        { type: "output", text: "added 1337 packages in 4s" },
        { type: "success", text: "✓ up to date" },
      ];
      break;

    case "npm run build":
      lines = [
        { type: "system", text: "> next build" },
        { type: "output", text: "✓ Compiled successfully" },
        { type: "success", text: "Route (app)   / → 4.27 kB" },
        { type: "success", text: "Build complete. Ship it. 🚀" },
      ];
      break;

    case "rm -rf /":
    case "sudo rm -rf /":
    case "sudo rm -rf --no-preserve-root /":
      lines = [
        { type: "error", text: "rm: it is dangerous to operate recursively on '/'." },
        { type: "error", text: "Use --no-preserve-root to override this failsafe." },
        { type: "system", text: "( you already tried that, didn't you. )" },
        { type: "output", text: "Nothing was harmed. The portfolio survives." },
      ];
      break;

    case "whoami":
      lines = [
        { type: "success", text: isRoot ? "root" : "RuBy" },
        { type: "output", text: "Développeur module ERP,Architecte de flux,Agent IA" },
        { type: "output", text: "Location: Strasbourg, FR" },
        { type: "output", text: `Privileges: ${isRoot ? "root ⚡" : "user"}` },
      ];
      break;

    case "ls":
    case "ls -la":
    case "ls -l": {
      const lsTarget = raw.replace(/^ls(?:\s+(?:-la?|-l))?\s*/i, "").trim() || ".";
      const targetPath = lsTarget === "." ? cwd : changeDir(cwd, lsTarget).cwd;
      const entries = listDir(targetPath, isRoot);
      if (entries.length === 0 && lsTarget !== ".") {
        const probe = changeDir(cwd, lsTarget);
        if (probe.error) {
          lines = [{ type: "error", text: probe.error }];
          break;
        }
      }
      lines = [
        { type: "output", text: `${formatPromptPath(targetPath)}:` },
        ...entries.map((f) => {
          const isLocked = f.includes("[LOCKED]");
          const isExec = f.endsWith("*");
          return {
            type: (isLocked ? "error" : isExec ? "success" : "output") as TerminalLine["type"],
            text: `  ${f}`,
          };
        }),
      ];
      break;
    }

    case "hack":
    case "./hack.sh":
      markEggFound(EGG_IDS.HACK_CMD);
      window.dispatchEvent(new Event("rb-egg-found"));
      action = "hack";
      lines = [
        { type: "error", text: "Initiating sequence..." },
        { type: "error", text: "████████████████████ 100%" },
        { type: "error", text: "ACCESS GRANTED,just kidding. 😈" },
        { type: "error", text: "(Reversible. Relax.)" },
      ];
      break;

    case "git pull":
      lines = [
        { type: "system", text: "remote: Enumerating objects... done." },
        { type: "system", text: "Fetching origin/main..." },
        { type: "success", text: "Already up to date." },
        { type: "output", text: "  (Pull en prod c'est déjà suspect. Là, rien de neuf.)" },
      ];
      break;

    case "git pull --force":
      lines = [
        { type: "system", text: "remote: Enumerating objects... done." },
        { type: "system", text: "Forcing override of local changes..." },
        { type: "error", text: "⚠  WARNING: divergent branches detected" },
        { type: "error", text: "Force-fetching origin/main..." },
        { type: "error", text: "Merge conflict in package-lock.json" },
        { type: "output", text: "  Tu as forcé un pull. Même Git ne sait pas pourquoi." },
      ];
      break;

    case "git push":
      lines = [
        { type: "system", text: "Enumerating objects: 42, done." },
        { type: "system", text: "Writing objects: 100% (42/42), 6.9 KiB | 6.9 MiB/s, done." },
        { type: "system", text: "To github.com:rb-rubydev/portfolio.git" },
        { type: "error", text: "   a1b2c3d..deadbeef  main -> main" },
        { type: "error", text: "⚠  CI failed. Deploy pipeline triggered anyway." },
        { type: "success", text: "🎉 Tu viens de push de la merde en prod sans review." },
        { type: "output", text: "   git push ≠ git pray. Vérifie avant le merge." },
        { type: "output", text: "   Bienvenue dans l'équipe on-call. ☕" },
      ];
      break;

    case "git push --force":
    case "git push -f":
    case "git push --force-with-lease":
      markEggFound(EGG_IDS.GIT_FORCE);
      window.dispatchEvent(new Event("rb-egg-found"));
      lines = [
        { type: "system", text: "Enumerating objects: 42, done." },
        { type: "error", text: "⚠  WARNING: force-push to protected branch 'main'" },
        { type: "error", text: "Force pushing origin/main... (+ deadbeef...a1b2c3d)" },
        { type: "error", text: "████████████████████ 100%" },
        { type: "error", text: "🔥 History rewritten. Prod is on fire. Incident #404." },
        { type: "error", text: "   Slack: @channel prod is down who pushed???" },
        { type: "output", text: "   (You really committed to the bit.)" },
      ];
      break;

    case "reboot":
      if (!isRoot) {
        lines = [{ type: "error", text: "reboot: must be superuser. Try: su -" }];
        break;
      }
      lines = [
        { type: "system", text: "Broadcast message from root@rb-rubydev (console):" },
        { type: "system", text: "  The system is going down for reboot NOW!" },
        { type: "error", text: "Stopping rb-rubydev.service..." },
        { type: "error", text: "Stopping nginx.service..." },
        { type: "system", text: "Rebooting..." },
        { type: "success", text: "RuBy OS v2.5.1,back online. (just kidding, still here.)" },
      ];
      break;

    case "shutdown":
    case "shutdown -h now":
    case "shutdown -h":
      if (!isRoot) {
        lines = [{ type: "error", text: "shutdown: must be superuser" }];
        break;
      }
      lines = [
        { type: "system", text: "System shutdown scheduled." },
        { type: "output", text: "  (Nice try. This portfolio runs 24/7.)" },
      ];
      break;

    case "systemctl status rb-rubydev":
    case "systemctl status":
      if (!isRoot) {
        lines = [{ type: "error", text: "Permission denied. Try: su -" }];
        break;
      }
      lines = [
        { type: "success", text: "● rb-rubydev.service,RuBy Portfolio" },
        { type: "output", text: "   Active: active (running) since today" },
        { type: "output", text: "   Main PID: 143 (pm2)" },
        { type: "output", text: "   Memory: 4.2M / 16G" },
        { type: "system", text: "   Agent PID 1337: thinking..." },
      ];
      break;

    case "journalctl -n 5":
    case "journalctl":
      if (!isRoot) {
        lines = [{ type: "error", text: "Permission denied. Try: su -" }];
        break;
      }
      lines = [
        { type: "output", text: "Jun 10 23:01 rb-rubydev[143]: GET / 200" },
        { type: "output", text: "Jun 10 23:02 rb-rubydev[143]: POST /api/scores/tetris 200" },
        { type: "error", text: "Jun 10 23:03 rb-rubydev[143]: user typed 'drop database'" },
        { type: "output", text: "Jun 10 23:04 rb-rubydev[143]: terminal boot sequence OK" },
        { type: "system", text: "Jun 10 23:05 agent[1337]: curiosity spike detected" },
      ];
      break;

    case "passwd":
      if (!isRoot) {
        lines = [{ type: "error", text: "passwd: permission denied" }];
        break;
      }
      lines = [
        { type: "system", text: "Changing password for root." },
        { type: "output", text: "New password: ********" },
        { type: "success", text: "Password unchanged. (Would you really trust a portfolio?)" },
      ];
      break;

    case "visudo":
      if (!isRoot) {
        lines = [{ type: "error", text: "visudo: must be run as root" }];
        break;
      }
      lines = [
        { type: "error", text: "visudo: interactive editor not supported here." },
        { type: "system", text: "  root ALL=(ALL:ALL) NOPASSWD: ALL  ← you wish" },
      ];
      break;

    case "iptables -l":
    case "iptables -L":
      if (!isRoot) {
        lines = [{ type: "error", text: "iptables: permission denied" }];
        break;
      }
      lines = [
        { type: "output", text: "Chain INPUT (policy ACCEPT)" },
        { type: "output", text: "  ACCEPT  tcp  --  anywhere  anywhere  dpt:443" },
        { type: "output", text: "  ACCEPT  tcp  --  anywhere  anywhere  dpt:3001" },
        { type: "system", text: "  DROP    icmp --  curiosity  anywhere  (just kidding)" },
      ];
      break;

    case "drop database":
      newDropDbCount = dropDbCount + 1;
      markEggFound(EGG_IDS.DROP_DATABASE);
      window.dispatchEvent(new Event("rb-egg-found"));
      if (dropDbCount === 0) {
        lines = [
          { type: "error", text: "ERROR: You're not the DBA of this site." },
          { type: "error", text: "Error: You're not the DBA of this site. Keep exploring!" },
          { type: "output", text: "Keep exploring!" },
        ];
      } else {
        action = "wipe";
        lines = [
          { type: "error", text: "⚠  Oops..." },
          { type: "error", text: "Oops... I think you've made a mistake. [CONTENT WIPED]" },
        ];
      }
      break;

    case "clear":
      lines = [];
      break;

    case "exit":
    case "quit":
      lines = [{ type: "system", text: "Closing terminal..." }];
      break;

    case "":
      lines = [];
      break;

    default: {
      const executable = resolveExecutable(raw, cwd);
      if (executable === "tetris") {
        markEggFound(EGG_IDS.TETRIS_PLAYED);
        window.dispatchEvent(new Event("rb-egg-found"));
        action = "tetris";
        lines = [
          { type: "system", text: `Executing ${raw}...` },
          { type: "system", text: "Loading assets... ████████████████████ OK" },
          { type: "success", text: "▶ Tetris started." },
        ];
        break;
      }
      if (executable === "flappy") {
        markEggFound(EGG_IDS.FLAPPY_PLAYED);
        window.dispatchEvent(new Event("rb-egg-found"));
        action = "flappy";
        lines = [
          { type: "system", text: `Executing ${raw}...` },
          { type: "system", text: "Loading planneur sprite... ████████████████████ OK" },
          { type: "success", text: "▶ Flappy Planneur started." },
        ];
        break;
      }
      if (executable === "hack") {
        if (!isRoot && /bin\/hack|hack\.sh/i.test(raw)) {
          lines = [{ type: "error", text: `${raw}: Permission denied` }];
          break;
        }
        markEggFound(EGG_IDS.HACK_CMD);
        window.dispatchEvent(new Event("rb-egg-found"));
        action = "hack";
        lines = [
          { type: "error", text: "Initiating sequence..." },
          { type: "error", text: "████████████████████ 100%" },
          { type: "error", text: "ACCESS GRANTED,just kidding. 😈" },
          { type: "error", text: "(Reversible. Relax.)" },
        ];
        break;
      }

      const pingMatch = raw.match(/^ping\s+(.+)$/i);
      if (pingMatch) {
        const host = pingMatch[1].trim();
        lines = [
          { type: "system", text: `PING ${host}: 56 data bytes` },
          { type: "success", text: `64 bytes from ${host}: icmp_seq=0 time=12.${Math.floor(Math.random()*9)} ms` },
          { type: "success", text: `64 bytes from ${host}: icmp_seq=1 time=11.${Math.floor(Math.random()*9)} ms` },
          { type: "success", text: `64 bytes from ${host}: icmp_seq=2 time=13.${Math.floor(Math.random()*9)} ms` },
          { type: "output", text: `3 packets transmitted, 3 received, 0% packet loss` },
        ];
        break;
      }

      const sshMatch = raw.match(/^ssh\s+(.+)$/i);
      if (sshMatch) {
        const dest = sshMatch[1].trim();
        lines = [
          { type: "system", text: `Connecting to ${dest}...` },
          { type: "error", text: `ssh: connect to host ${dest}: Connection refused` },
          { type: "system", text: `(the real one is rb-rubydev.fr 😄)` },
        ];
        break;
      }

      const grepMatch = raw.match(/^grep\s+(.+)$/i);
      if (grepMatch) {
        lines = [
          { type: "output", text: `grep: no matches in this universe.` },
          { type: "system", text: `(try: grep TODO ~/projects/portfolio/next.config.ts)` },
        ];
        break;
      }

      const cdMatch = raw.match(/^cd\s*(.*)$/i);
      if (cdMatch) {
        const target = cdMatch[1].trim() || "~";
        const result = changeDir(cwd, target);
        if (result.error) {
          lines = [{ type: "error", text: result.error }];
        } else {
          newCwd = result.cwd;
        }
        break;
      }

      const treeMatch = raw.match(/^tree\s*(.*)$/i);
      if (treeMatch) {
        const target = treeMatch[1].trim() || ".";
        const resolved = target === "." ? { cwd, error: undefined } : changeDir(cwd, target);
        if (resolved.error) {
          lines = [{ type: "error", text: resolved.error }];
          break;
        }
        lines = [
          { type: "output", text: formatPromptPath(resolved.cwd) },
          ...buildTree(resolved.cwd, isRoot).map((l) => ({ type: "output" as const, text: l })),
        ];
        break;
      }

      const echoMatch = raw.match(/^echo\s*(.*)/i);
      if (echoMatch) {
        lines = [{ type: "output", text: echoMatch[1].trim() }];
        break;
      }

      const sudoCatMatch = raw.match(/^sudo\s+cat\s+(.+)$/i);
      if (sudoCatMatch) {
        const filePath = sudoCatMatch[1].trim();
        const result = readFile(cwd, filePath, { isRoot, sudo: true });
        if (result.ok) {
          lines = astroLinesFromRead(filePath, [
            { type: "system", text: "[sudo] password: ••••••••" },
            { type: "success", text: "Access granted." },
            ...result.lines.map((l) => ({ type: "output" as const, text: l })),
          ]);
        } else if (result.reason === "denied") {
          lines = [{ type: "error", text: `cat: ${result.name}: Permission denied` }];
        } else if (result.reason === "is_dir") {
          lines = [{ type: "error", text: `cat: ${result.name}: Is a directory` }];
        } else {
          lines = [{ type: "error", text: `cat: ${filePath}: No such file or directory` }];
        }
        break;
      }

      const catMatch = raw.match(/^cat\s+(.+)$/i);
      if (catMatch) {
        const filePath = catMatch[1].trim();
        const result = readFile(cwd, filePath, { isRoot, sudo: false });
        if (result.ok) {
          lines = astroLinesFromRead(
            filePath,
            result.lines.map((l) => ({ type: "output" as const, text: l }))
          );
        } else if (result.reason === "denied") {
          lines = [
            { type: "error", text: `cat: ${result.name}: Permission denied` },
            { type: "system", text: "Hint: try sudo cat or su -" },
          ];
        } else if (result.reason === "is_dir") {
          lines = [{ type: "error", text: `cat: ${result.name}: Is a directory` }];
        } else {
          lines = [{ type: "error", text: `cat: ${filePath}: No such file or directory` }];
        }
        break;
      }

      const headMatch = raw.match(/^head\s+(.+)$/i);
      if (headMatch) {
        const result = readFile(cwd, headMatch[1].trim(), { isRoot, sudo: false });
        if (result.ok) {
          lines = result.lines.slice(0, 5).map((l) => ({ type: "output" as const, text: l }));
        } else {
          lines = [{ type: "error", text: `head: ${headMatch[1].trim()}: No such file` }];
        }
        break;
      }

      lines = [
        { type: "error", text: `Command not found: ${raw}. Type "help" for help.` },
      ];
    }
  }

  return { lines, newDropDbCount, newCwd, action, grantRoot, revokeRoot };
}

interface HiddenTerminalProps {
  onOpenTetris: () => void;
  onOpenFlappy: () => void;
}

export function HiddenTerminal({ onOpenTetris, onOpenFlappy }: HiddenTerminalProps) {
  const [open, setOpen] = useState(false);
  const [booted, setBooted] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(TERMINAL_BOOT_KEY) === "true";
  });
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [dropDbCount, setDropDbCount] = useState(0);
  const [wiped, setWiped] = useState(false);
  const [isRoot, setIsRoot] = useState(false);
  const [cwd, setCwd] = useState(HOME);
  const [bootInProgress, setBootInProgress] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const bootTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bootStartedRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [lines, scrollToBottom]);

  const clearBootTimeouts = useCallback(() => {
    bootTimeoutsRef.current.forEach(clearTimeout);
    bootTimeoutsRef.current = [];
  }, []);

  const scheduleBootStep = useCallback((delay: number, fn: () => void) => {
    const id = setTimeout(fn, delay);
    bootTimeoutsRef.current.push(id);
  }, []);

  const playTerminalSound = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio("/song/hacking.mp3");
        audioRef.current.volume = 0.45;
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } catch {}
  }, []);

  const updateProgressLine = useCallback((pct: number) => {
    const filled = Math.round((pct / 100) * 20);
    const bar = "█".repeat(filled) + "░".repeat(20 - filled);
    const text = `[${bar}] ${pct}%`;
    setLines((prev) => {
      const withoutProgress = prev.filter((l) => l.type !== "progress");
      return [...withoutProgress, { type: "progress", text }];
    });
  }, []);

  const boot = useCallback(() => {
    if (booted || bootStartedRef.current) return;

    bootStartedRef.current = true;
    setBootInProgress(true);
    setLines([]);
    playTerminalSound();

    const addLine = (delay: number, line: TerminalLine) => {
      scheduleBootStep(delay, () => {
        setLines((prev) => [...prev, line]);
      });
    };

    addLine(0, { type: "system", text: "RuBy OS v2.5.1,boot sequence..." });
    addLine(600, { type: "system", text: "> loading kernel modules..." });
    addLine(1200, { type: "system", text: "> mounting /home/ruby..." });
    addLine(1800, { type: "system", text: "> initializing network stack..." });
    addLine(2400, { type: "system", text: "> decrypting secrets.enc... [SKIPPED]" });
    addLine(3000, { type: "system", text: "> starting agent runtime..." });

    const progressStart = 3400;
    const progressEnd = 6500;
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const delay = progressStart + ((progressEnd - progressStart) * i) / steps;
      const pct = Math.min(100, Math.round((100 * i) / steps));
      scheduleBootStep(delay, () => updateProgressLine(pct));
    }

    addLine(6700, { type: "system", text: "> verifying integrity... OK" });
    addLine(7000, {
      type: "success",
      text: "// Connection established. Ready for command.",
    });
    addLine(7300, {
      type: "output",
      text: 'Type "help" for available commands.',
    });

    scheduleBootStep(BOOT_DURATION_MS, () => {
      setBootInProgress(false);
      setBooted(true);
      localStorage.setItem(TERMINAL_BOOT_KEY, "true");
      markEggFound(EGG_IDS.TERMINAL_OPEN);
      window.dispatchEvent(new Event("rb-egg-found"));
      inputRef.current?.focus();
    });
  }, [booted, scheduleBootStep, updateProgressLine, playTerminalSound]);

  useEffect(() => {
    return () => clearBootTimeouts();
  }, [clearBootTimeouts]);

  useEffect(() => {
    if (!open) {
      clearBootTimeouts();
      audioRef.current?.pause();
      if (bootStartedRef.current && !booted) {
        setBootInProgress(false);
        bootStartedRef.current = false;
      }
      return;
    }

    if (!booted) {
      boot();
    } else {
      setLines((prev) =>
        prev.length > 0
          ? prev
          : [
              {
                type: "success",
                text: "// Connection established. Ready for command.",
              },
              {
                type: "output",
                text: 'Type "help" for available commands.',
              },
            ]
      );
      setBootInProgress(false);
      inputRef.current?.focus();
    }
    // Déclenché uniquement à l'ouverture/fermeture du terminal
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Global keyboard shortcut: Shift+T to toggle terminal
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      const isShiftT = e.shiftKey && e.key === "T" && !e.ctrlKey && !e.metaKey && !e.altKey;
      if (!isShiftT) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      setOpen((prev) => !prev);
      setTimeout(() => inputRef.current?.focus(), 100);
    };
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, [boot]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && input !== "") return;

    const cmd = input;
    setInput("");
    setHistory((prev) => [cmd, ...prev].slice(0, 50));
    setHistoryIndex(-1);

    if (cmd.trim()) {
      const pathLabel = formatPromptPath(cwd);
      const prompt = isRoot ? `root@rb-rubydev:${pathLabel}# ` : `ruby@rb-rubydev:${pathLabel}$ `;
      setLines((prev) => [...prev, { type: "input", text: `${prompt}${cmd}` }]);
    }

    if (cmd.trim().toLowerCase() === "scores") {
      setLines((prev) => [
        ...prev,
        { type: "system", text: "> fetching global leaderboard..." },
      ]);
      void Promise.all([fetchTopScores("tetris"), fetchTopScores("flappy")])
        .then(([t, f]) => {
          setLines((prev) => [...prev, ...formatLeaderboardLines(t, f)]);
        })
        .catch(() => {
          setLines((prev) => [
            ...prev,
            { type: "error", text: "Failed to fetch leaderboard." },
          ]);
        });
      return;
    }

    const { lines: outputLines, newDropDbCount, newCwd, action, grantRoot, revokeRoot } =
      processCommand(cmd, dropDbCount, isRoot, cwd);
    setDropDbCount(newDropDbCount);
    setCwd(newCwd);
    if (grantRoot) setIsRoot(true);
    if (revokeRoot) setIsRoot(false);

    if (cmd.toLowerCase() === "clear") {
      setLines([]);
      return;
    }

    if (cmd.toLowerCase() === "exit" || cmd.toLowerCase() === "quit") {
      setLines((prev) => [...prev, ...outputLines]);
      setTimeout(() => setOpen(false), 800);
      return;
    }

    if (action === "hack") {
      setLines((prev) => [...prev, ...outputLines]);
      document.body.style.animation = "glitch 0.5s ease-in-out 3";
      setTimeout(() => { document.body.style.animation = ""; }, 1600);
      return;
    }

    if (action === "wipe") {
      setLines((prev) => [...prev, ...outputLines]);
      setTimeout(() => setWiped(true), 500);
      setTimeout(() => setWiped(false), 4000);
      return;
    }

    if (action === "tetris") {
      setLines((prev) => [...prev, ...outputLines]);
      setTimeout(() => onOpenTetris(), 600);
      return;
    }

    if (action === "flappy") {
      setLines((prev) => [...prev, ...outputLines]);
      setTimeout(() => onOpenFlappy(), 600);
      return;
    }

    setLines((prev) => [...prev, ...outputLines]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const newIndex = Math.min(historyIndex + 1, history.length - 1);
      setHistoryIndex(newIndex);
      setInput(history[newIndex] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const newIndex = Math.max(historyIndex - 1, -1);
      setHistoryIndex(newIndex);
      setInput(newIndex === -1 ? "" : history[newIndex] || "");
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const lineColor = (type: TerminalLine["type"]) => {
    switch (type) {
      case "input": return "#00D4FF";
      case "error": return "#C41E3A";
      case "success": return "#00FF41";
      case "system": return "#FFD700";
      case "progress": return "#00FF41";
      default: return "#E8E8E8";
    }
  };

  const pathLabel = formatPromptPath(cwd);
  const promptShort = isRoot ? "#" : "$";

  return (
    <>
      {/* Hint label,tiny, bottom-left, low-profile */}
      <div
        className="fixed bottom-16 left-4 z-40 font-pixel"
        style={{ fontSize: "7px", userSelect: "none", color: "#252525" }}
        aria-hidden="true"
      >
        [Shift+T] terminal
      </div>

      {/* Content wipe overlay */}
      {wiped && (
        <div
          className="fixed inset-0 z-[9998] bg-bg flex items-center justify-center"
          aria-hidden="true"
        >
          <p className="font-pixel text-ruby" style={{ fontSize: "14px" }}>
            DATABASE WIPED
          </p>
        </div>
      )}

      {/* Terminal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[9990] flex items-end justify-center pb-4 px-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(2px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div
            className="w-full max-w-3xl bg-bg border-2 border-green"
            style={{
              boxShadow: `0 0 20px rgba(0,255,65,0.2), 4px 4px 0 ${isRoot ? "#FFD700" : "#00FF41"}`,
              borderColor: isRoot ? "#FFD700" : "#00FF41",
              height: "60vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Title bar */}
            <div
              className="flex items-center justify-between px-4 py-2 border-b-2 bg-bg-secondary"
              style={{ borderColor: isRoot ? "#FFD700" : "#00FF41" }}
            >
              <span
                className="font-pixel"
                style={{ fontSize: "8px", color: isRoot ? "#FFD700" : "#00FF41" }}
              >
                {isRoot ? "root@rb-rubydev" : "RuBy Terminal v1.0"}{" "}
                <span className="text-muted" style={{ fontSize: "7px" }}>
                  {formatPromptPath(cwd)}
                </span>{" "}
                {isRoot && <span style={{ color: "#C41E3A" }}>⚡ ROOT</span>}
              </span>
              <span className="font-pixel text-muted" style={{ fontSize: "7px" }}>
                [Shift+T] ou [ESC] pour fermer
              </span>
              <button
                onClick={() => setOpen(false)}
                className="font-pixel text-muted hover:text-ruby transition-none"
                style={{ fontSize: "10px" }}
                aria-label="Fermer le terminal"
              >
                ✕
              </button>
            </div>

            {/* Output */}
            <div
              className="flex-1 overflow-y-auto px-4 py-3 font-mono"
              style={{ fontSize: "14px" }}
            >
              {lines.map((line, i) => (
                <div key={i} style={{ color: lineColor(line.type), marginBottom: "2px" }}>
                  {line.text}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 px-4 py-3 border-t-2"
              style={{
                borderColor: isRoot ? "#FFD700" : "#00FF41",
                opacity: bootInProgress ? 0.5 : 1,
              }}
            >
              <span
                className="font-mono shrink-0"
                style={{ fontSize: "14px", color: isRoot ? "#FFD700" : "#00D4FF" }}
              >
                {promptShort}
              </span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={bootInProgress}
                className="flex-1 bg-transparent font-mono text-text outline-none disabled:cursor-not-allowed"
                style={{ fontSize: "14px", caretColor: "#00FF41" }}
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
                aria-label="Entrée terminal"
                placeholder={bootInProgress ? "boot in progress..." : ""}
              />
              {!bootInProgress && (
                <span
                  className="font-mono animate-blink shrink-0"
                  style={{ fontSize: "14px", color: isRoot ? "#FFD700" : "#00FF41" }}
                >
                  █
                </span>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
