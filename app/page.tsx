import { Sidebar } from "@/components/Sidebar";
import { HeroPost } from "@/components/HeroPost";
import { PostListCard } from "@/components/PostListCard";
import { Pagination } from "@/components/Pagination";
import { CategoryCards } from "@/components/CategoryCards";
import { LatestComments } from "@/components/LatestComments";
import {
  getCategoryStats,
  getHeroPost,
  getPublishedPostsPaginated,
} from "@/lib/posts";

export const revalidate = 60;

type HomePageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, Number(params.page ?? "1") || 1);

  const hero = await getHeroPost();
  const { posts, totalPages } = await getPublishedPostsPaginated(
    currentPage,
    hero?.slug
  );
  const categoryStats = await getCategoryStats();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-10">
        {hero && <HeroPost post={hero} />}

        <div className="grid gap-x-8 lg:grid-cols-[1fr_280px]">
          <h2 className="mb-5 text-lg font-semibold lg:col-start-1 lg:row-start-1">
            최근 글
          </h2>

          <div className="lg:col-start-1 lg:row-start-2">
            <section>
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostListCard key={post.slug} post={post} />
                ))}
              </div>

              {posts.length === 0 && (
                <p className="py-10 text-center text-muted-foreground">
                  표시할 글이 없습니다.
                </p>
              )}

              <Pagination currentPage={currentPage} totalPages={totalPages} />
            </section>

            <CategoryCards categories={categoryStats} />
          </div>

          <aside className="mt-10 space-y-6 lg:col-start-2 lg:row-start-2 lg:mt-0 lg:sticky lg:top-24 lg:self-start">
            <Sidebar />
            <LatestComments />
          </aside>
        </div>
      </div>
    </main>
  );
}
