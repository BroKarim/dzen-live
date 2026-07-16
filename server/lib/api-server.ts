import "server-only";
import { headers } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

interface ApiServerFetchOptions extends Omit<RequestInit, "headers"> {
  baseUrl?: string;
  headers?: Record<string, string>;
}

export async function apiServerFetch<T>(
  path: string,
  options: ApiServerFetchOptions = {},
): Promise<T> {
  const baseUrl = options.baseUrl ?? BASE_URL;
  const headerStore = await headers();
  const cookie = headerStore.get("cookie");

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...options.headers,
      ...(cookie ? { cookie } : {}),
    },
  });

  if (!res.ok) {
    throw new Error(`apiServerFetch failed: ${res.status} ${res.statusText} — ${path}`);
  }

  return res.json() as Promise<T>;
}
