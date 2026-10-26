# Bahruz Mammadov — Portfolio

Personal portfolio and Markdown blog, rebuilt with React, TypeScript, Vite, and Tailwind CSS. Existing portfolio content, design styles, public image paths, and blog URLs are retained.

## Requirements and local development

- Node.js 22 or newer
- npm

```sh
npm ci
npm run dev
```

Production checks and preview:

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
```

The production output is `dist/`. The build validates blog frontmatter and refreshes the RSS feed and sitemap from the Markdown source.

## Structure and content

- `src/App.tsx` — routes, theme, shared layout
- `src/components/` — navigation, footer, and shared headings
- `src/pages/` — portfolio and blog pages
- `src/lib/` — Markdown parsing and GitHub project loading
- `src/styles/` — preserved site styles plus Tailwind CSS v4
- `blog/content/` — Markdown posts and YAML frontmatter
- `public/assets/` — public images and repository fallback JSON

Add a Markdown file beneath `blog/content/` with `title`, `description`, `date` (`YYYY-MM-DD`), `slug` (lowercase letters, digits, and hyphens), and optional `tags` in its frontmatter. The slug determines the public URL `/blog/<slug>/`. Markdown is rendered with `marked` and sanitized with DOMPurify. Invalid required metadata stops the production build instead of silently omitting a post.

Place images and other public files under `public/`; URLs keep the corresponding path under the deployed site. The GitHub repositories section uses the public API, then cached data and `public/assets/data/repos.json` as fallbacks.

The existing CSS is retained to preserve typography, colors, spacing, breakpoints, and interaction states. Tailwind CSS v4 is configured through its Vite plugin for application utilities; the original detailed component styles remain in `src/styles/site.css` and `src/styles/blog.css`.

There is no backend. The contact form continues to use the existing Formspree endpoint. The former `blog/build.py` was a static Markdown-to-HTML generator; the Vite application now renders posts from the same Markdown sources and `scripts/build-content.mjs` generates the feed and sitemap. No Python server or runtime is required.

## Routing and SEO

React Router uses browser-history URLs. The existing routes remain `/`, `/blog/`, `/blog/hello/`, and `/blog/qloballasma/`; unknown paths show a 404 page. Client-side title, description, canonical, Open Graph, and article metadata are updated per route. GitHub Pages receives a `404.html` app fallback from its deployment workflow; Vercel and Netlify have SPA rewrites, and Cloudflare Pages uses its SPA fallback behavior. Static files are served before rewrites.

Vite's base defaults to `/`, appropriate for this repository's `bahruzmammad.github.io` root site. For a GitHub Pages project subpath, set `VITE_BASE_PATH=/repository-name/` for the build; the router and asset URLs use that base.

## Deployment

All platforms run the same `npm run build` and publish `dist/`.

### GitHub Pages

The workflow in `.github/workflows/deploy.yml` runs type checks, lint, tests, and the build, then deploys the artifact. In repository **Settings → Pages**, select **GitHub Actions** as the build and deployment source. Preserve any existing custom domain by keeping its `CNAME` in `public/`; none was present in the inspected project. This project repository is a user-site repository, so its default Vite base is `/`.

### Vercel

Import the repository into Vercel. Use build command `npm run build` and output directory `dist`; `vercel.json` supplies the SPA rewrite. Configure the custom domain in Vercel's project settings.

### Netlify

Import the repository into Netlify. `netlify.toml` sets build command `npm run build`, publish directory `dist`, and the SPA redirect. Configure the custom domain in the site's domain settings.

### Cloudflare Pages

Connect the repository in Cloudflare Pages, set build command `npm run build` and build output directory `dist`. Pages serves the single-page app fallback while retaining its static assets. Configure a custom domain from the Pages project.

No deployment has been run from this local workspace. Provider account linking, Pages settings, custom-domain DNS, and live deployment status must be verified in the respective provider dashboards.

## Known unavailable legacy files

The original HTML referenced a CV PDF, favicon, and certificate image/download that were not present in the repository inventory. The portfolio now avoids linking to missing downloads; add those actual files under `public/assets/` if they should be offered. The profile image remains the existing social image/favicon asset.
