import { parseAiMetaBlock } from "@/lib/ai/parseMeta";
import {
  buildDraftSystemPrompt,
  buildDraftUserPrompt,
  type DraftTemplate,
} from "@/lib/ai/prompts";
import { jsonAiResult, streamOpenAIChat } from "@/lib/ai/openaiStream";

function mockDraft(
  brief: string,
  template: DraftTemplate,
  category?: string
) {
  const title = brief.slice(0, 40).trim() || "새 Tech-Log";
  const promptExample = brief.slice(0, 120).trim();

  const body =
    template === "tech-log"
      ? `## 1. 배경 및 문제 정의 (Context)

${brief.trim()}

핵심 과제를 정의하고, 왜 이 문제를 해결해야 하는지 설명합니다.

## 2. 가설 수립 및 AI 프롬프팅 (Thinking & Prompting)

<Prompt>
${promptExample || "이 문제를 해결하기 위한 접근 방향을 제안해줘"}
</Prompt>

## 3. AI의 제안과 엔지니어의 비판적 검토 (Collaboration)

<Response>
AI가 제안한 방향 중 일부는 채택하고, 프로젝트 맥락에 맞지 않는 부분은 수정합니다.
</Response>

* **채택:** [측정 예정]
* **거절/수정:** [측정 예정]

## 4. 구현 및 결과 (Implementation & Metrics)

\`\`\`tsx
// 핵심 구현 스니펫을 여기에 추가합니다.
\`\`\`

## 5. 회고 및 AI 협업 레슨 (Takeaway)

이번 작업을 통해 AI와 협업할 때 **프롬프트에 제약 조건을 먼저 주는 것**이 중요함을 확인했습니다.`
      : `## 개요

${brief.trim()}

## 핵심 내용

* 첫 번째 포인트
* 두 번째 포인트

## 마무리

추가로 검증할 내용을 여기에 정리합니다.`;

  return parseAiMetaBlock(
    `${body}

---
TITLE: ${title}
DESCRIPTION: ${brief.slice(0, 80)}...
TAGS: AI-Collaboration, ${category || "Tech-Log"}, Draft`
  );
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    brief?: string;
    template?: DraftTemplate;
    context?: {
      title?: string;
      category?: string;
      existingContent?: string;
    };
  };

  const brief = body.brief?.trim();
  if (!brief) {
    return Response.json({ error: "brief is required" }, { status: 400 });
  }

  const template: DraftTemplate =
    body.template === "free" ? "free" : "tech-log";
  const userPrompt = buildDraftUserPrompt(brief, body.context);

  if (!process.env.OPENAI_API_KEY) {
    const result = mockDraft(brief, template, body.context?.category);
    return jsonAiResult(result, "content");
  }

  try {
    return await streamOpenAIChat(
      buildDraftSystemPrompt(template),
      userPrompt,
      {
        onDelta: () => undefined,
        onDone: () => undefined,
      },
      0.6
    );
  } catch {
    const result = mockDraft(brief, template, body.context?.category);
    return jsonAiResult(result, "content");
  }
}
