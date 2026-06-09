import { isSupabaseConfigured } from "@/lib/supabase/config";
import { mergeCategories } from "@/lib/admin/categories";
import type { Post, PostMeta } from "@/lib/types/post";
import * as db from "./db";
import * as mdx from "./mdx";

export type { Post, PostMeta, PostInput, PostStatus } from "@/lib/types/post";
export { isSupabaseConfigured };

async function withSource<T>(
  dbFn: () => Promise<T>,
  mdxFn: () => T
): Promise<T> {
  if (isSupabaseConfigured()) return dbFn();
  return mdxFn();
}

export async function getAllPosts(): Promise<PostMeta[]> {
  return withSource(() => db.getPublishedPosts(), () => mdx.getAllPostsFromMdx());
}

export async function getAllPostsAdmin(): Promise<PostMeta[]> {
  if (!isSupabaseConfigured()) return mdx.getAllPostsFromMdx();
  return db.getAllPostsAdmin();
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return withSource(
    () => db.getPostBySlug(slug),
    () => mdx.getPostBySlugFromMdx(slug)
  );
}

export async function getPostByIdAdmin(id: string): Promise<Post | null> {
  if (!isSupabaseConfigured()) return null;
  return db.getPostByIdAdmin(id);
}

export async function getCategories(): Promise<string[]> {
  const posts = await getAllPosts();
  return ["All", ...Array.from(new Set(posts.map((p) => p.category)))];
}

export async function getAdminCategories(): Promise<string[]> {
  if (!isSupabaseConfigured()) {
    return mergeCategories([]);
  }
  const posts = await getAllPostsAdmin();
  return mergeCategories(posts.map((post) => post.category));
}

export type CategoryStat = { name: string; count: number };

export async function getCategoryStats(): Promise<CategoryStat[]> {
  const posts = await getAllPosts();
  const map = new Map<string, number>();

  for (const post of posts) {
    map.set(post.category, (map.get(post.category) ?? 0) + 1);
  }

  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

const PAGE_SIZE = 5;

export async function getPublishedPostsPaginated(
  page: number,
  excludeSlug?: string
) {
  if (isSupabaseConfigured()) {
    return db.getPublishedPostsPaginated(page, PAGE_SIZE, excludeSlug);
  }

  let posts = mdx.getAllPostsFromMdx();
  if (excludeSlug) {
    posts = posts.filter((p) => p.slug !== excludeSlug);
  }

  const total = posts.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * PAGE_SIZE;

  return {
    posts: posts.slice(start, start + PAGE_SIZE),
    total,
    totalPages,
  };
}

export { PAGE_SIZE };

export async function getPopularPosts(limit = 3): Promise<PostMeta[]> {
  const posts = await getAllPosts();
  return [...posts]
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .slice(0, limit);
}

export async function getHeroPost(): Promise<PostMeta | null> {
  const posts = await getAllPosts();
  return posts.find((p) => p.featured) ?? posts[0] ?? null;
}

export async function searchPosts(query: string): Promise<PostMeta[]> {
  const q = query.toLowerCase().trim();
  const posts = await getAllPosts();
  if (!q) return posts;

  return posts.filter(
    (post) =>
      post.title.toLowerCase().includes(q) ||
      post.description.toLowerCase().includes(q) ||
      post.tags.some((tag) => tag.toLowerCase().includes(q)) ||
      post.category.toLowerCase().includes(q)
  );
}

export async function getPublishedSlugs(): Promise<string[]> {
  if (isSupabaseConfigured()) return db.getPublishedSlugs();
  return mdx.getAllPostsFromMdx().map((p) => p.slug);
}

export { createPost, updatePost, deletePost } from "./db";
