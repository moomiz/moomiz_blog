export type MdxSegment = {
  type: "md" | "prompt" | "response";
  content: string;
};

export function parseMdxSegments(source: string): MdxSegment[] {
  const segments: MdxSegment[] = [];
  const regex = /<(Prompt|Response)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(source)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: "md",
        content: source.slice(lastIndex, match.index),
      });
    }

    segments.push({
      type: match[1].toLowerCase() as "prompt" | "response",
      content: match[2].trim(),
    });

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < source.length) {
    segments.push({ type: "md", content: source.slice(lastIndex) });
  }

  if (segments.length === 0) {
    segments.push({ type: "md", content: source });
  }

  return segments;
}
