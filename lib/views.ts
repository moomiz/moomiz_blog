import { createPublicClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), ".data");
const viewsFile = path.join(dataDir, "views.json");

type ViewsStore = Record<string, number>;

function ensureFileStore(): ViewsStore {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(viewsFile)) {
    fs.writeFileSync(viewsFile, JSON.stringify({}), "utf8");
    return {};
  }
  return JSON.parse(fs.readFileSync(viewsFile, "utf8")) as ViewsStore;
}

function saveFileStore(store: ViewsStore) {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(viewsFile, JSON.stringify(store, null, 2), "utf8");
}

export async function getViewCount(slug: string): Promise<number> {
  if (isSupabaseConfigured()) {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("posts")
      .select("view_count")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    return data?.view_count ?? 0;
  }

  const store = ensureFileStore();
  return store[slug] ?? 0;
}

export async function incrementViewCount(slug: string): Promise<number> {
  if (isSupabaseConfigured()) {
    const supabase = createPublicClient();
    const { data, error } = await supabase.rpc("increment_post_views", {
      post_slug: slug,
    });

    if (error) throw error;
    return (data as number) ?? 0;
  }

  const store = ensureFileStore();
  const next = (store[slug] ?? 0) + 1;
  store[slug] = next;
  saveFileStore(store);
  return next;
}
