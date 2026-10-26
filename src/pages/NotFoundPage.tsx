import { Link, useLocation } from "react-router-dom";
import { usePageMetadata } from "../hooks/useSiteEffects";

export function NotFoundPage() {
  const location = useLocation();
  usePageMetadata(
    "Page not found | Bahruz Mammadov",
    "The requested page could not be found.",
    location.pathname,
    "website",
    true,
  );
  return (
    <main id="main">
      <section className="section blog-section">
        <div className="container blog-container">
          <header className="section-header blog-header">
            <span className="section-label">404</span>
            <h1>Page not found</h1>
            <p>The page you’re looking for doesn’t exist.</p>
            <Link className="post-back" to="/">
              ← Back to home
            </Link>
          </header>
        </div>
      </section>
    </main>
  );
}
