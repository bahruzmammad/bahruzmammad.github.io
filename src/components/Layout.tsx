import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export type Theme = "light" | "dark";

interface HeaderProps {
  activeSection: string;
  isBlogPage: boolean;
  onThemeToggle: () => void;
  theme: Theme;
}

const navItems = [
  ["home", "Home"],
  ["about", "About"],
  ["projects", "Projects"],
  ["education", "Education"],
  ["skills", "Skills"],
  ["certificates", "Certificates"],
] as const;

function SocialLinks() {
  return (
    <nav className="footer-socials" aria-label="Social media links">
      <a
        href="https://github.com/bahruzmammad"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Bahruz Mammadov on GitHub (opens in new tab)"
        title="GitHub"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" width="17" height="17">
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
        <svg viewBox="0 0 24 24" aria-hidden="true" width="17" height="17">
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
        <svg viewBox="0 0 24 24" aria-hidden="true" width="17" height="17">
          <path
            fill="currentColor"
            d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.78L6.14 22H3l7.24-8.28L2.2 2h6.4l4.42 6.19L18.9 2Zm-1.1 17.87h1.72L7.27 4.02H5.43L17.8 19.87Z"
          />
        </svg>
      </a>
    </nav>
  );
}

export function Header({
  activeSection,
  isBlogPage,
  onThemeToggle,
  theme,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRightRef = useRef<HTMLDivElement>(null);

  function closeMenu(): void {
    setMenuOpen(false);
  }

  useEffect(() => {
    function onOutsideClick(event: MouseEvent): void {
      if (
        menuOpen &&
        event.target instanceof Node &&
        !navRightRef.current?.contains(event.target)
      ) {
        closeMenu();
      }
    }
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape" && menuOpen) {
        closeMenu();
        document.getElementById("menu-toggle")?.focus();
      }
    }
    function onResize(): void {
      if (window.innerWidth > 800) closeMenu();
    }
    document.addEventListener("click", onOutsideClick);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("click", onOutsideClick);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [menuOpen]);

  return (
    <>
      <a href="#main" className="skip-to-content">
        Skip to main content
      </a>
      <header className="header-nav" role="banner">
        <nav className="navbar container" aria-label="Main navigation">
          <Link
            to="/#home"
            className="logo"
            aria-label="Bahruz Mammadov — back to top"
            onClick={closeMenu}
          >
            Bahruz Mammadov
          </Link>
          <div className="nav-right" ref={navRightRef}>
            <button
              type="button"
              id="menu-toggle"
              className={`menu-toggle${menuOpen ? " is-open" : ""}`}
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
              aria-controls="main-menu"
              onClick={() => {
                setMenuOpen((open) => window.innerWidth <= 800 && !open);
              }}
            >
              <span />
              <span />
              <span />
            </button>
            <ul
              className={`nav-list${menuOpen ? " is-open" : ""}`}
              id="main-menu"
              role="list"
              onClick={(event) => {
                if ((event.target as HTMLElement).closest("a")) closeMenu();
              }}
            >
              {navItems.map(([id, label]) => {
                const selected = !isBlogPage && activeSection === id;
                return (
                  <li key={id}>
                    {isBlogPage ? (
                      <Link to={`/#${id}`} onClick={closeMenu}>
                        {label}
                      </Link>
                    ) : (
                      <a
                        href={`#${id}`}
                        className={selected ? "active" : undefined}
                        aria-current={selected ? "location" : undefined}
                        onClick={closeMenu}
                      >
                        {label}
                      </a>
                    )}
                  </li>
                );
              })}
              <li>
                <Link
                  to="/blog/"
                  className={isBlogPage ? "nav-blog active" : "nav-blog"}
                  aria-current={isBlogPage ? "page" : undefined}
                  onClick={closeMenu}
                >
                  Blog
                </Link>
              </li>
              <li>
                {isBlogPage ? (
                  <Link to="/#contact" onClick={closeMenu}>
                    Contact
                  </Link>
                ) : (
                  <a
                    href="#contact"
                    className={activeSection === "contact" ? "active" : undefined}
                    aria-current={activeSection === "contact" ? "location" : undefined}
                    onClick={closeMenu}
                  >
                    Contact
                  </a>
                )}
              </li>
            </ul>
            <div className="theme-switcher">
              <button
                type="button"
                className="theme-icon-button"
                onClick={onThemeToggle}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                aria-pressed={theme === "dark"}
                title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                <span className="theme-icon" aria-hidden="true">
                  {theme === "dark" ? (
                    <svg
                      viewBox="0 0 36 36"
                      width="22"
                      height="22"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="18" cy="18" r="6" />
                      <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M18 3v4 M18 29v4 M3 18h4 M29 18h4 M7.4 7.4l2.8 2.8 M25.8 25.8l2.8 2.8 M28.6 7.4l-2.8 2.8 M10.2 25.8l-2.8 2.8" />
                      </g>
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 36 36"
                      width="22"
                      height="22"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M31 27.19a1 1 0 0 0-1-.56c-.28 0-.56 0-.85 0A11 11 0 0 1 24.92 5.61a1 1 0 0 0 .61-1 1 1 0 0 0-.67-.91 14.7 14.7 0 0 0-5-.87 15.12 15.12 0 0 0 0 30.24 14.78 14.78 0 0 0 11-4.81A1 1 0 0 0 31 27.19ZM19.89 31.12a13.12 13.12 0 0 1 0-26.24 11.81 11.81 0 0 1 2 .16 13 13 0 0 0 5.72 23.53 12.75 12.75 0 0 1-7.72 2.55Z" />
                    </svg>
                  )}
                </span>
              </button>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}

export function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <p>© 2026 Bahruz Mammadov. All rights reserved.</p>
        <SocialLinks />
      </div>
    </footer>
  );
}

export function SectionHeading({
  label,
  title,
}: {
  label: string;
  title: string;
}) {
  return (
    <div className="section-header reveal">
      <span className="section-label">{label}</span>
      <h2>{title}</h2>
    </div>
  );
}
