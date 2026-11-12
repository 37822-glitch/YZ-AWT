import { afterEach, describe, expect, it, vi } from "vitest";

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

describe("REST and GraphQL request helpers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("performs an uncached REST GET", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(response({ body: { id: 2 } }));
    vi.stubGlobal("fetch", fetchMock);
    const { getJson } = await import("@/lib/api");

    await expect(getJson<{ id: number }>("/students/2")).resolves.toEqual({ id: 2 });
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/students/2", {
      cache: "no-store",
    });
  });

  it("posts GraphQL variables and returns data", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      response({ body: { data: { student: { name: "Daniyar Bekov" } } } }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { gql } = await import("@/lib/graphql");

    await expect(gql("query ($id: ID!) { student(id: $id) { name } }", { id: "2" }))
      .resolves.toEqual({ student: { name: "Daniyar Bekov" } });
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "query ($id: ID!) { student(id: $id) { name } }",
        variables: { id: "2" },
      }),
      cache: "no-store",
    });
  });

  it("throws GraphQLRequestError when a status-200 response has errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        response({ body: { data: null, errors: [{ message: "Invalid ID" }] } }),
      ),
    );
    const { gql, GraphQLRequestError } = await import("@/lib/graphql");

    await expect(gql("{ student(id: 2) { name } }")).rejects.toBeInstanceOf(
      GraphQLRequestError,
    );
  });

  it("throws the HTTP status before reading GraphQL data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        response({ ok: false, status: 503 }),
      ),
    );
    const { gql } = await import("@/lib/graphql");

    await expect(gql("{ courses { id } }")).rejects.toThrow("API error: 503");
  });
});
