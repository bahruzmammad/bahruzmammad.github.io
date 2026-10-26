import { marked, Renderer } from "marked";
import { parse } from "yaml";
import type { BlogPost } from "../types";

const markdownFiles = import.meta.glob("../../blog/content/**/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;

function requiredString(value: unknown, field: string, file: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Invalid blog metadata: "${field}" is missing in ${file}`);
  }
  return value.trim();
}

function parsePost(source: string, file: string): {
  data: Record<string, unknown>;
  content: string;
} {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    throw new Error(`Missing YAML frontmatter in ${file}`);
  }
  const parsed: unknown = parse(match[1]);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`Invalid YAML frontmatter in ${file}`);
  }
  return {
    data: parsed as Record<string, unknown>,
    content: source.slice(match[0].length),
  };
}

function validPostDate(value: string): boolean {
  const date = new Date(`${value}T00:00:00Z`);
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

function loadPosts(): BlogPost[] {
  const slugs = new Set<string>();
  const posts = Object.entries(markdownFiles).map(([file, source]) => {
    const { data, content } = parsePost(source, file);
    const slug = requiredString(data.slug, "slug", file);
    const date = requiredString(data.date, "date", file);

    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw new Error(`Invalid blog slug "${slug}" in ${file}`);
    }
    if (slugs.has(slug)) {
      throw new Error(`Duplicate blog slug "${slug}" in ${file}`);
    }
    slugs.add(slug);
    if (!validPostDate(date)) {
      throw new Error(`Invalid blog date "${date}" in ${file}`);
    }
    if (
      data.tags !== undefined &&
      (!Array.isArray(data.tags) ||
        !data.tags.every((tag) => typeof tag === "string"))
    ) {
      throw new Error(`Invalid blog tags in ${file}`);
    }

    return {
      title: requiredString(data.title, "title", file),
      description: requiredString(data.description, "description", file),
      date,
      slug,
      tags: (data.tags as string[] | undefined) ?? [],
      readingTimeMinutes: Math.max(
        1,
        Math.ceil((content.match(/[\p{L}\p{N}_'-]+/gu)?.length ?? 0) / 200),
      ),
      markdown: content,
    };
  });

  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export const blogPosts = loadPosts();

const markdownRenderer = new Renderer();
markdownRenderer.link = ({ href, title, text }) => {
  const safeTitle = title
    ? ` title="${title.replaceAll("&", "&amp;").replaceAll('"', "&quot;")}"`
    : "";
  const safeHref = href.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
  return `<a href="${safeHref}"${safeTitle} target="_blank" rel="noopener noreferrer">${text}</a>`;
};
markdownRenderer.image = ({ href, title, text }) => {
  const safeTitle = title
    ? ` title="${title.replaceAll("&", "&amp;").replaceAll('"', "&quot;")}"`
    : "";
  const safeHref = href.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
  const safeAlt = text.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
  return `<img src="${safeHref}" alt="${safeAlt}"${safeTitle} loading="lazy">`;
};

export function renderMarkdown(markdown: string): string {
  return marked.parse(markdown, {
    async: false,
    gfm: true,
    renderer: markdownRenderer,
  });
}

export function formatPostDate(date: string): string {
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime())
    ? date
    : new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(parsed);
}

export function formatPostMeta(post: BlogPost): string {
  return `${formatPostDate(post.date)} · ${post.readingTimeMinutes} min read`;
}
