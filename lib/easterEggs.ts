export const EGG_IDS = {
  CONSOLE_F12: "console_f12",
  TERMINAL_OPEN: "terminal_open",
  HACK_CMD: "hack_cmd",
  DROP_DATABASE: "drop_database",
  TETRIS_PLAYED: "tetris_played",
  FLAPPY_PLAYED: "flappy_played",
  AVIATION_TRIPLE_CLICK: "aviation_triple_click",
  ASTRO_FOUND: "astro_found",
  GIT_FORCE: "git_force",
  RUBY_TITLE_CLICK: "ruby_title_click",
  FLAPPY_WIN: "flappy_win",
} as const;

export type EggId = (typeof EGG_IDS)[keyof typeof EGG_IDS];

const TOTAL_EGGS = Object.keys(EGG_IDS).length;
const STORAGE_KEY = "rb-eggs-found";

export function getFoundEggs(): EggId[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markEggFound(id: EggId): boolean {
  const found = getFoundEggs();
  if (found.includes(id)) return false;
  found.push(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
  return true;
}

export function discoverEgg(id: EggId): boolean {
  if (typeof window === "undefined") return false;
  const isNew = markEggFound(id);
  if (isNew) window.dispatchEvent(new Event("rb-egg-found"));
  return isNew;
}

export function getEggCount(): { found: number; total: number } {
  return { found: getFoundEggs().length, total: TOTAL_EGGS };
}
