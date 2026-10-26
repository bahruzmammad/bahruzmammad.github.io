import { describe, expect, it } from "vitest";
import { blogPosts, renderMarkdown } from "./blog";

describe("Markdown blog content", () => {
  it("preserves both existing article URLs and metadata", () => {
    expect(blogPosts.map((post) => post.slug)).toEqual([
      "qloballasma",
      "hello",
    ]);
    expect(blogPosts.find((post) => post.slug === "hello")?.title).toBe(
      "Hello, How Are You? My First Blog Post",
    );
    expect(
      blogPosts.map((post) => [post.slug, post.readingTimeMinutes]),
    ).toEqual([
      ["qloballasma", 13],
      ["hello", 3],
    ]);
  });

  it("renders Markdown headings, lists, and links", () => {
    const html = renderMarkdown(
      "## Heading\n\n- Item\n\n[Portfolio](https://example.com)",
    );

    expect(html).toContain("<h2>Heading</h2>");
    expect(html).toContain("<li>Item</li>");
    expect(html).toContain(
      'href="https://example.com" target="_blank" rel="noopener noreferrer"',
    );
  });
});
