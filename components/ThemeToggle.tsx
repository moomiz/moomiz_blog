"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className="h-9 w-[4.25rem] rounded-full bg-muted"
        aria-hidden
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative h-9 w-[4.25rem] rounded-full bg-muted p-1 transition-colors hover:bg-muted/80"
    >
      <span className="pointer-events-none flex justify-between px-1.5 pt-0.5 text-muted-foreground/50">
        <Sun className="h-4 w-4" aria-hidden />
        <Moon className="h-4 w-4" aria-hidden />
      </span>
      <span
        className={cn(
          "absolute top-1 flex h-7 w-7 items-center justify-center rounded-full bg-card text-foreground shadow-sm transition-transform duration-300 ease-out",
          isDark ? "translate-x-[2.125rem]" : "translate-x-0"
        )}
      >
        <Sun
          className={cn(
            "absolute h-4 w-4 transition-all duration-300",
            isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
          )}
          aria-hidden
        />
        <Moon
          className={cn(
            "absolute h-4 w-4 transition-all duration-300",
            isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
          )}
          aria-hidden
        />
      </span>
    </button>
  );
}
