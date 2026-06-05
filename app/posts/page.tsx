import { Suspense } from "react";
import { Sidebar } from "@/components/Sidebar";
import { PostCard } from "@/components/PostCard";
import { CategoryChips } from "@/components/CategoryChips";
import { getAllPosts, getCategories, searchPosts } from "@/lib/posts";

export const revalidate = 60;

type PostsPageProps = {
  searchParams: Promise<{ q?: string; category?: string }>;
};

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const params = await searchParams;
  const query = params.q ?? "";
  const category = params.category ?? "All";

  let posts = query ? await searchPosts(query) : await getAllPosts();
  if (category !== "All") {
    posts = posts.filter((post) => post.category === category);
  }

  const categories = await getCategories();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <Sidebar />
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">글 목록</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {query
                ? `"${query}" 검색 결과 ${posts.length}건`
                : category !== "All"
                  ? `#${category} 카테고리 ${posts.length}건`
                  : `총 ${posts.length}개의 Tech-Log`}
            </p>
          </div>

          <Suspense fallback={null}>
            <CategoryChips categories={categories} />
          </Suspense>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>

          {posts.length === 0 && (
            <p className="mt-10 text-center text-muted-foreground">
              조건에 맞는 글이 없습니다.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
