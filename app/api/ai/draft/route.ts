import { parseAiMetaBlock } from "@/lib/ai/parseMeta";
import {
  buildDraftSystemPrompt,
  buildDraftUserPrompt,
  getDraftTemperature,
  parseDraftTemplate,
} from "@/lib/ai/prompts";
import { logAiOutput } from "@/lib/ai/logAiOutput";
import { jsonAiResult, streamOpenAIChat } from "@/lib/ai/openaiStream";

function mockDraft(brief: string, category?: string) {
  const title = brief.slice(0, 40).trim() || "새 글";

  return parseAiMetaBlock(
    `## 개요

${brief.trim()}

## 핵심 내용

* 첫 번째 포인트
* 두 번째 포인트

## 마무리

추가로 검증할 내용을 여기에 정리합니다.

---
TITLE: ${title}
DESCRIPTION: ${brief.slice(0, 80)}...
TAGS: Blog, ${category || "General"}, Draft`
  );
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    brief?: string;
    template?: string;
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

  const template = parseDraftTemplate(body.template);
  const userPrompt = buildDraftUserPrompt(brief, body.context, template);

  if (!process.env.OPENAI_API_KEY) {
    const result = mockDraft(brief, body.context?.category);
    logAiOutput("초안 (mock)", result);
    return jsonAiResult(result, "content");
  }

  try {
    return await streamOpenAIChat(
      buildDraftSystemPrompt(template),
      userPrompt,
      {
        onDelta: () => undefined,
        onDone: (result) => logAiOutput("초안", result),
      },
      getDraftTemperature(template)
    );
  } catch {
    const result = mockDraft(brief, body.context?.category);
    logAiOutput("초안 (fallback mock)", result);
    return jsonAiResult(result, "content");
  }
}
