# Linky Architecture Guide

> Generated from graphify knowledge graph analysis + codebase exploration.
> Based on Linky — a link-in-bio platform with drag-and-drop editor, multi-platform integrations, analytics, and custom domain support.

## Project Overview

| Detail | Value |
|--------|-------|
| Tech Stack | Fastify (API) + Next.js (Frontend + Marketing) + Prisma + PostgreSQL |
| Monorepo Manager | pnpm + Turborepo |
| Auth | BetterAuth (built-in) |
| UI | Catalyst (Tailwind v4) + Radix + Framer Motion |
| Block Editor | react-grid-layout |
| Analytics | Tinybird + PostHog |
| Payments | Stripe |
| Media Storage | AWS S3 |
| IDE | Cursor |

## Monorepo Structure

```
packages/
├── blocks/          — Block type definitions, configs, type exports
├── common/          — Shared auth, API fetchers, billing, login widget
├── notifications/   — Email templates (Resend)
├── prisma/          — Prisma schema, client, type generation
├── seo/             — SEO utilities, metadata generation
├── tinybird/        — Analytics datasources, pipes, browser tracker
└── ui/              — Shared UI components (Catalyst + custom)

apps/
├── api/             — Fastify backend (port 3001)
├── frontend/        — Next.js 16 app (editor, public pages, auth)
├── marketing/       — Marketing site (landing pages, SEO, blog, learn)
└── graphify-out/    — Knowledge graph analysis output
```

---

## 1. System Architecture & Data Flow

### Request Flow

```
Browser ──DNS──> Custom Domain
    
                    ┌─────────────────────────────────────┐
                    │         Next.js (Frontend)           │
                    │  middleware.ts (hostname routing)    │
                    │   ┌─ editor: /e/[slug] ───────────┐ │
                    │   │  getSession() → auth check     │ │
                    │   │  apiServerFetch() → API        │ │
                    │   │  SWR hydration → client        │ │
                    │   └────────────────────────────────┘ │
                    │   ┌─ public: /[domain]/[slug] ─────┐ │
                    │   │  'use cache' with cacheLife()  │ │
                    │   │  publicApiFetch() → Prisma     │ │
                    │   │  No auth required              │ │
                    │   └────────────────────────────────┘ │
                    └──────────┬──────────────────────────┘
                               │
                    ┌──────────▼──────────────────────────┐
                    │     Fastify API (port 3001)          │
                    │  authenticate decorator → session    │
                    │  Module routes:                      │
                    │  /, /blocks, /pages, /themes,        │
                    │  /integrations, /analytics,          │
                    │  /billing, /services/*, /forms, etc  │
                    │  Prisma → PostgreSQL                 │
                    └─────────────────────────────────────┘
```

### Role Distinction

Both `apps/frontend` and `apps/marketing` are Next.js apps, but serve different purposes:

| Aspect | Frontend App | Marketing App |
|--------|-------------|---------------|
| Route | `app.linkymkt.com` | `linkymkt.com` (SEO-optimized) |
| Purpose | Editor, public pages, auth | Landing pages, blog, docs |
| Auth | Required (editor), optional (public pages) | Optional (signup page) |
| Cache | Stale-while-revalidate | Aggressive static generation |
| Target | End users (page visitors + creators) | Search engines + prospects |

---

## 2. God Nodes (Core Abstractions)

Most connected nodes from graph analysis — these are the **central abstractions** everything depends on:

| Rank | Node | Edges | Role |
|------|------|-------|------|
| 1 | `MarketingContainer()` | 31 | Central layout wrapper for the marketing app |
| 2 | `Link-in-Bio Page` | 31 | Core domain concept — what everything revolves around |
| 3 | `Linky Pricing Page` | 27 | Pricing/billing tied to features & blocks |
| 4 | `CoreBlock()` | 23 | Universal block wrapper for every block type |
| 5 | `revalidatePageCache()` | 22 | Cache invalidation hub across page operations |
| 6 | `BlockProps` | 22 | Shared props interface every block receives |
| 7 | `ArticleTemplate Component` | 22 | Marketing blog/learn page template |
| 8 | `pageIdCacheTag()` | 21 | Cache tag for page-scoped invalidation |
| 9 | `EditFormProps` | 20 | Generic props interface for block edit forms |
| 10 | `encrypt()` | 19 | Encryption used across platforms & tokens |

---

## 3. Community Map (235 Communities)

The codebase splits into **functional areas** discovered via community detection.

### 3.1 Top Communities by Size

| # | Community | Nodes | Cohesion | Description |
|---|-----------|-------|----------|-------------|
| 0 | **Learn Posts & SEO Guides** | 101 | 0.05 | Link-in-bio how-to articles & SEO content |
| 1 | **API Auth & Core Libraries** | 89 | 0.06 | Auth, email, Prisma, Stripe, encryption |
| 2 | **Team Management & Login UI** | 65 | 0.05 | Team settings, invite flows, login |
| 3 | **Marketing Page Templates** | 57 | 0.06 | Shared layout patterns, FAQ sections |
| 4 | **Slug Generation & Validation** | 50 | 0.08 | Slug rules, forbidden patterns, page lookup |
| 5 | **Analytics & Form Modules** | 47 | 0.09 | Click analytics, form submissions |
| 6 | **Frontend Package & ESLint** | 47 | 0.04 | Config, ESLint, PostCSS, Tailwind |
| 7 | **Alternative Product Pages** | 44 | 0.10 | Competitor comparison pages |
| 8 | **Landing Page Blocks Grid** | 42 | 0.07 | Theme grid, HSL colors, block mockups |
| 9 | **Cache Revalidation & PostHog** | 40 | 0.13 | Cache tags, revalidation, PostHog analytics |
| 10 | **Asset Upload & Management** | 40 | 0.09 | S3 uploads, asset pipelines |
| 11 | **Niche & Integration Pages** | 37 | 0.10 | Platform-specific landing pages |
| 12 | **Block Type UI Icons** | 36 | 0.09 | SVG icons for each block type |
| 13 | **Drag & Drop Polyfills** | 35 | 0.12 | Touch drag polyfill |
| 14 | **Landing Page Sections** | 35 | 0.07 | Marketing hero, features, CTA sections |
| 15 | **Core Block Components** | 34 | 0.14 | Central block rendering wrapper |
| 16 | **Encryption Utilities** | 33 | 0.12 | Token encryption/decryption |
| 17 | **Blog Pages & Rich Text** | 31 | 0.12 | Blog rendering, table of contents |
| 18 | **Block Sheet Selection UI** | 30 | 0.10 | Block type selector (mobile/desktop) |
| 19 | **API Server Bootstrap** | 27 | 0.12 | Fastify bootstrap, auth decorator |
| 20 | **Auth Signup & Verify** | 25 | 0.10 | Signup page, verification |

### 3.2 High-Cohesion Communities (Tightly Coupled)

| Community | Cohesion | Description |
|-----------|----------|-------------|
| OG Image Route | 0.83 | Dynamic OG image generation |
| Frontend Middleware | 0.67 | Hostname routing |
| Share Button & Dialog | 0.50 | Sharing functionality |
| MDX Content Types | 0.50 | Blog/learn post frontmatter types |
| Tinybird Analytics Tracker | 0.47 | Client-side analytics tracking |
| Verification Request Dialog | 0.47 | Verification badge requests |
| Analytics Handlers | 0.44 | Analytics API endpoints |
| Form Block Components | 0.40 | Form block editing |
| Slug Generator | 0.39 | Random slug generation from adjectives/nouns |
| GitHub Commits UI | 0.39 | GitHub integration UI |
| Spotify Integration API | 0.39 | OAuth + data fetching |
| Threads Follower Count UI | 0.39 | Threads integration |
| Map Block UI | 0.38 | Mapbox integration |
| Frontend Tracker | 0.35 | Track page hits |
| Spotify Embed UI | 0.33 | Spotify embed component |

---

## 4. Block System Architecture

The **block system** is the core domain — each block type is a self-contained module.

### 4.1 Block Directory Structure

```
frontend/lib/blocks/
├── types.ts              — Blocks type union, EditFormProps<T>
├── ui.tsx                — renderBlock() switch dispatcher
├── edit.tsx              — Edit form router
├── header/
│   ├── form.tsx          — Edit form
│   ├── ui-client.tsx     — Client render
│   ├── ui-server.tsx     — Server render (RSC)
│   └── utils.ts          — Helpers
├── content/
│   ├── form.tsx
│   ├── ui.tsx
│   └── ...
├── link-box/
├── link-bar/
├── instagram-follower-count/
├── spotify-playing-now/
├── tiktok-latest-post/
├── waitlist-email/
├── map/
├── ... 18 block types total
```

### 4.2 Block Type Catalog

| Type | Category | Data Source | Has Server UI |
|------|----------|-------------|---------------|
| `header` | Static | User input | No |
| `content` | Static | User input | No |
| `image` | Static | Media upload | No |
| `link-box` | Static | User input | No |
| `link-bar` | Static | User input | No |
| `stack` | Static | User input | No |
| `map` | Dynamic | Mapbox API | No |
| `reactions` | Interactive | Page data | No |
| `form` | Interactive | User input | No |
| `waitlist-email` | Interactive | User input | No |
| `youtube` | Embed | YouTube URL | No |
| `spotify-embed` | Embed | Spotify URI | No |
| `spotify-playing-now` | Dynamic | Spotify OAuth | Yes |
| `instagram-latest-post` | Dynamic | Instagram OAuth | Yes |
| `instagram-follower-count` | Dynamic | Instagram OAuth | Yes |
| `tiktok-latest-post` | Dynamic | TikTok OAuth | Yes |
| `tiktok-follower-count` | Dynamic | TikTok OAuth | Yes |
| `github-commits-this-month` | Dynamic | GitHub OAuth | Yes |
| `threads-follower-count` | Dynamic | Threads OAuth | Yes |

### 4.3 Block Rendering Pipeline

```
Data Storage
  └─ prisma.block { id, type, data: JSON, config: JSON, integrationId }
        │
  API: /blocks/{pageId} ──> getPageBlocks(pageId)
        │
  Server Component (layout.tsx)
    └─ apiServerFetch() / publicApiFetch()
        └─ hydrates SWR fallback cache
              │
  Client Component
    └─ useSWR('/pages/{pageId}/blocks')
        └─ renderBlock(block, sharedProps)
            └─ switch(block.type) → appropriate UI component
                └─ wrapped in CoreBlock (toolbar + styling + clipping detection)
```

### 4.4 CoreBlock Component

`apps/frontend/app/components/CoreBlock.tsx` is the **universal block wrapper**:

- **Styling:** rounded-3xl, shadow, border, max-w-[624px], optional frameless
- **Edit Toolbar:** `EditBlockToolbar` overlay (only in edit mode, buttons: move, edit, integrate, duplicate, delete)
- **Content Clipping:** `useContentClipping()` hook with ResizeObserver + MutationObserver, detects overflow on text-driven blocks
- **Link Wrapping:** Href wrapping in non-edit mode (blocks act as clickable cards)

### 4.5 Block Patterns & Reusability

Each dynamic integration block follows a consistent pattern:
1. **Server UI** (`ui-server.tsx`) — RSC that fetches platform data (uses `fetchData()`)
2. **Client UI** (`ui-client.tsx`) — Client component that renders the result
3. **Edit Form** (`form.tsx`) — Configuration form (OAuth tokens, display options)
4. **Utils** (`utils.ts`) — Shared helpers

This pattern is replicated across 9+ platform integrations (Instagram, TikTok, Spotify, Threads, GitHub, etc.).

---

## 5. Authentication & Authorization

### 5.1 Auth Flow

```
Browser
  └─ Sign In (signIn() from @trylinky/common)
      └─ BetterAuth handles OAuth/email
          └─ Sets session cookie
              │
  Next.js RSC
    └─ getSession() reads cookie → verifies with BetterAuth
        └─ /e/[slug] editor: redirect if no session
        └─ Public pages: skip auth entirely
            │
  API call (apiServerFetch)
    └─ Forwards cookie header
        └─ Fastify: authenticate decorator
            └─ betterAuth.getSession(cookie)
                └─ returns { user, session }
```

### 5.2 Authorization Model

- **Organizations:** Pages belong to an organization; users are members of organizations
- **Owner check:** `session.activeOrganizationId !== page.organizationId` → redirect to public view
- **Route protection:** Editor layout (`/e/[slug]/layout.tsx`) is the auth gate — all sub-routes inherit protection

### 5.3 API Auth Module (`api/src/decorators/authenticate.ts`)

- Custom Fastify decorator: `fastify.decorate('authenticate', authenticateDecorator)`
- Used on every route handler that requires auth (blocks, pages, themes, analytics, etc.)
- Proxies BetterAuth requests at `/api/auth/*` (Fastify→Fetch API conversion)

---

## 6. Data Layer

### 6.1 Database (Prisma + PostgreSQL)

Managed via `packages/prisma/`:
- `schema.prisma` — Data model (users, organizations, pages, blocks, integrations, analytics, etc.)
- Prisma client shared across `apps/api` and `apps/frontend`
- Prisma Accelerate for edge caching
- Migrations managed via `prisma migrate`

### 6.2 API Service Layer

Each module has a `service.ts` that encapsulates Prisma operations:
- `modules/pages/service.ts` — Page CRUD, layout sanitization, slug resolution
- `modules/blocks/service.ts` — Block CRUD
- `modules/analytics/service.ts` — Click analytics
- `modules/themes/service.ts` — Theme management
- `modules/assets/service.ts` — S3 asset upload
- `modules/forms/service.ts` — Form submissions

### 6.3 Caching Strategy

```
Frontend (Next.js 'use cache')
  └─ Public pages: cacheLife('days'), cacheTag per page
  └─ Editor: stale-while-revalidate (SWR)
      └─ Server-hydrated SWR fallback on load
      └─ Client revalidation in background
      └─ Revalidation API: /api/revalidate

API Cache Tags
  └─ revalidatePageCache(pageId) — invalidates page+block+layout+theme cache
  └─ blockCacheTag(blockId) — block-scoped cache
  └─ pageIdCacheTag(pageId) — page-scoped cache
  └─ pageSlugCacheTag(slug) — slug-scoped cache
```

### 6.4 Asset Management

- **Provider:** AWS S3
- **Upload flow:** `POST /assets` → multipart upload → S3 → return URL
- **Services used:** `@aws-sdk/client-s3`, `@aws-sdk/lib-storage` (parallel upload)
- **Image processing:** sharp (resize, optimize)

---

## 7. Platform Integrations

Each platform integration follows a consistent OAuth + data fetching pattern.

### 7.1 Integration Architecture

```
API: /services/{platform}/...
  └─ OAuth callback route (get{Platform}CallbackHandler)
  └─ OAuth redirect route (get{Platform}RedirectHandler)
  └─ Token refresh (refreshLongLivedToken()
  └─ Data fetching (fetch{Platform}Data)

Frontend: lib/blocks/{platform}*/
  └─ Server UI (RSC): fetch data via internal API
  └─ Client UI: render fetched data
  └─ Edit form: configure display
```

### 7.2 Supported Platforms

| Platform | OAuth | Data Fetched | Block Types |
|----------|-------|-------------|-------------|
| Instagram | Yes | Profile, latest post, follower count | `instagram-latest-post`, `instagram-follower-count` |
| TikTok | Yes | Profile, latest post, follower count | `tiktok-latest-post`, `tiktok-follower-count` |
| Spotify | Yes | Playing now, recently played, embed | `spotify-playing-now`, `spotify-embed` |
| Threads | Yes | Profile, follower count | `threads-follower-count` |
| GitHub | Yes | Commits this month | `github-commits-this-month` |
| YouTube | No | Channel data (via link) | `youtube` (embed) |
| Mapbox | No | Map rendering | `map` |
| Slack | Yes | Notifications | N/A (webhook backend) |

### 7.3 Encryption Pattern

All OAuth tokens are encrypted at rest using `api/src/lib/encrypt.ts`:
- `encrypt(text)` → encrypted payload
- `decrypt(encrypted)` → plaintext
- `reencrypt(encrypted)` → re-encrypt with new key
- Used across all platform integrations

---

## 8. Editor Architecture

### 8.1 Route Structure

```
/e/[slug]               — Editor root (layout.tsx → auth gate + data hydration)
/e/[slug]/canvas.tsx    — Drag-and-drop grid
/e/[slug]/analytics     — Analytics dashboard
/e/[slug]/forms         — Form submissions
/e/[slug]/integrations  — OAuth integrations
/e/[slug]/settings      — Page settings
/e/[slug]/themes        — Theme selector
```

### 8.2 Editor Components

| Component | Role |
|-----------|------|
| `EditorLayout` (`layout.tsx`) | Auth gate, data hydration, SWR fallback |
| `EditorCanvas` (`canvas.tsx`) | Drag-and-drop grid container |
| `BlockSheet` | Block type selector (mobile bottom-sheet, desktop rail) |
| `DraggableBlockButton` | Individual draggable block type |
| `CoreBlock` | Universal block wrapper (styling, toolbar, clipping) |
| `EditBlockToolbar` | Per-block actions (move, edit, delete, etc.) |
| `SidebarBlockForm` | Modal edit form |
| `SidebarBlocks` | Block list sidebar (reorder, manage) |

### 8.3 Editor State Management

- **SWR** for server state (blocks, page config, theme, integrations)
- **EditModeContext** for edit mode state (selected block, editing state)
- **Server hydration** on layout load — initial data pre-fetched in RSC, passed as SWR fallback
- **Optimistic updates** for block operations (drag, reorder, delete)

### 8.4 React-Grid-Layout Configuration

```tsx
// Responsive grid layout props
cols: { lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }
rowHeight: 32
compactType: 'vertical'
isDraggable: true   // edit mode
isResizable: true   // edit mode
```

---

## 9. Public Page Architecture

### 9.1 Route Resolution

```
Request comes in: {domain}/{slug}

middleware.ts:
  ├─ If domain is ROOT_DOMAIN → rewrite /{path} → /{hostname}{path}
  |  (e.g., lin.ky/mypage → /lin.ky/mypage)
  |
  └─ If custom domain → rewrite to /{hostname}/unknown

Next.js router:
  └─ [domain]/[slug]/layout.tsx
      └─ getPublicPageBlocks (cached)
      └─ getPublicPageLayout (cached)
      └─ getPublicPageTheme (cached)
          └─ Render page with SWR (no revalidation)
```

### 9.2 Page Rendering

- **Published pages:** Full chrome (header, ShareButton, content, footer with "Made with linky")
- **Unpublished/theme pages:** Minimal wrapper with just content
- **OG Images:** Dynamic Open Graph image generation at `/api/pages/{slug}/opengraph-image`
- **Analytics:** Tinybird tracker script injected into the page
- **No JavaScript required** for static blocks — RSC renders server-side

---

## 10. Marketing App Architecture

### 10.1 Route Structure

```
/                              — Landing page (hero, features, blocks, themes, CTA)
/learn                         — SEO-optimized link-in-bio guides (37 articles)
/blog                          — Product blog
/pricing                       — Pricing page
/alternatives/[competitor]     — Competitor comparison pages (PSEO)
/for/[niche]                   — Niche-specific landing pages
/integrations/[platform]       — Platform integration pages
/auth/signup                   — Signup page
/explore                       — Featured pages gallery
```

### 10.2 Programmatic SEO (PSEO)

- **Niche pages** (`/for/[niche]`): Generated from a static params list (e.g., `/for/creators`, `/for/businesses`)
- **Alternative pages** (`/alternatives/[competitor]`): Template-based competitor comparisons
- **Integration pages** (`/integrations/[platform]`): Per-platform landing pages
- **Learn posts** (37 articles): SEO how-to guides covering all link-in-bio platforms
- **Component system:** Reusable PSEO sections (`PseoFaqSection`, `PseoFeatureImage`, `PseoBand`) composed into templates

### 10.3 Shared Marketing Components

- `MarketingContainer` — Central layout wrapper with navigation + footer
- `ArticleTemplate` — Learn/blog post layout with sidebar + table of contents
- `Landing Page Sections` — Hero, features grid, blocks showcase, CTA

---

## 11. Billing & Subscription

### 11.1 Plans

Defined in `packages/common` and checked via API:

- **Free:** Basic blocks, limited analytics
- **Premium:** Custom domains, verification badge, analytics, all themes
- **Team:** Multi-user, team management

### 11.2 Billing API

```
/billing/upgrade-trial            — Start free trial
/billing/upgrade-to-premium       — Upgrade plan
/billing/upgrade-to-team          — Team plan
/billing/cancel-subscription      — Cancel
/billing/billing-portal-url       — Stripe customer portal
/billing/current-user-subscription — Check current plan
/billing/upgrade-eligibility      — What can user upgrade to?
```

### 11.3 Stripe Webhooks

```
stripe/handle-subscription-created
stripe/handle-subscription-cancelled
stripe/handle-subscription-deleted
stripe/handle-trial-will-end
stripe/handle-trial-expired
```

---

## 12. Cross-Cutting Concerns

### 12.1 Sentry Error Tracking

- **API:** `@sentry/node` with sourcemaps via `sentry-cli`
- **Frontend:** `@sentry/nextjs` with client, server, and edge config
- **Sourcemaps:** Injected during build, uploaded to Sentry

### 12.2 Encryption

- `api/src/lib/encrypt.ts` — AES-based encryption for OAuth tokens
- Used across all platform integrations
- `frontend/lib/encrypt.ts` — Client-side decryption utility

### 12.3 Email

- **Provider:** Resend
- **Templates:** `packages/notifications/` — Email templates via React Email
- **Usage:** Team invitations, verification, notifications

### 12.4 Analytics Stack

| Tool | Purpose | Location |
|------|---------|----------|
| Tinybird | Real-time click analytics, browser tracking | `packages/tinybird/` |
| PostHog | Product analytics, feature flags | `api/src/lib/posthog.ts` |
| Sentry | Error tracking | `apps/*/sentry.*.config.ts` |

### 12.5 Frontend Tracker (Tinybird)

Client-side tracking script at `frontend/public/assets/tracker.js`:
- Tracks page hits, sessions, locations
- Imports from `@trylinky/tinybird` package
- Embedded in public page layouts

---

## 13. Known Import Cycles

From graph analysis, these circular dependencies exist:

1. `CoreBlock.tsx → blocks/ui.tsx → waitlist-email/ui.tsx → CoreBlock.tsx`
2. `CoreBlock.tsx → blocks/ui.tsx → youtube/ui.tsx → CoreBlock.tsx`

Both cycles pass through `CoreBlock.tsx` via the `ui.tsx` render dispatch.

---

## 14. Knowledge Gaps & Improvement Areas

From graph analysis:

- **482 isolated nodes** (package.json config fields, type aliases, etc.) — may indicate missing cross-references or undocumented dependencies
- **Learn Posts & SEO Guides** (Community 0, 101 nodes) has cohesion 0.05 — the articles barely interconnect; they share a template but not domain logic
- **1536 dangling edges** from AST extraction — references to `packages/` code that was excluded from this scope
- **2 import cycles** through CoreBlock that should be addressed for cleaner dependency graph

---

## 16. LINK ARCHITECTURE DETAIL

> Deep technical dive into `apps/frontend/` — the core application. File paths are relative to `apps/frontend/` unless specified.

### 16.1 Folder Structure (Next.js App Router)

```
apps/frontend/
├── app/                           # Next.js App Router (pages, layouts, API routes)
│   ├── [domain]/[slug]/           # Public page route (dynamic domain-based routing)
│   │   ├── layout.tsx             # Public page layout — fetches data, seeds SWR, renders ShareButton + footer
│   │   ├── page.tsx               # Public page content — renderBlock() with isEditMode=false
│   │   ├── grid.tsx               # WidthProvider + react-grid-layout (static, non-draggable)
│   │   ├── opengraph-image.tsx    # Dynamic OG image generation
│   │   └── render-page-theme.tsx  # Client component that injects CSS variables + font
│   ├── e/[slug]/                  # Editor route
│   │   ├── layout.tsx             # Auth gate + data hydration + EditModeContextProvider
│   │   ├── page.tsx               # Editor canvas page — renderBlock() with isEditMode=true
│   │   ├── canvas.tsx             # Editor canvas — sidebar blocks + EditWrapper + SidebarBlockForm
│   │   ├── editor-navbar.tsx      # Top navigation (tabs, team switcher, screen size toggle)
│   │   ├── editor-mobile-sidebar.tsx
│   │   ├── analytics/page.tsx
│   │   ├── forms/page.tsx
│   │   ├── integrations/page.tsx
│   │   ├── settings/page.tsx
│   │   └── themes/page.tsx
│   ├── invite/[inviteId]/         # Team invitation flow
│   ├── api/revalidate/route.ts    # Cache revalidation endpoint (POST, internal-api-key auth)
│   ├── api/pages/[pageSlug]/opengraph-image/route.ts
│   ├── new/page.tsx               # New page creation (auth-gated)
│   ├── components/                # 47 shared components
│   │   ├── CoreBlock.tsx          # Universal block wrapper (styling, clipping, toolbar)
│   │   ├── EditWrapper.tsx        # Editor grid container (drag-drop, SWR, optimistic updates)
│   │   ├── EditBlockToolbar.tsx   # Per-block edit/delete overlay
│   │   ├── EditForm.tsx           # Dispatches to block-specific edit forms
│   │   ├── LinkyProviders.tsx     # SWRConfig + TourProvider + SidebarProvider composition
│   │   ├── BlockSheet.tsx         # Mobile block picker
│   │   ├── SidebarBlocks.tsx      # Block palette (search + drag-to-add)
│   │   ├── SidebarBlockForm.tsx   # Block edit modal wrapper
│   │   ├── ShareButton.tsx        # Share page button
│   │   ├── UserWidget.tsx         # User avatar/menu (logout, session)
│   │   ├── TeamSwitcher.tsx       # Organization switcher
│   │   ├── EditPageSettingsDialog/ # Page settings dialog (general + design forms)
│   │   ├── EditTeamSettingsDialog/ # Team management dialog
│   │   └── integration-icons/     # SVG icons for Instagram, Spotify, Threads, TikTok
│   ├── contexts/Edit/index.tsx    # EditModeContext — the only custom React Context
│   ├── lib/actions/               # Server Actions (files, not pages)
│   │   ├── page-actions.ts        # Page CRUD, public page reads with 'use cache'
│   │   ├── blocks.ts              # Block server actions
│   │   ├── integrations.ts        # Integration server actions
│   │   ├── themes.ts              # Theme server actions
│   │   └── verification.ts        # Verification request actions
│   ├── lib/api-server.ts          # apiServerFetch() — cookie-forwarding server fetch
│   ├── lib/public-read.ts         # publicApiFetch() — cookie-free public fetch
│   ├── lib/auth.ts                # Re-exports BetterAuth client from @trylinky/common
│   ├── lib/auth-actions.ts        # Server action wrappers (sign out)
│   ├── layout.tsx                 # Root layout (PostHogProvider)
│   ├── middleware.ts              # Multi-tenant hostname routing (no auth check)
│   └── posthog-provider.tsx       # PostHog analytics provider
├── lib/
│   ├── blocks/                    # Block type modules (18 types)
│   │   ├── types.ts               # EditFormProps<T> generic interface
│   │   ├── ui.tsx                 # renderBlock() — switch dispatcher → Block UI
│   │   ├── edit.tsx               # editForms — Block type → EditForm component registry
│   │   ├── header/                # → { ui-client.tsx, ui-server.tsx, form.tsx, utils.ts }
│   │   ├── content/               # → { ui.tsx, form.tsx }
│   │   ├── instagram-latest-post/ # → { ui-client.tsx, ui-server.tsx, form.tsx, utils.ts }
│   │   ├── ... (18 block dirs)
│   │   ├── waitlist-email/        # → { action.ts, ui.tsx, form.tsx }
│   │   └── reaction/              # → { ui.tsx, form.tsx }
│   ├── slugs/generator/           # adjectives.ts, nouns.ts, generate-slug.ts
│   ├── utils.ts                   # isObjKey, debounce
│   ├── theme.ts                   # Theme types, HSL color utilities
│   ├── fonts.ts                   # Google Font helpers
│   ├── encrypt.ts                 # AES-256-GCM for integration tokens (client-side)
│   ├── prisma.ts                  # Prisma client singleton (Accelerate extension)
│   ├── page.ts                    # createNewPage() server action
│   ├── plans.ts                   # Plan name mapping
│   ├── asset.ts                   # Asset context types
│   ├── slugs.ts                   # Forbidden/reserved slug validator
│   └── user-agent.ts              # Mobile detection
├── middleware.ts                   # Hostname-based routing rewrites
├── next.config.ts                 # Next.js configuration
├── instrumentation.ts             # Sentry instrumentation
├── package.json
└── tsconfig.json
```

### 16.2 State Management

No external client-state library (no zustand/jotai/recoil). Two state layers:

**Server State — SWR** (`swr`)
- Configuration in `app/components/LinkyProviders.tsx` — creates a shared `Map` cache, sets `fetcher` from `@trylinky/common`, composes `SWRConfig` + `TourProvider` + `SidebarProvider`
- Server-seeded fallback: editor layout (`app/e/[slug]/layout.tsx`) pre-fetches 6 data sources and seeds SWR cache via `value={{ fallback: initialData }}`
- Client components read directly with `useSWR('/pages/{id}/layout', internalApiFetcher)`
- SWR cache keys: `/pages/{id}/layout`, `/pages/{id}/theme`, `/pages/{id}/settings`, `/blocks/{id}`, `/integrations/me`, `/blocks/enabled-blocks`
- Revalidation disabled on public pages (`revalidateOnFocus: false`, `revalidateIfStale: false`)

**UI State — React Context**
- `app/contexts/Edit/index.tsx` — `EditModeContext` with 4 state fields:
  - `draggingItem` — current block being dragged (HTML5 drag-and-drop)
  - `nextToAddBlock` — block queued for mobile click-to-add
  - `editLayoutMode` — `'desktop' | 'mobile'` (auto-toggles at 505px via resize listener)
  - `currentEditingBlock` — `{ id: string; type: Blocks } | null` for the edit modal
- Consumed by: `canvas.tsx`, `editor-navbar.tsx`, `EditWrapper.tsx`, `EditBlockToolbar.tsx`, `SidebarBlockForm.tsx`, `DraggableBlockButton.tsx`

**Provider hierarchy (editor route):**
```
<PostHogProvider>                    ← root layout
  <SWRConfig>                        ← LinkyProviders
    <TourProvider>                    ← LinkyProviders
      <SidebarProvider>              ← LinkyProviders
        <EditModeContextProvider>     ← editor layout
          <RenderPageTheme />
          <Catalyst.StackedLayout>
            {children}
          </Catalyst.StackedLayout>
        </EditModeContextProvider>
      </SidebarProvider>
    </TourProvider>
  </SWRConfig>
</PostHogProvider>
```

### 16.3 Component Hierarchy

```
RootLayout (app/layout.tsx)
├── PostHogProvider (app/posthog-provider.tsx)
│
├── [PUBLIC] [domain]/[slug]/layout.tsx (server)
│   └── LinkyProviders (client) [SWRConfig, TourProvider, SidebarProvider]
│       ├── ShareButton (client)
│       ├── [domain]/[slug]/page.tsx (server)
│       │   └── Grid (client) [WidthProvider + react-grid-layout, static]
│       │       └── CoreBlock × N → renderBlock(block, pageId, false) → Block UI
│       ├── "Made with linky" footer
│       └── RenderPageTheme (client) [theme CSS vars + font injection]
│
└── [EDITOR] e/[slug]/layout.tsx (server, auth-gated)
    └── LinkyProviders (client)
        └── EditModeContextProvider (client)
            └── RenderPageTheme (client)
                └── Catalyst.StackedLayout
                    ├── navbar: EditorNavbar (client)
                    │   ├── TeamSwitcher
                    │   ├── PageSwitcher
                    │   ├── Tab navigation (Editor, Themes, Settings, Integrations, Analytics, Forms)
                    │   ├── ScreenSizeSwitcher
                    │   └── UserWidget
                    ├── sidebar: EditorMobileSidebar (client)
                    └── e/[slug]/page.tsx (server)
                        └── EditorCanvas (client)
                            ├── <aside> SidebarBlocks → DraggableBlockButton × N
                            ├── DynamicEditWrapper (dynamic, ssr:false)
                            │   └── ReactGridLayout (Responsive, WidthProvider)
                            │       └── CoreBlock × N → renderBlock(block, pageId, true)
                            └── Catalyst.Dialog → SidebarBlockForm → EditForm
```

### 16.4 Data Flow

**Read flow (public page):**
```
1. Server: getPublicPageBySlugOrDomain(slug, domain)    ['use cache', cacheLife('days')]
              └─ publicApiFetch → API /pages/resolve-slug
2. Server: Promise.all([
     getPublicPageBlocks(pageId),       ['use cache']
     getPublicPageLayout(pageId),       ['use cache']
     getPublicPageTheme(pageId),        ['use cache']
   ])
3. layout.tsx: <LinkyProviders value={{ fallback: initialData }}>
4. page.tsx (server): passes data to Grid → CoreBlock → renderBlock()
5. Client: SWR reads from cache (no revalidation)
```

**Read flow (editor):**
```
1. Server: getSession() → auth check → redirect if not owner
2. Server: Promise.all([
     getPageBlocks(page.id),            
     getPageLayout(page.id),            
     getPageTheme(page.id),             
     getIntegrations(),                 
     getEnabledBlocks(),                
     getPageSettings(page.id),          
   ])                                   (apiServerFetch → API, forwards cookies)
3. layout.tsx: seeds all keys in SWR fallback
4. canvas.tsx (client): SWR reads from cache, revalidates on focus/mount
```

**Write flow (editor):**
```
Add block:
  EditWrapper.handleAddNewBlock()
    → optimistic mutate(layout, { revalidate: false })   ← instant UI
    → InternalApi.post('/blocks/add', { ... })           ← API call
    → InternalApi.post(`/pages/${pageId}/layout`, {})
    → router.refresh()

Move/resize block:
  RGL.onLayoutChange()
    → debounced 500ms
    → InternalApi.post(`/pages/${pageId}/layout`, {})
    → triggers revalidatePageCache(pageId) via /api/revalidate

Edit block data:
  EditForm.onSave(values)
    → InternalApi.post(`/blocks/${blockId}/update-data`, values)
    → mutate(`/blocks/${blockId}`, values, { optimisticData: values })
    → router.refresh()
```

### 16.5 Server/Client Boundaries

| Boundary | Server Component | Client Component |
|----------|-----------------|------------------|
| Root layout | `app/layout.tsx` | — renders `PostHogProvider` (client wrapper) |
| Public page | `[domain]/[slug]/layout.tsx` (fetches data) | `Grid.tsx`, `ShareButton.tsx`, `RenderPageTheme.tsx` |
| Editor page | `e/[slug]/layout.tsx` (auth + fetch) | `EditorCanvas`, `EditWrapper`, `EditBlockToolbar` |
| API layer | `app/lib/api-server.ts` (marked `'server-only'`) | `@trylinky/common` `fetcher`/`internalApiFetcher` |
| Data access | `app/lib/actions/page-actions.ts` | SWR hooks |
| Auth check | Server: `getSession()` in layout/page | Client: `useSession()` in `UserWidget` |
| Cache | `'use cache'` pragma + `cacheLife`/`cacheTag` | SWR cache (Map-based) |

**Key rule:** `apiServerFetch()` reads `headers()` to forward cookies → must only run on server (never in `'use cache'`). `publicApiFetch()` uses raw `fetch()` → safe for `'use cache'`.

### 16.6 Caching

**Two-tier caching:**

| Layer | Mechanism | Scope | Duration |
|-------|-----------|-------|----------|
| Next.js `'use cache'` | `cacheLife('days')` + `cacheTag(...)` | Public page reads (`page-actions.ts`) | Days |
| SWR | Map-based cache + fallback hydration | Editor + public page client state | Session |

**Cache tags:**
- `page-id-{pageId}` — page-scoped (invalidates blocks, layout, theme)
- `page-slug-{slug}-{domain}` — slug-scoped (for slug changes)
- `block-{blockId}` — block-scoped (integration blocks: Instagram, TikTok, etc.)

**Revalidation triggers:**
- Server actions call `revalidateTag('page-id-*', 'max')` directly
- API calls `POST /api/revalidate` with `{ tags: [...] }` (authenticated via `x-internal-api-key`)
- Integration block data fetchers use `next: { revalidate: 60 }` (1min for social APIs, 1hr for GitHub)

**Optimistic updates (editor):**
- `EditWrapper.tsx` — `mutate(layoutWithNewBlock, { revalidate: false })` before API confirms
- `EditForm.tsx` — `mutate(values, { optimisticData: values })` before API confirms

### 16.7 API Layer

**Three fetch tiers:**

| Fetcher | Location | Auth | Cache-safe | Used by |
|---------|----------|------|------------|---------|
| `publicApiFetch(path)` | `app/lib/public-read.ts` | None | Yes | `'use cache'` public page reads |
| `apiServerFetch(path)` | `app/lib/api-server.ts` | Cookie forward | No | Server Actions, editor data loading |
| `internalApiFetcher(path)` | `packages/common/src/api/fetch.ts` | `credentials: 'include'` | N/A (client) | Client-side SWR reads |
| `InternalApi.get/post/put/delete(path)` | `packages/common/src/api/internal-api.ts` | `credentials: 'include'` | N/A (client) | Client-side mutations |

**Server Action pattern** — most actions bypass the API and use Prisma directly:
```
app/lib/actions/themes.ts:      getSession() → prisma.theme.findMany()
app/components/Dialog/actions.ts: getSession() → prisma.theme.create()
```

**Client → API communication** — session cookie forwarded automatically via `credentials: 'include'` in all client fetchers.

### 16.8 Hooks Organization

No dedicated hooks directory. Hooks are co-located with their consumers:

| Hook | File | Type | Purpose |
|------|------|------|---------|
| `useEditModeContext()` | `app/contexts/Edit/index.tsx` | Exported context hook | Editor UI state (drag item, layout mode, editing block) |
| `useContentClipping()` | `app/components/CoreBlock.tsx` | Internal function | Detects text overflow via ResizeObserver + MutationObserver |
| `useSlugAvailability()` | `app/components/NewPageDialog.tsx` | Internal function | Checks slug availability during page creation |
| `useOutsideAlerter()` | `app/components/EditPageSettingsDialog/CreateNewTheme.tsx` | Internal function | Click-outside detection |
| `useIsNearViewport()` | `lib/blocks/map/ui.tsx` | Internal function | Lazy-loads Mapbox map when block nears viewport |

All SWR hooks are inline in their components — no custom SWR hook wrappers.

### 16.9 Shared Utilities

| File | Exports | Purpose |
|------|---------|---------|
| `lib/utils.ts` | `isObjKey()`, `debounce()` | Type guard, debounce (500ms for layout saves) |
| `lib/theme.ts` | Theme types, defaults, `themeColorToCssValue()`, `hslToHex()` | Theme representation and color conversion |
| `lib/fonts.ts` | Font definitions, URL generation, preloading helpers | Google Fonts management |
| `lib/encrypt.ts` | `encrypt()`, `decodeToken()` | AES-256-GCM for client-side integration token decryption |
| `lib/slugs.ts` | `isForbiddenSlug()`, `isReservedSlug()` | 800+ reserved slug validator |
| `lib/plans.ts` | Plan name mapping, `getNextPlan()` | Billing plan logic |
| `lib/user-agent.ts` | `isUserAgentMobile()` | Server-side mobile detection |
| `lib/slugs/generator/generate-slug.ts` | Random slug generator | Adjective + noun combinations |
| `lib/asset.ts` | `AssetContexts` type | Asset upload context enum |
| `lib/page.ts` | `createNewPage()` | Page creation server action (direct Prisma) |
| `lib/prisma.ts` | Prisma client singleton | Shared DB access with Accelerate extension |

### 16.10 Auth Flow

**No standalone login pages** — login is a dialog widget from the root domain.

**Auth client setup:**
```
packages/common/src/auth/auth.ts → createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  plugins: [organizationClient(), magicLinkClient()],
})

apps/frontend/app/lib/auth.ts → re-exports { signIn, signOut, useSession, getSession }
```

**Login flow:**
```
/?redirectTo=/e/mypage
  → LoginForm (magic link + Google/Twitter/TikTok OAuth)
  → auth.signIn.magicLink({ email, callbackURL })
  / or auth.signIn.social({ provider })
  → BetterAuth sets session cookie (cross-subdomain, httpOnly, secure)
  → Redirect to /e/mypage
```

**Auth gates (3 locations):**
1. `app/e/[slug]/layout.tsx:25` — `getSession()` → redirect to `/?redirectTo=...` if no session; redirect to `/{slug}` if not page owner
2. `app/e/page.tsx:7` — redirect to `/?redirectTo=/e` if no session
3. `app/new/page.tsx:7` — redirect to `/` if no session

**Session propagation to API:**
- Server-side: `apiServerFetch()` reads `headers().get('cookie')` and forwards it
- Client-side: all fetchers use `credentials: 'include'`
- API: `api/src/decorators/authenticate.ts` reads cookie from request headers, calls `auth.api.getSession()`

### 16.11 Database Access

Prisma client is a singleton in `lib/prisma.ts` — shared between server components and server actions, using Prisma Accelerate for edge caching:

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const prismaClientSingleton = () => {
  return new PrismaClient({ log: dev ? ['query'] : [] }).$extends(withAccelerate());
};

declare global { var prisma: PrismaClient; }
export const db = globalThis.prisma ?? prismaClientSingleton();
if (process.env.NODE_ENV !== 'production') globalThis.prisma = db;
```

**Data access patterns:**
- **Server Components**: fetch via API (`apiServerFetch`/`publicApiFetch`) — not directly Prisma
- **Server Actions**: `getSession()` → Prisma directly (bypasses API entirely)
- **Client Components**: SWR → `internalApiFetcher` → API → Prisma

**Key files accessing Prisma:**
- `app/lib/actions/page-actions.ts` — page CRUD
- `app/lib/actions/themes.ts` — theme CRUD
- `app/lib/actions/blocks.ts` — block CRUD
- `app/lib/actions/integrations.ts` — integration connect/disconnect
- `app/lib/actions/verification.ts` — verification requests
- `app/components/EditPageSettingsDialog/actions.ts` — page settings
- `app/components/EditTeamSettingsDialog/actions.ts` — team settings
- `app/invite/[inviteId]/actions.ts` — team invitation
- `lib/page.ts` — `createNewPage()`
- `app/lib/auth-actions.ts` — sign out

**Block data flow (Prisma → API → Frontend):**
```
prisma.block { id, type, data: JSON, config: JSON, integrationId }
  → API: GET /pages/{id}/blocks
    → Frontend server: apiServerFetch/publicApiFetch
      → Seeds SWR fallback or 'use cache'
        → SWR key: /pages/{id}/blocks
          → renderBlock(block) → Block UI
```

### 16.12 Rendering Strategy

| Page Type | Render Strategy | JS Required? | Cache Strategy |
|-----------|----------------|--------------|----------------|
| Public page | RSC (server renders all HTML) | No for static blocks | `'use cache'` (days) + SWR fallback |
| Public page (dynamic blocks) | RSC + client-hydrated integration data | Yes for integrations | SWR with revalidation disabled |
| Editor | RSC shell + client hydration | Yes | SWR with revalidation |
| Editor (canvas) | Client-only (`dynamic(..., ssr: false)`) | Yes | SWR + optimistic updates |
| API routes | Server (Next.js route handlers) | N/A | N/A |

**RSC block rendering:**
```
[domain]/[slug]/page.tsx (server)
  → getPublicPageLayout(pageId)     ['use cache']
  → filters blocks by layout IDs
  → Grid (client)
    → ResponsiveReactGridLayout (static)
      → section × N
        → CoreBlock × N
          → renderBlock(block, pageId, false)
            → switch(block.type) → specific Block UI
              → Most blocks render as: <div>{block.data.content}</div>
              → Integration blocks: <ui-server /> fetches data server-side
```

**Dynamic blocks (social integrations)** use a two-phase render:
1. `ui-server.tsx` — RSC that calls `fetchData()` with `'use cache'` and `next: { revalidate: 60 }`
2. `ui-client.tsx` — Client component hydrating the server data, with SWR revalidation

**Editor canvas** is dynamically imported with `ssr: false` because `react-grid-layout` requires the DOM:
```typescript
// canvas.tsx
const DynamicEditWrapper = dynamic(() => import('./EditWrapper'), { ssr: false });
```

**OG Image generation** — two parallel approaches:
- `app/[domain]/[slug]/opengraph-image.tsx` — uses `satori` + `@vercel/og` (server-side, App Router convention)
- `app/api/pages/[pageSlug]/opengraph-image/route.ts` — fallback API route

**Font strategy** — self-hosted fonts (`SaansRegular.ttf`, `SaansHeavy.ttf`, `ssn.woff2`) + Google Fonts via `lib/fonts.ts` with preload links.

**SEO** — `robots.ts` generates `robots.txt` per environment, allows AI crawlers on public content, sitemap at `https://lin.ky/sitemap.xml`.

These are the patterns you'd want to replicate in your own link-in-bio project:

### Block System
- Self-contained block directories (UI + edit form + types)
- Universal `CoreBlock` wrapper for consistent styling
- `renderBlock()` switch dispatch
- Shared `EditFormProps<T>` generic interface

### Data Flow
- RSC hydration → SWR fallback → Client rendering
- Public pages: cache-first, no auth
- Editor: auth-gated, SWR revalidation

### Integration Pattern
- Platform service (API-side OAuth + crypto)
- Server UI (RSC data fetch)
- Client UI (render)
- Edit form (configure)
- Encryption: all tokens encrypted at rest

### Monorepo Structure
- Granular packages (`blocks`, `ui`, `common`, `prisma`, etc.)
- Types shared via packages
- Prisma client shared across API + frontend

### Deployment
- Next.js (frontend + marketing)
- Fastify (API)
- Prisma (PostgreSQL)
- AWS S3 (media)
- Vercel (hosting)

---

## 17. Linky vs Ohmylink — Direct Comparison

> Side-by-side comparison across 12 architecture dimensions. Ohmylink gaps marked with ⚠️.

### 17.1 Folder Structure

| Aspect | Linky | Ohmylink | Gap |
|--------|-------|----------|-----|
| Public route | `[domain]/[slug]/` — multi-tenant via middleware | `[username]/` — single tenant | ⚠️ No custom domain support |
| Server actions | `app/lib/actions/` — dedicated dir | `server/` dir | Same, naming diff |
| Server fetch | `app/lib/api-server.ts` — cookie-forwarding | Direct Prisma in RSC | ⚠️ Missing — no fetch abstraction |
| Public fetch | `app/lib/public-read.ts` — `'server-only'`, no cookies | None | ⚠️ Missing |
| UI context | `app/contexts/Edit/` — UI-only React Context | All state in Zustand | ⚠️ UI/data state mixed |
| Providers | `app/components/LinkyProviders.tsx` — SWR config | `app/providers.tsx` — TanStack Query | Different libs |
| Block types | `lib/blocks/` — 18 block type modules | `server/` + `components/control-panel/` | ⚠️ Fixed schema, not extensible |

### 17.2 State Management

| Aspect | Linky | Ohmylink |
|--------|-------|----------|
| Server state | SWR with SWRConfig, Map cache, server-hydrated fallback | TanStack Query with QueryClient, `staleTime: 60s` |
| UI state | EditModeContext (React Context) — draggingItem, editLayoutMode, currentEditingBlock | Zustand store — all state in one store including `stylePopover` |
| Hydration | Layout pre-fetches 6 data sources → seeds SWR fallback → client reads cache | RSC passes props → `initializeEditor()` → reconcile with localStorage draft |
| Provider order | SWRConfig > TourProvider > SidebarProvider > EditModeContextProvider | ThemeProvider > MotionConfig > QueryClientProvider |

### 17.3 Component Hierarchy

| Layer | Linky | Ohmylink |
|-------|-------|----------|
| Public page | `layout.tsx` (server) → LinkyProviders (client) → ShareButton + Grid → CoreBlock × N → `renderBlock()` | `page.tsx` (server) → ProfileView (client) → PreviewBackground + PreviewProfile + PreviewLinks + PreviewSocials |
| Editor | `layout.tsx` → LinkyProviders → EditModeContextProvider → EditorNavbar + EditorCanvas → EditWrapper (dynamic, ssr:false) → ReactGridLayout → CoreBlock × N | `page.tsx` (server) → EditorClient (client) → ControlPanel + Preview + EditorDock |
| Block rendering | Universal `CoreBlock` wrapper → dispatch via `renderBlock()` switch | Fixed preview components per type |
| Extensibility | 18 block types, each with `ui-client.tsx` + `ui-server.tsx` + `form.tsx` | Fixed schema — every link type render is hardcoded |

### 17.4 Data Flow

| Stage | Linky | Ohmylink |
|-------|-------|----------|
| Editor read | `getSession()` + `Promise.all([6 apiServerFetch])` → seeds SWR fallback → client reads `useSWR()` from cache → revalidates on focus | `getProfileData(userId)` via Prisma direct → passes props to EditorClient → `initializeEditor()` → localStorage reconciliation |
| Editor write | `handleAddNewBlock()` → `mutate(layout, { revalidate: false })` [optimistic] → `InternalApi.post('/blocks/add')` → `router.refresh()` | User edits → `updateDraft()` → debounce 1500ms → `saveProfile()` server action → `$transaction` → `revalidatePath()` → `markAsSaved()` |
| UX pattern | ⚡ Optimistic — UI updates before server confirms | ⏳ Pessimistic — waits for server round-trip |

### 17.5 Server/Client Boundaries

| Layer | Linky | Ohmylink |
|-------|-------|----------|
| Server fetch | `apiServerFetch()` — marked `'server-only'`, forwards cookies | Direct Prisma — no fetch abstraction |
| Public fetch | `publicApiFetch()` — marked `'server-only'`, no cookies, safe for `'use cache'` | None — RSC calls Prisma directly |
| Client fetch | `internalApiFetcher()` / `InternalApi` class — `credentials: 'include'` | TanStack Query hooks → Server Actions |
| Auth | `getSession()` in layout, session forwarded via cookie | `withAuth()` HOF in server actions |
| Cache | `'use cache'` for public, SWR for client | `'use cache'` for public, TanStack Query for client |

### 17.6 Caching

| Aspect | Linky | Ohmylink |
|--------|-------|----------|
| Public cache | `cacheLife('days')` + granular `cacheTag` (page-id, page-slug, block) | `cacheLife('minutes')` + `cacheTag` per username only |
| Granularity | `page-id-{id}`, `page-slug-{slug}-{domain}`, `block-{blockId}` | `public-profile-${username}` only |
| Client cache | SWR with server-hydrated fallback | TanStack Query with `staleTime: 60s` |
| Revalidation | `revalidateTag()` directly + `/api/revalidate` endpoint | `revalidatePath("/[username]")` |
| Editor | SWR revalidation on focus/mount + optimistic updates | Autosave debounce + server action |

### 17.7 API Layer

| Fetcher | Linky | Ohmylink |
|---------|-------|----------|
| Public reads | `publicApiFetch(path)` → Fastify API → Prisma | Direct Prisma from RSC |
| Server reads | `apiServerFetch(path)` → Fastify API (cookies forwarded) → Prisma | Direct Prisma from Server Actions |
| Client reads | `internalApiFetcher(path)` → Fastify API (`credentials: 'include'`) | TanStack Query → Server Actions |
| Client mutations | `InternalApi.post/put/delete(path)` → Fastify API | Server Actions directly |
| Auth reads | Fastify `authenticate` decorator → `betterAuth.api.getSession(cookie)` | `withAuth()` HOF — auth at server action level |

### 17.8 Hooks Organization

| Aspect | Linky | Ohmylink |
|--------|-------|----------|
| Location | Co-located with consumers (useEditModeContext in contexts/Edit/, useContentClipping in CoreBlock.tsx) | `hooks/use-autosave.ts` — dedicated hooks dir |
| Editor state | `useEditModeContext()` from React Context | `useEditorStore()` from Zustand |
| Inline hooks | All SWR hooks inline in components | TanStack Query hooks inline |
| Custom hooks | useSlugAvailability, useOutsideAlerter, useIsNearViewport — all co-located | useAutosave — only hook in dedicated dir |

### 17.9 Shared Utilities

| File | Linky | Ohmylink |
|------|-------|----------|
| Prisma client | `lib/prisma.ts` — singleton + Accelerate extension | `lib/db.ts` — singleton + PrismaPg adapter |
| Fetch | `packages/common/src/api/fetch.ts` + `internal-api.ts` | None — direct server action |
| Auth | `packages/common/src/auth/auth.ts` — shared auth client | `lib/auth.ts` + `lib/auth-client.ts` |
| Fonts | `lib/fonts.ts` — Google Font helpers | `lib/font-catalog.ts` — 30 curated fonts |
| SEO | `packages/seo/` — dedicated package | `lib/seo/json-ld.ts` |
| Types | `@trylinky/blocks` — shared block types | `lib/generated/prisma/` — generated types |
| UI | `@trylinky/ui` — Catalyst + custom | `components/ui/` — shadcn/ui |

### 17.10 Auth Flow

| Aspect | Linky | Ohmylink |
|--------|-------|----------|
| Login | Dialog widget from root domain + magic link + social OAuth | Standalone `/login` page + social OAuth only |
| Session | BetterAuth with `organizationClient()` plugin | BetterAuth with `lastLoginMethod()` plugin |
| Multi-tenant | Organizations — page belongs to org, user is member | Single user — intentional, no team feature needed |
| Auth gate | `app/e/[slug]/layout.tsx:25` — `getSession()` → redirect | `withAuth()` HOF wraps every server action |
| API auth | Fastify `authenticate` decorator — reads cookie | `getSession()` — reads from `headers()` |
| Owner check | `session.activeOrganizationId !== page.organizationId` → redirect | Not needed — single user owns profile directly |

### 17.11 Database Access

| Aspect | Linky | Ohmylink |
|--------|-------|----------|
| Prisma adapter | PrismaPg + `withAccelerate()` | PrismaPg only |
| Singleton | `globalThis.prisma` pattern | `globalThis.prisma` pattern |
| Server Components | Via API (`apiServerFetch`/`publicApiFetch`) — not Prisma | ⚠️ Direct Prisma from RSC |
| Server Actions | Direct Prisma | Direct Prisma |
| Client | SWR → API → Prisma | TanStack Query → Server Action → Prisma |
| Dev logging | Query duration in dev | None |

### 17.12 Rendering Strategy

| Aspect | Linky | Ohmylink |
|--------|-------|----------|
| Public page | RSC with `'use cache'` (days) + SWR fallback (no revalidation) | ⚠️ SSR with `force-dynamic` + `'use cache'` (minutes) |
| Dynamic blocks | `ui-server.tsx` (RSC, cached 60s) + `ui-client.tsx` (SWR hydrated) | N/A — no dynamic blocks |
| Editor | RSC shell + client hydration + SWR revalidation | `"use client"` wrapper + Zustand hydration |
| Editor canvas | `dynamic(() => import('./EditWrapper'), { ssr: false })` | No lazy loading — all components imported directly |
| JS required | No for static blocks | ⚠️ Yes — ProfileView is `"use client"` |
