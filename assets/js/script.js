$(function () {
  "use strict";

  const $window = $(window);
  const $html = $("html");
  const $body = $("body");
  const $sections = $("main section[id]");
  const $navLinks = $(".nav-list a");
  const isBlogPage = $body.hasClass("blog-page");
  const $about = $("#about");
  const $aboutBody = $(".about-body");
  const $paragraphs = $aboutBody.find("p");
  const $projectsGrid = $("#github-projects");
  const $themeToggle = $("#theme-toggle");
  const $themeColor = $("#theme-color");
  const $contactForm = $("#contact-form");
  const $contactButton = $(".contact-button");
  const $formStatus = $(".form-status");
  const $menuToggle = $("#menu-toggle");
  const $mainMenu = $("#main-menu");

  const DESKTOP_BREAKPOINT = 1024;
  const MOBILE_BREAKPOINT = 800;
  const ABOUT_MIN_STEP = 110;
  const ABOUT_MAX_STEP = 165;
  const SCROLL_DURATION = 700;
  const REVEAL_THRESHOLD = 0.06;
  const REVEAL_ROOT_MARGIN = "0px 0px -6% 0px";
  const GITHUB_USERNAME = "bahruzmammad";
  const GITHUB_PROFILE_URL = `https://github.com/${GITHUB_USERNAME}`;
  const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos`;
  const GITHUB_PER_PAGE = 100;
  const GITHUB_TIMEOUT = 8000;
  const GITHUB_MAX_PAGES = 5;
  const GITHUB_CACHE_KEY = "github_repos_cache_v1";
  const GITHUB_CACHE_TTL = 10 * 60 * 1000;
  const GITHUB_FALLBACK_URL = "assets/data/repos.json";
  const THEME_KEY = "theme";
  const CERT_AUTOPLAY_MS = 5500;
  const CARD_STAGGER_MS = 60;
  const DEMO_IMG_BASE = "assets/img/demo/";

  /* ------------------------------------------------------------------ */
  /* EDUCATION DATA                                                      */
  /* Add a new school by copying one { ... }, block and editing it.      */
  /* ------------------------------------------------------------------ */
  const EDUCATION_ITEMS = [
    {
      image: "assets/img/kollec-idhtk.jpg",
      name: "Ismayilli State College of Technology and Humanities",
      program: "Computer Software Systems",
      period: "2024 \u2013 Present",
      description:
        "Studying software engineering fundamentals, programming, algorithms, and computer systems.",
      url: "",
      badge: "Current",
      tech: [],
    },
    {
      image: "assets/img/divfasad1.png",
      name: "Div Academy",
      program: "Web Development",
      period: "2023 \u2013 2024",
      description:
        "Intensive web development training covering modern frontend technologies and practical project building.",
      url: "https://divacademy.az/",
      badge: "",
      tech: ["HTML5", "CSS3", "JavaScript", "jQuery", "AJAX", "Bootstrap"],
    },
  ];

  const PROJECT_NAME_OVERRIDES = {
    "bahruzmammad.github.io": "Portfolio Website",
    "Yoga-Page": "Yoga Landing Page",
    "Weather-App": "Weather App",
    "Weather-Page": "Weather Landing Page",
    "Unique-Car-Rental-Page": "Unique Car Rental",
    "Travel-Toor-Page": "Travel Tour",
    "Steed-Moto-Page": "Steed Moto",
    "Skywings-Travel-Page": "Skywings Travel",
    "Royal-Hotels-Page": "Royal Hotels",
    "Rental-Page": "Rental Website",
    "Discord-App": "Discord App",
    "Photography-Page": "Photography Website",
    "Pet-Place-Page": "Pet Place",
    "Pastry-World-Page": "Pastry World",
    Neovim: "Neovim Configuration",
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

  const PROJECT_URL_OVERRIDES = {
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
    "Yoga-Page": "https://yoga-landing-page-with-html-css-js.netlify.app/",
  };

  const PROJECT_OVERRIDES = {};

  const SKILL_GROUP_VISIBILITY = {
    Backend: false,
    Frontend: true,
    Database: false,
    "Software Engineering": false,
    Other: false,
  };

  const SKILL_VISIBILITY = {
    Java: true,
    "Spring Boot": true,
    "Node.js": true,
    "Express.js": true,
    "REST APIs": true,
    HTML5: true,
    CSS3: true,
    JavaScript: true,
    "React.js": true,
    "Next.js": true,
    Redux: true,
    "Tailwind CSS": true,
    Bootstrap: true,
    jQuery: true,
    AJAX: true,
    MySQL: true,
    MongoDB: true,
    SQLite: true,
    OOP: true,
    "Data Structures": true,
    Algorithms: true,
    Git: true,
    Architecture: true,
    "Computer Science": true,
    "Operating Systems": true,
    "Computer Networking": true,
    "Web Development": true,
    "Full-Stack Development": true,
  };

  /* ------------------------------------------------------------------ */
  /* CERTIFICATE DATA                                                    */
  /*                                                                     */
  /* HOW TO ADD A NEW CERTIFICATE:                                       */
  /*   1. Copy the whole { ... }, block of the first item.               */
  /*   2. Paste it right after it (keep the comma between blocks).       */
  /*   3. Change the fields. Leave a field as "" (or [] for skills)      */
  /*      if you do not have it, the card hides that part.               */
  /*   4. Put the image into assets/img/ and set the "image" path.       */
  /*                                                                     */
  /* Fields:                                                             */
  /*   image       local image path (do NOT use a LinkedIn image URL,    */
  /*               those links are signed and expire)                    */
  /*   title       certificate name                                      */
  /*   issuer      who issued it                                         */
  /*   date        text shown next to the issuer                         */
  /*   description short summary                                         */
  /*   credentialId  shown as "Credential ID ..."                        */
  /*   skills      array of short tags                                   */
  /*   link        verification URL, shows the "Show credential" button  */
  /*   download    file path for the Download button ("" hides it)       */
  /* ------------------------------------------------------------------ */
  const CERTIFICATE_ITEMS = [
    {
      image: "assets/img/certificate-1.jpg",
      title: "Web Development Fundamentals",
      issuer: "IBM SkillsBuild",
      date: "Issued Sep 2026",
      description:
        "Completed the Web Development Fundamentals credential issued by IBM SkillsBuild, covering fundamental concepts and practices in web development.",
      credentialId: "2def4899-7299-4ce2-84b5-57b999cebd29",
      skills: ["Web Design", "Software Development Life Cycle (SDLC)"],
      link: "https://www.credly.com/badges/2def4899-7299-4ce2-84b5-57b999cebd29/linked_in_profile",
      download: "assets/img/certificate-1.jpg",
    },

    // ---- TEMPLATE FOR THE SECOND CERTIFICATE (remove the // to use) ----
    // {
    //   image: "assets/img/certificate-2.jpg",
    //   title: "Certificate name",
    //   issuer: "Issuer name",
    //   date: "Issued Month YYYY",
    //   description: "Short description of what the certificate covers.",
    //   credentialId: "",
    //   skills: [],
    //   link: "",
    //   download: "assets/img/certificate-2.jpg",
    // },
  ];

  let ticking = false;
  let resizeTimer = null;
  let revealObserver = null;
  let certIndex = 0;
  let certTimer = null;
  let certPaused = false;
  let githubRequestId = 0;
  let githubInFlight = null;

  function isDesktop() {
    return window.innerWidth > DESKTOP_BREAKPOINT;
  }

  function isMobile() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
  }

  function getHeaderHeight() {
    return $(".header-nav").outerHeight() || 60;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
  }

  function getAboutStep() {
    return clamp($window.height() * 0.16, ABOUT_MIN_STEP, ABOUT_MAX_STEP);
  }

  function escapeHtml(value) {
    if (value === null || value === undefined) return "";
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatRepositoryName(name) {
    return String(name || "")
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, function (l) {
        return l.toUpperCase();
      });
  }

  function getProjectOverride(repoName) {
    return Object.prototype.hasOwnProperty.call(PROJECT_OVERRIDES, repoName)
      ? PROJECT_OVERRIDES[repoName]
      : null;
  }

  function isProjectVisible(repo) {
    if (!repo || !repo.name) return false;

    if (repo.name.toLowerCase() === "nvim") {
      return false;
    }

    const ov = getProjectOverride(repo.name);

    if (ov && Object.prototype.hasOwnProperty.call(ov, "visible")) {
      return ov.visible !== false;
    }

    return true;
  }

  function getProjectName(repo) {
    const ov = getProjectOverride(repo.name);
    if (ov && ov.name) return ov.name;
    if (
      Object.prototype.hasOwnProperty.call(PROJECT_NAME_OVERRIDES, repo.name)
    ) {
      return PROJECT_NAME_OVERRIDES[repo.name];
    }
    return formatRepositoryName(repo.name);
  }

  function getProjectLiveUrl(repo) {
    const ov = getProjectOverride(repo.name);
    if (ov && ov.live) return ov.live;
    if (
      Object.prototype.hasOwnProperty.call(PROJECT_URL_OVERRIDES, repo.name)
    ) {
      return PROJECT_URL_OVERRIDES[repo.name];
    }
    if (repo.homepage && String(repo.homepage).trim()) {
      return String(repo.homepage).trim();
    }
    return null;
  }

  function getProjectGithubUrl(repo) {
    const ov = getProjectOverride(repo.name);
    if (ov && ov.github) return ov.github;
    return repo.html_url;
  }

  function getProjectDemoImage(repo) {
    const ov = getProjectOverride(repo.name);
    if (ov && ov.demoImage === false) return null;
    if (ov && ov.demoImage && String(ov.demoImage).trim()) {
      return String(ov.demoImage).trim();
    }
    return null;
  }

  function getSystemTheme() {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
    return "light";
  }

  function getStoredTheme() {
    try {
      const t = localStorage.getItem(THEME_KEY);
      if (t === "dark" || t === "light") return t;
    } catch (e) {}
    return null;
  }

  function getCurrentTheme() {
    return getStoredTheme() || getSystemTheme();
  }

  function updateThemeMeta(theme) {
    if ($themeColor.length) {
      $themeColor.attr("content", theme === "dark" ? "#000000" : "#ffffff");
    }
  }

  function updateThemeButton(theme) {
    if (!$themeToggle.length) return;
    const isDark = theme === "dark";
    $themeToggle.find(".theme-icon").text(isDark ? "\u2600" : "\u263e");
    $themeToggle.attr("aria-pressed", String(isDark));
    $themeToggle.attr(
      "aria-label",
      isDark ? "Switch to light mode" : "Switch to dark mode",
    );
    $themeToggle.attr(
      "title",
      isDark ? "Switch to light mode" : "Switch to dark mode",
    );
  }

  function applyTheme(theme) {
    const t = theme === "dark" ? "dark" : "light";
    $html.attr("data-theme", t);
    updateThemeMeta(t);
    updateThemeButton(t);
  }

  function initializeTheme() {
    applyTheme(getCurrentTheme());
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
  }

  function toggleTheme() {
    const next = $html.attr("data-theme") === "dark" ? "light" : "dark";
    saveTheme(next);
    applyTheme(next);
  }

  /* ------------------------------------------------------------------ */
  /* GITHUB PROJECTS: cache, API, local fallback, error handling         */
  /* ------------------------------------------------------------------ */

  function renderGitHubLoading() {
    $projectsGrid.html(
      `<article class="project-card github-loading">
                <div class="project-content">
                    <span class="project-number">\u2014</span>
                    <h3>Loading\u2026</h3>
                    <p>Fetching repositories from GitHub.</p>
                    <div class="project-tech"><span>GitHub API</span></div>
                </div>
            </article>`,
    );
  }

  function pickRepoFields(repo) {
    return {
      name: repo.name,
      description: repo.description,
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      homepage: repo.homepage,
      html_url: repo.html_url,
      visibility: repo.visibility,
      private: repo.private,
    };
  }

  function isPublicRepo(repo) {
    return !!(
      repo &&
      repo.name &&
      repo.private !== true &&
      (!repo.visibility || repo.visibility === "public")
    );
  }

  function readRepoCache(allowStale) {
    try {
      const raw = localStorage.getItem(GITHUB_CACHE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || !Array.isArray(data.repos) || !data.repos.length) {
        return null;
      }
      const fresh = Date.now() - Number(data.savedAt) < GITHUB_CACHE_TTL;
      return fresh || allowStale ? data : null;
    } catch (e) {
      return null;
    }
  }

  function writeRepoCache(repos) {
    try {
      localStorage.setItem(
        GITHUB_CACHE_KEY,
        JSON.stringify({ savedAt: Date.now(), repos: repos }),
      );
    } catch (e) {}
  }

  function parseGitHubError(xhr, textStatus) {
    const info = {
      kind: "unknown",
      status: xhr ? xhr.status : 0,
      message: "",
      resetAt: null,
    };

    if (textStatus === "timeout") {
      info.kind = "timeout";
      return info;
    }

    if (!xhr || xhr.status === 0) {
      info.kind = "network";
      return info;
    }

    const remaining = xhr.getResponseHeader("x-ratelimit-remaining");
    const reset = xhr.getResponseHeader("x-ratelimit-reset");
    const retryAfter = xhr.getResponseHeader("retry-after");
    const apiMessage =
      xhr.responseJSON && xhr.responseJSON.message
        ? String(xhr.responseJSON.message)
        : "";

    info.message = apiMessage;

    if (retryAfter && !isNaN(parseInt(retryAfter, 10))) {
      info.resetAt = new Date(Date.now() + parseInt(retryAfter, 10) * 1000);
    } else if (reset && !isNaN(parseInt(reset, 10))) {
      info.resetAt = new Date(parseInt(reset, 10) * 1000);
    }

    if (
      (xhr.status === 403 || xhr.status === 429) &&
      (remaining === "0" || retryAfter || /rate limit/i.test(apiMessage))
    ) {
      info.kind = "rate-limit";
    } else if (xhr.status === 401) {
      info.kind = "auth";
    } else if (xhr.status === 403) {
      info.kind = "forbidden";
    } else if (xhr.status === 404) {
      info.kind = "not-found";
    } else if (xhr.status >= 500) {
      info.kind = "server";
    }

    return info;
  }

  function getGitHubErrorMessage(err) {
    if (!err) return "Could not load GitHub repositories right now.";

    switch (err.kind) {
      case "rate-limit":
        return err.resetAt
          ? "GitHub API limit reached. Try again after " +
              err.resetAt.toLocaleTimeString() +
              "."
          : "GitHub API limit reached. Please try again later.";
      case "timeout":
        return "GitHub did not respond in time. Please try again.";
      case "network":
        return "Network error while contacting GitHub.";
      case "server":
        return "GitHub is temporarily unavailable.";
      default:
        return "Could not load GitHub repositories right now.";
    }
  }

  function fetchGitHubPage(page, collected) {
    if (page > GITHUB_MAX_PAGES) {
      return $.Deferred().resolve(collected).promise();
    }

    const deferred = $.Deferred();

    $.ajax({
      url: GITHUB_API_URL,
      method: "GET",
      dataType: "json",
      timeout: GITHUB_TIMEOUT,
      headers: { Accept: "application/vnd.github+json" },
      data: {
        page: page,
        per_page: GITHUB_PER_PAGE,
        sort: "updated",
        direction: "desc",
      },
    })
      .done(function (repos) {
        if (!Array.isArray(repos)) {
          deferred.reject({
            kind: "unknown",
            status: 200,
            message: "Invalid response.",
            resetAt: null,
          });
          return;
        }

        const all = collected.concat(repos);

        if (repos.length < GITHUB_PER_PAGE) {
          deferred.resolve(all);
        } else {
          fetchGitHubPage(page + 1, all).then(
            deferred.resolve,
            deferred.reject,
          );
        }
      })
      .fail(function (xhr, textStatus) {
        deferred.reject(parseGitHubError(xhr, textStatus));
      });

    return deferred.promise();
  }

  function fetchLocalRepos() {
    const deferred = $.Deferred();

    $.ajax({
      url: GITHUB_FALLBACK_URL,
      method: "GET",
      dataType: "json",
      timeout: GITHUB_TIMEOUT,
    })
      .done(function (data) {
        if (Array.isArray(data) && data.length) {
          deferred.resolve(data);
        } else {
          deferred.reject({
            kind: "unknown",
            status: 200,
            message: "Fallback file is empty or invalid.",
            resetAt: null,
          });
        }
      })
      .fail(function (xhr, textStatus) {
        deferred.reject({
          kind: "unknown",
          status: xhr ? xhr.status : 0,
          message: "Fallback file unavailable (" + textStatus + ").",
          resetAt: null,
        });
      });

    return deferred.promise();
  }

  function loadRepos() {
    const fresh = readRepoCache(false);

    if (fresh) {
      return $.Deferred()
        .resolve({ repos: fresh.repos, source: "cache" })
        .promise();
    }

    return fetchGitHubPage(1, []).then(
      function (repos) {
        const slim = repos.map(pickRepoFields);
        writeRepoCache(slim);
        return { repos: slim, source: "api" };
      },
      function (apiError) {
        console.warn(
          "[GitHub API]",
          apiError.kind,
          apiError.status || "",
          apiError.message || "",
          apiError.resetAt ? "reset: " + apiError.resetAt.toISOString() : "",
        );

        const stale = readRepoCache(true);
        if (stale) {
          return { repos: stale.repos, source: "stale-cache" };
        }

        return fetchLocalRepos().then(
          function (data) {
            return { repos: data.map(pickRepoFields), source: "local-json" };
          },
          function (fallbackError) {
            console.warn(
              "[GitHub fallback]",
              fallbackError.message || "failed",
            );
            return $.Deferred().reject(apiError).promise();
          },
        );
      },
    );
  }

  function getGitHubRepos() {
    if (!$projectsGrid.length) return;
    if (githubInFlight) return;

    const requestId = ++githubRequestId;

    $projectsGrid.attr("aria-busy", "true");
    renderGitHubLoading();

    githubInFlight = loadRepos()
      .done(function (result) {
        if (requestId !== githubRequestId) return;

        const publicRepos = (result.repos || []).filter(isPublicRepo);

        if (!publicRepos.length) {
          renderGitHubError({ kind: "unknown" });
          return;
        }

        renderGitHubProjects(publicRepos);
      })
      .fail(function (err) {
        if (requestId !== githubRequestId) return;
        renderGitHubError(err);
      })
      .always(function () {
        if (requestId !== githubRequestId) return;
        githubInFlight = null;
        $projectsGrid.attr("aria-busy", "false");
      });
  }

  function renderGitHubProjects(repos) {
    if (!$projectsGrid.length) return;

    const visible = repos.filter(isProjectVisible);

    if (!visible.length) {
      $projectsGrid.html(
        `
                <article class="project-card reveal visible">
                    <div class="project-content">
                        <span class="project-number">&#8212;</span>
                        <h3>No projects found</h3>
                        <p>No public repositories are available.</p>
                        <div class="project-links">
                            <a
                                class="project-link project-link-github"
                                href="${escapeHtml(GITHUB_PROFILE_URL)}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                GitHub &rarr;
                            </a>
                        </div>
                    </div>
                </article>
                `,
      );

      $projectsGrid.attr("aria-busy", "false");
      return;
    }

    const html = visible
      .map(function (repo, index) {
        const number = String(index + 1).padStart(2, "0");
        const name = escapeHtml(getProjectName(repo));
        const description = escapeHtml(repo.description || "A GitHub project.");
        const language = repo.language ? escapeHtml(repo.language) : "Code";
        const stars = Number(repo.stargazers_count) || 0;
        const forks = Number(repo.forks_count) || 0;
        const liveUrl = getProjectLiveUrl(repo);
        const demoImage = getProjectDemoImage(repo);
        const safeLive = liveUrl ? escapeHtml(liveUrl) : null;
        const safeGithub = escapeHtml(getProjectGithubUrl(repo));
        const delay = index * CARD_STAGGER_MS;

        const meta = [`<span>${language}</span>`];

        if (stars > 0) {
          meta.push(`<span>&#9733;&nbsp;${stars}</span>`);
        }

        if (forks > 0) {
          meta.push(`<span>Forks&nbsp;${forks}</span>`);
        }

        const demoHtml = demoImage
          ? `<div class="project-demo-img">
                        <img
                            src="${escapeHtml(demoImage)}"
                            alt="${name} preview"
                            loading="lazy"
                        />
                    </div>`
          : "";

        const liveLink = safeLive
          ? `<a
                        class="project-link project-link-live"
                        href="${safeLive}"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="View live demo of ${name} (opens in new tab)"
                    >
                        Live Demo &rarr;
                    </a>`
          : "";

        const githubLink = `
                    <a
                        class="project-link project-link-github"
                        href="${safeGithub}"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="View ${name} source code on GitHub (opens in new tab)"
                    >
                        GitHub &rarr;
                    </a>
                `;

        return `
                    <article class="project-card reveal" data-delay="${delay}">
                        ${demoHtml}
                        <div class="project-content">
                            <span class="project-number">${number}</span>
                            <h3>${name}</h3>
                            <p>${description}</p>
                            <div class="project-tech">
                                ${meta.join("")}
                            </div>
                            <div class="project-links">
                                ${liveLink}
                                ${githubLink}
                            </div>
                        </div>
                    </article>
                `;
      })
      .join("");

    $projectsGrid.html(html);
    $projectsGrid.attr("aria-busy", "false");

    $projectsGrid.find(".project-demo-img img").on("error", function () {
      $(this).parent().hide();
    });

    window.requestAnimationFrame(function () {
      setupRevealObserver();
      setupProjectHover();
    });
  }

  function renderGitHubError(err) {
    if (!$projectsGrid.length) return;
    $projectsGrid.html(
      `<article class="project-card reveal visible">
                <div class="project-content">
                    <span class="project-number">\u2014</span>
                    <h3>Projects unavailable</h3>
                    <p>${escapeHtml(getGitHubErrorMessage(err))}</p>
                    <div class="project-links">
                        <a class="project-link project-link-github" href="${escapeHtml(GITHUB_PROFILE_URL)}" target="_blank" rel="noopener noreferrer">GitHub &rarr;</a>
                    </div>
                </div>
            </article>`,
    );
    $projectsGrid.attr("aria-busy", "false");
  }

  /* ------------------------------------------------------------------ */
  /* EDUCATION                                                           */
  /* ------------------------------------------------------------------ */

  function renderEducation() {
    const $grid = $("#education-grid");
    if (!$grid.length || !EDUCATION_ITEMS.length) return;

    const html = EDUCATION_ITEMS.map(function (item, index) {
      const hasImage = item.image && item.image.trim();
      const hasUrl = item.url && item.url.trim();
      const hasTech = Array.isArray(item.tech) && item.tech.length;
      const hasDesc = item.description && item.description.trim();
      const hasBadge = item.badge && item.badge.trim();
      const delay = index * CARD_STAGGER_MS;

      const imgHtml = hasImage
        ? `<div class="education-img-wrap"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy" /></div>`
        : "";

      const badgeHtml = hasBadge
        ? `<span class="education-badge">${escapeHtml(item.badge)}</span>`
        : "";

      const techHtml = hasTech
        ? `<div class="education-tech">${item.tech
            .map(function (t) {
              return `<span>${escapeHtml(t)}</span>`;
            })
            .join("")}</div>`
        : "";

      const descHtml = hasDesc
        ? `<p class="education-desc">${escapeHtml(item.description)}</p>`
        : "";

      const linkHtml = hasUrl
        ? `<a class="education-link" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" aria-label="Visit ${escapeHtml(item.name)} website (opens in new tab)">Visit website \u2197</a>`
        : "";

      return `<article class="education-card reveal" data-delay="${delay}">
                ${imgHtml}
                <div class="education-body">
                    <div class="education-meta">
                        ${badgeHtml}
                        <span class="education-date">${escapeHtml(item.period || "")}</span>
                    </div>
                    <h3>${escapeHtml(item.name || "")}</h3>
                    <p class="education-field">${escapeHtml(item.program || "")}</p>
                    ${descHtml}
                    ${techHtml}
                    ${linkHtml}
                </div>
            </article>`;
    }).join("");

    $grid.html(html);
    window.requestAnimationFrame(setupRevealObserver);
  }

  /* ------------------------------------------------------------------ */
  /* SKILLS                                                              */
  /* ------------------------------------------------------------------ */

  function applySkillVisibility() {
    $(".skill-group").each(function () {
      const $group = $(this);
      const groupName = $group.find("h3").first().text().trim();
      const groupVisible = Object.prototype.hasOwnProperty.call(
        SKILL_GROUP_VISIBILITY,
        groupName,
      )
        ? SKILL_GROUP_VISIBILITY[groupName]
        : true;
      if (!groupVisible) {
        $group.hide();
        return;
      }
      $group.show();
      let visibleCount = 0;
      $group.find("li").each(function () {
        const $skill = $(this);
        const sv = Object.prototype.hasOwnProperty.call(
          SKILL_VISIBILITY,
          $skill.text().trim(),
        )
          ? SKILL_VISIBILITY[$skill.text().trim()]
          : true;
        if (sv) {
          $skill.show();
          visibleCount++;
        } else {
          $skill.hide();
        }
      });
      if (visibleCount === 0) $group.hide();
    });
  }

  /* ------------------------------------------------------------------ */
  /* CERTIFICATES                                                        */
  /* ------------------------------------------------------------------ */

  function stopCertTimer() {
    if (certTimer !== null) {
      window.clearInterval(certTimer);
      certTimer = null;
    }
  }

  function startCertTimer() {
    stopCertTimer();
    if (CERTIFICATE_ITEMS.length <= 1) return;
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    certTimer = window.setInterval(function () {
      if (!certPaused) renderCert((certIndex + 1) % CERTIFICATE_ITEMS.length);
    }, CERT_AUTOPLAY_MS);
  }

  // Fills the single certificate card with the item at `index`.
  function renderCert(index) {
    if (!CERTIFICATE_ITEMS.length) return;
    const cert = CERTIFICATE_ITEMS[index];
    if (!cert) return;
    certIndex = index;

    // Image: if there is no image or it fails to load, hide the image column
    const $img = $("#cert-img");
    const $main = $(".cert-main");
    $img.off("error.cert load.cert");
    if (cert.image && cert.image.trim()) {
      $main.removeClass("no-image");
      $img
        .on("error.cert", function () {
          $main.addClass("no-image");
        })
        .on("load.cert", function () {
          $main.removeClass("no-image");
        })
        .attr("src", cert.image)
        .attr("alt", cert.title ? "Certificate: " + cert.title : "Certificate");
    } else {
      $img.removeAttr("src").attr("alt", "");
      $main.addClass("no-image");
    }

    $("#cert-title").text(cert.title || "");
    $("#cert-issuer").text(cert.issuer || "");
    $("#cert-date").text(cert.date || "");
    $("#cert-desc").text(cert.description || "");
    $("#cert-indicator").text(index + 1 + " / " + CERTIFICATE_ITEMS.length);

    // Credential ID (hidden by CSS when empty)
    $("#cert-id").text(
      cert.credentialId ? "Credential ID " + cert.credentialId : "",
    );

    // Skills chips (hidden by CSS when empty)
    const $skills = $("#cert-skills").empty();
    if (Array.isArray(cert.skills)) {
      cert.skills.forEach(function (skill) {
        $("<li>").text(skill).appendTo($skills);
      });
    }

    // "Show credential" button
    const $view = $("#cert-view");
    if (cert.link && cert.link.trim()) {
      $view
        .attr("href", cert.link)
        .attr("aria-label", "Show credential: " + (cert.title || ""))
        .show();
    } else {
      $view.hide();
    }

    // "Download" button
    const $download = $("#cert-download");
    if (cert.download && cert.download.trim()) {
      $download
        .attr("href", cert.download)
        .attr("download", cert.title || "certificate")
        .attr("aria-label", "Download certificate: " + (cert.title || ""))
        .show();
    } else {
      $download.hide();
    }

    $("#cert-prev").prop("disabled", index <= 0);
    $("#cert-next").prop("disabled", index >= CERTIFICATE_ITEMS.length - 1);
  }

  function initCertShowcase() {
    const $showcase = $("#cert-showcase");
    if (!$showcase.length || !CERTIFICATE_ITEMS.length) {
      $showcase.hide();
      return;
    }

    renderCert(0);

    // With one certificate the arrows and counter are not needed
    if (CERTIFICATE_ITEMS.length <= 1) {
      $("#cert-controls").hide();
    } else {
      startCertTimer();
    }

    $("#cert-prev").on("click", function () {
      certPaused = true;
      stopCertTimer();
      renderCert(Math.max(0, certIndex - 1));
      window.setTimeout(function () {
        certPaused = false;
        startCertTimer();
      }, 3000);
    });

    $("#cert-next").on("click", function () {
      certPaused = true;
      stopCertTimer();
      renderCert(Math.min(CERTIFICATE_ITEMS.length - 1, certIndex + 1));
      window.setTimeout(function () {
        certPaused = false;
        startCertTimer();
      }, 3000);
    });

    // Pause autoplay while the user hovers or focuses the card
    $showcase.on("mouseenter focusin", function () {
      certPaused = true;
    });
    $showcase.on("mouseleave", function () {
      if (!$showcase.is(":focus-within")) certPaused = false;
    });
    $showcase.on("focusout", function () {
      window.setTimeout(function () {
        if (!$showcase.is(":focus-within")) certPaused = false;
      }, 100);
    });
  }

  /* ------------------------------------------------------------------ */
  /* ABOUT SCROLL                                                        */
  /* ------------------------------------------------------------------ */

  function updateAboutHeight() {
    if (!$about.length || !isDesktop()) {
      $about.css("height", "auto");
      return;
    }
    if (!$paragraphs.length) {
      $about.css("height", "auto");
      return;
    }
    const step = getAboutStep();
    $about.css(
      "height",
      $window.height() +
        Math.max(0, $paragraphs.length - 1) * step +
        getHeaderHeight() +
        "px",
    );
  }

  function updateAboutParagraphs() {
    if (!$about.length || !$paragraphs.length) return;

    if (!isDesktop()) {
      $paragraphs.removeClass("active").first().addClass("active");
      return;
    }

    const aboutOffset = $about.offset();
    if (!aboutOffset) return;
    const rel = $window.scrollTop() - aboutOffset.top;
    if (rel <= 0) {
      $paragraphs.removeClass("active").first().addClass("active");
      return;
    }
    const step = getAboutStep();
    const idx = clamp(Math.floor(rel / step), 0, $paragraphs.length - 1);
    $paragraphs.each(function (i) {
      const a = i === idx;
      if ($(this).hasClass("active") !== a) $(this).toggleClass("active", a);
    });
  }

  function updateActiveNav() {
    if (!$navLinks.length) return;

    if (isBlogPage) {
      $navLinks.removeClass("active");
      $navLinks.filter(".nav-blog").addClass("active");
      return;
    }

    if (!$sections.length) return;
    const scrollTop = $window.scrollTop();
    const marker = scrollTop + getHeaderHeight() + $window.height() * 0.3;
    let currentId = "";

    $sections.each(function () {
      const $s = $(this);
      const offset = $s.offset();
      if (!offset) return;
      if (marker >= offset.top && marker < offset.top + $s.outerHeight()) {
        currentId = $s.attr("id");
      }
    });

    if (!currentId) {
      const $home = $("#home");
      if ($home.length) {
        const ho = $home.offset();
        if (ho && scrollTop < ho.top + $home.outerHeight()) currentId = "home";
      }
    }
    if (!currentId && $sections.length) currentId = $sections.last().attr("id");

    $navLinks.removeClass("active");
    if (currentId)
      $navLinks.filter(`[href="#${currentId}"]`).addClass("active");
  }

  /* ------------------------------------------------------------------ */
  /* REVEAL + HOVER                                                      */
  /* ------------------------------------------------------------------ */

  function setupRevealObserver() {
    if (revealObserver) {
      revealObserver.disconnect();
      revealObserver = null;
    }
    const $elements = $(".reveal");
    if (!$elements.length) return;
    if (!("IntersectionObserver" in window)) {
      $elements.addClass("visible");
      return;
    }

    const prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          if (revealObserver) revealObserver.unobserve(el);
          const delay = prefersReduced
            ? 0
            : parseInt($(el).data("delay") || "0", 10);
          if (delay > 0) {
            window.setTimeout(function () {
              $(el).addClass("visible");
            }, delay);
          } else {
            $(el).addClass("visible");
          }
        });
      },
      { threshold: REVEAL_THRESHOLD, rootMargin: REVEAL_ROOT_MARGIN },
    );

    $elements.each(function () {
      if (!$(this).hasClass("visible")) revealObserver.observe(this);
    });
  }

  function setupProjectHover() {
    const $cards = $(".project-card");
    if (!$cards.length) return;
    $cards.off(".projectHover");
    $cards.on("mouseenter.projectHover", function () {
      $(this)
        .find(".project-tech span")
        .each(function (i) {
          $(this).css("transition-delay", i * 25 + "ms");
        });
    });
    $cards.on("mouseleave.projectHover", function () {
      $(this).find(".project-tech span").css("transition-delay", "0ms");
    });
  }

  /* ------------------------------------------------------------------ */
  /* CONTACT FORM                                                        */
  /* ------------------------------------------------------------------ */

  function setContactState(state, message, buttonText) {
    const isDisabled = state === "sending";
    $contactButton
      .prop("disabled", isDisabled)
      .attr("aria-busy", String(isDisabled))
      .text(buttonText);
    $formStatus.text(message);
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
  }

  function submitContactForm() {
    if (!$contactForm.length) return;
    $contactForm.on("submit", function (event) {
      event.preventDefault();
      const form = this;
      const nameVal = (form.querySelector("#name") || {}).value || "";
      const emailVal = (form.querySelector("#email") || {}).value || "";
      const msgVal = (form.querySelector("#message") || {}).value || "";

      if (!nameVal.trim() || nameVal.trim().length < 2) {
        setContactState(
          "error",
          "Please enter your name (at least 2 characters).",
          "Send Message \u2192",
        );
        return;
      }
      if (!isValidEmail(emailVal)) {
        setContactState(
          "error",
          "Please enter a valid email address.",
          "Send Message \u2192",
        );
        return;
      }
      if (!msgVal.trim() || msgVal.trim().length < 10) {
        setContactState(
          "error",
          "Please enter a message (at least 10 characters).",
          "Send Message \u2192",
        );
        return;
      }

      const endpoint = String(form.action || "").trim();
      if (!endpoint) {
        setContactState(
          "error",
          "Contact form is not configured.",
          "Send Message \u2192",
        );
        return;
      }

      setContactState("sending", "Sending\u2026", "Sending\u2026");
      $.ajax({
        url: endpoint,
        method: "POST",
        data: new FormData(form),
        processData: false,
        contentType: false,
        dataType: "json",
        timeout: 10000,
        headers: { Accept: "application/json" },
      })
        .done(function () {
          form.reset();
          setContactState(
            "success",
            "Message sent. I\u2019ll be in touch soon.",
            "Sent \u2713",
          );
          window.setTimeout(function () {
            setContactState("idle", "", "Send Message \u2192");
          }, 4000);
        })
        .fail(function (xhr, status) {
          let msg = "Unable to send. Please try again.";
          if (status === "timeout")
            msg = "Request timed out. Please try again.";
          else if (
            xhr &&
            xhr.responseJSON &&
            Array.isArray(xhr.responseJSON.errors)
          ) {
            const errs = xhr.responseJSON.errors
              .map(function (e) {
                return e.message;
              })
              .filter(Boolean);
            if (errs.length) msg = errs.join(" ");
          }
          setContactState("error", msg, "Send Message \u2192");
        });
    });
  }

  /* ------------------------------------------------------------------ */
  /* MOBILE NAVIGATION                                                   */
  /* ------------------------------------------------------------------ */

  function setupMobileNavigation() {
    if (!$menuToggle.length || !$mainMenu.length) return;

    function setMenuState(isOpen, restoreFocus) {
      $menuToggle.toggleClass("is-open", isOpen);
      $mainMenu.toggleClass("is-open", isOpen);

      $menuToggle.attr("aria-expanded", String(isOpen));

      $menuToggle.attr(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu",
      );

      $menuToggle.attr(
        "title",
        isOpen ? "Close navigation menu" : "Open navigation menu",
      );

      if (restoreFocus) {
        $menuToggle.trigger("focus");
      }
    }

    function closeMenu(restoreFocus) {
      setMenuState(false, restoreFocus);
    }

    function toggleMenu(event) {
      event.preventDefault();
      event.stopPropagation();

      if (!isMobile()) {
        closeMenu(false);
        return;
      }

      setMenuState(!$mainMenu.hasClass("is-open"), false);
    }

    $menuToggle.off("click.mobileNavigation");
    $navLinks.off("click.mobileNavigation");
    $window.off("resize.mobileNavigation");
    $(document).off("click.mobileNavigation");
    $(document).off("keydown.mobileNavigation");

    $menuToggle.on("click.mobileNavigation", toggleMenu);

    $navLinks.on("click.mobileNavigation", function () {
      if (isMobile()) {
        closeMenu(false);
      }
    });

    $window.on("resize.mobileNavigation", function () {
      if (!isMobile()) {
        closeMenu(false);
      }
    });

    $(document).on("click.mobileNavigation", function (event) {
      if (!isMobile()) return;
      if (!$mainMenu.hasClass("is-open")) return;

      const target = event.target;

      if (
        $menuToggle.is(target) ||
        $menuToggle.has(target).length ||
        $mainMenu.is(target) ||
        $mainMenu.has(target).length
      ) {
        return;
      }

      closeMenu(false);
    });

    $(document).on("keydown.mobileNavigation", function (event) {
      if (event.key !== "Escape") return;
      if (!$mainMenu.hasClass("is-open")) return;

      closeMenu(true);
    });

    setMenuState($mainMenu.hasClass("is-open"), false);
  }

  /* ------------------------------------------------------------------ */
  /* SCROLL / RESIZE / THEME EVENTS                                      */
  /* ------------------------------------------------------------------ */

  function handleScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      updateAboutParagraphs();
      updateActiveNav();
      ticking = false;
    });
  }

  if ($themeToggle.length) $themeToggle.on("click", toggleTheme);

  if (window.matchMedia) {
    const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
    function handleSystemThemeChange(e) {
      if (getStoredTheme()) return;
      applyTheme(e.matches ? "dark" : "light");
    }
    if (typeof colorScheme.addEventListener === "function") {
      colorScheme.addEventListener("change", handleSystemThemeChange);
    } else if (typeof colorScheme.addListener === "function") {
      colorScheme.addListener(handleSystemThemeChange);
    }
  }

  $navLinks.on("click", function (event) {
    const href = $(this).attr("href");
    if (!href || href === "#" || !href.startsWith("#")) return;
    const $target = $(href);
    if (!$target.length) return;
    const offset = $target.offset();
    if (!offset) return;
    event.preventDefault();
    $("html, body")
      .stop(true, false)
      .animate(
        { scrollTop: Math.max(0, offset.top - getHeaderHeight()) },
        SCROLL_DURATION,
        "swing",
      );
  });

  $window.on("scroll", handleScroll);

  $window.on("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      updateAboutHeight();
      updateAboutParagraphs();
      updateActiveNav();
    }, 150);
  });

  /* ------------------------------------------------------------------ */
  /* INIT                                                                */
  /* ------------------------------------------------------------------ */

  function initialize() {
    initializeTheme();
    setupMobileNavigation();
    updateActiveNav();
    window.requestAnimationFrame(function () {
      setupRevealObserver();
      setupProjectHover();
    });

    if (isBlogPage) return;

    applySkillVisibility();
    renderEducation();
    updateAboutHeight();
    updateAboutParagraphs();
    initCertShowcase();
    submitContactForm();
    getGitHubRepos();
  }

  initialize();
});
