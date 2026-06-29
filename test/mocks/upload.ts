import { vi } from "vitest";

vi.mock("@/server/upload/actions", () => ({
  getUploadUrl: vi.fn().mockResolvedValue({
    success: true,
    url: "https://mock-upload.url",
    publicUrl: "https://mock-public.url/avatar.jpg",
  }),
}));

vi.mock("@/lib/media", () => ({
  compressImage: vi.fn().mockImplementation(async (file: File) => file),
}));
