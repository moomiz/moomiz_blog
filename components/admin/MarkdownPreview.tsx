"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PromptBlock } from "@/components/mdx/PromptBlock";
import { ResponseBlock } from "@/components/mdx/ResponseBlock";
import { MermaidDiagram } from "@/components/mdx/MermaidDiagram";
import {
  EDITOR_CONTENT_MIN_HEIGHT,
  EDITOR_PREVIEW_MAX_HEIGHT,
} from "@/lib/admin/editor-steps";
import { splitMarkdownSegments } from "@/lib/mdx/splitMarkdown";
import { cn } from "@/lib/utils";

function MarkdownBody({ content }: { content: string }) {
  if (!content.trim()) return null;

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
  );
}

type MarkdownPreviewProps = {
  source: string;
  className?: string;
};

export function MarkdownPreview({ source, className }: MarkdownPreviewProps) {
  const segments = splitMarkdownSegments(source);

  return (
    <div
      className={cn(
        "prose-blog overflow-y-auto rounded-lg border border-border bg-muted/30 p-4",
        EDITOR_CONTENT_MIN_HEIGHT,
        EDITOR_PREVIEW_MAX_HEIGHT,
        className
      )}
    >
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

        if (segment.type === "mermaid") {
          return <MermaidDiagram key={index} chart={segment.content} />;
        }

        return <MarkdownBody key={index} content={segment.content} />;
      })}
    </div>
  );
}
