import { lazy, Suspense, useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Footer, Header, type Theme } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";

const BlogPage = lazy(() =>
  import("./pages/BlogPages").then((module) => ({
    default: module.BlogPage,
  })),
);
const BlogPostPage = lazy(() =>
  import("./pages/BlogPages").then((module) => ({
    default: module.BlogPostPage,
  })),
);

function BlogLoading() {
  return (
    <main id="main" aria-busy="true">
      <section className="section blog-section">
        <div className="container blog-container">Loading…</div>
      </section>
    </main>
  );
}

const themeKey = "theme";

function storedTheme(): Theme | null {
  try {
    const saved = localStorage.getItem(themeKey);
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    return null;
  }
  return null;
}

function initialTheme(): Theme {
  const saved = storedTheme();
  if (saved) return saved;
  return typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function AppContent() {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [themeManuallySet, setThemeManuallySet] = useState(
    () => storedTheme() !== null,
  );
  const [activeSection, setActiveSection] = useState("home");
  const location = useLocation();
  const isBlogPage = location.pathname.startsWith("/blog");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#000000" : "#ffffff");
    if (themeManuallySet) {
      try {
        localStorage.setItem(themeKey, theme);
      } catch {
        // The theme remains active for this page even if storage is unavailable.
      }
    }
  }, [theme, themeManuallySet]);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
    const updateTheme = () => {
      if (!themeManuallySet) setTheme(colorScheme.matches ? "dark" : "light");
    };
    colorScheme.addEventListener("change", updateTheme);
    return () => colorScheme.removeEventListener("change", updateTheme);
  }, [themeManuallySet]);

  useEffect(() => {
    document.body.classList.toggle("blog-page", isBlogPage);
    return () => document.body.classList.remove("blog-page");
  }, [isBlogPage]);

  useEffect(() => {
    if (location.hash) {
      requestAnimationFrame(() => {
        document.getElementById(location.hash.slice(1))?.scrollIntoView();
      });
      return;
    }
    if (location.pathname !== "/" && !location.pathname.startsWith("/#")) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (isBlogPage) return;
    const update = () => {
      const sections = document.querySelectorAll<HTMLElement>("main section[id]");
      const header = document.querySelector(".header-nav");
      const marker =
        window.scrollY +
        (header?.getBoundingClientRect().height ?? 60) +
        window.innerHeight * 0.3;
      let current = sections[0]?.id ?? "home";
      sections.forEach((section) => {
        const bounds = section.getBoundingClientRect();
        const top = bounds.top + window.scrollY;
        if (marker >= top && marker < top + section.offsetHeight) {
          current = section.id;
        }
      });
      setActiveSection((previous) => (previous === current ? previous : current));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [isBlogPage, location.pathname]);

  return (
    <div className="min-h-screen">
      <Header
        activeSection={activeSection}
        isBlogPage={isBlogPage}
        theme={theme}
        onThemeToggle={() => {
          setThemeManuallySet(true);
          setTheme((current) => (current === "dark" ? "light" : "dark"))
        }}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/blog" element={<Navigate to="/blog/" replace />} />
        <Route
          path="/blog/"
          element={
            <Suspense fallback={<BlogLoading />}>
              <BlogPage />
            </Suspense>
          }
        />
        <Route
          path="/blog/:slug/"
          element={
            <Suspense fallback={<BlogLoading />}>
              <BlogPostPage />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <AppContent />
    </BrowserRouter>
  );
}
