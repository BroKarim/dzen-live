import { vi } from "vitest";

const mockPrisma = {
  profile: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  link: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  socialLink: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
  },
  $queryRaw: vi.fn(),
  $transaction: vi.fn(),
};

vi.mock("@/lib/db", () => ({
  db: mockPrisma,
  prisma: mockPrisma,
}));

export const prisma = mockPrisma;
export const resetDb = () => {
  for (const model of Object.values(mockPrisma)) {
    for (const method of Object.values(model)) {
      if (typeof method === "function" && "mockReset" in method) {
        (method as ReturnType<typeof vi.fn>).mockReset();
      }
    }
  }
};
