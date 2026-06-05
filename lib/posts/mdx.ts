import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { Post, PostMeta } from "@/lib/types/post";

const postsDirectory = path.join(process.cwd(), "content/posts");

function ensurePostsDir() {
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
  }
}

function mapFileToMeta(
  slug: string,
  data: Record<string, unknown>,
  content: string
): PostMeta {
  const stats = readingTime(content);
  return {
    slug,
    title: (data.title as string) ?? slug,
    description: (data.description as string) ?? "",
    date: (data.date as string) ?? new Date().toISOString(),
    category: (data.category as string) ?? "General",
    tags: (data.tags as string[]) ?? [],
    featured: Boolean(data.featured),
    views: Number(data.views ?? 0),
    readingTime: stats.text,
    status: "published",
  };
}

export function getAllPostsFromMdx(): PostMeta[] {
  ensurePostsDir();
  const fileNames = fs
    .readdirSync(postsDirectory)
    .filter((f) => f.endsWith(".mdx"));

  const posts = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.mdx$/, "");
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);
    return mapFileToMeta(slug, data, content);
  });

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPostBySlugFromMdx(slug: string): Post | null {
  ensurePostsDir();
  const fullPath = path.join(postsDirectory, `${slug}.mdx`);
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    ...mapFileToMeta(slug, data, content),
    content,
  };
}

export function listMdxFiles() {
  ensurePostsDir();
  return fs.readdirSync(postsDirectory).filter((f) => f.endsWith(".mdx"));
}
