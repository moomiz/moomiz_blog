import { Suspense } from "react";
import { Sidebar } from "@/components/Sidebar";
import { HeroPost } from "@/components/HeroPost";
import { CategoryChips } from "@/components/CategoryChips";
import { PopularPosts } from "@/components/PopularPosts";
import { PostCard } from "@/components/PostCard";
import { getAllPosts, getCategories, getHeroPost, getPopularPosts } from "@/lib/posts";
import { mergeViewsWithPosts } from "@/lib/views";

export default function HomePage() {
  const hero = getHeroPost();
  const categories = getCategories();
  const posts = mergeViewsWithPosts(getAllPosts());
  const popular = mergeViewsWithPosts(getPopularPosts(3));
  const recent = posts.filter((p) => p.slug !== hero?.slug).slice(0, 4);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <Sidebar />

        <div>
          {hero && <HeroPost post={hero} />}

          <div className="mt-10">
            <Suspense fallback={null}>
              <CategoryChips categories={categories} />
            </Suspense>
          </div>

          <section className="mt-10">
            <h2 className="mb-5 text-lg font-semibold">최근 글</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {recent.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </section>

          <PopularPosts posts={popular} />
        </div>
      </div>
    </main>
  );
}
