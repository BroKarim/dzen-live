import { vi } from "vitest";

const mockSession = vi.fn();

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: mockSession,
    },
  },
}));

export const setAuthenticated = () => {
  mockSession.mockResolvedValue({
    user: { id: "user-1", name: "Test User", email: "test@dzenn.live" },
    session: { id: "session-1" },
  });
};

export const setUnauthenticated = () => {
  mockSession.mockResolvedValue(null);
};

export const resetAuth = () => {
  mockSession.mockReset();
};
