import type { DraftTemplate } from "@/lib/ai/prompts";

export type BriefFieldType = "text" | "textarea" | "bullets" | "pairs";

export type BriefFieldDef = {
  id: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  type: BriefFieldType;
  rows?: number;
  minBullets?: number;
  maxBullets?: number;
  pairLabels?: [string, string];
  pairCount?: number;
};

export type BriefSectionDef = {
  title: string;
  optional?: boolean;
  fields: BriefFieldDef[];
};

export type BriefValues = Record<string, string | string[] | Array<[string, string]>>;

const FREE_SECTIONS: BriefSectionDef[] = [
  {
    title: "필수",
    fields: [
      {
        id: "topic",
        label: "글 주제",
        required: true,
        type: "text",
      },
      {
        id: "content",
        label: "전달하고 싶은 내용",
        required: true,
        type: "textarea",
        rows: 5,
      },
    ],
  },
  {
    title: "추가 정보",
    optional: true,
    fields: [
      {
        id: "keywords",
        label: "포함하면 좋을 키워드",
        type: "text",
      },
      {
        id: "notes",
        label: "자유 메모",
        type: "textarea",
        rows: 3,
      },
    ],
  },
];

export const BRIEF_SECTIONS: Record<DraftTemplate, BriefSectionDef[]> = {
  free: FREE_SECTIONS,
};

function asString(value: BriefValues[string] | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function isFieldFilled(field: BriefFieldDef, values: BriefValues) {
  const value = values[field.id];

  if (field.type === "bullets") {
    const bullets = Array.isArray(value) && typeof value[0] === "string"
      ? (value as string[])
      : [];
    const min = field.minBullets ?? 1;
    const filled = bullets.map((item) => item.trim()).filter(Boolean);
    return filled.length >= min;
  }

  if (field.type === "pairs") {
    const pairs = Array.isArray(value) && Array.isArray(value[0])
      ? (value as Array<[string, string]>)
      : [];
    if (field.required) {
      return pairs.length >= 1 && pairs.every(([title]) => title.trim());
    }
    return pairs.length > 0;
  }

  return Boolean(asString(value));
}

export function getEmptyBriefValues(_template: DraftTemplate = "free"): BriefValues {
  return {
    topic: "",
    content: "",
    keywords: "",
    notes: "",
  };
}

export function hasRequiredBriefFields(
  _template: DraftTemplate,
  values: BriefValues
) {
  for (const section of FREE_SECTIONS) {
    for (const field of section.fields) {
      if (field.required && !isFieldFilled(field, values)) {
        return false;
      }
    }
  }
  return true;
}

export function isBriefEmpty(_template: DraftTemplate, values: BriefValues) {
  for (const section of FREE_SECTIONS) {
    for (const field of section.fields) {
      if (isFieldFilled(field, values)) return false;
    }
  }
  return true;
}

export function serializeBrief(
  _template: DraftTemplate,
  values: BriefValues
): string {
  return [
    `- 글 주제: ${asString(values.topic)}`,
    `- 독자에게 전달하고 싶은 내용: ${asString(values.content)}`,
    `- 포함하면 좋을 키워드: ${asString(values.keywords)}`,
    `- 자유 메모: ${asString(values.notes)}`,
  ].join("\n");
}

export function isBriefFieldFilled(field: BriefFieldDef, values: BriefValues) {
  return isFieldFilled(field, values);
}

export function getBriefProgress(_template: DraftTemplate, values: BriefValues) {
  const required = FREE_SECTIONS.flatMap((section) =>
    section.fields.filter((field) => field.required)
  );
  const filled = required.filter((field) => isFieldFilled(field, values));
  return { filled: filled.length, total: required.length };
}
