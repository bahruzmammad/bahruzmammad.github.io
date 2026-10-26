// @vitest-environment jsdom
import { act, createElement, StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import type { Repository } from "./types";

const repository: Repository = {
  name: "example-project",
  description: "A project",
  language: "TypeScript",
  stargazers_count: 0,
  forks_count: 0,
  homepage: null,
  html_url: "https://github.com/bahruzmammad/example-project",
};

function response(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe("application routes and interactions", () => {
  let roots: { root: Root; container: HTMLDivElement }[];
  let matchMediaDescriptor: PropertyDescriptor | undefined;
  let innerWidthDescriptor: PropertyDescriptor | undefined;

  beforeEach(() => {
    roots = [];
    matchMediaDescriptor = Object.getOwnPropertyDescriptor(window, "matchMedia");
    innerWidthDescriptor = Object.getOwnPropertyDescriptor(window, "innerWidth");
    localStorage.clear();
    localStorage.setItem("theme", "light");
    window.history.replaceState(null, "", "/");
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response([repository])));
  });

  afterEach(() => {
    for (const { root, container } of roots) {
      act(() => root.unmount());
      container.remove();
    }
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
    if (matchMediaDescriptor) {
      Object.defineProperty(window, "matchMedia", matchMediaDescriptor);
    } else {
      Reflect.deleteProperty(window, "matchMedia");
    }
    if (innerWidthDescriptor) {
      Object.defineProperty(window, "innerWidth", innerWidthDescriptor);
    }
    localStorage.clear();
  });

  function renderAt(path = "/", strict = false): HTMLDivElement {
    window.history.replaceState(null, "", path);
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    roots.push({ root, container });
    act(() => {
      root.render(
        strict
          ? createElement(StrictMode, null, createElement(App))
          : createElement(App),
      );
    });
    return container;
  }

  it("renders the homepage and coalesces the StrictMode project request", async () => {
    let resolveResponse!: (value: Response) => void;
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveResponse = resolve;
      }),
    );
    const container = renderAt("/", true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain("Fetching repositories from GitHub.");
    await act(async () => {
      resolveResponse(response([repository]));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(container.textContent).toContain("Example Project");
    expect(container.querySelector("#hero-title")?.textContent).toContain(
      "Bahruz Mammadov",
    );
    expect(container.querySelector('nav[aria-label="Main navigation"]')).not.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("opens and closes the responsive navigation menu", () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 390,
    });
    const container = renderAt("/");
    const toggle = container.querySelector<HTMLButtonElement>("#menu-toggle")!;
    const menu = container.querySelector<HTMLUListElement>("#main-menu")!;

    act(() => toggle.click());
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(menu.classList.contains("is-open")).toBe(true);

    act(() => toggle.click());
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(menu.classList.contains("is-open")).toBe(false);
  });

  it("renders the blog index, an existing post, and the not-found route", async () => {
    const blog = renderAt("/blog/");
    await vi.waitFor(() =>
      expect(blog.querySelector("h1")?.textContent).toBe(
        "Bahruz Mammadov Blog",
      ),
    );
    expect(blog.querySelector('a[href="/blog/hello/"]')).not.toBeNull();

    const post = renderAt("/blog/hello/");
    await vi.waitFor(() =>
      expect(post.querySelector("h1")?.textContent).toBe(
        "Hello, How Are You? My First Blog Post",
      ),
    );
    act(() => post.querySelector<HTMLAnchorElement>(".logo")?.click());
    expect(window.location.pathname).toBe("/");
    expect(document.title).toBe(
      "Bahruz Mammadov — Junior Full Stack Developer",
    );

    const missing = renderAt("/not-a-route");
    expect(missing.querySelector("h1")?.textContent).toBe("Page not found");
  });

  it("switches the theme and validates contact fields before sending", async () => {
    const container = renderAt("/");
    const themeButton = container.querySelector<HTMLButtonElement>(
      ".theme-icon-button",
    );
    expect(themeButton).not.toBeNull();
    act(() => themeButton?.click());
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");

    const form = container.querySelector<HTMLFormElement>(".contact-form");
    expect(form).not.toBeNull();
    await act(async () => {
      form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      await Promise.resolve();
    });
    expect(container.querySelector(".form-status")?.textContent).toContain(
      "Please enter your name",
    );

    container.querySelector<HTMLInputElement>("#name")!.value = "Test User";
    container.querySelector<HTMLInputElement>("#email")!.value = "invalid";
    container.querySelector<HTMLTextAreaElement>("#message")!.value =
      "A message long enough to submit.";
    await act(async () => {
      form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      await Promise.resolve();
    });
    expect(container.querySelector(".form-status")?.textContent).toContain(
      "Please enter a valid email address.",
    );
    const contactRequests = vi
      .mocked(fetch)
      .mock.calls.filter(([url]) => String(url).includes("formspree.io"));
    expect(contactRequests).toHaveLength(0);
  });

  it("tracks system theme changes until the user sets a preference", () => {
    localStorage.removeItem("theme");
    let prefersDark = false;
    const listeners = new Set<() => void>();
    const mediaQuery = {
      get matches() {
        return prefersDark;
      },
      addEventListener: (_type: string, listener: () => void) => {
        listeners.add(listener);
      },
      removeEventListener: (_type: string, listener: () => void) => {
        listeners.delete(listener);
      },
    };
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(() => mediaQuery),
    });
    const container = renderAt("/");

    expect(document.documentElement.dataset.theme).toBe("light");
    act(() => {
      prefersDark = true;
      listeners.forEach((listener) => listener());
    });
    expect(document.documentElement.dataset.theme).toBe("dark");

    act(() => container.querySelector<HTMLButtonElement>(".theme-icon-button")?.click());
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(localStorage.getItem("theme")).toBe("light");

    act(() => {
      prefersDark = true;
      listeners.forEach((listener) => listener());
    });
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("shows the empty state when both repository sources are empty", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(response([]))
      .mockResolvedValueOnce(response([]));
    const container = renderAt("/");

    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 0));
    });
    expect(container.textContent).toContain("No public repositories are available.");
  });

  it("shows an error state when the API and fallback both fail", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(fetch)
      .mockRejectedValueOnce(new Error("network unavailable"))
      .mockResolvedValueOnce(response({ invalid: true }));
    const container = renderAt("/");

    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 0));
    });
    expect(container.textContent).toContain("Could not load projects right now.");
  });

  it("prevents duplicate contact submissions and reports provider success", async () => {
    let resolveResponse!: (value: Response) => void;
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockImplementation((input) => {
      if (String(input).includes("api.github.com")) {
        return Promise.resolve(response([repository]));
      }
      return new Promise((resolve) => {
        resolveResponse = resolve;
      });
    });

    const container = renderAt("/");
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const form = container.querySelector<HTMLFormElement>(".contact-form");
    expect(form).not.toBeNull();
    container.querySelector<HTMLInputElement>("#name")!.value = "Test User";
    container.querySelector<HTMLInputElement>("#email")!.value =
      "test@example.com";
    container.querySelector<HTMLTextAreaElement>("#message")!.value =
      "This is a test message.";

    await act(async () => {
      form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      await Promise.resolve();
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1]?.[0]).toBe("https://formspree.io/f/xoeqywza");
    expect(fetchMock.mock.calls[1]?.[1]).toMatchObject({
      method: "POST",
      headers: { Accept: "application/json" },
    });

    await act(async () => {
      resolveResponse(response({}));
      await Promise.resolve();
    });
    expect(container.querySelector(".form-status")?.textContent).toContain(
      "Message submitted successfully",
    );
  });

  it("surfaces contact provider errors without claiming delivery", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockImplementation((input) =>
      String(input).includes("api.github.com")
        ? Promise.resolve(response([repository]))
        : Promise.resolve(
            response(
              { errors: [{ message: "The form provider rejected this request." }] },
              422,
            ),
          ),
    );
    const container = renderAt("/");
    const form = container.querySelector<HTMLFormElement>(".contact-form");
    container.querySelector<HTMLInputElement>("#name")!.value = "Test User";
    container.querySelector<HTMLInputElement>("#email")!.value =
      "test@example.com";
    container.querySelector<HTMLTextAreaElement>("#message")!.value =
      "This is a test message.";

    await act(async () => {
      form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      await new Promise((resolve) => window.setTimeout(resolve, 0));
    });
    expect(container.querySelector(".form-status")?.textContent).toContain(
      "The form provider rejected this request.",
    );
    expect(container.querySelector(".contact-button")?.textContent).toContain(
      "Send Message",
    );
  });
});
