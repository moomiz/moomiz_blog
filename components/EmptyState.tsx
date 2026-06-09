type EmptyStateProps = {
  emoji?: string;
  title?: string;
  description?: string;
};

export function EmptyState({
  emoji = "🐈",
  title = "아직 준비된 글이 없어요",
  description = "열심히 작성 중이니 조금만 기다려주세요!",
}: EmptyStateProps) {
  return (
    <div className="card-craft flex flex-col items-center px-6 py-14 text-center">
      <span className="text-5xl" role="img" aria-hidden>
        {emoji}
      </span>
      <p className="mt-4 text-base font-medium text-foreground">{title}</p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
