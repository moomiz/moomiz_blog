const SYSTEM_PROMPT = `당신은 시니어 프론트엔드 엔지니어이자 기술 블로그 스타 편집자입니다.

다음 규칙으로 마크다운 초안을 교정하세요:
- 기술적 본질과 코드는 훼손하지 않습니다.
- 간결한 명조체(~합니다)로 변환합니다.
- 문단은 4줄을 넘지 않도록 나눕니다.
- 핵심 키워드는 **bold** 처리합니다.
- 구조화가 필요한 부분은 bullet point(*)로 정리합니다.

응답 형식:
1) 먼저 교정된 마크다운 본문만 출력합니다.
2) 마지막에 아래 구분선과 메타데이터를 추가합니다.

---
DESCRIPTION: (2줄 요약)
TAGS: tag1, tag2, tag3`;

function parseOptimizedResponse(text: string) {
  const marker = "\n---\n";
  const markerIndex = text.lastIndexOf(marker);

  if (markerIndex === -1) {
    return {
      optimized: text.trim(),
      description: "",
      tags: [] as string[],
    };
  }

  const optimized = text.slice(0, markerIndex).trim();
  const metaBlock = text.slice(markerIndex + marker.length).trim();
  const descriptionMatch = metaBlock.match(/DESCRIPTION:\s*([\s\S]*?)(?:\nTAGS:|$)/);
  const tagsMatch = metaBlock.match(/TAGS:\s*(.+)/);

  return {
    optimized,
    description: descriptionMatch?.[1]?.trim() ?? "",
    tags:
      tagsMatch?.[1]
        ?.split(",")
        .map((tag) => tag.trim())
        .filter(Boolean) ?? [],
  };
}

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

  return {
    optimized,
    description: `${plain.slice(0, 70)}...\n기술적 본질을 유지한 AI 가독성 최적화 초안입니다.`,
    tags: ["AI-Collaboration", "Tech-Log", "Frontend"],
  };
}

export async function POST(request: Request) {
  const { content } = (await request.json()) as { content?: string };

  if (!content?.trim()) {
    return new Response(JSON.stringify({ error: "content is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    const result = mockOptimize(content);
    return Response.json(result);
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      stream: true,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content },
      ],
      temperature: 0.4,
    }),
  });

  if (!response.ok || !response.body) {
    const result = mockOptimize(content);
    return Response.json(result);
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let fullText = "";

  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body!.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.startsWith("data: "));

        for (const line of lines) {
          const payload = line.replace("data: ", "").trim();
          if (payload === "[DONE]") continue;

          try {
            const parsed = JSON.parse(payload) as {
              choices?: Array<{ delta?: { content?: string } }>;
            };
            const delta = parsed.choices?.[0]?.delta?.content ?? "";
            if (delta) {
              fullText += delta;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "delta", delta })}\n\n`)
              );
            }
          } catch {
            // ignore malformed SSE chunks
          }
        }
      }

      const parsed = parseOptimizedResponse(fullText);
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "done", ...parsed })}\n\n`)
      );
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
