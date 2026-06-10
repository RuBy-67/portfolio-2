export type FsEntry =
  | { kind: "file"; content: string[]; locked?: boolean; hidden?: boolean }
  | { kind: "dir"; children: Record<string, FsEntry> };

export const HOME = "/home/ruby";

const FS: FsEntry = {
  kind: "dir",
  children: {
    home: {
      kind: "dir",
      children: {
        ruby: {
          kind: "dir",
          children: {
            "README.md": {
              kind: "file",
              content: [
                "# RuBy OS",
                "",
                "This is not a regular portfolio.",
                "It is a system. A living architecture.",
                "",
                "Intégration ERP,Flux,IA,Aviation,Astronomie.",
                "",
                "If you're reading this, you found the terminal.",
                "Keep going. There is more.",
                "",
                ", RuBy",
              ],
            },
            "agent.py": {
              kind: "file",
              content: [
                "#!/usr/bin/env python3",
                "# autonomous_agent.py,v0.3",
                "",
                "class Agent:",
                "    def __init__(self, goal, constraints):",
                "        self.goal = goal",
                "        self.memory = []",
                "",
                "    def decide(self, observation) -> str:",
                "        if self._violates(observation):",
                "            return 'wait'",
                "        return self._reason(observation)",
                "",
                "# An agent that can't explain itself",
                "# is not deployable in production.",
              ],
            },
            ".bash_history": {
              kind: "file",
              content: [
                "cd ~/projects/portfolio",
                "npm run build",
                "git commit -m 'fix'",
                "git commit -m 'fix again'",
                "git push origin main --force",
                "ssh root@rb-rubydev.fr",
                "pm2 restart rb-rubydev",
                "cat /var/log/nginx/access.log | grep 404",
                "grep -r 'TODO' ./src | wc -l",
                "# output: 42",
              ],
            },
            "config.json": {
              kind: "file",
              content: [
                "{",
                '  "mode": "production",',
                '  "version": "2.5.1",',
                '  "agent_enabled": true,',
                '  "erp_sync": { "odoo": true, "sage_x3": true },',
                '  "debug": false,',
                '  "secret_key": "****************************"',
                "}",
              ],
            },
            bin: {
              kind: "dir",
              children: {
                "tetris.sh": {
                  kind: "file",
                  content: ["#!/bin/bash", "exec tetris --8bit --ruby-theme"],
                },
                "flappy.sh": {
                  kind: "file",
                  content: ["#!/bin/bash", "exec flappy --planneur-mode"],
                },
                "hack.sh": {
                  kind: "file",
                  content: ["#!/bin/bash", "# CLASSIFIED,root only", "echo 'nice try.'"],
                  hidden: true,
                },
              },
            },
            secrets: {
              kind: "dir",
              children: {
                "secrets.enc": {
                  kind: "file",
                  locked: true,
                  content: [
                    "-----BEGIN ENCRYPTED BLOCK-----",
                    "decryption key accepted.",
                    "",
                    "RA 05h 34m 32s,Dec +22° 00' 52\"",
                    "M1,Crab Nebula",
                    "6500 light-years from here.",
                    "Put things in perspective.",
                    "",
                    ", RuBy",
                    "-----END ENCRYPTED BLOCK-----",
                  ],
                },
                "secrets_root.enc": {
                  kind: "file",
                  locked: true,
                  hidden: true,
                  content: [
                    "// ROOT CLEARANCE,EYES ONLY",
                    "",
                    "Portfolio auth token: rb-****-****-live",
                    "DB path: /var/www/rb-rubydev/data/scores.db",
                    "",
                    "Real secret: curiosity is the best debugger.",
                  ],
                },
              },
            },
            projects: {
              kind: "dir",
              children: {
                portfolio: {
                  kind: "dir",
                  children: {
                    "package.json": {
                      kind: "file",
                      content: [
                        '{',
                        '  "name": "rb-rubydev-portfolio",',
                        '  "version": "2.5.1",',
                        '  "scripts": { "dev": "next dev -p 3001" }',
                        "}",
                      ],
                    },
                    "next.config.ts": {
                      kind: "file",
                      content: ["export default { output: 'standalone' };"],
                    },
                  },
                },
                erp: {
                  kind: "dir",
                  children: {
                    "sync.log": {
                      kind: "file",
                      content: [
                        "[2026-06-10 08:12:01] Odoo → Sage X3 sync OK",
                        "[2026-06-10 08:12:06] Flux agent heartbeat OK",
                        "[2026-06-10 08:12:11] 0 errors, 142 records",
                      ],
                    },
                  },
                },
              },
            },
            ".ssh": {
              kind: "dir",
              children: {
                "authorized_keys": {
                  kind: "file",
                  content: [
                    "ssh-ed25519 AAAA... rb-rubydev deploy@ci",
                    "# don't paste your real keys here 😄",
                  ],
                },
              },
            },
          },
        },
      },
    },
    etc: {
      kind: "dir",
      children: {
        hostname: {
          kind: "file",
          content: ["rb-rubydev.fr"],
        },
        "os-release": {
          kind: "file",
          content: [
            'NAME="RuBy OS"',
            'VERSION="2.5.1 (Crab Nebula)"',
            'ID=rubyos',
          ],
        },
      },
    },
    var: {
      kind: "dir",
      children: {
        log: {
          kind: "dir",
          children: {
            "nginx.access.log": {
              kind: "file",
              content: [
                '127.0.0.1 - - [10/Jun/2026] "GET / HTTP/1.1" 200',
                '127.0.0.1 - - [10/Jun/2026] "GET /api/scores/tetris HTTP/1.1" 200',
                '10.0.0.1 - - [10/Jun/2026] "POST /api/scores/flappy HTTP/1.1" 200',
              ],
            },
          },
        },
      },
    },
  },
};

export function normalizePath(cwd: string, input: string): string {
  const base = input.startsWith("/") ? input : `${cwd}/${input}`;
  const parts = base.split("/").filter(Boolean);
  const stack: string[] = [];

  for (const part of parts) {
    if (part === ".") continue;
    if (part === "..") {
      stack.pop();
      continue;
    }
    stack.push(part);
  }

  return "/" + stack.join("/");
}

function isHidden(entry: FsEntry): boolean {
  return entry.kind === "file" && !!entry.hidden;
}

function getNode(path: string): FsEntry | null {
  if (path === "/") return FS;
  const parts = path.split("/").filter(Boolean);
  let node: FsEntry = FS;

  for (const part of parts) {
    if (node.kind !== "dir") return null;
    const next = node.children[part];
    if (!next) return null;
    node = next;
  }

  return node;
}

export function changeDir(cwd: string, target: string): { cwd: string; error?: string } {
  const resolved =
    target === "" || target === "~" ? HOME : normalizePath(cwd, target);

  const node = getNode(resolved);
  if (!node) return { cwd, error: `cd: ${target}: No such file or directory` };
  if (node.kind !== "dir") return { cwd, error: `cd: ${target}: Not a directory` };
  return { cwd: resolved };
}

export function listDir(path: string, isRoot: boolean): string[] {
  const node = getNode(path);
  if (!node) return [];
  if (node.kind !== "dir") return [];

  return Object.entries(node.children)
    .filter(([, entry]) => isRoot || !isHidden(entry))
    .map(([name, entry]) => {
      if (entry.kind === "dir") return `${name}/`;
      const locked = entry.locked ? " [LOCKED]" : "";
      const exec = name.endsWith(".sh") ? "*" : "";
      return `${name}${exec}${locked}`;
    })
    .sort();
}

export type ReadResult =
  | { ok: true; lines: string[] }
  | { ok: false; reason: "not_found" | "denied" | "is_dir"; name: string };

export function readFile(
  cwd: string,
  filePath: string,
  opts: { isRoot: boolean; sudo: boolean }
): ReadResult {
  const resolved = normalizePath(cwd, filePath);
  const parts = resolved.split("/").filter(Boolean);
  const name = parts[parts.length - 1] ?? filePath;
  const node = getNode(resolved);

  if (!node) return { ok: false, reason: "not_found", name };
  if (node.kind === "dir") return { ok: false, reason: "is_dir", name };

  const canRead = !node.locked || opts.isRoot || opts.sudo;
  if (!canRead) return { ok: false, reason: "denied", name };
  if (node.hidden && !opts.isRoot && !opts.sudo) {
    return { ok: false, reason: "not_found", name };
  }

  return { ok: true, lines: node.content };
}

export function buildTree(path: string, isRoot: boolean, prefix = "", isLast = true): string[] {
  const node = getNode(path);
  if (!node || node.kind !== "dir") return [];

  const entries = Object.entries(node.children).filter(([, e]) => isRoot || !isHidden(e));
  const lines: string[] = [];

  entries.forEach(([name, entry], i) => {
    const last = i === entries.length - 1;
    const branch = prefix + (isLast ? "└── " : "├── ");
    const childPrefix = prefix + (isLast ? "    " : "│   ");

    if (entry.kind === "dir") {
      lines.push(`${branch}${name}/`);
      lines.push(...buildTree(normalizePath(path, name), isRoot, childPrefix, last));
    } else {
      const tag = entry.locked ? " [LOCKED]" : "";
      lines.push(`${branch}${name}${tag}`);
    }
  });

  return lines;
}

const BIN_DIR = `${HOME}/bin`;

export function resolveExecutable(cmd: string, cwd: string): string | null {
  const normalized = cmd.trim();

  // Chemin absolu ou relatif résolu
  const resolved = normalized.startsWith("~/")
    ? normalizePath("/", normalized.replace("~", HOME.slice(1)))
    : normalizePath(cwd, normalized.replace(/^\.\//, ""));

  // Les exécutables ne vivent que dans ~/bin,on vérifie le chemin résolu
  if (resolved === `${BIN_DIR}/tetris.sh`) return "tetris";
  if (resolved === `${BIN_DIR}/flappy.sh`) return "flappy";
  if (resolved === `${BIN_DIR}/hack.sh`) return "hack";

  // Raccourcis directs : ./tetris.sh depuis ~/bin uniquement
  if ((normalized === "./tetris.sh" || normalized === "./tetris") && cwd === BIN_DIR) return "tetris";
  if ((normalized === "./flappy.sh" || normalized === "./flappy") && cwd === BIN_DIR) return "flappy";
  if (normalized === "./hack.sh" && cwd === BIN_DIR) return "hack";

  // Noms nus depuis ~/bin
  if ((normalized === "tetris.sh" || normalized === "tetris") && cwd === BIN_DIR) return "tetris";
  if ((normalized === "flappy.sh" || normalized === "flappy") && cwd === BIN_DIR) return "flappy";

  return null;
}
