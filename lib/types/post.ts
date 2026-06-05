export type PostStatus = "draft" | "published";

export type PostMeta = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  featured?: boolean;
  views?: number;
  readingTime: string;
  status?: PostStatus;
};

export type Post = PostMeta & {
  content: string;
};

export type PostRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  status: PostStatus;
  featured: boolean;
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PostInput = {
  slug: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  status: PostStatus;
  featured: boolean;
};
