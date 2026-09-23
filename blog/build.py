#!/usr/bin/env python3

from __future__ import annotations

import html
import json
import re
import sys
from dataclasses import dataclass
from datetime import date
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
CONTENT_DIR = ROOT_DIR / "content"
OUTPUT_DIR = ROOT_DIR

SITE_NAME = "Bahruz Mammadov Blog"
SITE_AUTHOR = "Bahruz Mammadov"
PORTFOLIO_ORIGIN = "https://bahruzmammad.github.io"
SITE_URL = f"{PORTFOLIO_ORIGIN}/blog"

# FRONTMATTER_RE = re.compile(
#     r"\A---[ \t]*\r?\n(?P<meta>.*?)\r?\n---[ \t]*\r?\n?(?P<body>[\s\S]*)\Z"
# )

HEADING_RE = re.compile(r"^(#{1,6})\s+(.+)$")
LIST_RE = re.compile(r"^[-*]\s+(.+)$")
LINK_RE = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")
IMAGE_RE = re.compile(r"!\[([^\]]*)\]\(([^)]+)\)")
INLINE_CODE_RE = re.compile(r"`([^`]+)`")
BOLD_RE = re.compile(r"\*\*([^*]+)\*\*")
ITALIC_RE = re.compile(r"(?<!\*)\*([^*]+)\*(?!\*)")


class BuildError(Exception):
    """Raised when the blog build cannot be completed safely."""


@dataclass(frozen=True, slots=True)
class Post:
    title: str
    description: str
    published: date
    tags: tuple[str, ...]
    slug: str
    body: str
    source: Path

    @property
    def reading_time(self) -> int:
        words = re.findall(r"\b[\w'-]+\b", self.body)
        return max(1, (len(words) + 199) // 200)


def log(message: str) -> None:
    print(f"[build] {message}")


def error(message: str) -> None:
    raise BuildError(message)


def slugify(value: str) -> str:
    slug = value.strip().lower()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"\s+", "-", slug)
    slug = re.sub(r"-+", "-", slug)
    slug = slug.strip("-")

    if not slug:
        error(f"Cannot create slug from title: {value!r}")

    return slug


def parse_scalar(value: str) -> str:
    value = value.strip()

    if len(value) >= 2 and value[0] == value[-1]:
        if value[0] in {"'", '"'}:
            return value[1:-1]

    return value


def parse_frontmatter(source: Path) -> tuple[dict[str, object], str]:
    try:
        content = source.read_text(encoding="utf-8")
    except OSError as exc:
        raise BuildError(f"Cannot read {source}: {exc}") from exc

    lines = content.splitlines()

    if not lines or lines[0].strip() != "---":
        error(f"{source}: invalid front matter. File must start with ---.")

    closing_index = None

    for index in range(1, len(lines)):
        if lines[index].strip() == "---":
            closing_index = index
            break

    if closing_index is None:
        error(f"{source}: invalid front matter. Closing --- marker not found.")

    metadata: dict[str, object] = {}
    tags: list[str] = []
    reading_tags = False

    for raw_line in lines[1:closing_index]:
        line = raw_line.strip()

        if not line:
            continue

        if line == "tags:":
            reading_tags = True
            continue

        if reading_tags:
            if line.startswith("- "):
                tag = parse_scalar(line[2:])
                if tag:
                    tags.append(tag)
                continue

            reading_tags = False

        if ":" not in line:
            error(f"{source}: invalid metadata line: {raw_line!r}")

        key, value = line.split(":", 1)
        key = key.strip()

        if not key:
            error(f"{source}: metadata key cannot be empty")

        metadata[key] = parse_scalar(value)

    metadata["tags"] = tags

    body = "\n".join(lines[closing_index + 1 :]).strip()

    return metadata, body


def validate_post(
    source: Path,
    metadata: dict[str, object],
    body: str,
) -> Post:
    required = ("title", "description", "date")

    for field in required:
        value = metadata.get(field)

        if not isinstance(value, str) or not value.strip():
            error(f"{source}: missing required field '{field}'")

    title = str(metadata["title"]).strip()
    description = str(metadata["description"]).strip()
    date_value = str(metadata["date"]).strip()
    tags_value = metadata.get("tags", [])
    slug_value = str(metadata.get("slug", "")).strip()
    slug = slugify(slug_value) if slug_value else slugify(title)

    try:
        published = date.fromisoformat(date_value)
    except ValueError as exc:
        raise BuildError(
            f"{source}: invalid date '{date_value}'. Expected YYYY-MM-DD."
        ) from exc

    if not body:
        error(f"{source}: article body cannot be empty")

    if not isinstance(tags_value, list):
        error(f"{source}: tags must be a YAML-style list")

    tags = tuple(str(tag).strip() for tag in tags_value if str(tag).strip())

    return Post(
        title=title,
        description=description,
        published=published,
        tags=tags,
        slug=slug,
        body=body,
        source=source,
    )


def load_posts() -> list[Post]:
    if not CONTENT_DIR.exists():
        error(f"Content directory does not exist: {CONTENT_DIR}")

    sources = sorted(
        source for source in CONTENT_DIR.glob("*/*.md") if source.is_file()
    )

    if not sources:
        error(f"No Markdown files found in {CONTENT_DIR}")

    posts: list[Post] = []

    for source in sources:
        metadata, body = parse_frontmatter(source)
        posts.append(validate_post(source, metadata, body))

    slugs: set[str] = set()

    for post in posts:
        if post.slug in slugs:
            error(f"Duplicate slug detected: {post.slug}")

        slugs.add(post.slug)

    posts.sort(
        key=lambda post: (
            post.published,
            post.title.lower(),
        ),
        reverse=True,
    )

    return posts


def render_inline(text: str) -> str:
    result = html.escape(text, quote=True)

    result = IMAGE_RE.sub(
        lambda match: (
            f'<img src="{html.escape(match.group(2), quote=True)}" '
            f'alt="{html.escape(match.group(1), quote=True)}" '
            'loading="lazy">'
        ),
        result,
    )

    result = LINK_RE.sub(
        lambda match: (
            f'<a href="{html.escape(match.group(2), quote=True)}" '
            'target="_blank" '
            'rel="noopener noreferrer">'
            f"{match.group(1)}</a>"
        ),
        result,
    )

    result = INLINE_CODE_RE.sub(
        r"<code>\1</code>",
        result,
    )

    result = BOLD_RE.sub(
        r"<strong>\1</strong>",
        result,
    )

    result = ITALIC_RE.sub(
        r"<em>\1</em>",
        result,
    )

    return result


def render_markdown(markdown: str) -> str:
    lines = markdown.splitlines()
    output: list[str] = []

    paragraph: list[str] = []
    list_items: list[str] = []
    code_lines: list[str] = []

    in_code = False
    code_language = ""

    def flush_paragraph() -> None:
        if not paragraph:
            return

        text = " ".join(line.strip() for line in paragraph)

        output.append(f"<p>{render_inline(text)}</p>")

        paragraph.clear()

    def flush_list() -> None:
        if not list_items:
            return

        items = "".join(f"<li>{render_inline(item)}</li>" for item in list_items)

        output.append(f"<ul>{items}</ul>")
        list_items.clear()

    def flush_code() -> None:
        nonlocal in_code, code_language

        if not in_code:
            return

        code = html.escape(
            "\n".join(code_lines),
            quote=False,
        )

        language = (
            f' class="language-{html.escape(code_language)}"' if code_language else ""
        )

        output.append(f"<pre><code{language}>{code}</code></pre>")

        code_lines.clear()
        code_language = ""
        in_code = False

    for line in lines:
        if line.startswith("```"):
            if in_code:
                flush_code()
            else:
                flush_paragraph()
                flush_list()

                in_code = True
                code_language = line[3:].strip()

            continue

        if in_code:
            code_lines.append(line)
            continue

        if not line.strip():
            flush_paragraph()
            flush_list()
            continue

        heading = HEADING_RE.match(line)

        if heading:
            flush_paragraph()
            flush_list()

            level = len(heading.group(1))
            text = render_inline(heading.group(2).strip())

            output.append(f"<h{level}>{text}</h{level}>")

            continue

        list_match = LIST_RE.match(line)

        if list_match:
            flush_paragraph()
            list_items.append(list_match.group(1).strip())
            continue

        flush_list()
        paragraph.append(line)

    flush_code()
    flush_paragraph()
    flush_list()

    return "\n".join(output)


THEME_BOOTSTRAP = """
    <script>
      (function () {
        try {
          var theme = localStorage.getItem("theme");
          var isDark = window.matchMedia(
            "(prefers-color-scheme: dark)",
          ).matches;

          document.documentElement.dataset.theme =
            theme || (isDark ? "dark" : "light");
        } catch (error) {
          document.documentElement.dataset.theme = "light";
        }
      })();
    </script>
"""

FOOTER_HTML = """
    <footer class="footer" role="contentinfo">
      <div class="container">
        <p>&#169; 2026 Bahruz Mammadov. All rights reserved.</p>

        <nav class="footer-socials" aria-label="Social media links">
          <a
            href="https://github.com/bahruzmammad"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Bahruz Mammadov on GitHub (opens in new tab)"
            title="GitHub"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
              width="17"
              height="17"
            >
              <path
                fill="currentColor"
                d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.85 10.91.57.1.78-.25.78-.55 0-.27-.01-1.17-.01-2.13-3.19.69-3.86-1.35-3.86-1.35-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.73-1.52-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.11 3.04.73.8 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.67.41.35.77 1.04.77 2.1 0 1.52-.01 2.74-.01 3.11 0 .3.2.66.79.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"
              />
            </svg>
          </a>

          <a
            href="https://www.linkedin.com/in/bahruzmammad"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Bahruz Mammadov on LinkedIn (opens in new tab)"
            title="LinkedIn"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
              width="17"
              height="17"
            >
              <path
                fill="currentColor"
                d="M6.94 8.5H3.2V20h3.74V8.5ZM5.07 3A2.17 2.17 0 1 0 5.06 7.34 2.17 2.17 0 0 0 5.07 3ZM20.8 13.42c0-3.47-1.85-5.09-4.32-5.09-1.99 0-2.88 1.09-3.38 1.85V8.5H9.36V20h3.74v-6.4c0-1.68.32-3.31 2.4-3.31 2.05 0 2.08 1.93 2.08 3.42V20h3.22v-6.58Z"
              />
            </svg>
          </a>

          <a
            href="https://twitter.com/bahruzmammad"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Bahruz Mammadov on X / Twitter (opens in new tab)"
            title="X / Twitter"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
              width="17"
              height="17"
            >
              <path
                fill="currentColor"
                d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.78L6.14 22H3l7.24-8.28L2.2 2h6.4l4.42 6.19L18.9 2Zm-1.1 17.87h1.72L7.27 4.02H5.43L17.8 19.87Z"
              />
            </svg>
          </a>
        </nav>
      </div>
    </footer>
"""


def render_nav(prefix: str, blog_href: str) -> str:
    home = f"{prefix}/#home"

    return f"""
    <header class="header-nav" role="banner">
      <nav class="navbar container" aria-label="Main navigation">
        <a href="{home}" class="logo" aria-label="Bahruz Mammadov — back to top">
          Bahruz Mammadov
        </a>

        <div class="nav-right">
          <button
            type="button"
            class="menu-toggle"
            id="menu-toggle"
            aria-label="Open navigation menu"
            aria-expanded="false"
            aria-controls="main-menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <ul class="nav-list" id="main-menu" role="list">
            <li>
              <a href="{home}"> Home </a>
            </li>

            <li>
              <a href="{prefix}/#about"> About </a>
            </li>

            <li>
              <a href="{prefix}/#projects"> Projects </a>
            </li>

            <li>
              <a href="{prefix}/#skills"> Skills </a>
            </li>

            <li>
              <a href="{blog_href}" class="nav-blog active"> Blog </a>
            </li>

            <li>
              <a href="{prefix}/#contact"> Contact </a>
            </li>
          </ul>

          <div class="theme-switcher">
            <button
              type="button"
              class="theme-icon-button"
              id="theme-toggle"
              aria-label="Switch to dark mode"
              aria-pressed="false"
              title="Switch to dark mode"
            >
              <span class="theme-icon" aria-hidden="true"> &#9790; </span>
            </button>
          </div>
        </div>
      </nav>
    </header>
"""


def render_head(
    title: str,
    description: str,
    prefix: str,
    canonical_url: str,
    blog_stylesheet: str,
) -> str:
    styles = f"{prefix}/assets/css/styles.css"
    favicon = f"{prefix}/assets/img/favicon.png"
    og_image = f"{PORTFOLIO_ORIGIN}/assets/img/myimage.jpg"
    page_title = (
        html.escape(title)
        if title == SITE_NAME
        else f"{html.escape(title)} | {html.escape(SITE_NAME)}"
    )

    return f"""<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1"
    >
    <meta
        name="description"
        content="{html.escape(description, quote=True)}"
    >
    <meta
        name="author"
        content="{html.escape(SITE_AUTHOR, quote=True)}"
    >
    <meta name="theme-color" content="#ffffff" id="theme-color">
    <meta
        name="robots"
        content="index, follow"
    >
    <link
        rel="canonical"
        href="{html.escape(canonical_url, quote=True)}"
    >
    <meta property="og:type" content="article">
    <meta
        property="og:title"
        content="{html.escape(title, quote=True)}"
    >
    <meta
        property="og:description"
        content="{html.escape(description, quote=True)}"
    >
    <meta
        property="og:url"
        content="{html.escape(canonical_url, quote=True)}"
    >
    <meta
        property="og:image"
        content="{html.escape(og_image, quote=True)}"
    >
    <script type="application/ld+json">
    {{
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": {json.dumps(title)},
        "description": {json.dumps(description)},
        "author": {{
            "@type": "Person",
            "name": {json.dumps(SITE_AUTHOR)}
        }},
        "url": {json.dumps(canonical_url)}
    }}
    </script>
    <title>
        {page_title}
    </title>
    <link
        rel="icon"
        type="image/png"
        href="{html.escape(favicon, quote=True)}"
        sizes="32x32"
    >
    {THEME_BOOTSTRAP}
    <link
        rel="stylesheet"
        href="{html.escape(styles, quote=True)}"
    >
    <link
        rel="stylesheet"
        href="{html.escape(blog_stylesheet, quote=True)}"
    >
</head>
"""


def render_scripts(prefix: str) -> str:
    return f"""
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="{prefix}/assets/js/script.js"></script>
"""


def wrap_page(
    *,
    title: str,
    description: str,
    prefix: str,
    blog_href: str,
    canonical_url: str,
    blog_stylesheet: str,
    main_html: str,
) -> str:
    return f"""{
        render_head(
            title,
            description,
            prefix,
            canonical_url,
            blog_stylesheet,
        )
    }
<body class="blog-page">
    <a href="#main" class="skip-to-content"> Skip to main content </a>
    {render_nav(prefix, blog_href)}
    <main id="main">
        {main_html}
    </main>
    {FOOTER_HTML}
    {render_scripts(prefix)}
</body>
</html>
"""


def render_post(post: Post) -> str:
    content = render_markdown(post.body)

    tags = "".join(f"<li>{html.escape(tag)}</li>" for tag in post.tags)
    prefix = "../.."

    main_html = f"""
      <section id="blog" class="section blog-section" aria-labelledby="post-title">
        <div class="container blog-container">
          <article class="post reveal">
            <header class="post-header">
              <a href="../" class="post-back">
                ← Back to blog
              </a>

              <p class="post-meta">
                {post.published.strftime("%B %d, %Y")}
                ·
                {post.reading_time} min read
              </p>

              <h1 id="post-title">
                {html.escape(post.title)}
              </h1>

              <p class="post-description">
                {html.escape(post.description)}
              </p>

              <ul class="post-tags">
                {tags}
              </ul>
            </header>

            <div class="post-content">
              {content}
            </div>
          </article>
        </div>
      </section>
"""

    return wrap_page(
        title=post.title,
        description=post.description,
        prefix=prefix,
        blog_href="../",
        canonical_url=f"{SITE_URL}/{post.slug}/",
        blog_stylesheet="../assets/css/blog.css",
        main_html=main_html,
    )


def render_index(posts: list[Post]) -> str:
    cards: list[str] = []

    for index, post in enumerate(posts):
        tags = "".join(f"<span>{html.escape(tag)}</span>" for tag in post.tags)
        delay = index * 60

        cards.append(
            f"""<article class="post-card reveal" data-delay="{delay}">
    <p class="post-meta">
        {post.published.strftime("%B %d, %Y")}
        ·
        {post.reading_time} min read
    </p>

    <h2>
        <a href="{post.slug}/">
            {html.escape(post.title)}
        </a>
    </h2>

    <p>
        {html.escape(post.description)}
    </p>

    <div class="post-tags">
        {tags}
    </div>
</article>"""
        )

    cards_html = "\n".join(cards)
    description = "Articles about software engineering and programming."
    prefix = ".."

    main_html = f"""
      <section id="blog" class="section blog-section" aria-labelledby="blog-title">
        <div class="container blog-container">
          <header class="section-header blog-header reveal">
            <span class="section-label">Blog</span>

            <h1 id="blog-title">
              {html.escape(SITE_NAME)}
            </h1>

            <p>
              Notes on software engineering,
              backend development, and programming.
            </p>
          </header>

          <div
            class="posts"
            aria-label="Blog posts"
          >
            {cards_html}
          </div>
        </div>
      </section>
"""

    return wrap_page(
        title=SITE_NAME,
        description=description,
        prefix=prefix,
        blog_href="./",
        canonical_url=f"{SITE_URL}/",
        blog_stylesheet="assets/css/blog.css",
        main_html=main_html,
    )


def write_file(path: Path, content: str) -> None:
    try:
        path.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        temporary = path.with_suffix(path.suffix + ".tmp")

        temporary.write_text(
            content,
            encoding="utf-8",
        )

        temporary.replace(path)

    except OSError as exc:
        raise BuildError(f"Cannot write {path}: {exc}") from exc


def render_sitemap(posts: list[Post]) -> str:
    urls = [f"{SITE_URL}/"]
    urls.extend(f"{SITE_URL}/{post.slug}/" for post in posts)
    items = "\n".join(
        f"    <url>\n        <loc>{html.escape(url)}</loc>\n    </url>" for url in urls
    )
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{items}
</urlset>
"""


def render_feed(posts: list[Post]) -> str:
    items = "\n".join(
        f"    <item>\n        <title>{html.escape(post.title)}</title>\n        <link>{SITE_URL}/{post.slug}/</link>\n        <guid>{SITE_URL}/{post.slug}/</guid>\n        <description>{html.escape(post.description)}</description>\n    </item>"
        for post in posts
    )
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
    <title>Blog</title>
    <link>{SITE_URL}/</link>
    <description>Portfolio Blog</description>
{items}
</channel>
</rss>
"""


def build(posts: list[Post]) -> None:
    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    for post in posts:
        output = OUTPUT_DIR / post.slug / "index.html"
        output.parent.mkdir(parents=True, exist_ok=True)

        source_assets = post.source.parent / "assets"
        output_assets = output.parent / "assets"

        if source_assets.is_dir():
            import shutil

            shutil.copytree(source_assets, output_assets, dirs_exist_ok=True)

        write_file(
            output,
            render_post(post),
        )

        log(f"generated {output.relative_to(ROOT_DIR)}")

    write_file(
        ROOT_DIR / "index.html",
        render_index(posts),
    )
    write_file(
        ROOT_DIR / "sitemap.xml",
        render_sitemap(posts),
    )
    write_file(
        ROOT_DIR / "feed.xml",
        render_feed(posts),
    )

    log("generated blog/index.html")


def main() -> int:
    try:
        log("starting build")

        posts = load_posts()

        log(f"validated {len(posts)} post(s)")

        build(posts)

        log("build completed successfully")

        return 0

    except BuildError as exc:
        print(
            f"[error] {exc}",
            file=sys.stderr,
        )
        return 1

    except KeyboardInterrupt:
        print(
            "[error] build interrupted",
            file=sys.stderr,
        )
        return 130

    except Exception as exc:
        print(
            f"[error] unexpected failure: {type(exc).__name__}: {exc}",
            file=sys.stderr,
        )
        return 1


if __name__ == "__main__":
    sys.exit(main())
