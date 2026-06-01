import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), ".data");
const viewsFile = path.join(dataDir, "views.json");

type ViewsStore = Record<string, number>;

function ensureStore(): ViewsStore {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(viewsFile)) {
    fs.writeFileSync(viewsFile, JSON.stringify({}), "utf8");
    return {};
  }

  return JSON.parse(fs.readFileSync(viewsFile, "utf8")) as ViewsStore;
}

function saveStore(store: ViewsStore) {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(viewsFile, JSON.stringify(store, null, 2), "utf8");
}

export function getViewCount(slug: string): number {
  const store = ensureStore();
  return store[slug] ?? 0;
}

export function incrementViewCount(slug: string): number {
  const store = ensureStore();
  const next = (store[slug] ?? 0) + 1;
  store[slug] = next;
  saveStore(store);
  return next;
}

export function getAllViewCounts(): ViewsStore {
  return ensureStore();
}

export function mergeViewsWithPosts<T extends { slug: string; views?: number }>(
  posts: T[]
): T[] {
  const store = ensureStore();
  return posts.map((post) => ({
    ...post,
    views: store[post.slug] ?? post.views ?? 0,
  }));
}
