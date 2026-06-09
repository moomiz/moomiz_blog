const TAG_PALETTES = [
  "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-300",
  "bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-300",
  "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300",
  "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300",
] as const;

export function getTagPalette(tag: string) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TAG_PALETTES[Math.abs(hash) % TAG_PALETTES.length];
}
