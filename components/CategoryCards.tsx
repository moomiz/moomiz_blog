import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { Card } from "@/components/ui";

export type CategoryStat = {
  name: string;
  count: number;
};

export function CategoryCards({ categories }: { categories: CategoryStat[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="mb-5 text-lg font-semibold">카테고리</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {categories.map((category) => (
          <Link
            key={category.name}
            href={`/posts?category=${encodeURIComponent(category.name)}`}
            className="group block"
          >
            <Card className="flex items-start gap-4 p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-md">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <FolderOpen className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold transition-colors group-hover:text-primary">
                  {category.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {category.count}개의 Tech-Log
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
