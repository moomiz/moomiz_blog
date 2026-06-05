export type LatestComment = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
  discussionTitle: string;
  discussionUrl: string;
};

function parseRepo(repo: string) {
  const [owner, name] = repo.split("/");
  if (!owner || !name) return null;
  return { owner, name };
}

function stripMarkdown(text: string) {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#*_`>~-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function getLatestComments(limit = 5): Promise<LatestComment[]> {
  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO;
  if (!repo) return [];

  const parsed = parseRepo(repo);
  if (!parsed) return [];

  const query = `
    query($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) {
        discussions(first: 15, orderBy: { field: UPDATED_AT, direction: DESC }) {
          nodes {
            title
            url
            comments(first: 10) {
              nodes {
                id
                body
                url
                createdAt
                author { login }
              }
            }
          }
        }
      }
    }
  `;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/vnd.github+json",
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        variables: parsed,
      }),
      next: { revalidate: 300 },
    });

    if (!response.ok) return [];

    const json = (await response.json()) as {
      data?: {
        repository?: {
          discussions?: {
            nodes?: Array<{
              title: string;
              url: string;
              comments?: {
                nodes?: Array<{
                  id: string;
                  body: string;
                  url: string;
                  createdAt: string;
                  author?: { login?: string };
                }>;
              };
            }>;
          };
        };
      };
    };

    const discussions = json.data?.repository?.discussions?.nodes ?? [];
    const flat: LatestComment[] = [];

    for (const discussion of discussions) {
      for (const comment of discussion.comments?.nodes ?? []) {
        flat.push({
          id: comment.id,
          author: comment.author?.login ?? "anonymous",
          body: stripMarkdown(comment.body).slice(0, 120),
          createdAt: comment.createdAt,
          discussionTitle: discussion.title,
          discussionUrl: comment.url || discussion.url,
        });
      }
    }

    return flat
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, limit);
  } catch {
    return [];
  }
}
