import DOMPurify from "dompurify";
import { useMemo } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useReveal, usePageMetadata } from "../hooks/useSiteEffects";
import { blogPosts, formatPostMeta, renderMarkdown } from "../lib/blog";

const blogDescription =
  "Notes on software engineering, backend development, and programming.";

function Tags({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <div className="post-tags">
      {tags.map((tag) => <span key={tag}>{tag}</span>)}
    </div>
  );
}

export function BlogPage() {
  useReveal(blogPosts.length);
  usePageMetadata(
    "Bahruz Mammadov Blog",
    "Articles about software engineering and programming.",
    "/blog/",
  );

  return (
    <main id="main">
      <section
        id="blog"
        className="section blog-section"
        aria-labelledby="blog-title"
      >
        <div className="container blog-container">
          <header className="section-header blog-header reveal">
            <span className="section-label">Blog</span>
            <h1 id="blog-title">Bahruz Mammadov Blog</h1>
            <p>{blogDescription}</p>
          </header>
          <div className="posts" aria-label="Blog posts">
            {blogPosts.map((post, index) => (
              <article
                className="post-card reveal"
                data-delay={index * 60}
                key={post.slug}
              >
                <p className="post-meta">
                  {formatPostMeta(post)}
                </p>
                <h2>
                  <Link to={`/blog/${post.slug}/`}>{post.title}</Link>
                </h2>
                <p>{post.description}</p>
                <Tags tags={post.tags} />
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export function BlogPostPage() {
  const { slug = "" } = useParams();
  const location = useLocation();
  const post = blogPosts.find((item) => item.slug === slug);
  const title = post
    ? `${post.title} | Bahruz Mammadov Blog`
    : "Article not found | Bahruz Mammadov Blog";
  const description = post?.description ?? "The requested article was not found.";
  const path = post ? `/blog/${post.slug}/` : location.pathname;
  usePageMetadata(
    title,
    description,
    path,
    post ? "article" : "website",
    !post,
  );
  useReveal(post?.slug);

  const html = useMemo(
    () => (post ? DOMPurify.sanitize(renderMarkdown(post.markdown)) : ""),
    [post],
  );

  if (!post) {
    return (
      <main id="main">
        <section className="section blog-section">
          <div className="container blog-container">
            <header className="section-header blog-header">
              <span className="section-label">Blog</span>
              <h1>Article not found</h1>
              <p>This article may have moved or no longer exists.</p>
              <Link className="post-back" to="/blog/">
                ← Back to blog
              </Link>
            </header>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main id="main">
      <section className="section blog-section" aria-labelledby="post-title">
        <article className="container blog-container">
          <Link className="post-back" to="/blog/">
            ← Back to blog
          </Link>
          <header className="post-header reveal">
            <p className="post-meta">{formatPostMeta(post)}</p>
            <h1 id="post-title">{post.title}</h1>
            <p className="post-description">{post.description}</p>
            <Tags tags={post.tags} />
          </header>
          <div
            className="post-content"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>
      </section>
    </main>
  );
}
