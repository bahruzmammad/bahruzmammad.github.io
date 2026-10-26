// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Repository } from "../types";
import { loadProjects, projectLiveUrl } from "./projects";

const repository: Repository = {
  name: "example-project",
  description: "A project",
  language: "TypeScript",
  stargazers_count: 2,
  forks_count: 1,
  homepage: "https://example.com/",
  html_url: "https://github.com/bahruzmammad/example-project",
  visibility: "public",
  private: false,
};

function response(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe("GitHub project loading", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("requests public repositories and rejects malformed records", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      response([
        repository,
        { ...repository, name: "unsafe-url", html_url: "javascript:alert(1)" },
        { ...repository, name: "missing-fields", forks_count: undefined },
      ]),
    );

    await expect(loadProjects()).resolves.toEqual([repository]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://api.github.com/users/bahruzmammad/repos?per_page=100&page=1&sort=updated&direction=desc",
    );
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      headers: { Accept: "application/vnd.github+json" },
    });
  });

  it("falls back to the static snapshot when GitHub is unavailable", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce(response({ message: "rate limit exceeded" }, 403))
      .mockResolvedValueOnce(response([repository]));

    await expect(loadProjects()).resolves.toEqual([repository]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1]?.[0]).toBe(
      `${import.meta.env.BASE_URL}assets/data/repos.json`,
    );
  });

  it("returns an empty result when both sources have no repositories", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce(response([]))
      .mockResolvedValueOnce(response([]));

    await expect(loadProjects()).resolves.toEqual([]);
  });

  it("deduplicates concurrent requests", async () => {
    const fetchMock = vi.mocked(fetch);
    let resolveResponse!: (value: Response) => void;
    fetchMock.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveResponse = resolve;
      }),
    );

    const first = loadProjects();
    const second = loadProjects();
    expect(second).toBe(first);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveResponse(response([repository]));
    await expect(first).resolves.toEqual([repository]);
  });

  it("does not use an unsafe repository homepage", () => {
    expect(
      projectLiveUrl({ ...repository, homepage: "javascript:alert(1)" }),
    ).toBeNull();
  });
});
