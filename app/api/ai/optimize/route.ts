import { parseAiMetaBlock } from "@/lib/ai/parseMeta";
import { OPTIMIZE_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { logAiOutput } from "@/lib/ai/logAiOutput";
import { jsonAiResult, streamOpenAIChat } from "@/lib/ai/openaiStream";

function mockOptimize(content: string) {
  const paragraphs = content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      if (p.startsWith("#") || p.startsWith("```") || p.startsWith("<")) {
        return p;
      }
      return p.replace(/\.$/u, "합니다.");
    });

  const optimized = paragraphs.join("\n\n");
  const plain = optimized.replace(/[#*`>\-\n]/g, " ").slice(0, 140);

  return parseAiMetaBlock(
    `${optimized}

---
DESCRIPTION: ${plain.slice(0, 70)}...
TAGS: AI-Collaboration, Tech-Log, Frontend`
  );
}

export async function POST(request: Request) {
  const { content } = (await request.json()) as { content?: string };

  if (!content?.trim()) {
    return Response.json({ error: "content is required" }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    const result = mockOptimize(content);
    logAiOutput("최적화 (mock)", result);
    return Response.json({
      optimized: result.body,
      description: result.description,
      tags: result.tags,
    });
  }

  try {
    const response = await streamOpenAIChat(
      OPTIMIZE_SYSTEM_PROMPT,
      content,
      {
        onDelta: () => undefined,
        onDone: (result) => logAiOutput("최적화", result),
      },
      0.4
    );

    return response;
  } catch {
    const result = mockOptimize(content);
    logAiOutput("최적화 (fallback mock)", result);
    return Response.json({
      optimized: result.body,
      description: result.description,
      tags: result.tags,
    });
  }
}
