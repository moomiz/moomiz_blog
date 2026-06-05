"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PromptBlock } from "@/components/mdx/PromptBlock";
import { ResponseBlock } from "@/components/mdx/ResponseBlock";
import { parseMdxSegments } from "@/lib/mdx/parseSegments";

function MarkdownBody({ content }: { content: string }) {
  if (!content.trim()) return null;

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
  );
}

export function MarkdownPreview({ source }: { source: string }) {
  const segments = parseMdxSegments(source);

  return (
    <div className="prose-blog min-h-[420px] rounded-lg border border-border bg-muted/30 p-4">
      {segments.map((segment, index) => {
        if (segment.type === "prompt") {
          return (
            <PromptBlock key={index}>
              <MarkdownBody content={segment.content} />
            </PromptBlock>
          );
        }

        if (segment.type === "response") {
          return (
            <ResponseBlock key={index}>
              <MarkdownBody content={segment.content} />
            </ResponseBlock>
          );
        }

        return <MarkdownBody key={index} content={segment.content} />;
      })}
    </div>
  );
}
