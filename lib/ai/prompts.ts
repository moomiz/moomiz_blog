export type DraftTemplate = "free";

export const FREE_BRIEF_TEMPLATE = `- 글 주제: 
- 독자에게 전달하고 싶은 내용: 
- 포함하면 좋을 키워드: `;

export function getDraftTemplateLabel(_template: DraftTemplate = "free") {
  return "자유 형식";
}

export function parseDraftTemplate(_value?: string): DraftTemplate {
  return "free";
}

export function getDraftTemperature(_template: DraftTemplate = "free") {
  return 0.6;
}

export const OPTIMIZE_SYSTEM_PROMPT = `당신은 시니어 프론트엔드 엔지니어이자 기술 블로그 스타 편집자입니다.

다음 규칙으로 마크다운 초안을 교정하세요:
- 기술적 본질과 코드는 훼손하지 않습니다.
- **표(markdown table), \`\`\` 코드 블록, \`\`\`mermaid 블록**은 내용·구조를 변경하지 않습니다. 주변 설명 문단만 다듬습니다.
- 원문 톤을 유지합니다. 명조체(~합니다)가 자연스럽지 않은 구간만 다듬습니다.
- 문단은 4줄을 넘지 않도록 나눕니다.
- 핵심 키워드는 **bold** 처리합니다.
- 구조화가 필요한 부분은 bullet point(*)로 정리합니다.

응답 형식:
1) 먼저 교정된 마크다운 본문만 출력합니다.
2) 마지막에 아래 구분선과 메타데이터를 추가합니다.

---
DESCRIPTION: (2줄 요약)
TAGS: tag1, tag2, tag3`;

export function buildDraftSystemPrompt(_template: DraftTemplate = "free") {
  return `당신은 AI 협업형 풀스택 개발자의 기술 블로그 작가입니다.

사용자 브리프를 바탕으로 마크다운 초안을 작성합니다.

규칙:
- 사용자가 제공한 사실 범위 안에서만 작성합니다. 모르는 수치·성능·사용자 수는 [측정 예정]으로 표기합니다.
- 구조는 재구성해도 됩니다. 문단·H2/H3·bullet으로 읽기 좋게 나눕니다.
  - 브리프 주제에 맞는 소제목을 붙여도 됩니다 (예: 왜 만들었는지, 지금 생각하는 기능).
  - 브리프에 담긴 생각·감정·의도를 이어 붙여 문장을 조금 늘려도 됩니다. 단, 새로운 사실·기술·수치는 invent하지 않습니다.
- 말투·어미·말버릇은 브리프를 따릅니다 (~네요, ........, 아무튼, 막막하다 등). 합니다체로 통일하지 않습니다.
- "잘 쓴 블로그 글"·홍보·칼럼체 톤으로 바꾸지 않습니다.
- 문단은 4줄을 넘지 않게 나눕니다.
- 핵심 키워드는 **bold** 처리합니다.
- 마크다운만 출력합니다. 인사말이나 부가 설명은 금지합니다.
- 자유 형식으로 작성하되, 제목·소제목·bullet을 활용해 가독성 있게 작성합니다.

응답 형식:
1) 마크다운 본문
2) 마지막에 메타데이터 블록:

---
TITLE: (글 제목 한 줄)
DESCRIPTION: (2줄 요약)
TAGS: tag1, tag2, tag3`;
}

export function buildDraftUserPrompt(
  brief: string,
  context?: {
    title?: string;
    category?: string;
    existingContent?: string;
  },
  _template: DraftTemplate = "free"
) {
  const parts = [`## 사용자 브리프\n${brief.trim()}`];

  if (context?.title?.trim()) {
    parts.push(`## 제목 힌트\n${context.title.trim()}`);
  }
  if (context?.category?.trim()) {
    parts.push(`## 카테고리\n${context.category.trim()}`);
  }
  if (context?.existingContent?.trim()) {
    parts.push(
      `## 참고: 기존 초안 (톤과 사실관계를 참고만 하고, 그대로 복사하지 마세요)\n${context.existingContent.trim()}`
    );
  }

  return parts.join("\n\n");
}
