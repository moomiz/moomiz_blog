import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { PromptBlock } from "@/components/mdx/PromptBlock";
import { ResponseBlock } from "@/components/mdx/ResponseBlock";
import { MdxPre } from "@/components/mdx/MdxPre";

const components = {
  Prompt: PromptBlock,
  Response: ResponseBlock,
  pre: MdxPre,
};

export async function MdxContent({ source }: { source: string }) {
  return MDXRemote({
    source,
    components,
    options: {
      blockJS: true,
      blockDangerousJS: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: "wrap" }],
        ],
      },
    },
  });
}

export type { MDXRemoteProps };
