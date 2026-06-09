import { getDraftTemplateLabel, type DraftTemplate } from "@/lib/ai/prompts";

export const EDITOR_STEPS = [
  { id: 1, label: "AI 브리프", hint: "초안 생성" },
  { id: 2, label: "본문 편집", hint: "마크다운·미리보기" },
  { id: 3, label: "검토·발행", hint: "기본 정보·URL" },
] as const;

export type EditorStepId = (typeof EDITOR_STEPS)[number]["id"];

export const LAST_EDITOR_STEP = EDITOR_STEPS[EDITOR_STEPS.length - 1].id;

/** 2단계 본문·미리보기 패널 높이 (툴바·단계 nav 제외) */
export const EDITOR_CONTENT_MIN_HEIGHT = "min-h-[calc(100vh-12rem)]";
export const EDITOR_PREVIEW_MAX_HEIGHT = "max-h-[calc(100vh-12rem)]";

/** 1·3단계 기본, 2단계 본문 편집용 넓은 레이아웃 */
export const EDITOR_LAYOUT_MAX_WIDTH = "max-w-6xl";
export const EDITOR_CONTENT_LAYOUT_MAX_WIDTH = "max-w-[min(100%,90rem)]";

export function getNewPostPageTitle(_template: DraftTemplate = "free") {
  return `새 ${getDraftTemplateLabel()} 작성`;
}

export function getDefaultContentTemplate(_template: DraftTemplate = "free") {
  return "";
}

const PLACEHOLDER_PREFIX = "무제 · ";

export function createPlaceholderTitle() {
  const now = new Date();
  const date = now.toLocaleDateString("ko-KR", {
    month: "numeric",
    day: "numeric",
  });
  const time = now.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${PLACEHOLDER_PREFIX}${date} ${time}`;
}

export function isPlaceholderTitle(title: string) {
  return title.trim().startsWith(PLACEHOLDER_PREFIX);
}

export function hasAutosaveContent(
  brief: string,
  content: string,
  _template: DraftTemplate = "free",
  briefIsPristine: boolean
) {
  const hasContent = Boolean(content.trim());
  return hasContent || (brief.trim() && !briefIsPristine);
}
