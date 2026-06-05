export type AiMetaResult = {
  body: string;
  title: string;
  description: string;
  tags: string[];
};

export function parseAiMetaBlock(text: string): AiMetaResult {
  const marker = "\n---\n";
  const markerIndex = text.lastIndexOf(marker);

  if (markerIndex === -1) {
    return {
      body: text.trim(),
      title: "",
      description: "",
      tags: [],
    };
  }

  const body = text.slice(0, markerIndex).trim();
  const metaBlock = text.slice(markerIndex + marker.length).trim();

  const titleMatch = metaBlock.match(/TITLE:\s*([\s\S]*?)(?:\nDESCRIPTION:|$)/);
  const descriptionMatch = metaBlock.match(
    /DESCRIPTION:\s*([\s\S]*?)(?:\nTAGS:|$)/
  );
  const tagsMatch = metaBlock.match(/TAGS:\s*(.+)/);

  return {
    body,
    title: titleMatch?.[1]?.trim() ?? "",
    description: descriptionMatch?.[1]?.trim() ?? "",
    tags:
      tagsMatch?.[1]
        ?.split(",")
        .map((tag) => tag.trim())
        .filter(Boolean) ?? [],
  };
}
