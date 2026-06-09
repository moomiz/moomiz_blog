"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Check,
  RotateCcw,
  Wand2,
  ExternalLink,
} from "lucide-react";
import { Button, Textarea, Card, Input } from "@/components/ui";
import { CategorySelect } from "@/components/admin/CategorySelect";
import { DiffViewer } from "@/components/admin/DiffViewer";
import { DeletePostButton } from "@/components/admin/DeletePostButton";
import {
  EditorStatusBanner,
  type EditorBanner,
} from "@/components/admin/EditorStatusBanner";
import { EditorStepNav } from "@/components/admin/EditorStepNav";
import { MarkdownPreview } from "@/components/admin/MarkdownPreview";
import { PostEditorToolbar } from "@/components/admin/PostEditorToolbar";
import { BriefForm } from "@/components/admin/BriefForm";
import { consumeAiStream, type AiDonePayload } from "@/lib/ai/clientStream";
import {
  getEmptyBriefValues,
  hasRequiredBriefFields,
  isBriefEmpty,
  serializeBrief,
  type BriefValues,
} from "@/lib/ai/brief-fields";
import type { DraftTemplate } from "@/lib/ai/prompts";
import {
  EDITOR_STEPS,
  LAST_EDITOR_STEP,
  createPlaceholderTitle,
  EDITOR_CONTENT_LAYOUT_MAX_WIDTH,
  EDITOR_CONTENT_MIN_HEIGHT,
  EDITOR_LAYOUT_MAX_WIDTH,
  getDefaultContentTemplate,
  getNewPostPageTitle,
  hasAutosaveContent,
  isPlaceholderTitle,
  type EditorStepId,
} from "@/lib/admin/editor-steps";
import type { Post, PostInput, PostStatus } from "@/lib/types/post";
import { cn, slugify } from "@/lib/utils";

const DRAFT_TEMPLATE: DraftTemplate = "free";

type PostEditorProps = {
  post?: Post;
  categories?: string[];
};

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
  return !content.trim();
}

function buildSlug(title: string, manualSlug: string) {
  const trimmed = manualSlug.trim();
  if (trimmed) return trimmed;
  const fromTitle = slugify(title);
  return fromTitle || `post-${Date.now()}`;
}

function applyAiMeta(
  payload: AiDonePayload,
  update: (patch: Partial<PostInput>) => void,
  setTagsInput: (value: string) => void,
  currentTitle: string
) {
  const hasRealTitle =
    currentTitle.trim() && !isPlaceholderTitle(currentTitle);

  if (payload.title?.trim() && !hasRealTitle) {
    update({ title: payload.title.trim() });
  }
  if (payload.description?.trim()) {
    update({ description: payload.description.trim() });
  }
  if (payload.tags?.length) {
    setTagsInput(payload.tags.join(", "));
  }
}

function formatSavedTime(date: Date) {
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getToolbarTitle(formTitle: string, pageTitle: string) {
  if (formTitle.trim() && !isPlaceholderTitle(formTitle)) {
    return formTitle;
  }
  return pageTitle;
}

export function PostEditor({ post, categories = [] }: PostEditorProps) {
  const router = useRouter();
  const isEdit = Boolean(post?.id);
  const [postId, setPostId] = useState<string | undefined>(post?.id);

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
      : {
          ...emptyInput,
          content: getDefaultContentTemplate(DRAFT_TEMPLATE),
        }
  );

  const [tagsInput, setTagsInput] = useState(
    () => post?.tags.join(", ") ?? ""
  );
  const [briefValues, setBriefValues] = useState<BriefValues>(() =>
    getEmptyBriefValues(DRAFT_TEMPLATE)
  );

  const briefText = useMemo(
    () => serializeBrief(DRAFT_TEMPLATE, briefValues),
    [briefValues]
  );
  const briefIsEmpty = isBriefEmpty(DRAFT_TEMPLATE, briefValues);
  const briefIsReady = hasRequiredBriefFields(DRAFT_TEMPLATE, briefValues);
  const hasBriefProgress = !briefIsEmpty;

  const hasContent = Boolean(post?.content?.trim());
  const [step, setStep] = useState<EditorStepId>(() => (hasContent ? 2 : 1));
  const [maxReachedStep, setMaxReachedStep] = useState<EditorStepId>(() =>
    hasContent ? LAST_EDITOR_STEP : 1
  );
  const [aiMetaSuggested, setAiMetaSuggested] = useState(false);

  const [draftLoading, setDraftLoading] = useState(false);
  const [optimizeLoading, setOptimizeLoading] = useState(false);
  const [draftStream, setDraftStream] = useState("");
  const [optimizeStream, setOptimizeStream] = useState("");
  const [draftResult, setDraftResult] = useState("");
  const [optimizeResult, setOptimizeResult] = useState("");
  const [showDraftDiff, setShowDraftDiff] = useState(false);
  const [showOptimizeDiff, setShowOptimizeDiff] = useState(false);

  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [banner, setBanner] = useState<EditorBanner | null>(null);

  const saveInFlight = useRef(false);
  const isAiBusy = draftLoading || optimizeLoading;

  const pageTitle = isEdit
    ? "글 편집"
    : getNewPostPageTitle(DRAFT_TEMPLATE);

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

  const suggestedSlug = useMemo(
    () => buildSlug(form.title, form.slug),
    [form.title, form.slug]
  );

  const update = useCallback((patch: Partial<PostInput>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const parseTags = (value: string) =>
    value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

  const resetAiState = () => {
    setDraftStream("");
    setOptimizeStream("");
    setDraftResult("");
    setOptimizeResult("");
    setShowDraftDiff(false);
    setShowOptimizeDiff(false);
  };

  const showBanner = useCallback((next: EditorBanner) => {
    setBanner(next);
  }, []);

  const resolveTitleForSave = useCallback(
    (status: PostStatus) => {
      const trimmed = form.title.trim();
      if (status === "published") {
        return trimmed;
      }
      if (trimmed && !isPlaceholderTitle(trimmed)) {
        return trimmed;
      }
      return trimmed || createPlaceholderTitle();
    },
    [form.title]
  );

  const save = useCallback(
    async (options?: {
      status?: PostStatus;
      navigateOnPublish?: boolean;
    }) => {
      if (saveInFlight.current) return false;

      const nextStatus = options?.status ?? "draft";
      const titleForSave = resolveTitleForSave(nextStatus);

      if (nextStatus === "published") {
        if (!form.title.trim() || isPlaceholderTitle(form.title)) {
          showBanner({ type: "error", message: "제목을 입력해 주세요." });
          return false;
        }
      }

      const canSave =
        Boolean(postId) ||
        hasAutosaveContent(briefText, form.content, DRAFT_TEMPLATE, !hasBriefProgress);

      if (!canSave && !titleForSave.trim()) {
        showBanner({
          type: "error",
          message: "브리프 또는 본문을 작성한 뒤 저장해 주세요.",
        });
        return false;
      }

      const payload: PostInput = {
        ...form,
        title: titleForSave,
        slug: buildSlug(titleForSave, form.slug),
        tags: parseTags(tagsInput),
        status: nextStatus,
      };

      saveInFlight.current = true;
      setSaving(true);
      setBanner(null);

      try {
        const id = postId ?? post?.id;
        const url = id ? `/api/posts/${id}` : "/api/posts";
        const method = id ? "PATCH" : "POST";

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

        if (!postId) {
          setPostId(data.id);
          window.history.replaceState(null, "", `/admin/posts/${data.id}/edit`);
        }

        setForm((prev) => ({
          ...prev,
          slug: data.slug,
          status: (data.status ?? nextStatus) as PostStatus,
        }));

        const savedAt = new Date();
        setLastSavedAt(savedAt);

        if (nextStatus === "published") {
          showBanner({
            type: "success",
            message: "발행되었습니다.",
            href: `/posts/${data.slug}`,
            linkLabel: "공개 글 보기",
          });
          if (options?.navigateOnPublish !== false) {
            router.replace(`/posts/${data.slug}`);
          }
          return true;
        }

        showBanner({
          type: "info",
          message: "초안이 저장되었습니다.",
          href:
            data.status === "published" ? `/posts/${data.slug}` : undefined,
          linkLabel:
            data.status === "published" ? "공개 글 미리보기" : undefined,
        });

        return true;
      } catch (e) {
        const message = e instanceof Error ? e.message : "저장 중 오류";
        showBanner({ type: "error", message });
        return false;
      } finally {
        saveInFlight.current = false;
        setSaving(false);
      }
    },
    [
      form,
      tagsInput,
      post?.id,
      postId,
      router,
      showBanner,
      resolveTitleForSave,
      briefText,
      hasBriefProgress,
    ]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      if (!mod) return;

      if (event.key.toLowerCase() === "s") {
        event.preventDefault();
        void save();
        return;
      }

      if (event.key === "Enter" && step === LAST_EDITOR_STEP) {
        event.preventDefault();
        void save({ status: "published" });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [save, step]);

  const canGoNext = useMemo(() => {
    if (step === 2) return Boolean(form.content.trim());
    return true;
  }, [step, form.content]);

  const goNext = () => {
    if (!canGoNext) {
      if (step === 2) {
        showBanner({ type: "error", message: "본문을 작성해 주세요." });
      }
      return;
    }

    if (step === 2) {
      if (form.title.trim() && !form.slug.trim()) {
        update({ slug: slugify(form.title) });
      }
    }

    const next = Math.min(step + 1, LAST_EDITOR_STEP) as EditorStepId;
    setStep(next);
    setMaxReachedStep(
      (prev) => (next > prev ? next : prev) as EditorStepId
    );
  };

  const goPrev = () => {
    setStep((prev) => Math.max(prev - 1, 1) as EditorStepId);
  };

  const runDraft = async () => {
    if (!briefIsReady) {
      showBanner({
        type: "error",
        message: "필수 브리프 항목을 채운 뒤 AI 초안 생성을 눌러 주세요.",
      });
      return;
    }

    const contentIsEmpty = isEmptyContent(form.content);
    resetAiState();
    setDraftLoading(true);
    setBanner(null);

    let streamedBody = "";

    try {
      const response = await fetch("/api/ai/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief: briefText,
          template: DRAFT_TEMPLATE,
          context: {
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
          const content = payload.content ?? streamedBody;
          const hadMeta =
            Boolean(payload.title?.trim()) ||
            Boolean(payload.description?.trim()) ||
            Boolean(payload.tags?.length);

          applyAiMeta(payload, update, setTagsInput, form.title);

          if (hadMeta) {
            setAiMetaSuggested(true);
          }

          if (contentIsEmpty) {
            update({ content });
            showBanner({
              type: "success",
              message:
                "AI 초안이 생성되었습니다. 본문 편집 단계에서 확인해 주세요.",
            });
            setMaxReachedStep(LAST_EDITOR_STEP);
          } else {
            setDraftResult(content);
            setDraftStream("");
            setShowDraftDiff(true);
            showBanner({
              type: "info",
              message: "AI 초안 Diff를 확인하고 적용해 주세요.",
            });
          }
        },
      });
    } catch (e) {
      showBanner({
        type: "error",
        message: e instanceof Error ? e.message : "AI 초안 생성 중 오류",
      });
    } finally {
      setDraftLoading(false);
    }
  };

  const applyDraft = () => {
    if (!draftResult) return;
    update({ content: draftResult });
    setDraftResult("");
    setShowDraftDiff(false);
    showBanner({
      type: "success",
      message: "AI 초안이 본문에 적용되었습니다.",
    });
  };

  const runOptimize = async () => {
    if (!form.content.trim()) return;

    resetAiState();
    setOptimizeLoading(true);
    setBanner(null);

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
          showBanner({
            type: "info",
            message: "가독성 최적화 Diff를 확인하고 적용해 주세요.",
          });
        },
      });
    } catch (e) {
      showBanner({
        type: "error",
        message: e instanceof Error ? e.message : "AI 최적화 중 오류",
      });
    } finally {
      setOptimizeLoading(false);
    }
  };

  const resetBrief = () => {
    if (!briefIsEmpty && !confirm("작성 중인 브리프를 지우고 양식을 다시 채울까요?")) {
      return;
    }
    setBriefValues(getEmptyBriefValues(DRAFT_TEMPLATE));
    setBanner(null);
  };

  const insertMarkdownSnippet = (snippet: string) => {
    const spacer = form.content.trim() ? "\n\n" : "";
    update({ content: `${form.content}${spacer}${snippet}` });
  };

  const applyOptimized = () => {
    if (!optimizeResult) return;
    update({ content: optimizeResult });
    setOptimizeResult("");
    setShowOptimizeDiff(false);
    showBanner({ type: "success", message: "교정본이 적용되었습니다." });
  };

  return (
    <div className="-mx-4 sm:-mx-6">
      <EditorStatusBanner banner={banner} onDismiss={() => setBanner(null)} />

      <PostEditorToolbar
        title={getToolbarTitle(form.title, pageTitle)}
        step={step}
        lastSavedLabel={lastSavedAt ? formatSavedTime(lastSavedAt) : undefined}
        saving={saving}
        isAiBusy={isAiBusy}
        onSaveDraft={() => void save()}
        onPrev={goPrev}
        onNext={goNext}
        onPublish={() => void save({ status: "published" })}
        canGoNext={canGoNext}
      />

      <div className="border-b border-border px-4 py-3 md:hidden sm:px-6">
        <EditorStepNav
          variant="pills"
          currentStep={step}
          maxReachedStep={maxReachedStep}
          onStepChange={setStep}
        />
      </div>

      <div
        className={cn(
          "mx-auto flex gap-6 px-3 py-8 sm:px-4",
          step === 2 ? EDITOR_CONTENT_LAYOUT_MAX_WIDTH : EDITOR_LAYOUT_MAX_WIDTH
        )}
      >
        <aside
          className={cn(
            "hidden w-52 shrink-0 md:block",
            step === 2 && "md:hidden"
          )}
        >
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            작성 단계
          </p>
          <EditorStepNav
            currentStep={step}
            maxReachedStep={maxReachedStep}
            onStepChange={setStep}
          />
        </aside>

        <div className="min-w-0 flex-1 space-y-6">
          {!isEdit && (
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {pageTitle}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {EDITOR_STEPS[step - 1].label} · {step}/{EDITOR_STEPS.length}
              </p>
            </div>
          )}

          {step === 1 && (
            <Card className="space-y-5 border-border/80 p-6 shadow-none">
              <div>
                <div className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-primary" />
                  <h2 className="text-lg font-semibold">AI 초안 생성</h2>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  브리프부터 작성하세요. 제목·카테고리 등 기본 정보는 마지막
                  발행 단계에서 정리합니다.
                </p>
              </div>

              <BriefForm
                values={briefValues}
                onChange={setBriefValues}
                disabled={isAiBusy}
              />

              <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetBrief}
                  disabled={isAiBusy}
                >
                  <RotateCcw className="h-4 w-4" />
                  브리프 초기화
                </Button>
                <Button
                  onClick={() => void runDraft()}
                  disabled={isAiBusy || !briefIsReady}
                  className="ml-auto w-full sm:w-auto"
                >
                  <Wand2 className="h-4 w-4" />
                  {draftLoading ? "초안 생성 중..." : "AI 초안 생성"}
                </Button>
              </div>

              {showDraftDiff && draftResult && (
                <div className="space-y-3 border-t border-border pt-5">
                  <p className="text-sm font-medium text-primary">AI 초안 Diff</p>
                  <DiffViewer oldValue={form.content} newValue={draftResult} />
                  <Button className="w-full sm:w-auto" onClick={applyDraft}>
                    <Check className="h-4 w-4" />
                    초안 적용
                  </Button>
                </div>
              )}
            </Card>
          )}

          {step === 2 && (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="flex min-w-0 flex-col space-y-4 border-border/80 p-4 shadow-none sm:p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">마크다운 본문</h2>
                  <div className="ml-auto flex flex-wrap gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isAiBusy}
                      onClick={() =>
                        insertMarkdownSnippet(
                          "| 항목 | 내용 |\n|------|------|\n| | |"
                        )
                      }
                    >
                      + 표
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isAiBusy}
                      onClick={() =>
                        insertMarkdownSnippet(
                          "```mermaid\nflowchart TB\n  A[시작] --> B[끝]\n```"
                        )
                      }
                    >
                      + mermaid
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        update({
                          content: getDefaultContentTemplate(DRAFT_TEMPLATE),
                        })
                      }
                      disabled={isAiBusy}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={form.content}
                  onChange={(e) => update({ content: e.target.value })}
                  readOnly={isAiBusy}
                  className={cn(
                    "w-full min-w-0 flex-1 resize-y font-mono text-sm",
                    EDITOR_CONTENT_MIN_HEIGHT
                  )}
                />
              </Card>

              <Card className="flex min-w-0 flex-col space-y-4 border-border/80 p-4 shadow-none sm:p-5">
                <h2 className="font-semibold">미리보기</h2>
                <MarkdownPreview source={preview} className="w-full min-w-0 flex-1" />
              </Card>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              {aiMetaSuggested && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
                  AI가 제안한 제목·요약·태그가 채워졌습니다. 발행 전에 확인하고
                  수정해 주세요.
                </div>
              )}

              <Card className="space-y-5 border-border/80 p-6 shadow-none">
                <div>
                  <h2 className="text-lg font-semibold">기본 정보</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    발행에 필요한 메타 정보를 입력하세요.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">
                      제목 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      className="mt-1.5"
                      value={
                        isPlaceholderTitle(form.title) ? "" : form.title
                      }
                      onChange={(e) => update({ title: e.target.value })}
                      placeholder="글 제목"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">요약 (SEO)</label>
                    <Input
                      className="mt-1.5"
                      value={form.description}
                      onChange={(e) => update({ description: e.target.value })}
                      placeholder="검색·SNS에 노출될 한두 줄 요약"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">카테고리</label>
                      <div className="mt-1.5">
                        <CategorySelect
                          value={form.category}
                          onChange={(category) => update({ category })}
                          categories={categories}
                          disabled={isAiBusy}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        태그 (쉼표 구분)
                      </label>
                      <Input
                        className="mt-1.5"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        placeholder="Frontend, 바이브코딩"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => update({ featured: e.target.checked })}
                    />
                    Featured (메인 Hero)
                  </label>

                  <div>
                    <label className="text-sm font-medium">Slug (URL)</label>
                    <Input
                      className="mt-1.5 font-mono"
                      value={form.slug}
                      onChange={(e) => update({ slug: e.target.value })}
                      disabled={Boolean(isEdit && post?.slug)}
                      placeholder={suggestedSlug}
                    />
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <ExternalLink className="h-3.5 w-3.5" />
                      /posts/{form.slug.trim() || suggestedSlug}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="space-y-4 border-dashed border-primary/30 bg-primary/5 p-6 shadow-none">
                <div>
                  <h3 className="font-semibold">발행 전 가독성 점검</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    문장 톤과 구조를 다듬고 싶다면 AI 가독성 최적화를 실행해
                    보세요. Diff 확인 후 적용할 수 있습니다.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={runOptimize}
                  disabled={isAiBusy || !form.content.trim()}
                >
                  <Sparkles className="h-4 w-4" />
                  {optimizeLoading ? "AI 최적화 중..." : "AI 가독성 최적화"}
                </Button>

                {showOptimizeDiff && optimizeResult && (
                  <div className="space-y-3 border-t border-border/60 pt-4">
                    <p className="text-sm font-medium text-primary">
                      가독성 최적화 Diff
                    </p>
                    <DiffViewer
                      oldValue={form.content}
                      newValue={optimizeResult}
                    />
                    <Button
                      className="w-full sm:w-auto"
                      variant="outline"
                      onClick={applyOptimized}
                    >
                      <Check className="h-4 w-4" />
                      교정본 적용
                    </Button>
                  </div>
                )}
              </Card>

              <Card className="border-border/80 p-5 shadow-none">
                <h3 className="mb-3 font-semibold">본문 미리보기</h3>
                <MarkdownPreview source={form.content} />
              </Card>
            </div>
          )}

          {isEdit && post?.id && step === LAST_EDITOR_STEP && (
            <div className="flex justify-end border-t border-border pt-4">
              <DeletePostButton
                id={post.id}
                title={form.title || post.title}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { getNewPostPageTitle };
