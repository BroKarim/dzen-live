import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockProfileFindUnique, mockImageResponse } = vi.hoisted(() => ({
  mockProfileFindUnique: vi.fn(),
  mockImageResponse: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    profile: {
      findUnique: mockProfileFindUnique,
    },
  },
}));

vi.mock("next/og", () => ({
  ImageResponse: mockImageResponse,
}));

vi.mock("@/server/website/profile/payloads", () => ({
  publicProfilePayload: {
    username: true, displayName: true, bio: true, avatarUrl: true,
    isPublished: true, bgType: true, bgColor: true,
  },
}));

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import { GET } from "@/app/api/og/route";

function makeRequest(username?: string) {
  const url = new URL("http://localhost:3000/api/og");
  if (username) url.searchParams.set("username", username);
  return new Request(url);
}

describe("og/route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockImageResponse.mockReturnValue(new Response("fake-image", {
      headers: { "content-type": "image/png" },
    }));
  });

  it("returns 400 when username missing", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(400);
  });

  it("returns 404 when profile not found", async () => {
    mockProfileFindUnique.mockResolvedValue(null);
    const res = await GET(makeRequest("nonexistent"));
    expect(res.status).toBe(404);
  });

  it("returns 404 when profile not published", async () => {
    mockProfileFindUnique.mockResolvedValue({ username: "hidden", isPublished: false });
    const res = await GET(makeRequest("hidden"));
    expect(res.status).toBe(404);
  });

  it("returns ImageResponse for published profile", async () => {
    mockProfileFindUnique.mockResolvedValue({
      username: "user",
      displayName: "User Name",
      bio: "My bio",
      avatarUrl: null,
      isPublished: true,
      bgType: "color",
      bgColor: "#111",
    });

    let callCount = 0;
    mockFetch.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve(
          new Response("@font-face { font-family: 'Inter'; src: url(https://fonts.gstatic.com/inter.woff2); }", {
            headers: { "content-type": "text/css" },
          }),
        );
      }
      return Promise.resolve(new Response("fake-font-data", { headers: { "content-type": "font/woff2" } }));
    });

    const res = await GET(makeRequest("user"));
    expect(mockImageResponse).toHaveBeenCalled();
    const callArgs = mockImageResponse.mock.calls[0];
    expect(callArgs[1]).toMatchObject({ width: 1200, height: 630 });
  });
});
