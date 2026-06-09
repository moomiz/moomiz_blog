import { parseAiMetaBlock, type AiMetaResult } from "./parseMeta";

export const DEFAULT_OPENAI_MODEL = "gpt-5.4-mini";

export function getOpenAIModel() {
  return process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL;
}

type StreamHandlers = {
  onDelta: (delta: string) => void;
  onDone: (result: AiMetaResult) => void;
};

export async function streamOpenAIChat(
  systemPrompt: string,
  userPrompt: string,
  handlers: StreamHandlers,
  temperature = 0.5
) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: getOpenAIModel(),
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature,
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error("OpenAI request failed");
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let fullText = "";
  let sseLineBuffer = "";

  const processSseLine = (line: string, controller: ReadableStreamDefaultController) => {
    if (!line.startsWith("data: ")) return;

    const payload = line.slice("data: ".length).trim();
    if (!payload || payload === "[DONE]") return;

    try {
      const parsed = JSON.parse(payload) as {
        choices?: Array<{ delta?: { content?: string } }>;
      };
      const delta = parsed.choices?.[0]?.delta?.content ?? "";
      if (!delta) return;

      fullText += delta;
      handlers.onDelta(delta);
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ type: "delta", delta })}\n\n`
        )
      );
    } catch {
      // ignore malformed SSE JSON
    }
  };

  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body!.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          sseLineBuffer += decoder.decode(value, { stream: true });
          const lines = sseLineBuffer.split("\n");
          sseLineBuffer = lines.pop() ?? "";

          for (const line of lines) {
            processSseLine(line, controller);
          }
        }

        sseLineBuffer += decoder.decode();
        if (sseLineBuffer.trim()) {
          processSseLine(sseLineBuffer, controller);
        }

        const result = parseAiMetaBlock(fullText);
        handlers.onDone(result);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "done",
              content: result.body,
              title: result.title,
              description: result.description,
              tags: result.tags,
            })}\n\n`
          )
        );
        controller.close();
      } catch (error) {
        controller.error(error);
      }
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

export function jsonAiResult(
  result: AiMetaResult,
  contentKey: "content" | "optimized" = "content"
) {
  return Response.json({
    [contentKey]: result.body,
    title: result.title,
    description: result.description,
    tags: result.tags,
  });
}
