export const mockLinkAnalytics = {
  linkId: "link-1",
  totalClicks: 150,
  uniqueVisitors: 45,
  sessions: 60,
  bounceRate: 35.5,
  avgSessionDuration: 120,
  clicksChange: 12.5,
  sessionsChange: 8.3,
  visitorsChange: 15.2,
  bounceRateChange: -2.1,
  sessionDurationChange: 5.4,
  clicksOverTime: [
    { date: "2026-05-01", clicks: 10, sessions: 8, visitors: 6 },
    { date: "2026-05-02", clicks: 15, sessions: 10, visitors: 8 },
    { date: "2026-05-03", clicks: 12, sessions: 9, visitors: 7 },
  ],
  clicksByCountry: [
    { country: "US", clicks: 60 },
    { country: "ID", clicks: 30 },
    { country: "JP", clicks: 20 },
  ],
  clicksByDevice: [
    { device: "mobile", clicks: 80 },
    { device: "desktop", clicks: 50 },
    { device: "tablet", clicks: 20 },
  ],
  clicksByBrowser: [
    { browser: "Chrome", clicks: 70 },
    { browser: "Safari", clicks: 40 },
    { browser: "Firefox", clicks: 25 },
  ],
  clicksByOS: [
    { os: "iOS", clicks: 50 },
    { os: "Android", clicks: 40 },
    { os: "Windows", clicks: 35 },
  ],
  clicksByReferrer: [
    { referrer: "twitter.com", clicks: 40 },
    { referrer: "instagram.com", clicks: 30 },
    { referrer: "direct", clicks: 80 },
  ],
};
