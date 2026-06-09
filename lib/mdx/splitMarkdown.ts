export type MarkdownSegment =
  | { type: "markdown"; content: string }
  | { type: "mermaid"; content: string }
  | { type: "prompt"; content: string }
  | { type: "response"; content: string };

const MERMAID_FENCE = /^```mermaid\s*\n([\s\S]*?)```/gm;

export function splitMarkdownSegments(source: string): MarkdownSegment[] {
  const promptSegments = parseMdxSegments(source);
  const output: MarkdownSegment[] = [];

  for (const segment of promptSegments) {
    if (segment.type === "prompt" || segment.type === "response") {
      output.push(segment);
      continue;
    }

    let lastIndex = 0;
    const text = segment.content;
    MERMAID_FENCE.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = MERMAID_FENCE.exec(text)) !== null) {
      const before = text.slice(lastIndex, match.index);
      if (before.trim()) {
        output.push({ type: "markdown", content: before });
      }
      output.push({ type: "mermaid", content: match[1].trim() });
      lastIndex = match.index + match[0].length;
    }

    const tail = text.slice(lastIndex);
    if (tail.trim()) {
      output.push({ type: "markdown", content: tail });
    }
  }

  return output.length > 0 ? output : [{ type: "markdown", content: source }];
}

/** Prompt/Response XML-style blocks (existing behavior) */
export function parseMdxSegments(source: string) {
  const segments: MarkdownSegment[] = [];
  const pattern = /<(Prompt|Response)>([\s\S]*?)<\/\1>/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(source)) !== null) {
    const before = source.slice(lastIndex, match.index);
    if (before.trim()) {
      segments.push({ type: "markdown", content: before });
    }
    const tag = match[1].toLowerCase();
    segments.push({
      type: tag === "prompt" ? "prompt" : "response",
      content: match[2].trim(),
    });
    lastIndex = match.index + match[0].length;
  }

  const tail = source.slice(lastIndex);
  if (tail.trim() || segments.length === 0) {
    segments.push({ type: "markdown", content: tail });
  }

  return segments;
}
