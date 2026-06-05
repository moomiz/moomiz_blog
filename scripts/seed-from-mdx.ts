import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";

const postsDir = path.join(process.cwd(), "content/posts");

async function main() {
  // tsx 단독 실행 시 .env.local 을 자동으로 읽지 않아서 명시적으로 로드
  loadEnvConfig(process.cwd());

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required."
    );
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".mdx"));
  console.log(`Seeding ${files.length} posts...`);

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(postsDir, file), "utf8");
    const { data, content } = matter(raw);

    const row = {
      slug,
      title: (data.title as string) ?? slug,
      description: (data.description as string) ?? "",
      content,
      category: (data.category as string) ?? "General",
      tags: (data.tags as string[]) ?? [],
      status: "published" as const,
      featured: Boolean(data.featured),
      view_count: Number(data.views ?? 0),
      published_at: (data.date as string) ?? new Date().toISOString(),
    };

    const { error } = await supabase.from("posts").upsert(row, {
      onConflict: "slug",
    });

    if (error) {
      console.error(`Failed: ${slug}`, error.message);
    } else {
      console.log(`✓ ${slug}`);
    }
  }

  console.log("Done.");
}

main();
