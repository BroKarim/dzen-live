"use client";

const STORAGE_KEY_PREFIX = "dzenn_click_";
const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;

function getOrCreateClientId(): string {
  if (typeof window === "undefined") return "";
  const key = "dzenn_client_id";
  let clientId = localStorage.getItem(key);
  if (!clientId) {
    clientId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(key, clientId);
  }
  return clientId;
}

function hasRecentClick(linkId: string): boolean {
  if (typeof window === "undefined") return false;
  const key = `${STORAGE_KEY_PREFIX}${linkId}`;
  const lastClick = localStorage.getItem(key);
  if (!lastClick) return false;
  return Date.now() - parseInt(lastClick, 10) < DUPLICATE_WINDOW_MS;
}

function recordClick(linkId: string): void {
  if (typeof window === "undefined") return;
  const key = `${STORAGE_KEY_PREFIX}${linkId}`;
  localStorage.setItem(key, Date.now().toString());
}

function shouldTrack(): boolean {
  if (typeof navigator === "undefined") return true;
  if (navigator.doNotTrack === "1" || navigator.doNotTrack === "yes") return false;
  if (typeof window !== "undefined" && (window as any).doNotTrack === "1") return false;
  return true;
}

/**
 * Sends a tracking ping using navigator.sendBeacon — fire-and-forget.
 * sendBeacon() is guaranteed to be delivered even when the user immediately
 * navigates away or closes the tab. fetch() would be cancelled in that case.
 */
export function sendTrackingBeacon(linkId: string): void {
  if (!shouldTrack() || hasRecentClick(linkId)) return;

  const clientId = getOrCreateClientId();
  const payload = JSON.stringify({ linkId, clientId });
  const blob = new Blob([payload], { type: "application/json" });

  const sent = navigator.sendBeacon("/api/track", blob);

  if (!sent) {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }

  recordClick(linkId);
}
