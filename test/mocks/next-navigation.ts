import { vi } from "vitest";

const router = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  prefetch: vi.fn(),
};

export const mockRouter = () => router;
export const resetRouter = () => {
  vi.clearAllMocks();
};
