import readingTime from "reading-time";
import { createClient, createPublicClient } from "@/lib/supabase/server";
import type { Post, PostInput, PostMeta, PostRow, PostStatus } from "@/lib/types/post";

function rowToMeta(row: PostRow): PostMeta {
  const date = row.published_at ?? row.created_at;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    date,
    category: row.category,
    tags: row.tags ?? [],
    featured: row.featured,
    views: row.view_count,
    readingTime: readingTime(row.content).text,
    status: row.status,
  };
}

function rowToPost(row: PostRow): Post {
  return {
    ...rowToMeta(row),
    content: row.content,
  };
}

export async function getPublishedPosts(): Promise<PostMeta[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false });

  if (error) throw error;
  return (data as PostRow[]).map(rowToMeta);
}

export async function getAllPostsAdmin(): Promise<PostMeta[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data as PostRow[]).map(rowToMeta);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return rowToPost(data as PostRow);
}

export async function getPostByIdAdmin(id: string): Promise<Post | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return rowToPost(data as PostRow);
}

export async function getPostBySlugAdmin(slug: string): Promise<Post | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return rowToPost(data as PostRow);
}

export async function createPost(input: PostInput) {
  const supabase = await createClient();
  const payload = toDbPayload(input);

  const { data, error } = await supabase
    .from("posts")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return rowToPost(data as PostRow);
}

export async function updatePost(id: string, input: PostInput) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("posts")
    .select("published_at")
    .eq("id", id)
    .maybeSingle();

  const payload = toDbPayload(
    input,
    (existing as { published_at: string | null } | null)?.published_at ?? null
  );

  const { data, error } = await supabase
    .from("posts")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return rowToPost(data as PostRow);
}

export async function deletePost(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw error;
}

function toDbPayload(
  input: PostInput,
  existingPublishedAt: string | null = null
) {
  let published_at: string | null = existingPublishedAt;
  if (input.status === "published" && !published_at) {
    published_at = new Date().toISOString();
  }
  if (input.status === "draft") {
    published_at = null;
  }

  return {
    slug: input.slug,
    title: input.title,
    description: input.description,
    content: input.content,
    category: input.category,
    tags: input.tags,
    status: input.status as PostStatus,
    featured: input.featured,
    published_at,
  };
}

export async function getPublishedSlugs(): Promise<string[]> {
  const posts = await getPublishedPosts();
  return posts.map((p) => p.slug);
}

export async function getPublishedPostsPaginated(
  page: number,
  pageSize: number,
  excludeSlug?: string
): Promise<{ posts: PostMeta[]; total: number; totalPages: number }> {
  const supabase = createPublicClient();
  const safePage = Math.max(1, page);

  let countQuery = supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");

  if (excludeSlug) {
    countQuery = countQuery.neq("slug", excludeSlug);
  }

  const { count, error: countError } = await countQuery;
  if (countError) throw countError;

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;

  let dataQuery = supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .range(from, to);

  if (excludeSlug) {
    dataQuery = dataQuery.neq("slug", excludeSlug);
  }

  const { data, error } = await dataQuery;
  if (error) throw error;

  return {
    posts: (data as PostRow[]).map(rowToMeta),
    total,
    totalPages,
  };
}
