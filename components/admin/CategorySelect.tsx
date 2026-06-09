"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui";
import { rememberCustomCategory } from "@/lib/admin/categories";

type CategorySelectProps = {
  value: string;
  onChange: (value: string) => void;
  categories: string[];
  disabled?: boolean;
};

export function CategorySelect({
  value,
  onChange,
  categories,
  disabled,
}: CategorySelectProps) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const options = useMemo(() => {
    const set = new Set(categories);
    if (value.trim()) set.add(value.trim());
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ko"));
  }, [categories, value]);

  const commitNewCategory = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    rememberCustomCategory(trimmed);
    onChange(trimmed);
    setNewName("");
    setAdding(false);
  };

  if (adding) {
    return (
      <div className="flex gap-2">
        <Input
          autoFocus
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="새 카테고리 이름"
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitNewCategory();
            }
            if (e.key === "Escape") {
              setAdding(false);
              setNewName("");
            }
          }}
        />
        <button
          type="button"
          className="shrink-0 rounded-lg border border-border px-3 text-sm hover:bg-muted"
          onClick={commitNewCategory}
          disabled={disabled || !newName.trim()}
        >
          추가
        </button>
      </div>
    );
  }

  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => {
        if (e.target.value === "__new__") {
          setAdding(true);
          return;
        }
        onChange(e.target.value);
      }}
      className="flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {options.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
      <option value="__new__">+ 새 카테고리 추가</option>
    </select>
  );
}
