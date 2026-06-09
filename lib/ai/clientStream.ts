export type AiDonePayload = {
  type: "done";
  content?: string;
  optimized?: string;
  title?: string;
  description: string;
  tags: string[];
};

export type AiDeltaPayload = {
  type: "delta";
  delta: string;
};

export async function consumeAiStream(
  response: Response,
  handlers: {
    onDelta: (delta: string) => void;
    onDone: (payload: AiDonePayload) => void;
  }
) {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("text/event-stream") || !response.body) {
    const data = (await response.json()) as AiDonePayload & {
      optimized?: string;
      content?: string;
    };
    handlers.onDone({
      type: "done",
      content: data.content,
      optimized: data.optimized,
      title: data.title,
      description: data.description,
      tags: data.tags,
    });
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const event of events) {
      const line = event.replace(/^data: /, "").trim();
      if (!line) continue;

      const payload = JSON.parse(line) as AiDeltaPayload | AiDonePayload;
      if (payload.type === "delta") {
        handlers.onDelta(payload.delta);
      }
      if (payload.type === "done") {
        handlers.onDone(payload);
      }
    }
  }

  buffer += decoder.decode();
  if (buffer.trim()) {
    const line = buffer.replace(/^data: /, "").trim();
    if (line) {
      const payload = JSON.parse(line) as AiDeltaPayload | AiDonePayload;
      if (payload.type === "delta") {
        handlers.onDelta(payload.delta);
      }
      if (payload.type === "done") {
        handlers.onDone(payload);
      }
    }
  }
}
