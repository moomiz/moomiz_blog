export const DEFAULT_ADMIN_CATEGORIES = [
  "Frontend",
  "Backend",
  "General",
  "AI",
  "Product",
] as const;

const CUSTOM_CATEGORIES_KEY = "moomiz-custom-categories";

export function mergeCategories(existing: string[]): string[] {
  const set = new Set<string>([
    ...DEFAULT_ADMIN_CATEGORIES,
    ...existing.filter(Boolean),
  ]);

  if (typeof window !== "undefined") {
    try {
      const stored = JSON.parse(
        localStorage.getItem(CUSTOM_CATEGORIES_KEY) ?? "[]"
      ) as string[];
      for (const name of stored) {
        if (name.trim()) set.add(name.trim());
      }
    } catch {
      // ignore invalid localStorage
    }
  }

  return Array.from(set).sort((a, b) => a.localeCompare(b, "ko"));
}

export function rememberCustomCategory(name: string) {
  if (typeof window === "undefined") return;
  const trimmed = name.trim();
  if (!trimmed || DEFAULT_ADMIN_CATEGORIES.includes(trimmed as never)) return;

  try {
    const stored = JSON.parse(
      localStorage.getItem(CUSTOM_CATEGORIES_KEY) ?? "[]"
    ) as string[];
    if (!stored.includes(trimmed)) {
      localStorage.setItem(
        CUSTOM_CATEGORIES_KEY,
        JSON.stringify([...stored, trimmed])
      );
    }
  } catch {
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify([trimmed]));
  }
}
