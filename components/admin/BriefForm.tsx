"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Input, Textarea } from "@/components/ui";
import {
  BRIEF_SECTIONS,
  getBriefProgress,
  serializeBrief,
  type BriefFieldDef,
  type BriefSectionDef,
  type BriefValues,
} from "@/lib/ai/brief-fields";

const BRIEF_TEMPLATE = "free" as const;

type BriefFormProps = {
  values: BriefValues;
  onChange: (values: BriefValues) => void;
  disabled?: boolean;
};

function BulletField({
  field,
  value,
  onChange,
  disabled,
}: {
  field: BriefFieldDef;
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}) {
  const min = field.minBullets ?? 2;
  const max = field.maxBullets ?? 5;

  const updateItem = (index: number, text: string) => {
    const next = [...value];
    next[index] = text;
    onChange(next);
  };

  const addItem = () => {
    if (value.length >= max) return;
    onChange([...value, ""]);
  };

  const removeItem = (index: number) => {
    if (value.length <= min) return;
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {value.map((item, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={item}
            onChange={(e) => updateItem(index, e.target.value)}
            placeholder={`${field.label} ${index + 1}`}
            disabled={disabled}
          />
          {value.length > min && (
            <button
              type="button"
              onClick={() => removeItem(index)}
              disabled={disabled}
              className="shrink-0 rounded-lg border border-border px-2 text-xs text-muted-foreground hover:bg-muted"
            >
              삭제
            </button>
          )}
        </div>
      ))}
      {value.length < max && (
        <button
          type="button"
          onClick={addItem}
          disabled={disabled}
          className="text-xs text-primary hover:underline"
        >
          + 항목 추가
        </button>
      )}
    </div>
  );
}

function PairField({
  field,
  value,
  onChange,
  disabled,
}: {
  field: BriefFieldDef;
  value: Array<[string, string]>;
  onChange: (next: Array<[string, string]>) => void;
  disabled?: boolean;
}) {
  const [titleLabel, summaryLabel] = field.pairLabels ?? ["제목", "요약"];

  const updatePair = (index: number, slot: 0 | 1, text: string) => {
    const next = value.map((pair, i) =>
      i === index
        ? slot === 0
          ? ([text, pair[1]] as [string, string])
          : ([pair[0], text] as [string, string])
        : pair
    );
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {value.map(([title, summary], index) => (
        <div
          key={index}
          className="space-y-2 rounded-lg border border-border/80 bg-muted/20 p-3"
        >
          <p className="text-xs font-medium text-muted-foreground">
            {index + 1}번째 해결책
          </p>
          <Input
            value={title}
            onChange={(e) => updatePair(index, 0, e.target.value)}
            placeholder={titleLabel}
            disabled={disabled}
          />
          <Input
            value={summary}
            onChange={(e) => updatePair(index, 1, e.target.value)}
            placeholder={summaryLabel}
            disabled={disabled}
          />
        </div>
      ))}
    </div>
  );
}

function BriefFieldInput({
  field,
  value,
  onChange,
  disabled,
}: {
  field: BriefFieldDef;
  value: BriefValues[string];
  onChange: (next: BriefValues[string]) => void;
  disabled?: boolean;
}) {
  const bulletValue =
    Array.isArray(value) && (value.length === 0 || typeof value[0] === "string")
      ? (value as string[])
      : [""];

  const pairValue =
    Array.isArray(value) && Array.isArray(value[0])
      ? (value as Array<[string, string]>)
      : [["", ""] as [string, string]];

  return (
    <div>
      <label className="text-sm font-medium">
        {field.label}
        {field.required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="mt-1.5">
        {field.type === "text" && (
          <Input
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
          />
        )}

        {field.type === "textarea" && (
          <Textarea
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows ?? 3}
            disabled={disabled}
            className="min-h-0"
          />
        )}

        {field.type === "bullets" && (
          <BulletField
            field={field}
            value={bulletValue}
            onChange={onChange}
            disabled={disabled}
          />
        )}

        {field.type === "pairs" && (
          <PairField
            field={field}
            value={pairValue}
            onChange={onChange}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
}

function BriefSection({
  section,
  values,
  onFieldChange,
  disabled,
}: {
  section: BriefSectionDef;
  values: BriefValues;
  onFieldChange: (fieldId: string, next: BriefValues[string]) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(!section.optional);

  if (section.optional) {
    return (
      <div className="rounded-lg border border-dashed border-border/80">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-muted/30"
        >
          <span>{section.title} (선택)</span>
          {open ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {open && (
          <div className="space-y-4 border-t border-border/80 px-4 pb-4 pt-4">
            {section.fields.map((field) => (
              <BriefFieldInput
                key={field.id}
                field={field}
                value={values[field.id]}
                onChange={(next) => onFieldChange(field.id, next)}
                disabled={disabled}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {section.title}
      </p>
      {section.fields.map((field) => (
        <BriefFieldInput
          key={field.id}
          field={field}
          value={values[field.id]}
          onChange={(next) => onFieldChange(field.id, next)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

export function BriefForm({
  values,
  onChange,
  disabled,
}: BriefFormProps) {
  const sections = BRIEF_SECTIONS[BRIEF_TEMPLATE];
  const progress = getBriefProgress(BRIEF_TEMPLATE, values);

  const preview = useMemo(
    () => serializeBrief(BRIEF_TEMPLATE, values),
    [values]
  );

  const onFieldChange = (fieldId: string, next: BriefValues[string]) => {
    onChange({ ...values, [fieldId]: next });
  };

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted-foreground">
        필수 {progress.filled}/{progress.total} · 나머지는 접어 둔 선택 항목
      </p>

      {sections.map((section) => (
        <BriefSection
          key={section.title}
          section={section}
          values={values}
          onFieldChange={onFieldChange}
          disabled={disabled}
        />
      ))}

      <details className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-sm">
        <summary className="cursor-pointer font-medium text-muted-foreground">
          브리프 미리보기 (Playground 복붙용)
        </summary>
        <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap font-mono text-xs text-foreground">
          {preview}
        </pre>
      </details>
    </div>
  );
}
