import type { Repository } from "../types";

const cacheKey = "github_repos_cache_v1";
const cacheTtl = 10 * 60 * 1000;
const fallbackUrl = `${import.meta.env.BASE_URL}assets/data/repos.json`;
let pendingProjects: Promise<Repository[]> | null = null;

const projectNames: Record<string, string> = {
  "bahruzmammad.github.io": "Portfolio Website",
  "Discord-App": "Discord App",
  "Yoga-Page": "Yoga Landing Page",
  "Weather-App": "Weather App",
  "Weather-Page": "Weather Landing Page",
  "Unique-Car-Rental-Page": "Unique Car Rental",
  "Travel-Toor-Page": "Travel Tour",
  "Steed-Moto-Page": "Steed Moto",
  "Skywings-Travel-Page": "Skywings Travel",
  "Royal-Hotels-Page": "Royal Hotels",
  "Rental-Page": "Rental Website",
  "Photography-Page": "Photography Website",
  Neovim: "Neovim Configuration",
  "Pet-Place-Page": "Pet Place",
  "Pastry-World-Page": "Pastry World",
  "MyNotes-App": "MyNotes App",
  "Mole-Game-Page": "Mole Game",
  "Mary-Hardy-Portfolio-Page": "Mary Hardy Portfolio",
  "Marvel-Page": "Marvel Website",
  "IceWorld-Page": "IceWorld Website",
  "Hosale-Real-Estate-Page": "Hosale Real Estate",
  "GScon-Gaming-Controller-Page": "GScon Gaming Controller",
  "Fitnesxia-Page": "Fitnesxia",
  "FitClub-Page": "FitClub",
  "Falcon-Page": "Falcon Website",
  "Eightyeight-Page": "Eightyeight Website",
  "Car-Rental-Page": "Car Rental",
  "Cafe-Page": "Cafe Website",
  "AgencyBD-Page": "AgencyBD",
  "Advanto-Page": "Advanto Travel Website",
};

const liveUrls: Record<string, string> = {
  "bahruzmammad.github.io": "https://bahruzmammad.github.io/",
  "Weather-App": "https://weather-app.pages.dev/",
  "MyNotes-App": "https://mynotes-react.pages.dev/",
  "Advanto-Page": "https://advanto.pages.dev/",
  "AgencyBD-Page": "https://agencybd.pages.dev/",
  "Cafe-Page": "https://cafehtmlcssjs.netlify.app/",
  "Eightyeight-Page": "https://eightyeight-bj0.pages.dev/",
  "Falcon-Page": "https://falcon-html-css-js.pages.dev/",
  "FitClub-Page": "https://fitclub-4jv.pages.dev/",
  "Fitnesxia-Page": "https://fitnesxia.pages.dev/",
  "GScon-Gaming-Controller-Page":
    "https://gscon-gaming-controller-html-css-js.pages.dev/",
  "Hosale-Real-Estate-Page": "https://hosale-real-estate.pages.dev/",
  "IceWorld-Page": "https://iceworld-1by.pages.dev/",
  "Marvel-Page": "https://marvel-3do.pages.dev/",
  "Mary-Hardy-Portfolio-Page":
    "https://mary-hardy-portfolio-html-css-js.pages.dev/",
  "Mole-Game-Page": "https://molegamehtmlcssjs.netlify.app/",
  "Pastry-World-Page": "https://pastry-world.pages.dev/",
  "Pet-Place-Page": "https://pet-place-html-css-js.pages.dev/",
  "Photography-Page": "https://photography-html-css-js.pages.dev/",
  "Royal-Hotels-Page": "https://royal-hotels.pages.dev/",
  "Skywings-Travel-Page":
    "https://skywings-travel-website-html-css-js.pages.dev/",
  "Steed-Moto-Page": "https://steed-moto.pages.dev/",
  "Unique-Car-Rental-Page": "https://unique-ah5.pages.dev/",
  "Weather-Page": "https://weatherhtmlcssjs.netlify.app/",
  "Yoga-Page":
    "https://yoga-landing-page-with-html-css-js.netlify.app/",
};

function readCache(): Repository[] | null {
  try {
    const raw = localStorage.getItem(cacheKey);
    if (!raw) return null;
    const cached = JSON.parse(raw) as { savedAt?: number; repos?: Repository[] };
    if (!Array.isArray(cached.repos)) return null;
    const validRepos = cached.repos.filter(isRepository);
    return validRepos.length ? validRepos : null;
  } catch {
    return null;
  }
}

function freshCache(): Repository[] | null {
  try {
    const raw = localStorage.getItem(cacheKey);
    if (!raw) return null;
    const cached = JSON.parse(raw) as { savedAt?: number; repos?: Repository[] };
    if (
      typeof cached.savedAt === "number" &&
      Date.now() - cached.savedAt < cacheTtl &&
      Array.isArray(cached.repos) &&
      cached.repos.length
    ) {
      const validRepos = cached.repos.filter(isRepository);
      return validRepos.length ? validRepos : null;
    }
  } catch {
    return null;
  }
  return null;
}

function isRepository(value: unknown): value is Repository {
  if (!value || typeof value !== "object") return false;
  const repo = value as Partial<Repository>;
  return (
    typeof repo.name === "string" &&
    repo.name.trim().length > 0 &&
    isHttpUrl(repo.html_url) &&
    (repo.description === null || typeof repo.description === "string") &&
    (repo.language === null || typeof repo.language === "string") &&
    typeof repo.stargazers_count === "number" &&
    Number.isFinite(repo.stargazers_count) &&
    typeof repo.forks_count === "number" &&
    Number.isFinite(repo.forks_count) &&
    (repo.homepage === null || typeof repo.homepage === "string") &&
    (repo.visibility === undefined || typeof repo.visibility === "string") &&
    (repo.private === undefined || typeof repo.private === "boolean")
  );
}

function isHttpUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

function saveCache(repos: Repository[]): void {
  try {
    localStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), repos }));
  } catch {
    // Storage is optional; the current request can still be rendered.
  }
}

async function fetchGitHubRepos(): Promise<Repository[]> {
  const repos: Repository[] = [];
  for (let page = 1; page <= 5; page++) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(
        `https://api.github.com/users/bahruzmammad/repos?per_page=100&page=${page}&sort=updated&direction=desc`,
        {
          headers: { Accept: "application/vnd.github+json" },
          signal: controller.signal,
        },
      );
      if (!response.ok) {
        throw new Error(`GitHub API returned ${response.status}`);
      }
      const result: unknown = await response.json();
      if (!Array.isArray(result)) {
        throw new Error("GitHub API returned an invalid repository list");
      }
      repos.push(...result.filter(isRepository));
      if (result.length < 100) break;
    } finally {
      window.clearTimeout(timeout);
    }
  }
  return repos.filter(
    (repo) =>
      repo.name &&
      repo.private !== true &&
      (!repo.visibility || repo.visibility === "public"),
  );
}

async function loadProjectsUncached(): Promise<Repository[]> {
  const fresh = freshCache();
  if (fresh) return fresh;

  try {
    const repos = await fetchGitHubRepos();
    if (repos.length) {
      saveCache(repos);
      return repos;
    }
  } catch (error) {
    console.warn("[GitHub API]", error);
  }

  const stale = readCache();
  if (stale) return stale;

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(fallbackUrl, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Repository fallback returned ${response.status}`);
    }
    const repos: unknown = await response.json();
    if (!Array.isArray(repos)) {
      throw new Error("Repository fallback is invalid");
    }
    if (repos.length === 0) return [];
    const validRepos = repos.filter(isRepository);
    if (validRepos.length === 0) {
      throw new Error("Repository fallback contains no valid repositories");
    }
    return validRepos;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function loadProjects(): Promise<Repository[]> {
  if (pendingProjects) return pendingProjects;
  const request = loadProjectsUncached();
  pendingProjects = request;
  void request.then(
    () => {
      if (pendingProjects === request) pendingProjects = null;
    },
    () => {
      if (pendingProjects === request) pendingProjects = null;
    },
  );
  return request;
}

export function projectName(repository: Repository): string {
  return (
    projectNames[repository.name] ??
    repository.name
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
}

export function projectLiveUrl(repository: Repository): string | null {
  const url = liveUrls[repository.name] ?? repository.homepage?.trim();
  return isHttpUrl(url) ? url : null;
}
