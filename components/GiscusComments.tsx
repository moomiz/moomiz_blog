"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

type GiscusCommentsProps = {
  slug: string;
};

export function GiscusComments({ slug }: GiscusCommentsProps) {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const repo = process.env.NEXT_PUBLIC_GISCUS_REPO;
    const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
    const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY;
    const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;

    const container = document.getElementById("giscus-container");
    if (!container) return;

    container.innerHTML = "";

    if (!repo || !repoId || !categoryId) {
      container.innerHTML = `
        <div class="rounded-xl border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
          <p class="font-medium text-foreground">Giscus 댓글이 아직 설정되지 않았습니다.</p>
          <p class="mt-2">.env.local에 NEXT_PUBLIC_GISCUS_* 변수를 설정하면 GitHub Discussion 기반 댓글이 활성화됩니다.</p>
          <p class="mt-2 text-xs">현재 글: ${slug}</p>
        </div>
      `;
      return;
    }

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-repo", repo);
    script.setAttribute("data-repo-id", repoId);
    script.setAttribute("data-category", category ?? "General");
    script.setAttribute("data-category-id", categoryId);
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute("data-theme", resolvedTheme === "dark" ? "dark" : "light");
    script.setAttribute("data-lang", "ko");
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [slug, resolvedTheme]);

  return (
    <section className="mt-12">
      <h2 className="mb-4 text-xl font-semibold">댓글</h2>
      <div id="giscus-container" />
    </section>
  );
}
