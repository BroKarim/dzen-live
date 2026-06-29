import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

export function withAuth<TArgs extends any[], TReturn>(
  module: string,
  fn: (user: Awaited<ReturnType<typeof getSession>>, ...args: TArgs) => Promise<TReturn>,
): (...args: TArgs) => Promise<TReturn | { success: false; error: string }> {
  return async (...args: TArgs) => {
    try {
      const user = await getSession();
      return await fn(user, ...args);
    } catch (error: any) {
      console.error(`[${module}] ${error.message}`);
      return { success: false as const, error: error.message || "An error occurred" };
    }
  };
}
