import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { SectionHeading } from "../components/Layout";
import { usePageMetadata, useReveal } from "../hooks/useSiteEffects";
import { loadProjects, projectLiveUrl, projectName } from "../lib/projects";
import type { EducationItem, Repository } from "../types";

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

const educationItems: EducationItem[] = [
  {
    image: asset("assets/img/kollec-idhtk.jpg"),
    name: "Ismayilli State College of Technology and Humanities",
    program: "Computer Software Systems",
    period: "2024 – Present",
    description:
      "Studying software engineering fundamentals, programming, algorithms, and computer systems.",
    badge: "Current",
    tech: [],
  },
  {
    image: asset("assets/img/divfasad1.png"),
    name: "Div Academy",
    program: "Web Development",
    period: "2023 – 2024",
    description:
      "Intensive web development training covering modern frontend technologies and practical project building.",
    url: "https://divacademy.az/",
    tech: ["HTML5", "CSS3", "JavaScript", "jQuery", "AJAX", "Bootstrap"],
  },
];

function Hero() {
  return (
    <section id="home" className="hero" aria-labelledby="hero-title">
      <div className="container hero-content">
        <div className="hero-text reveal">
          <p className="hero-greeting">Hi, I’m</p>
          <h1 id="hero-title">
            Bahruz <span className="hero-highlight">Mammadov</span>
          </h1>
          <h2>Junior Full Stack Developer</h2>
          <p className="hero-description">
            I build modern and responsive web applications.
          </p>
          <div className="hero-buttons">
            <a href="#projects" className="button button-primary">
              View Projects
            </a>
            <Link
              to="/blog/"
              className="button button-secondary"
              aria-label="View Bahruz Mammadov’s Blog"
            >
              View Blog
            </Link>
            <a
              href="https://github.com/bahruzmammad"
              target="_blank"
              rel="noopener noreferrer"
              className="button button-secondary"
              aria-label="View Bahruz Mammadov on GitHub (opens in new tab)"
            >
              View GitHub
            </a>
            <a
              href="mailto:bahruzmammadly@gmail.com"
              className="button button-secondary"
              aria-label="Send email to Bahruz Mammadov"
            >
              Email Me
            </a>
          </div>
        </div>
        <div className="hero-image reveal" aria-hidden="true">
          <img
            src={asset("assets/img/myimage.jpg")}
            alt="Portrait of Bahruz Mammadov"
            width="380"
            height="380"
            loading="eager"
            fetchPriority="high"
          />
        </div>
      </div>
    </section>
  );
}

function About() {
  const [activeParagraph, setActiveParagraph] = useState(0);
  useEffect(() => {
    const section = document.getElementById("about");
    const paragraphs = section?.querySelectorAll("p");
    if (!section || !paragraphs?.length) return;

    let frame = 0;
    const update = () => {
      if (window.innerWidth <= 1024) {
        setActiveParagraph(0);
        section.style.height = "auto";
        return;
      }
      const step = Math.max(110, Math.min(window.innerHeight * 0.16, 165));
      section.style.height = `${
        window.innerHeight + (paragraphs.length - 1) * step + 60
      }px`;
      const relativeScroll = window.scrollY - section.offsetTop;
      setActiveParagraph(
        Math.max(
          0,
          Math.min(Math.floor(relativeScroll / step), paragraphs.length - 1),
        ),
      );
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      if (frame) window.cancelAnimationFrame(frame);
      section.style.height = "";
    };
  }, []);

  const paragraphs = [
    "Hi, I’m Bahruz Mammadov, a software engineering student with a strong interest in backend development, software engineering fundamentals, and data structures and algorithms.",
    "My software development journey started at Div Academy, where I built a strong foundation in web development. During my studies there, I worked with HTML5, CSS3, JavaScript, jQuery, AJAX, and Bootstrap.",
    "This experience helped me understand how modern web applications are structured and strengthened my problem-solving and programming skills.",
    "I’m currently studying Computer Software Systems at Ismayilli State College of Technology and Humanities.",
    "My current focus is Java backend development and software engineering. I’m learning and practicing Java, object-oriented programming, data structures and algorithms, databases, REST APIs, Git, software architecture, and backend development principles.",
    "I also have experience with frontend and full stack technologies, including React.js, Next.js, Node.js, Redux, Tailwind CSS, Bootstrap, HTML5, CSS3, JavaScript, jQuery, and AJAX.",
    "On the database side, I work with MySQL, MongoDB, and SQLite.",
    "I enjoy building simple, useful, and well-structured web applications. I like taking an idea, breaking it down into smaller problems, designing a solution, and turning it into a working application.",
    "My long-term goal is to become a strong software engineer capable of designing and developing reliable, scalable, and maintainable software systems.",
  ];

  return (
    <section id="about" className="about" aria-labelledby="about-title">
      <div className="about-sticky">
        <div className="container about-content">
          <div className="about-header reveal">
            <span className="section-label">About Me</span>
            <h2 id="about-title">Software Engineering Student</h2>
          </div>
          <div className="about-body" aria-label="About Bahruz Mammadov">
            {paragraphs.map((paragraph, index) => (
              <p className={activeParagraph === index ? "active" : ""} key={paragraph}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Projects() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useReveal(`${loading}-${repositories.length}`);

  useEffect(() => {
    let active = true;
    loadProjects()
      .then((result) => {
        if (active) setRepositories(result.filter((repo) => repo.name.toLowerCase() !== "nvim"));
      })
      .catch((reason: unknown) => {
        console.error("[Projects]", reason);
        if (active) setError("Could not load projects right now.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const visibleRepositories = repositories.filter((repo) => repo.name);

  return (
    <section
      id="projects"
      className="projects section"
      aria-labelledby="projects-title"
    >
      <div className="container">
        <SectionHeading label="Projects" title="Selected Projects" />
        <div
          className="projects-grid"
          aria-live="polite"
          aria-busy={loading}
        >
          {loading ? (
            <article className="project-card github-loading">
              <div className="project-content">
                <span className="project-number">—</span>
                <h3>Loading…</h3>
                <p>Fetching repositories from GitHub.</p>
                <div className="project-tech"><span>GitHub API</span></div>
              </div>
            </article>
          ) : error ? (
            <article className="project-card reveal visible">
              <div className="project-content">
                <span className="project-number">—</span>
                <h3>Projects unavailable</h3>
                <p>{error}</p>
                <div className="project-links">
                  <a
                    className="project-link project-link-github"
                    href="https://github.com/bahruzmammad"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub →
                  </a>
                </div>
              </div>
            </article>
          ) : visibleRepositories.length === 0 ? (
            <article className="project-card reveal visible">
              <div className="project-content">
                <span className="project-number">—</span>
                <h3>No projects found</h3>
                <p>No public repositories are available.</p>
              </div>
            </article>
          ) : (
            visibleRepositories.map((repository, index) => {
              const title = projectName(repository);
              const liveUrl = projectLiveUrl(repository);
              return (
                <article
                  className="project-card reveal"
                  data-delay={index * 60}
                  key={repository.name}
                >
                  <div className="project-content">
                    <span className="project-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3>{title}</h3>
                    <p>{repository.description || "A GitHub project."}</p>
                    <div className="project-tech">
                      <span>{repository.language || "Code"}</span>
                      {repository.stargazers_count > 0 && (
                        <span>★ {repository.stargazers_count}</span>
                      )}
                      {repository.forks_count > 0 && (
                        <span>Forks {repository.forks_count}</span>
                      )}
                    </div>
                    <div className="project-links">
                      {liveUrl && (
                        <a
                          className="project-link project-link-live"
                          href={liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`View live demo of ${title} (opens in new tab)`}
                        >
                          Live Demo →
                        </a>
                      )}
                      <a
                        className="project-link project-link-github"
                        href={repository.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View ${title} source code on GitHub (opens in new tab)`}
                      >
                        GitHub →
                      </a>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

function Education() {
  return (
    <section
      id="education"
      className="education section"
      aria-labelledby="education-title"
    >
      <div className="container">
        <SectionHeading label="Education" title="Academic Background" />
        <div className="education-grid" aria-live="polite">
          {educationItems.map((item, index) => (
            <article
              className="education-card reveal"
              data-delay={index * 60}
              key={item.name}
            >
              <div className="education-img-wrap">
                <img src={item.image} alt={item.name} loading="lazy" />
              </div>
              <div className="education-body">
                <div className="education-meta">
                  {item.badge && (
                    <span className="education-badge">{item.badge}</span>
                  )}
                  <span className="education-date">{item.period}</span>
                </div>
                <h3>{item.name}</h3>
                <p className="education-field">{item.program}</p>
                <p className="education-desc">{item.description}</p>
                {item.tech.length > 0 && (
                  <div className="education-tech">
                    {item.tech.map((technology) => (
                      <span key={technology}>{technology}</span>
                    ))}
                  </div>
                )}
                {item.url && (
                  <a
                    className="education-link"
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit ${item.name} website (opens in new tab)`}
                  >
                    Visit website ↗
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Skills() {
  const skills = [
    "HTML5",
    "CSS3",
    "JavaScript",
    "React.js",
    "Next.js",
    "Redux",
    "Tailwind CSS",
    "Bootstrap",
    "jQuery",
    "AJAX",
  ];
  return (
    <section id="skills" className="skills section" aria-labelledby="skills-title">
      <div className="container">
        <SectionHeading label="Skills" title="Technologies I Work With" />
        <div className="skills-grid">
          <div className="skill-group reveal">
            <h3>Frontend</h3>
            <ul>
              {skills.map((skill) => <li key={skill}>{skill}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Certificates() {
  const certificateUrl =
    "https://www.credly.com/badges/2def4899-7299-4ce2-84b5-57b999cebd29/linked_in_profile";
  return (
    <section
      id="certificates"
      className="certificates section"
      aria-labelledby="certificates-title"
    >
      <div className="container">
        <SectionHeading label="Certificates" title="Certifications" />
        <div className="cert-showcase reveal" aria-label="Certificate showcase">
          <div className="cert-main no-image">
            <div className="cert-info">
              <div className="cert-meta">
                <span className="cert-issuer">IBM SkillsBuild</span>
                <span className="cert-date">Issued Sep 2026</span>
              </div>
              <h3 className="cert-title">Web Development Fundamentals</h3>
              <p className="cert-desc">
                Completed the Web Development Fundamentals credential issued by
                IBM SkillsBuild, covering fundamental concepts and practices in
                web development.
              </p>
              <p className="cert-id">
                Credential ID 2def4899-7299-4ce2-84b5-57b999cebd29
              </p>
              <ul className="cert-skills" aria-label="Skills covered">
                <li>Web Design</li>
                <li>Software Development Life Cycle (SDLC)</li>
              </ul>
              <div className="cert-actions">
                <a
                  href={certificateUrl}
                  className="button button-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Show credential: Web Development Fundamentals"
                >
                  Show credential
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type FormState = "idle" | "sending" | "success" | "error";

function Contact() {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const submitting = useRef(false);
  const mounted = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const requestTimeout = useRef<number | undefined>(undefined);
  const statusTimeout = useRef<number | undefined>(undefined);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      controller.current?.abort();
      if (requestTimeout.current !== undefined) {
        window.clearTimeout(requestTimeout.current);
      }
      if (statusTimeout.current !== undefined) {
        window.clearTimeout(statusTimeout.current);
      }
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const content = String(data.get("message") ?? "").trim();

    if (name.length < 2) {
      setState("error");
      setMessage("Please enter your name (at least 2 characters).");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase())) {
      setState("error");
      setMessage("Please enter a valid email address.");
      return;
    }
    if (content.length < 10) {
      setState("error");
      setMessage("Please enter a message (at least 10 characters).");
      return;
    }

    submitting.current = true;
    setState("sending");
    setMessage("Sending…");
    const requestController = new AbortController();
    controller.current = requestController;
    requestTimeout.current = window.setTimeout(
      () => requestController.abort(),
      10000,
    );
    try {
      const response = await fetch("https://formspree.io/f/xoeqywza", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
        signal: requestController.signal,
      });
      if (!response.ok) {
        let errorMessage = "Unable to send. Please try again.";
        try {
          const result: unknown = await response.json();
          if (
            result &&
            typeof result === "object" &&
            "errors" in result &&
            Array.isArray(result.errors)
          ) {
            const details = result.errors
              .map((item: { message?: unknown }) => item.message)
              .filter((item): item is string => typeof item === "string"              );
              if (details.length) errorMessage = details.join(" ");
          }
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") throw error;
        }
        throw new Error(errorMessage);
      }
      if (!mounted.current) return;
      form.reset();
      setState("success");
      setMessage("Message submitted successfully. I’ll be in touch soon.");
      if (statusTimeout.current !== undefined) {
        window.clearTimeout(statusTimeout.current);
      }
      statusTimeout.current = window.setTimeout(() => {
        if (!mounted.current) return;
        setState("idle");
        setMessage("");
      }, 4000);
    } catch (error) {
      if (!mounted.current) return;
      setState("error");
      setMessage(
        error instanceof Error && error.name === "AbortError"
          ? "Request timed out. Please try again."
          : error instanceof Error
              ? error.message
              : "Unable to send. Please try again.",
      );
    } finally {
      if (requestTimeout.current !== undefined) {
        window.clearTimeout(requestTimeout.current);
        requestTimeout.current = undefined;
      }
      controller.current = null;
      submitting.current = false;
    }
  }

  return (
    <section id="contact" className="contact section" aria-labelledby="contact-title">
      <div className="container">
        <SectionHeading label="Contact" title="Let’s Work Together" />
        <div className="contact-content">
          <address className="contact-info">
            <ul role="list">
              <li className="contact-item reveal">
                <span>Email</span>
                <a href="mailto:bahruzmammadly@gmail.com">
                  bahruzmammadly@gmail.com
                </a>
              </li>
              <li className="contact-item reveal">
                <span>GitHub</span>
                <a
                  href="https://github.com/bahruzmammad"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Bahruz Mammadov on GitHub (opens in new tab)"
                >
                  @bahruzmammad
                </a>
              </li>
              <li className="contact-item reveal">
                <span>LinkedIn</span>
                <a
                  href="https://www.linkedin.com/in/bahruzmammad"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Bahruz Mammadov on LinkedIn (opens in new tab)"
                >
                  @bahruzmammad
                </a>
              </li>
              <li className="contact-item reveal">
                <span>Twitter</span>
                <a
                  href="https://twitter.com/bahruzmammad"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Bahruz Mammadov on X / Twitter (opens in new tab)"
                >
                  @bahruzmammad
                </a>
              </li>
              <li className="contact-item reveal">
                <span>CV</span>
                <span>Download unavailable</span>
              </li>
            </ul>
          </address>
          <form
            className="contact-form reveal"
            action="https://formspree.io/f/xoeqywza"
            method="POST"
            aria-label="Contact form"
            noValidate
            onSubmit={submit}
          >
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Your name"
                autoComplete="name"
                required
                minLength={2}
                disabled={state === "sending"}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="your@email.com"
                autoComplete="email"
                required
                disabled={state === "sending"}
              />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                rows={6}
                placeholder="Write your message…"
                required
                minLength={10}
                disabled={state === "sending"}
              />
            </div>
            <button
              type="submit"
              className="contact-button"
              disabled={state === "sending"}
              aria-busy={state === "sending"}
            >
              {state === "sending"
                ? "Sending…"
                : state === "success"
                  ? "Submitted ✓"
                  : "Send Message →"}
            </button>
            <p
              className="form-status"
              data-state={state === "idle" || state === "sending" ? undefined : state}
              aria-live="polite"
              aria-atomic="true"
              role="status"
            >
              {message}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

export function HomePage() {
  useReveal(null);
  usePageMetadata(
    "Bahruz Mammadov — Junior Full Stack Developer",
    "Bahruz Mammadov is a junior full-stack developer and software engineering student building modern web applications with Java, Spring Boot, React, Node.js, and MySQL. Open to junior developer roles.",
    "/",
  );
  return (
    <main id="main" className="min-h-screen">
      <Hero />
      <About />
      <Projects />
      <Education />
      <Skills />
      <Certificates />
      <Contact />
    </main>
  );
}
