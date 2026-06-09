import { Check } from "lucide-react";
import { EDITOR_STEPS, type EditorStepId } from "@/lib/admin/editor-steps";
import { cn } from "@/lib/utils";

type EditorStepNavProps = {
  currentStep: EditorStepId;
  maxReachedStep: EditorStepId;
  onStepChange: (step: EditorStepId) => void;
  variant?: "sidebar" | "pills";
};

export function EditorStepNav({
  currentStep,
  maxReachedStep,
  onStepChange,
  variant = "sidebar",
}: EditorStepNavProps) {
  if (variant === "pills") {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1">
        {EDITOR_STEPS.map((step) => {
          const done = step.id < currentStep;
          const active = step.id === currentStep;
          const reachable = step.id <= maxReachedStep;

          return (
            <button
              key={step.id}
              type="button"
              disabled={!reachable}
              onClick={() => reachable && onStepChange(step.id)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                active && "border-primary bg-primary text-primary-foreground",
                !active &&
                  reachable &&
                  "border-border bg-background hover:bg-muted",
                !reachable && "cursor-not-allowed opacity-40"
              )}
            >
              {done ? `${step.id}. ✓` : `${step.id}.`} {step.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <nav className="space-y-1">
      {EDITOR_STEPS.map((step) => {
        const done = step.id < currentStep;
        const active = step.id === currentStep;
        const reachable = step.id <= maxReachedStep;

        return (
          <button
            key={step.id}
            type="button"
            disabled={!reachable}
            onClick={() => reachable && onStepChange(step.id)}
            className={cn(
              "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
              active && "bg-primary/10 text-primary",
              !active && reachable && "hover:bg-muted/70",
              !reachable && "cursor-not-allowed opacity-40"
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                active && "border-primary bg-primary text-primary-foreground",
                done && !active && "border-emerald-500 bg-emerald-500 text-white",
                !active && !done && "border-border bg-background"
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : step.id}
            </span>
            <span>
              <span className="block text-sm font-medium">{step.label}</span>
              <span className="block text-xs text-muted-foreground">
                {step.hint}
              </span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}
