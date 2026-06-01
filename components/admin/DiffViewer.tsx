"use client";

import { cn } from "@/lib/utils";

type DiffViewerProps = {
  oldValue: string;
  newValue: string;
};

type DiffLine = {
  type: "same" | "add" | "remove";
  value: string;
};

function buildLineDiff(oldValue: string, newValue: string): DiffLine[] {
  const oldLines = oldValue.split("\n");
  const newLines = newValue.split("\n");
  const max = Math.max(oldLines.length, newLines.length);
  const result: DiffLine[] = [];

  for (let i = 0; i < max; i += 1) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];

    if (oldLine === newLine) {
      if (oldLine !== undefined) result.push({ type: "same", value: oldLine });
      continue;
    }

    if (oldLine !== undefined) result.push({ type: "remove", value: oldLine });
    if (newLine !== undefined) result.push({ type: "add", value: newLine });
  }

  return result;
}

export function DiffViewer({ oldValue, newValue }: DiffViewerProps) {
  const lines = buildLineDiff(oldValue, newValue);

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="border-b border-border bg-muted/50 px-4 py-2 text-sm font-medium">
        Diff View — 원문 vs 교정본
      </div>
      <pre className="max-h-[420px] overflow-auto p-0 text-xs leading-6">
        {lines.map((line, index) => (
          <div
            key={`${index}-${line.type}`}
            className={cn(
              "px-4 font-mono",
              line.type === "add" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
              line.type === "remove" && "bg-rose-500/10 text-rose-700 dark:text-rose-300",
              line.type === "same" && "text-muted-foreground"
            )}
          >
            <span className="mr-3 inline-block w-4 select-none opacity-60">
              {line.type === "add" ? "+" : line.type === "remove" ? "-" : " "}
            </span>
            {line.value || " "}
          </div>
        ))}
      </pre>
    </div>
  );
}
