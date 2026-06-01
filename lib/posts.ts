import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const postsDirectory = path.join(process.cwd(), "content/posts");

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  featured?: boolean;
  views?: number;
  readingTime: string;
};

export type Post = PostMeta & {
  content: string;
};

function ensurePostsDir() {
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
  }
}

export function getAllPosts(): PostMeta[] {
  ensurePostsDir();
  const fileNames = fs.readdirSync(postsDirectory).filter((f) => f.endsWith(".mdx"));

  const posts = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.mdx$/, "");
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);
    const stats = readingTime(content);

    return {
      slug,
      title: data.title ?? slug,
      description: data.description ?? "",
      date: data.date ?? new Date().toISOString(),
      category: data.category ?? "General",
      tags: data.tags ?? [],
      featured: data.featured ?? false,
      views: data.views ?? 0,
      readingTime: stats.text,
    } satisfies PostMeta;
  });

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPostBySlug(slug: string): Post | null {
  ensurePostsDir();
  const fullPath = path.join(postsDirectory, `${slug}.mdx`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const stats = readingTime(content);

  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    date: data.date ?? new Date().toISOString(),
    category: data.category ?? "General",
    tags: data.tags ?? [],
    featured: data.featured ?? false,
    views: data.views ?? 0,
    readingTime: stats.text,
    content,
  };
}

export function getCategories(): string[] {
  const posts = getAllPosts();
  return ["All", ...Array.from(new Set(posts.map((p) => p.category)))];
}

export function getPopularPosts(limit = 3): PostMeta[] {
  return [...getAllPosts()]
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .slice(0, limit);
}

export function getHeroPost(): PostMeta | null {
  const posts = getAllPosts();
  return posts.find((p) => p.featured) ?? posts[0] ?? null;
}

export function searchPosts(query: string): PostMeta[] {
  const q = query.toLowerCase().trim();
  if (!q) return getAllPosts();

  return getAllPosts().filter(
    (post) =>
      post.title.toLowerCase().includes(q) ||
      post.description.toLowerCase().includes(q) ||
      post.tags.some((tag) => tag.toLowerCase().includes(q)) ||
      post.category.toLowerCase().includes(q)
  );
}
