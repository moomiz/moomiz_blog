import type { AiMetaResult } from "./parseMeta";

/** 개발 시 `npm run dev` 터미널에 AI 생성 결과 출력 */
export function logAiOutput(label: string, result: AiMetaResult) {
  if (process.env.NODE_ENV === "production") return;

  const divider = "─".repeat(56);
  const lines = [
    "",
    `╔${"═".repeat(54)}╗`,
    `║  AI ${label.padEnd(50)}║`,
    `╚${"═".repeat(54)}╝`,
  ];

  if (result.title) lines.push(`TITLE: ${result.title}`);
  if (result.description) lines.push(`DESCRIPTION: ${result.description}`);
  if (result.tags?.length) lines.push(`TAGS: ${result.tags.join(", ")}`);

  lines.push(divider, result.body, divider, "");

  console.log(lines.join("\n"));
}
