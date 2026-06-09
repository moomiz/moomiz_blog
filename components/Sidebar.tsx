import Link from "next/link";
import { Github, Linkedin } from "lucide-react";
import type { CategoryStat } from "@/components/CategoryCards";
import { CountBadge } from "@/components/CountBadge";

type SidebarProps = {
  categories?: CategoryStat[];
};

export function Sidebar({ categories = [] }: SidebarProps) {
  return (
    <aside className="card-craft overflow-hidden">
      <div className="h-16 bg-gradient-to-r from-primary/15 via-muted/50 to-transparent" />
      <div className="px-5 pb-6">
        <div className="-mt-9 mb-4 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border-4 border-card bg-muted text-3xl shadow-sm">
          <span role="img" aria-label="개발자 프로필">
            💻
          </span>
        </div>
        <h2 className="text-lg font-semibold text-foreground">Moomiz</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          AI와 함께 문제를 정의하고, 비판적으로 검토하며, 더 나은 코드를 만드는
          풀스택 개발자
        </p>
        <p className="mt-4 rounded-xl bg-muted/70 p-3 text-sm leading-relaxed text-muted-foreground">
          &ldquo;What과 How보다 Why와 Collaboration을 기록합니다.&rdquo;
        </p>

        {categories.length > 0 && (
          <nav className="mt-6" aria-label="카테고리">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              카테고리
            </h3>
            <ul className="space-y-0.5">
              {categories.map((category) => (
                <li key={category.name}>
                  <Link
                    href={`/posts?category=${encodeURIComponent(category.name)}`}
                    className="flex items-center justify-between rounded-lg px-2 py-2 text-sm text-foreground transition-colors hover:bg-muted/70"
                  >
                    <span>{category.name}</span>
                    <CountBadge count={category.count} />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="mt-5 flex gap-2">
          <Link
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/80 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="GitHub"
          >
            <Github className="h-4 w-4" />
          </Link>
          <Link
            href="https://linkedin.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/80 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
