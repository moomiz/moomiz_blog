"use client";

import { useMemo, useState } from "react";
import { Sparkles, Check, RotateCcw } from "lucide-react";
import { Button, Textarea, Badge, Card } from "@/components/ui";
import { DiffViewer } from "@/components/admin/DiffViewer";

const DEFAULT_DRAFT = `# 새 Tech-Log 초안

## 1. 배경 및 문제 정의
Next.js App Router로 블로그를 만들려고 한다. SEO와 MDX 커스텀 컴포넌트가 필요하다.

## 2. 가설 수립 및 AI 프롬프팅
Cursor에게 App Router + MDX + Tailwind 구조를 요청했다.

## 3. AI의 제안과 엔지니어의 비판적 검토
AI가 pages router 예제를 제안했지만 App Router로 수정했다.
`;

export default function AdminPage() {
  const [draft, setDraft] = useState(DEFAULT_DRAFT);
  const [optimized, setOptimized] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [streaming, setStreaming] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDiff, setShowDiff] = useState(false);

  const preview = useMemo(
    () => (streaming || optimized || draft),
    [streaming, optimized, draft]
  );

  const runOptimize = async () => {
    setLoading(true);
    setStreaming("");
    setOptimized("");
    setDescription("");
    setTags([]);
    setShowDiff(false);

    try {
      const response = await fetch("/api/ai/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft }),
      });

      const contentType = response.headers.get("content-type") ?? "";

      if (contentType.includes("text/event-stream") && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";

          for (const event of events) {
            const line = event.replace(/^data: /, "").trim();
            if (!line) continue;

            const payload = JSON.parse(line) as
              | { type: "delta"; delta: string }
              | {
                  type: "done";
                  optimized: string;
                  description: string;
                  tags: string[];
                };

            if (payload.type === "delta") {
              setStreaming((prev) => prev + payload.delta);
            }

            if (payload.type === "done") {
              setOptimized(payload.optimized);
              setDescription(payload.description);
              setTags(payload.tags);
              setStreaming("");
              setShowDiff(true);
            }
          }
        }
      } else {
        const data = (await response.json()) as {
          optimized: string;
          description: string;
          tags: string[];
        };
        setOptimized(data.optimized);
        setDescription(data.description);
        setTags(data.tags);
        setShowDiff(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const applyOptimized = () => {
    if (!optimized) return;
    setDraft(optimized);
    setOptimized("");
    setStreaming("");
    setShowDiff(false);
  };

  const resetDraft = () => {
    setDraft(DEFAULT_DRAFT);
    setOptimized("");
    setStreaming("");
    setDescription("");
    setTags([]);
    setShowDiff(false);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">관리자 · AI Writing Assistant</h1>
        <p className="mt-2 text-muted-foreground">
          초안 작성 → AI 가독성 최적화(Streaming) → Diff View → 적용하기
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">마크다운 초안</h2>
            <Button variant="ghost" size="sm" onClick={resetDraft}>
              <RotateCcw className="h-4 w-4" />
              초기화
            </Button>
          </div>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="min-h-[480px] font-mono text-sm"
          />
          <Button
            className="mt-4 w-full"
            onClick={runOptimize}
            disabled={loading || !draft.trim()}
          >
            <Sparkles className="h-4 w-4" />
            {loading ? "AI 가독성 최적화 중..." : "AI 가독성 최적화"}
          </Button>
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 font-semibold">실시간 미리보기</h2>
          <div className="min-h-[480px] whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-4 text-sm leading-relaxed">
            {preview}
          </div>

          {(description || tags.length > 0) && (
            <div className="mt-4 rounded-lg border border-border bg-card p-4">
              <p className="text-sm font-medium">SEO Meta (AI 추출)</p>
              {description && (
                <p className="mt-2 text-sm text-muted-foreground">{description}</p>
              )}
              {tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {showDiff && optimized && (
            <div className="mt-4 space-y-3">
              <DiffViewer oldValue={draft} newValue={optimized} />
              <Button className="w-full" onClick={applyOptimized}>
                <Check className="h-4 w-4" />
                적용하기 (Apply)
              </Button>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
