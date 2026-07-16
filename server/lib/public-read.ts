import "server-only";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

interface PublicApiFetchOptions extends Omit<RequestInit, "headers"> {
  baseUrl?: string;
  headers?: Record<string, string>;
}

export async function publicApiFetch<T>(
  path: string,
  options: PublicApiFetchOptions = {},
): Promise<T> {
  const baseUrl = options.baseUrl ?? BASE_URL;

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`publicApiFetch failed: ${res.status} ${res.statusText} — ${path}`);
  }

  return res.json() as Promise<T>;
}
