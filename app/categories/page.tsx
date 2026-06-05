import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/ui";
import { getAllPosts, getCategories } from "@/lib/posts";
import Link from "next/link";

export const revalidate = 60;

export default async function CategoriesPage() {
  const categories = (await getCategories()).filter((c) => c !== "All");
  const posts = await getAllPosts();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <Sidebar />
        <div>
          <h1 className="text-2xl font-bold">카테고리</h1>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {categories.map((category) => {
              const count = posts.filter((p) => p.category === category).length;
              return (
                <Link
                  key={category}
                  href={`/posts?category=${encodeURIComponent(category)}`}
                >
                  <Card className="p-5 transition-colors hover:border-primary/40">
                    <p className="font-semibold">#{category}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {count}개의 글
                    </p>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
