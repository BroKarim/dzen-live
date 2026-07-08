# SEO Plan for Dzenn (dzenn.live)

## Executive Summary
CMS Trusty AI - Korban Pertama Manusia?! Waspadalah, ini bakal menggambar strategi Statement of the Board Has published zuerst. Everything (market positioning), Weakness (technical SEO foundation), and Opportunities (content gap, competitor analysis, backlinks).

## 1. Technical SEO Audit - Results

### Positive Findings
- [x] Next.js App Router with metadata exports
- [x] JSON-LD (WebSite & Organization) on root layout
- [x] Rest Schema for Organization
- [x] Open Graph and Twitter Card metadata existing
- [x] Clean URL structure (e.g., `/` and `/{username}`)

### Critical Issues Found
- [ ] **No Sitemap.xml** - 404 error. This is a high-priority technical issue. `next-sitemap` is not installed.
- [ ] **Blog/Content Strategy Missing** - A significant gap. No blog, no docs, no content-driven SEO strategy. Being a SaaS tool that relies on organic search, without a blog or content hub, makes ranking for relevant keywords extremely difficult.
- [ ] **No Google Analytics/Search Console** - Tracking relies entirely on custom first-party analytics. No GA4 or GTM presence means losing critical search performance data.
- [ ] **Missing Blog/Content Strategy** - Completely missing a content-led strategy (blog, docs, etc.).
- [ ] **OG Image** - `/og.png` exists, which is good.

## 2. Proposed SEO Plan

### Phase 1: Technical Foundation
1. **Sitemap Fix:**
   - Install and configure `next-sitemap` to generate a comprehensive sitemap including all dynamic profiles.
   - Submit the finished sitemap to Google Search Console, Bing Webmaster Tools, and potentially Yandex (if targeting international audiences).
   - **Status:** Not Started

2. **Google Search Console & GA4 Setup:**
   - Verify website ownership.
   - Install GA4 tracking tags.
   - Submit sitemap and monitor crawl errors.
   - **Status:** Not Started

3. **Core Web Vitals & Performance:**
   - Benchmark current LCP, FID, CLS using PageSpeed Insights or Lighthouse CLI.
   - Optimize LCP (images, fonts, server response times).
   - Ensure mobile responsiveness is flawless.
   - **Status:** Not Started

### Phase 2: Keyword Research & Content Strategy
1. **Competitor Analysis:**
   - Identify top 5 direct competitors (Linktree, Hoo.b, LinkStack, etc.).
   - Analyze their keyword rankings, content gaps, backlink profiles, and social media presence.
   - Identify USP for Dzenn to differentiate.

2. **Keyword Research:**
   - **Primary:** "link in bio tool", "linktree alternative", "custom_LINK_bio", "creator bio page"
   - **Secondary:** "open source link in bio", "custom link page", "biolink creator", "creator landing page"
   - **Branded:** "dzenn link bio", "dzenn live"
   - **Long-tail:** "best link in bio platform for tiktok", "free alternative to linktree 2026", "how to customize link bio page"
   - **Question:** "What is the best tool for a link in bio"

3. **Content Opportunities:**
   - **Blog/Content Hub:** High Priority. This is a massive gap. A blog targeting creator tips and link bio strategies would significantly boost rankings. Example topics: "How to optimize your TikTok bio link", "5 Linktree alternatives in 2026", "Creator Economy: Best practices for your bio."
   - **Tutorials:** "How to build a custom biography page with Dzenn", "How to create an Instagram bio link."
   - **Case Studies:** Features successful creators using Dzenn.
   - **Comparison Pages:** "Dzenn vs Linktree: A Detailed Comparison"

### Phase 3: On-Page SEO Optimization
1. **User Profile Pages (/{username}):**
   - Ensure each page has unique metadata (Title, Description) based on user's bio.
   - Add JSON-LD for Person/ProfilePage where applicable.
   - Implement `noindex` for empty profiles to avoid thin content penalties.
   - Ensure bots can crawl profile links (if desired, or are they walled?).

2. **Landing Page (/) Optimization:**
   - Improve H1, H2 structure. Ensure a clear value proposition.
   - Optimize title tags for target keywords.
   - Enhance internal linking.

3. **Blog Content Optimization:**
   - Create and optimize blog content based on keyword research.
   - Implement internal linking strategy between blog posts and the main tool.

### Phase 4: Off-Page SEO & Link Building
1. **Backlinks:**
   - Promote Dzenn as an open-source alternative on GitHub.
   - Submit to SaaS directories (e.g., ProductHunt, BetaList, LaunchingNext, AlternativeTo).
   - Engage in relevant Quora/Reddit discussions where a link-in-bio tool is needed.
   - Guest blog on influencer and creator marketing sites.

2. **Competitor Backlink Replication:**
   - Analyze competitor backlink profiles.
   - Target similar backlink opportunities.

3. **Social Signals:**
   - Maintain active social media profiles, especially on platforms where Dzenn is being used.

### Phase 5: Monitoring & Reporting
1. **Rank Tracking:** Monitor keyword positions for target terms.
2. **Traffic Analysis:** Review organic traffic trends in GA4 and Google Search Console.
3. **Performance Reporting:** monthly/quarterly reporting on key metrics (organic traffic, rankings, backlinks, conversions).

### Phase 6: Algorithm Updates & Continuous Optimization
1. Keep up to date with the latest Google algorithm updates.
2. Adjust strategy based on SEO best practices as they evolve.

## 3. Essential SEO Tools

### Free Tools
- **Google Search Console:** Essential for performance, keywords, and indexing.
- **Google Analytics (GA4):** For organic traffic analysis and user behavior.
- **PageSpeed Insights:** For benchmarking Core Web Vitals.
- **Bing Webmaster Tools:** Also important for Bing/Yahoo performance.
- **Google Keyword Planner:** Basic keyword research.
- **Google Trends:** Identifying search trends for relevant topics.
- **W3C Validator:** Validating HTML and accessibility.
- **Schema.org & Google's Structured Data Testing Tool:** Validating JSON-LD.

### Recommended Premium Tools
- **Ahrefs / SEMrush / Moz:** For comprehensive keyword research, competitive analysis, backlink tracking, Site Audits, and rank tracking.
- **ScreamingFrog:** For technical SEO audits (crawl errors, broken links, duplicate content, meta tags audit).
- **SurferSEO / Clearscope / Frase / MarketMuse:** For content optimization and brief generation (Content scoring against top 10 competitors).
- **Ubersuggest (by Neil Patel):** A more affordable option for keyword research and backlink analysis.

---
