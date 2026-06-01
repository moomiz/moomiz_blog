"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function CategoryChips({ categories }: { categories: string[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") ?? "All";

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">카테고리</h2>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((category) => {
          const isActive =
            (pathname === "/" && category === "All" && !searchParams.get("category")) ||
            active === category;

          const href =
            category === "All"
              ? pathname === "/posts"
                ? "/posts"
                : "/"
              : `/posts?category=${encodeURIComponent(category)}`;

          return (
            <Link
              key={category}
              href={href}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm transition-colors",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              #{category}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
