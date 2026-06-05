"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Check,
  Save,
  Send,
  RotateCcw,
  Wand2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button, Textarea, Card, Input } from "@/components/ui";
import { DiffViewer } from "@/components/admin/DiffViewer";
import { DeletePostButton } from "@/components/admin/DeletePostButton";
import { MarkdownPreview } from "@/components/admin/MarkdownPreview";
import { consumeAiStream, type AiDonePayload } from "@/lib/ai/clientStream";
import type { DraftTemplate } from "@/lib/ai/prompts";
import type { Post, PostInput, PostStatus } from "@/lib/types/post";
import { slugify } from "@/lib/utils";

type PostEditorProps = {
  post?: Post;
};

const DEFAULT_TEMPLATE = `# 새 Tech-Log 초안\n\n## 1. 배경 및 문제 정의\n`;

const emptyInput: PostInput = {
  slug: "",
  title: "",
  description: "",
  content: "",
  category: "General",
  tags: [],
  status: "draft",
  featured: false,
};

function isEmptyContent(content: string) {
  const trimmed = content.trim();
  return !trimmed || trimmed === DEFAULT_TEMPLATE.trim();
}

function applyAiMeta(
  payload: AiDonePayload,
  update: (patch: Partial<PostInput>) => void,
  setTagsInput: (value: string) => void,
  currentTitle: string
) {
  if (payload.title?.trim() && !currentTitle.trim()) {
    update({ title: payload.title.trim() });
  }
  if (payload.description?.trim()) {
    update({ description: payload.description.trim() });
  }
  if (payload.tags?.length) {
    setTagsInput(payload.tags.join(", "));
  }
}

export function PostEditor({ post }: PostEditorProps) {
  const router = useRouter();
  const isEdit = Boolean(post?.id);

  const [form, setForm] = useState<PostInput>(() =>
    post
      ? {
          slug: post.slug,
          title: post.title,
          description: post.description,
          content: post.content,
          category: post.category,
          tags: post.tags,
          status: (post.status ?? "draft") as PostStatus,
          featured: post.featured ?? false,
        }
      : { ...emptyInput, content: DEFAULT_TEMPLATE }
  );

  const [tagsInput, setTagsInput] = useState(
    () => post?.tags.join(", ") ?? ""
  );

  const [brief, setBrief] = useState("");
  const [draftTemplate, setDraftTemplate] =
    useState<DraftTemplate>("tech-log");
  const [draftPanelOpen, setDraftPanelOpen] = useState(true);

  const [draftLoading, setDraftLoading] = useState(false);
  const [optimizeLoading, setOptimizeLoading] = useState(false);
  const [draftStream, setDraftStream] = useState("");
  const [optimizeStream, setOptimizeStream] = useState("");
  const [draftResult, setDraftResult] = useState("");
  const [optimizeResult, setOptimizeResult] = useState("");
  const [showDraftDiff, setShowDraftDiff] = useState(false);
  const [showOptimizeDiff, setShowOptimizeDiff] = useState(false);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const isAiBusy = draftLoading || optimizeLoading;

  const preview = useMemo(() => {
    if (draftStream) return draftStream;
    if (optimizeStream) return optimizeStream;
    if (showDraftDiff && draftResult) return draftResult;
    if (showOptimizeDiff && optimizeResult) return optimizeResult;
    return form.content;
  }, [
    draftStream,
    optimizeStream,
    showDraftDiff,
    draftResult,
    showOptimizeDiff,
    optimizeResult,
    form.content,
  ]);

  const update = (patch: Partial<PostInput>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const parseTags = (value: string) =>
    value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

  const buildSlug = (title: string, manualSlug: string) => {
    const trimmed = manualSlug.trim();
    if (trimmed) return trimmed;
    const fromTitle = slugify(title);
    return fromTitle || `post-${Date.now()}`;
  };

  const resetAiState = () => {
    setDraftStream("");
    setOptimizeStream("");
    setDraftResult("");
    setOptimizeResult("");
    setShowDraftDiff(false);
    setShowOptimizeDiff(false);
  };

  const save = async (status?: PostStatus) => {
    setSaving(true);
    setMessage("");

    const nextStatus = status ?? form.status;

    if (!form.title.trim()) {
      setMessage("제목을 입력해 주세요.");
      setSaving(false);
      return;
    }

    const payload: PostInput = {
      ...form,
      slug: buildSlug(form.title, form.slug),
      tags: parseTags(tagsInput),
      status: nextStatus,
    };

    try {
      const url = isEdit ? `/api/posts/${post!.id}` : "/api/posts";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as Post & { error?: string };

      if (!res.ok) {
        throw new Error(data.error ?? "저장 실패");
      }

      if (!data.id || !data.slug) {
        throw new Error("저장 응답에 id 또는 slug가 없습니다.");
      }

      if (nextStatus === "published") {
        setMessage("발행되었습니다. 글 페이지로 이동합니다.");
        router.replace(`/posts/${data.slug}`);
        return;
      }

      if (!isEdit) {
        router.replace(`/admin/posts/${data.id}/edit`);
        return;
      }

      setMessage("저장되었습니다.");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "저장 중 오류");
    } finally {
      setSaving(false);
    }
  };

  const runDraft = async () => {
    if (!brief.trim()) {
      setMessage("AI 초안 생성을 위해 어떤 글을 쓸지 설명해 주세요.");
      return;
    }

    const contentIsEmpty = isEmptyContent(form.content);
    resetAiState();
    setDraftLoading(true);
    setMessage("");

    let streamedBody = "";

    try {
      const response = await fetch("/api/ai/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief,
          template: draftTemplate,
          context: {
            title: form.title,
            category: form.category,
            existingContent: contentIsEmpty ? undefined : form.content,
          },
        }),
      });

      if (!response.ok) {
        const err = (await response.json()) as { error?: string };
        throw new Error(err.error ?? "AI 초안 생성 실패");
      }

      await consumeAiStream(response, {
        onDelta: (delta) => {
          if (contentIsEmpty) {
            streamedBody += delta;
            update({ content: streamedBody });
          } else {
            setDraftStream((prev) => prev + delta);
          }
        },
        onDone: (payload) => {
          const content = payload.content ?? "";
          applyAiMeta(payload, update, setTagsInput, form.title);

          if (contentIsEmpty) {
            update({ content });
            setMessage(
              "AI 초안이 생성되었습니다. 사실 관계를 확인한 뒤 발행해 주세요."
            );
          } else {
            setDraftResult(content);
            setDraftStream("");
            setShowDraftDiff(true);
            setMessage(
              "AI 초안이 생성되었습니다. Diff를 확인하고 적용해 주세요."
            );
          }
        },
      });
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "AI 초안 생성 중 오류");
    } finally {
      setDraftLoading(false);
    }
  };

  const applyDraft = () => {
    if (!draftResult) return;
    update({ content: draftResult });
    setDraftResult("");
    setShowDraftDiff(false);
    setMessage("AI 초안이 본문에 적용되었습니다.");
  };

  const runOptimize = async () => {
    if (!form.content.trim()) return;

    resetAiState();
    setOptimizeLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/ai/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: form.content }),
      });

      if (!response.ok) {
        const err = (await response.json()) as { error?: string };
        throw new Error(err.error ?? "AI 최적화 실패");
      }

      await consumeAiStream(response, {
        onDelta: (delta) => setOptimizeStream((prev) => prev + delta),
        onDone: (payload) => {
          const content = payload.optimized ?? payload.content ?? "";
          setOptimizeResult(content);
          setOptimizeStream("");
          setShowOptimizeDiff(true);
          applyAiMeta(payload, update, setTagsInput, form.title);
        },
      });
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "AI 최적화 중 오류");
    } finally {
      setOptimizeLoading(false);
    }
  };

  const applyOptimized = () => {
    if (!optimizeResult) return;
    update({ content: optimizeResult });
    setOptimizeResult("");
    setShowOptimizeDiff(false);
    setMessage("교정본이 적용되었습니다.");
  };

  return (
    <div className="space-y-6">
      <Card className="grid gap-4 p-5 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">제목</label>
          <Input
            className="mt-1"
            value={form.title}
            onChange={(e) => update({ title: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Slug (URL)</label>
          <Input
            className="mt-1 font-mono"
            value={form.slug}
            onChange={(e) => update({ slug: e.target.value })}
            disabled={isEdit}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium">요약 (SEO)</label>
          <Input
            className="mt-1"
            value={form.description}
            onChange={(e) => update({ description: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">카테고리</label>
          <Input
            className="mt-1"
            value={form.category}
            onChange={(e) => update({ category: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">태그 (쉼표 구분)</label>
          <Input
            className="mt-1"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => update({ featured: e.target.checked })}
          />
          Featured (메인 Hero)
        </label>
      </Card>

      <Card className="overflow-hidden">
        <button
          type="button"
          className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-muted/40"
          onClick={() => setDraftPanelOpen((v) => !v)}
        >
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" />
            <span className="font-semibold">AI 초안 생성</span>
          </div>
          {draftPanelOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {draftPanelOpen && (
          <div className="space-y-4 border-t border-border px-5 pb-5 pt-4">
            <p className="text-sm text-muted-foreground">
              어떤 글을 쓸지 말로 설명하면 Tech-Log 형식의 마크다운 초안을
              생성합니다. 생성된 내용은 사실 확인 후 발행해 주세요.
            </p>
            <Textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="예: Supabase로 블로그 DB를 구축하면서 RLS와 조회수 API를 설계한 과정. Redis 대신 Postgres를 선택한 이유도 포함."
              className="min-h-[120px] text-sm"
              disabled={isAiBusy}
            />
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm font-medium">템플릿</label>
              <select
                value={draftTemplate}
                onChange={(e) =>
                  setDraftTemplate(e.target.value as DraftTemplate)
                }
                disabled={isAiBusy}
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
              >
                <option value="tech-log">Tech-Log 5단계</option>
                <option value="free">자유 형식</option>
              </select>
              <Button
                onClick={runDraft}
                disabled={isAiBusy || !brief.trim()}
                className="ml-auto"
              >
                <Wand2 className="h-4 w-4" />
                {draftLoading ? "초안 생성 중..." : "AI 초안 생성"}
              </Button>
            </div>
          </div>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">마크다운 본문</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => update({ content: DEFAULT_TEMPLATE })}
              disabled={isAiBusy}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          <Textarea
            value={form.content}
            onChange={(e) => update({ content: e.target.value })}
            readOnly={isAiBusy}
            className="min-h-[420px] font-mono text-sm"
          />
          <Button
            className="mt-4 w-full"
            variant="outline"
            onClick={runOptimize}
            disabled={isAiBusy || !form.content.trim()}
          >
            <Sparkles className="h-4 w-4" />
            {optimizeLoading ? "AI 최적화 중..." : "AI 가독성 최적화"}
          </Button>
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 font-semibold">미리보기</h2>
          <MarkdownPreview source={preview} />

          {showDraftDiff && draftResult && (
            <div className="mt-4 space-y-3">
              <p className="text-sm font-medium text-primary">AI 초안 Diff</p>
              <DiffViewer oldValue={form.content} newValue={draftResult} />
              <Button className="w-full" onClick={applyDraft}>
                <Check className="h-4 w-4" />
                초안 적용
              </Button>
            </div>
          )}

          {showOptimizeDiff && optimizeResult && (
            <div className="mt-4 space-y-3">
              <p className="text-sm font-medium text-primary">가독성 최적화 Diff</p>
              <DiffViewer oldValue={form.content} newValue={optimizeResult} />
              <Button
                className="w-full"
                variant="outline"
                onClick={applyOptimized}
              >
                <Check className="h-4 w-4" />
                교정본 적용
              </Button>
            </div>
          )}
        </Card>
      </div>

      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={() => save("draft")}
          disabled={saving || isAiBusy}
          variant="outline"
        >
          <Save className="h-4 w-4" />
          초안 저장
        </Button>
        <Button onClick={() => save("published")} disabled={saving || isAiBusy}>
          <Send className="h-4 w-4" />
          발행하기
        </Button>
        {isEdit && post?.id && (
          <DeletePostButton
            id={post.id}
            title={form.title || post.title}
            className="ml-auto"
          />
        )}
      </div>
    </div>
  );
}
