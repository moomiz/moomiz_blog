import Link from "next/link";
import { Github, Linkedin } from "lucide-react";
import { Card } from "@/components/ui";

export function Sidebar() {
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <Card className="overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
        <div className="px-5 pb-5">
          <div className="-mt-10 mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-card bg-muted text-2xl font-bold">
            MZ
          </div>
          <h2 className="text-lg font-semibold">Moomiz</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            AI와 함께 문제를 정의하고, 비판적으로 검토하며, 더 나은 코드를 만드는
            풀스택 개발자
          </p>
          <p className="mt-4 rounded-lg bg-muted/60 p-3 text-sm leading-relaxed text-muted-foreground">
            &ldquo;What과 How보다 Why와 Collaboration을 기록합니다.&rdquo;
          </p>
          <div className="mt-4 flex gap-2">
            <Link
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </Link>
            <Link
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Card>
    </aside>
  );
}
