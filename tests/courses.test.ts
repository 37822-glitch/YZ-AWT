import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const apiUrl = "http://localhost:8000";
const course = {
  id: "web-security",
  title: "Web Security Essentials",
  description: "JWT/OAuth2, XSS, CSRF, and SQL injection defense.",
  credits: 4,
  isElective: false,
  likes: 21,
};

function response({
  body,
  ok = true,
  status = 200,
}: {
  body?: unknown;
  ok?: boolean;
  status?: number;
}) {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

describe("course API data", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("API_URL", apiUrl);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("requests the complete course list without caching", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(response({ body: [course] }));
    vi.stubGlobal("fetch", fetchMock);
    const { getCourses } = await import("@/lib/courses");

    await expect(getCourses()).resolves.toEqual([course]);
    expect(fetchMock).toHaveBeenCalledWith(`${apiUrl}/courses`, {
      cache: "no-store",
    });
  });

  it("requests one course without caching", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(response({ body: course }));
    vi.stubGlobal("fetch", fetchMock);
    const { getCourse } = await import("@/lib/courses");

    await expect(getCourse("web-security")).resolves.toEqual(course);
    expect(fetchMock).toHaveBeenCalledWith(
      `${apiUrl}/courses/web-security`,
      { cache: "no-store" },
    );
  });

  it("maps only a missing course response to undefined", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        response({ ok: false, status: 404 }),
      ),
    );
    const { getCourse } = await import("@/lib/courses");

    await expect(getCourse("does-not-exist")).resolves.toBeUndefined();
  });

  it("throws the response status for failed list and course requests", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(response({ ok: false, status: 503 }));
    vi.stubGlobal("fetch", fetchMock);
    const { getCourse, getCourses } = await import("@/lib/courses");

    await expect(getCourses()).rejects.toThrow("API error: 503");
    await expect(getCourse("web-security")).rejects.toThrow("API error: 503");
  });

  it("fails fast when the server API URL is missing", async () => {
    vi.stubEnv("API_URL", "");

    await expect(import("@/lib/courses")).rejects.toThrow(
      "API_URL is not set: create .env.local",
    );
  });
});
