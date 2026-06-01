"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

export function ViewCounter({ slug, initialViews = 0 }: { slug: string; initialViews?: number }) {
  const [views, setViews] = useState(initialViews);

  useEffect(() => {
    fetch(`/api/views/${slug}`, { method: "POST" })
      .then((res) => res.json())
      .then((data: { views: number }) => setViews(data.views))
      .catch(() => undefined);
  }, [slug]);

  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
      <Eye className="h-4 w-4" />
      {views.toLocaleString()} views
    </span>
  );
}
