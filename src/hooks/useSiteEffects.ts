import { useEffect } from "react";

export function useReveal(dependency: unknown): void {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(".reveal:not(.visible)");
    if (!elements.length) return;

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("visible"));
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const element = entry.target as HTMLElement;
          observer.unobserve(element);
          const delay = reducedMotion
            ? 0
            : Number.parseInt(element.dataset.delay ?? "0", 10);
          window.setTimeout(
            () => element.classList.add("visible"),
            Number.isNaN(delay) ? 0 : delay,
          );
        });
      },
      { threshold: 0.06, rootMargin: "0px 0px -6% 0px" },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [dependency]);
}

export function usePageMetadata(
  title: string,
  description: string,
  path: string,
  type: "website" | "article" = "website",
  noIndex = false,
): void {
  useEffect(() => {
    const route = `${import.meta.env.BASE_URL.replace(/\/$/, "")}${path}`;
    const url = new URL(route, window.location.origin).href;
    document.title = title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", description);
    document
      .querySelector('meta[name="robots"]')
      ?.setAttribute("content", noIndex ? "noindex, follow" : "index, follow");
    document
      .querySelector('meta[property="og:type"]')
      ?.setAttribute("content", type);
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", title);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute("content", description);
    document
      .querySelector('meta[property="og:url"]')
      ?.setAttribute("content", url);
    document
      .querySelector('meta[name="twitter:title"]')
      ?.setAttribute("content", title);
    document
      .querySelector('meta[name="twitter:description"]')
      ?.setAttribute("content", description);
    document
      .querySelector('meta[name="twitter:url"]')
      ?.setAttribute("content", url);

    let canonical = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.append(canonical);
    }
    canonical.href = url;

    let structuredData = document.querySelector<HTMLScriptElement>(
      'script[data-page-schema="article"]',
    );
    if (type === "article") {
      if (!structuredData) {
        structuredData = document.createElement("script");
        structuredData.type = "application/ld+json";
        structuredData.dataset.pageSchema = "article";
        document.head.append(structuredData);
      }
      structuredData.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        author: { "@type": "Person", name: "Bahruz Mammadov" },
        url,
      });
    } else {
      structuredData?.remove();
    }
  }, [description, noIndex, path, title, type]);
}
