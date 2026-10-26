import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";

const contentDirectory = path.resolve("blog/content");
const publicBlogDirectory = path.resolve("public/blog");
const siteUrl = "https://bahruzmammad.github.io";

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const file = path.join(directory, entry.name);
      return entry.isDirectory() ? walk(file) : [file];
    }),
  );
  return nested.flat().filter((file) => file.endsWith(".md"));
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

const posts = await Promise.all(
  (await walk(contentDirectory)).map(async (file) => {
    const source = await readFile(file, "utf8");
    const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    if (!match) throw new Error(`Missing YAML frontmatter: ${file}`);
    const data = parse(match[1]);
    if (
      !data ||
      typeof data !== "object" ||
      Array.isArray(data) ||
      typeof data.slug !== "string" ||
      !/^[a-z0-9-]+$/.test(data.slug) ||
      typeof data.title !== "string" ||
      typeof data.description !== "string" ||
      typeof data.date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(data.date) ||
      Number.isNaN(new Date(`${data.date}T00:00:00Z`).getTime()) ||
      new Date(`${data.date}T00:00:00Z`).toISOString().slice(0, 10) !==
        data.date ||
      (data.tags !== undefined &&
        (!Array.isArray(data.tags) ||
          !data.tags.every((tag) => typeof tag === "string")))
    ) {
      throw new Error(`Invalid or missing blog frontmatter: ${file}`);
    }
    return data;
  }),
);

const slugs = new Set();
for (const post of posts) {
  if (slugs.has(post.slug)) {
    throw new Error(`Duplicate blog slug: ${post.slug}`);
  }
  slugs.add(post.slug);
}
posts.sort((a, b) => b.date.localeCompare(a.date));
await mkdir(publicBlogDirectory, { recursive: true });
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  `  <url><loc>${siteUrl}/</loc></url>`,
  `  <url><loc>${siteUrl}/blog/</loc></url>`,
  ...posts.map(
    (post) =>
      `  <url><loc>${siteUrl}/blog/${escapeXml(post.slug)}/</loc><lastmod>${escapeXml(post.date)}</lastmod></url>`,
  ),
  "</urlset>",
  "",
].join("\n");
const feedItems = posts
  .map(
    (post) => `  <item>
    <title>${escapeXml(post.title)}</title>
    <link>${siteUrl}/blog/${escapeXml(post.slug)}/</link>
    <guid>${siteUrl}/blog/${escapeXml(post.slug)}/</guid>
    <description>${escapeXml(post.description)}</description>
    <pubDate>${new Date(`${post.date}T12:00:00Z`).toUTCString()}</pubDate>
  </item>`,
  )
  .join("\n");
const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Bahruz Mammadov Blog</title>
    <link>${siteUrl}/blog/</link>
    <description>Notes on software engineering, backend development, and programming.</description>
${feedItems}
  </channel>
</rss>
`;

await Promise.all([
  writeFile(path.join(publicBlogDirectory, "sitemap.xml"), sitemap),
  writeFile(path.join(publicBlogDirectory, "feed.xml"), feed),
]);
