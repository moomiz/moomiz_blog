import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Save,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui";
import { LAST_EDITOR_STEP, type EditorStepId } from "@/lib/admin/editor-steps";

type PostEditorToolbarProps = {
  title: string;
  step: EditorStepId;
  lastSavedLabel?: string;
  saving: boolean;
  isAiBusy: boolean;
  onSaveDraft: () => void;
  onPrev: () => void;
  onNext: () => void;
  onPublish: () => void;
  canGoNext: boolean;
};

export function PostEditorToolbar({
  title,
  step,
  lastSavedLabel,
  saving,
  isAiBusy,
  onSaveDraft,
  onPrev,
  onNext,
  onPublish,
  canGoNext,
}: PostEditorToolbarProps) {
  const isLastStep = step === LAST_EDITOR_STEP;

  return (
    <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/admin/posts"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">글 목록</span>
        </Link>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {title.trim() || "제목 없음"}
          </p>
        </div>

        {saving ? (
          <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            저장 중…
          </span>
        ) : lastSavedLabel ? (
          <span className="hidden text-xs text-muted-foreground sm:inline">
            저장됨 · {lastSavedLabel}
          </span>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onPrev}
              disabled={saving || isAiBusy}
            >
              <ArrowLeft className="h-4 w-4" />
              이전
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSaveDraft}
            disabled={saving || isAiBusy}
          >
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">초안 저장</span>
            <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] font-normal text-muted-foreground lg:inline">
              ⌘S
            </kbd>
          </Button>

          {isLastStep ? (
            <Button
              type="button"
              size="sm"
              onClick={onPublish}
              disabled={saving || isAiBusy}
            >
              <Send className="h-4 w-4" />
              발행하기
              <kbd className="hidden rounded border border-primary-foreground/30 px-1.5 py-0.5 text-[10px] font-normal opacity-80 lg:inline">
                ⌘↵
              </kbd>
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={onNext}
              disabled={!canGoNext || saving || isAiBusy}
            >
              다음
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
