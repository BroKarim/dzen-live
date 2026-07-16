# Dzenn (OneURL) — Architecture Document

> A "link-in-bio" platform — like Linktree but with deep customization, per-element text styling, rich analytics, and a "nonchalant" aesthetic.

---

## 1. Project Overview

| Property | Value |
|---|---|
| **Name** | `oneurl` (branded **Dzenn**) |
| **Domain** | [dzenn.live](https://dzenn.live) |
| **Type** | Full-stack SaaS (link-in-bio platform) |
| **Language** | TypeScript (strict mode) |
| **Framework** | Next.js 16.2.10 (App Router) |
| **React** | 19.2.3 with React Compiler |
| **Package Manager** | pnpm 10.28.0 (single workspace) |
| **Node** | v22 (prod via Docker), v20 (dev via `.nvmrc`) |
| **Database** | PostgreSQL (Supabase) via Prisma ORM |
| **Auth** | Better Auth with Google/GitHub/Discord OAuth |
| **Output** | `standalone` (self-hosted Next.js, not serverless) |
| **Deployment** | Docker multi-stage build on `node:22-alpine` |

---

## 2. Technology Stack

### Core
- **Next.js 16** — App Router, React Compiler, `use cache` experimental
- **React 19** — Server Components, Server Actions
- **TypeScript** — strict mode, `@/*` alias to root

### UI & Styling
- **Tailwind CSS v4** — `@tailwindcss/postcss` plugin
- **shadcn/ui** — New York style, zinc base, CSS variables, lucide icons
- **Framer Motion** — animations via `MotionConfig`
- **Radix UI** — 15+ headless primitives (dialog, popover, dropdown, tabs, etc.)

### State Management
- **Zustand** — client-side editor state with `localStorage` persistence
- **TanStack Query** — server state (stale time 60s, retry 1)
- **next-themes** — dark/light mode (default: dark)

### Database
- **Prisma ORM v7** — PostgreSQL with `PrismaPg` adapter + `pg` Pool
- **PrismaPg** — connection pooling via Supabase pooler (PgBouncer)
- **Migrations** — 9 migrations (Dec 2025 – Jan 2026)

### Authentication
- **Better Auth v1.6.23** — Full-featured auth library
- **Providers** — Google, GitHub, Discord OAuth
- **Plugins** — `lastLoginMethod` (remembers last used provider)

### Infrastructure
- **AWS S3** — image storage (avatars, backgrounds)
- **Amazon CloudFront** — CDN for S3 images
- **Supabase** — PostgreSQL hosting
- **Docker** — multi-stage build, standalone Next.js output

### Testing
- **Vitest** — unit tests (happy-dom, React Testing Library)
- **Playwright** — E2E tests (Chromium only)

---

## 3. Directory Structure

```
/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Route group: landing pages
│   │   ├── page.tsx              # Marketing homepage
│   │   ├── info/page.tsx         # "Why Dzenn" page
│   │   └── layout.tsx            # Marketing layout
│   ├── [username]/               # Dynamic: public profile pages
│   │   ├── page.tsx              # Public profile (SSR + generateMetadata)
│   │   ├── layout.tsx            # Client layout (adds no-scrollbar)
│   │   ├── profile-view.tsx      # Client component: renders profile
│   │   ├── profile-header-buttons.tsx
│   │   ├── not-found.tsx         # 404 for unknown profiles
│   │   └── tracking.ts           # sendTrackingBeacon()
│   ├── admin/                    # Admin dashboard (role-gated)
│   │   ├── layout.tsx            # ADMIN role check + Shell wrapper
│   │   ├── page.tsx              # Dashboard overview
│   │   ├── users/page.tsx        # User management
│   │   ├── profiles/page.tsx     # Profile management
│   │   └── assets/page.tsx       # Asset management
│   ├── api/                      # API routes
│   │   ├── auth/[...all]/route.ts  # Better Auth handler
│   │   ├── auth/session/route.ts   # Session fetch
│   │   ├── track/route.ts          # Click tracking endpoint
│   │   ├── og/route.tsx            # Dynamic OG image generation
│   │   └── health/route.ts         # Health check
│   ├── auth/callback/page.tsx    # OAuth callback handler
│   ├── editor/                   # Profile editor
│   │   ├── page.tsx              # Redirects to /editor/[username]
│   │   ├── [username]/page.tsx   # Editor for specific username
│   │   └── _components.tsx/      # Editor component modules
│   │       ├── editor-client.tsx    # Main orchestrator
│   │       ├── editor-header.tsx    # Top bar with save status
│   │       ├── editor-preview.tsx   # Live preview pane
│   │       ├── control-panel.tsx    # Tabbed settings panel
│   │       └── editor-dock.tsx      # View mode toggle
│   ├── login/page.tsx            # Sign-in page
│   ├── new/page.tsx              # Username setup (first-time)
│   ├── layout.tsx                # Root layout (fonts, JSON-LD, Providers)
│   ├── providers.tsx             # Client providers wrapper
│   └── globals.css               # Tailwind v4 base styles
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui primitives (40+ components)
│   ├── preview/                  # Public profile preview
│   │   ├── preview-background.tsx
│   │   ├── preview-profile.tsx
│   │   ├── preview-links.tsx
│   │   ├── preview-socials.tsx
│   │   ├── view-mode-toggle.tsx
│   │   └── index.ts
│   ├── control-panel/            # Editor control panel
│   │   ├── profile-editor.tsx
│   │   ├── social-editor.tsx
│   │   ├── link-card-editor.tsx
│   │   ├── link-edit-dialog.tsx
│   │   ├── profile-layout-selector.tsx
│   │   ├── background-options.tsx
│   │   ├── background-effect.tsx
│   │   ├── texture-selector.tsx
│   │   ├── tab-navigation.tsx
│   │   └── tabs/                 # Tab content components
│   │       ├── profile-tab.tsx
│   │       ├── design-tab.tsx
│   │       ├── analytics-tab.tsx
│   │       └── settings-tab.tsx
│   ├── control-panel/animated-background/  # 7 animated BG patterns
│   ├── editor/                   # Editor-specific components
│   │   ├── color-picker.tsx
│   │   ├── font-picker.tsx
│   │   ├── text-style-popover.tsx
│   │   └── reset-styles-indicator.tsx
│   ├── admin/                    # Admin dashboard components
│   │   ├── shell.tsx, app-sidebar.tsx
│   │   ├── stats-card.tsx, overview-chart.tsx
│   │   ├── user-table.tsx, profile-table.tsx, asset-table.tsx
│   │   └── pagination.tsx, bulk-action-bar.tsx
│   ├── marketing/                # Landing page sections
│   └── shared/                   # DomainView, ShareDialog, etc.
│
├── lib/                          # Core library code
│   ├── db.ts                    # Prisma client singleton (PrismaPg adapter)
│   ├── auth.ts                  # Better Auth configuration
│   ├── auth-client.ts           # Better Auth browser client
│   ├── s3.ts                    # S3 client, upload/delete/presigned URL
│   ├── stores/editor-store.ts   # Zustand store with localStorage persist
│   ├── editor-draft.ts          # Draft normalization & versioning
│   ├── text-style.ts            # Per-element text styling system
│   ├── font-catalog.ts          # Available font families
│   ├── animated-backgrounds.ts  # BG preset configurations
│   ├── background-colors.ts     # Color palette definitions
│   ├── sosmed.ts                # Social media platform config
│   ├── media.ts                 # Image compression utility
│   ├── utils.ts                 # Shared utility functions (cn, etc.)
│   ├── toast.ts                 # Sonner toast helpers
│   └── seo/json-ld.ts           # Structured data builders
│
├── server/                       # Server-side business logic
│   ├── user/
│   │   ├── auth.ts              # getSession() + withAuth() HOF
│   │   ├── profile/
│   │   │   ├── save-profile-action.ts  # Main save server action
│   │   │   ├── schema.ts              # Zod validation schemas
│   │   │   ├── queries.ts             # Profile DB queries (use cache)
│   │   │   └── payloads.ts            # Prisma select payloads
│   │   ├── analytics/
│   │   │   ├── actions.ts       # Server actions (wrapped withAuth)
│   │   │   ├── queries.ts       # Aggregation queries
│   │   │   ├── schema.ts        # Zod validation
│   │   │   ├── payloads.ts      # Type definitions
│   │   │   └── index.ts
│   │   ├── links/schema.ts      # Link/Social Zod schemas
│   │   └── settings/actions.ts  # Settings actions (onboarding, publish, etc.)
│   ├── website/profile/          # Public-facing queries
│   │   ├── queries.ts           # getPublicProfile (use cache)
│   │   ├── payloads.ts          # Prisma select payloads
│   │   └── index.ts
│   ├── upload/actions.ts        # Image upload server actions
│   ├── admin/
│   │   ├── actions.ts           # Admin mutations (delete users, etc.)
│   │   └── queries.ts           # Admin aggregation queries
│   └── infrastructure/tracking/
│       └── service.ts           # Click tracking with bot detection, rate limiting
│
├── hooks/
│   └── use-autosave.ts          # Debounced autosave hook
│
├── prisma/
│   ├── schema.prisma            # Database schema (10 models, 4 enums)
│   └── migrations/              # 9 migration files
│
├── test/
│   ├── unit/                    # Vitest unit tests
│   ├── e2e/                     # Playwright E2E tests
│   ├── fixtures/                # Test fixtures
│   └── setup.ts                 # Test setup
│
├── public/                      # Static assets
├── todo/                        # Planning docs
├── Dockerfile                   # Multi-stage docker build
├── docker-entrypoint.sh         # Startup script (prisma db push)
├── next.config.ts               # Next.js configuration
├── tsconfig.json                # TypeScript configuration
├── vitest.config.mts            # Vitest configuration
├── playwright.config.ts         # Playwright configuration
├── eslint.config.mjs            # ESLint configuration
├── components.json              # shadcn/ui configuration
└── prisma.config.ts             # Prisma CLI configuration
```

---

## 4. Architecture Layers

The application follows a layered architecture within the Next.js App Router paradigm:

```
┌─────────────────────────────────────────────────────────┐
│                   CLIENT LAYER                          │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Zustand    │  │ TanStack     │  │  next-themes  │  │
│  │  (editor    │  │ Query        │  │  (dark mode)  │  │
│  │   state)    │  │ (server      │  │               │  │
│  │             │  │  state)      │  │               │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │           React Components                        │   │
│  │  (shadcn/ui + custom + Framer Motion)             │   │
│  └──────────────────────────────────────────────────┘   │
│                          │                               │
│                 Server Actions / API calls               │
├──────────────────────────┼──────────────────────────────┤
│               SERVER LAYER (RSC + Server Actions)       │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │  Auth       │  │  Server      │  │  API Routes    │ │
│  │  (Better    │  │  Actions     │  │  (/api/*)      │ │
│  │   Auth)     │  │  "use server"│  │                │ │
│  └─────────────┘  └──────────────┘  └────────────────┘ │
│                          │                              │
│            ┌─────────────┴──────────────┐               │
│            │    Business Logic          │               │
│            │  (server/user/*)           │               │
│            └─────────────┬──────────────┘               │
│                          │                              │
│            ┌─────────────┴──────────────┐               │
│            │    Prisma ORM              │               │
│            │    (lib/db.ts)             │               │
│            └─────────────┬──────────────┘               │
├──────────────────────────┼──────────────────────────────┤
│              INFRASTRUCTURE LAYER                       │
│                                                         │
│  ┌──────────┐  ┌───────────┐  ┌───────────────────┐    │
│  │ Supabase │  │ AWS S3   │  │ CloudFront        │    │
│  │(Postgres)│  │ (images) │  │ (CDN)             │    │
│  └──────────┘  └───────────┘  └───────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### 4.1 Client Layer
- **Server Components** handle initial data fetching (SSR)
- **Client Components** handle interactivity (editor, preview, admin tables)
- **Zustand** manages ephemeral editor state + draft persistence to `localStorage`
- **TanStack Query** manages server data fetching with caching
- **Framer Motion** provides animation primitives

### 4.2 Server Layer
- **Server Actions** (`"use server"` functions in `app/` and `server/`) are the primary mutation mechanism
- **API Routes** are limited to: auth (Better Auth), tracking, OG images, health checks
- **Route Handlers** (`generateMetadata`) provide dynamic SEO per profile
- **`use cache`** (`cacheTag` + `cacheLife`) provides granular cache control for public queries

### 4.3 Data Layer
- **Prisma ORM** with `PrismaPg` adapter + `pg` Pool for connection pooling
- **Prisma Client** generated to `lib/generated/prisma/`
- **Singleton pattern** (`globalThis.prisma`) prevents hot-reload connection leaks

---

## 5. Data Model

```
User ──1:N──> Profile ──1:N──> Link ──1:N──> LinkClick
  │              │
  │              └──1:N──> SocialLink
  │              │
  │              └──1:N──> Asset
  │
  └──1:N──> Session
  │
  └──1:N──> Account
```

### Entity Details

**User** — Core identity from OAuth. Has `role` (USER|ADMIN) and `isOnboarded` flag.

**Profile** — The link-in-bio page. Stores:
- **Metadata**: username (unique), displayName, bio, avatarUrl
- **Layout**: layout type (center, left_stack, left_row), padding
- **Background**: type (color, wallpaper, image), color value, wallpaper/image URL
- **Styling**: cardTexture, blurAmount, bgEffects (JSON), bgPattern (JSON)
- **Text Styles**: displayNameStyle (JSON), bioStyle (JSON) — per-element font/color
- **Publishing**: isPublished boolean

**Link** — Individual link in the bio page. Has:
- title, url, position, isActive
- buttonColor, buttonTextColor (per-link styling)
- titleStyle (JSON) — per-link font/color

**SocialLink** — Social media links. platform (x, instagram, github, etc.), url, position.

**Asset** — Tracks S3 uploads (avatars, background images). Supports soft-delete via `isActive`.

**LinkClick** — Analytics event. Stores referrer, country, device, browser, OS, UTM parameters, session fingerprint, idempotency key, bot flag.

**BackgroundPreset** — Curated background wallpapers.

**Session / Account / Verification** — Better Auth managed tables.

### Enums

| Enum | Values |
|---|---|
| `Role` | USER, ADMIN |
| `BackgroundType` | color, wallpaper, image |
| `ProfileLayout` | center, left_stack, left_row |
| `CardTexture` | base, glassy, brutalist, dots, grid, waves, noise |

---

## 6. Authentication Flow

```
User → /login
         │
         ├── Already authenticated?
         │     ├── Yes, onboarded → redirect /editor/[username]
         │     ├── Yes, not onboarded → redirect /new
         │     └── No → show sign-in page
         │
         ├── Picks OAuth provider (Google / GitHub / Discord)
         │     └── OAuth redirect → /api/auth/[...all] → /auth/callback
         │
         ├── /auth/callback (Server Component)
         │     └── ensureUserHasProfile()
         │           ├── Creates User in DB (if new)
         │           ├── Creates empty Profile in DB (if new)
         │           └── Redirects /editor/[username] or /new
         │
         └── /new (first-time)
               └── User picks username → checkUsernameAvailability()
                     └── setupUsername() → marks isOnboarded=true
                           └── Redirects /editor/[username]
```

### Auth Architecture

```
Better Auth
├── Config: lib/auth.ts
│   ├── Database: Prisma adapter (postgresql)
│   ├── Secret + Cookies (secure in production, sameSite=lax)
│   ├── Social providers: Google, GitHub, Discord
│   └── Plugin: lastLoginMethod()
│
├── Server helpers: server/user/auth.ts
│   ├── getSession() — throws if not authenticated
│   └── withAuth(module, fn) — HOF wrapping server actions
│
├── API Route: app/api/auth/[...all]/route.ts
│   └── Better Auth handler (handles ALL auth endpoints)
│
└── Auth client: lib/auth-client.ts
    └── createAuthClient() for browser-side auth operations
```

**Key design decisions:**
- No email/password — social-only (reduces security surface)
- `withAuth()` HOF wraps every server action — consistent error handling
- Role field is stored as `additionalFields` in Better Auth's User model
- No Next.js middleware — auth is checked at the route/server-action level

---

## 7. Editor Architecture

The editor is the most complex client-side subsystem:

```
/editor/[username]
│
├── Server Component (page.tsx)
│   └── Fetches profile data, passes to EditorClient
│
└── EditorClient (client component)
    │
    ├── Zustand Store (useEditorStore)
    │   ├── originalProfile — server snapshot (for dirty comparison)
    │   ├── draftProfile — current working state (persisted to localStorage)
    │   ├── isDirty — computed from JSON.stringify comparison
    │   ├── initializeEditor() — reconciliation logic (4 cases)
    │   └── markAsSaved() — syncs original = draft when save succeeds
    │
    ├── useAutosave Hook
    │   ├── 1500ms debounce after last edit
    │   ├── Calls saveProfile() server action
    │   ├── Status lifecycle: idle → saving → saved → (fade 2s) → idle
    │   ├── Error states: error-retryable, error-validation
    │   └── flushSave() — immediate save on route change
    │
    ├── Control Panel (left panel)
    │   ├── ProfileTab — displayName, bio, avatar upload
    │   ├── DesignTab — backgrounds, layout, textures, text styles
    │   ├── AnalyticsTab — link click stats & charts
    │   └── SettingsTab — username, publish/unpublish, delete
    │
    ├── Preview Pane (center)
    │   ├── Mobile/Desktop view modes
    │   ├── PreviewBackground — real-time rendering
    │   ├── PreviewProfile — with live text style application
    │   ├── PreviewLinks — with drag-to-reorder (dnd-kit)
    │   └── PreviewSocials — social icons in dock
    │
    └── EditorHeader (top)
        ├── Logo, domain display
        ├── Publish/Unpublish button
        ├── Save status indicator
        └── View site link
```

### Draft Reconciliation (initializeEditor)

On mount, the editor reconciles three sources of truth:

1. **Server profile** (fresh from DB via RSC) — always the source of truth for `originalProfile`
2. **localStorage draft** (from previous session) — may be stale or belong to different profile
3. **Current editor state** — computed via comparison

Four reconciliation cases:

| Condition | Action |
|---|---|
| No localStorage draft | Initialize fresh from server |
| Draft belongs to different profile (`draft.id !== server.id`) | Discard draft, init fresh |
| Draft has stale link IDs (links deleted by another session) | Discard draft, init fresh |
| Draft is valid | Keep draft, compute `isDirty` vs server |

### Autosave Flow

```
User edits → updateDraft() → isDirty=true → useAutosave debounce 1500ms
  → performSave()
    → normalizeEditorDraft() — strips obsolete fields
    → saveProfile(data) — "use server" action
      → Zod validation
      → Username uniqueness check
      → Prisma $transaction (profile + links + socials + assets)
      → Post-commit S3 cleanup (async)
      → revalidatePath()
      → Return refreshed links + socials
    → markAsSaved() — originalProfile = draftProfile, isDirty=false
    → Status: "saved" → fades after 2s
```

---

## 8. Data Flows

### 8.1 Public Profile Request

```
GET /[username]
  │
  ├── Server Component: generateMetadata()
  │   └── getPublicProfile(username) — "use cache" (cacheTag + cacheLife)
  │       └── Prisma: findUnique with publicProfilePayload
  │             ├── profile fields
  │             ├── links (sorted by position)
  │             └── socials (sorted by position)
  │
  └── Renders ProfileView (client component)
        ├── loadStyleFonts() — dynamically injects Google Fonts for per-element text styles
        ├── PreviewBackground — renders background with animated overlays + filters
        ├── PreviewProfile — avatar, displayName, bio with inline styles
        ├── PreviewSocials — social icons
        └── PreviewLinks — clickable link cards
              └── Each link click → sendTrackingBeacon(linkId)
```

### 8.2 Click Tracking Flow

```
User clicks link → sendTrackingBeacon(linkId)
  │
  └── POST /api/track (navigator.sendBeacon)
        │
        ├── DNT check (respects Do Not Track header)
        ├── Link exists + active check
        │
        └── trackingService.trackClickWithRetry()
              │
              ├── 1. Generate session fingerprint (SHA-256 of IP + UA + headers)
              ├── 2. Generate idempotency key (SHA-256 of linkId + fingerprint + timestamp + clientId)
              ├── 3. Dedup check (idempotency key unique)
              ├── 4. Rate limit check (10 clicks/minute/session)
              ├── 5. Bot detection (40+ bot UA patterns)
              ├── 6. Device/Browser/OS detection (regex-based)
              ├── 7. UTM parameter parsing
              ├── 8. Referrer domain extraction + classification
              └── 9. INSERT LinkClick record
```

### 8.3 Save Profile Flow

```
Control Panel edits → useAutosave → saveProfile(data)
  │
  ├── withAuth() — ensures authenticated
  ├── SaveProfileSchema.safeParse(data) — Zod validation
  ├── Username uniqueness check
  │
  ├── Prisma $transaction:
  │   ├── Profile scalars update (username, displayName, bio, bg*, etc.)
  │   ├── JSON fields (displayNameStyle, bioStyle, bgEffects, bgPattern)
  │   ├── Links: upsert (create new, update existing, delete removed)
  │   ├── Socials: upsert (create new, update existing, delete removed)
  │   └── Assets: deactivate old, create new for changed avatar/bgImage
  │
  ├── Async S3 cleanup (old files deleted non-blocking)
  ├── revalidatePath() — bust cache for public profile
  └── Return refreshed links + socials with real IDs
```

### 8.4 Image Upload Flow

```
User picks image → compressImage() (browser-image-compression)
  │
  └── uploadImage server action
        │
        ├── getPresignedUploadUrl() — S3 presigned POST URL (60s expiry)
        ├── Client uploads directly to S3 (avoids server intermediary)
        └── Returns public URL → stored on profile
```

---

## 9. Caching Strategy

| Layer | Mechanism | Used For |
|---|---|---|
| **React** | `use cache` / `cacheTag` / `cacheLife` | Public profile queries, published profile counts |
| **Next.js** | `static` / `force-dynamic` | Metadata generation uses `force-dynamic` for dynamic OG |
| **TanStack Query** | `staleTime: 60s`, `refetchOnWindowFocus` | Client-side data fetching |
| **Zustand** | `localStorage` persistence (versioned) | Editor draft recovery across sessions |
| **CDN** | CloudFront | S3 image delivery |

---

## 10. Server Action Design Pattern

All mutations follow a consistent pattern:

```typescript
// server/user/auth.ts
export function withAuth<TArgs extends any[], TReturn>(
  module: string,
  fn: (user: User, ...args: TArgs) => Promise<TReturn>,
): (...args: TArgs) => Promise<TReturn | { success: false; error: string }> {
  return async (...args: TArgs) => {
    try {
      const user = await getSession(); // throws if unauthorized
      return await fn(user, ...args);
    } catch (error: any) {
      console.error(`[${module}] ${error.message}`);
      return { success: false, error: error.message || "An error occurred" };
    }
  };
}
```

Every server action:
1. Wraps with `withAuth("module/name", handler)` — consistent auth + error handling
2. Validates input with Zod schemas (defined in `schema.ts` files)
3. Uses Prisma `$transaction` for multi-table writes
4. Returns `{ success: true, data }` or `{ success: false, error }`
5. Calls `revalidatePath()` / `cacheTag()` invalidation after writes

---

## 11. Security & Privacy

- **No email/password auth** — social-only login reduces credential exposure
- **Server Actions are authenticated** — every mutation goes through `withAuth()`
- **Do Not Track respected** — `POST /api/track` checks DNT header
- **Bot filtering** — 40+ bot user-agent patterns excluded from analytics
- **Rate limiting** — 10 clicks/minute/session for tracking
- **Idempotency keys** — prevents duplicate click tracking
- **Admin routes** — role-gated at layout level, checks ADMIN role server-side
- **S3 presigned URLs** — uploads go directly to S3, server never buffers files
- **Transaction isolation** — all DB writes use Prisma `$transaction`
- **Allowlisted writes** — `toLinkWrite()` / `toSocialWrite()` functions prevent Prisma injection

---

## 12. External Integrations

| Service | Purpose | Integration |
|---|---|---|
| **Supabase** | PostgreSQL hosting | `DATABASE_URL` / `DIRECT_URL` via Prisma |
| **AWS S3** | Image storage | `@aws-sdk/client-s3`: PutObject, DeleteObject, presigned URLs |
| **CloudFront** | CDN | `S3_PUBLIC_URL` CloudFront distribution |
| **Google OAuth** | Social login | Better Auth Google provider |
| **GitHub OAuth** | Social login | Better Auth GitHub provider |
| **Discord OAuth** | Social login | Better Auth Discord provider |
| **Discord Webhook** | Admin notifications | Webhook URL for alerts |
| **Google Fonts** | Dynamic font loading | Runtime injection via `<link>` for per-element text styles |
| **Next.js OG** | OG image generation | `@vercel/og` via `next/og` — per-profile card images |

---

## 13. Admin Dashboard

Role-gated at layout level (`app/admin/layout.tsx`):

```
Admin routes:
├── /admin          → Stats overview + growth chart (recharts)
├── /admin/users    → User table: search, role filter, actions (ban, delete)
│                    └── UserAnalyticsSheet — side panel with click analytics
├── /admin/profiles → Profile listing
└── /admin/assets   → Asset overview

Admin Server Actions (server/admin/):
├── deleteUser, deleteProfile, bulkDeleteUsers
├── updateUserRole
└── deleteAsset
```

---

## 14. Testing

### Unit Tests (Vitest)
- **Environment**: `happy-dom`
- **Pattern**: `**/*.test.{ts,tsx}`
- **Coverage**: v8 provider, includes `app/`, `components/`, `lib/`, `server/`
- **Test files cover**: Zod schemas, server actions, editor store, hooks, components, utilities, JSON-LD

### E2E Tests (Playwright)
- **Browser**: Chromium only
- **Base URL**: `localhost:3000`
- **Test directory**: `test/e2e/`
- **Features**: Screenshots on failure, retries in CI

### Test Structure
```
test/
├── unit/
│   ├── components/     # Component tests (React Testing Library)
│   ├── hooks/          # Hook tests
│   ├── lib/            # Utility/store tests
│   └── server/         # Server action/schema tests
├── e2e/
│   ├── auth/           # Login flow
│   └── profile/        # Public profile display
├── fixtures/           # Test data factories
└── setup.ts            # Vitest setup
```

---

## 15. Deployment

### Docker Build (Multi-stage)

```
Stage 1: deps
  └── pnpm install --frozen-lockfile + prisma copy

Stage 2: builder
  ├── COPY from deps
  ├── Build args: NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_BETTER_AUTH_URL
  ├── Dummy env vars for build-time Prisma generation
  └── next build (standalone output)

Stage 3: runner
  ├── node:22-alpine
  ├── nextjs user (non-root)
  ├── COPY standalone output + prisma + node_modules (minimal)
  ├── docker-entrypoint.sh → prisma db push → node server.js
  └── PORT=3000, HOSTNAME=0.0.0.0
```

### Startup Script (`docker-entrypoint.sh`)
```
prisma db push --accept-data-loss  # sync schema (migrations are not run in prod)
node server.js                      # start Next.js standalone server
```

**Note:** Uses `prisma db push` (not `prisma migrate`) — schema is applied directly, migrations are for development only.

---

## 16. Key Architectural Decisions

| Decision | Rationale |
|---|---|
| **No API routes for UI mutations** | Server Actions provide tighter coupling, colocated logic, built-in error handling |
| **Zustand over React Context for editor state** | Better performance (no re-render tree), built-in persistence middleware |
| **PrismaPg adapter** | Enables connection pooling through Supabase PgBouncer (required for serverless-style pooling) |
| **use cache for public queries** | Reduces DB load for frequently accessed public profiles |
| **SendBeacon for tracking** | Fire-and-forget, survives page navigation, no response expected |
| **Per-element text styles stored as JSON** | Flexible schema evolution without migrations for new style properties |
| **S3 presigned URLs** | Avoids server-side file buffering, reduces memory pressure |
| **Normalize on read** | `normalizeEditorDraft()` strips obsolete fields — enables forward-compatible schema evolution |
| **Social-only auth** | Reduces security surface, simpler user management |
| **`$transaction` for saves** | Ensures consistency across profile/links/socials/assets writes |
| **No `src/` directory** | Next.js App Router convention — root-level `app/` is simpler |

---

## 17. Environment Variables

```
# App
NEXT_PUBLIC_APP_URL          # Public-facing URL (e.g., https://dzenn.live)

# Database
DATABASE_URL                 # Supabase pooled connection (PgBouncer, port 6543)
DIRECT_URL                   # Supabase direct connection (port 5432, for migrations)

# Auth
BETTER_AUTH_SECRET           # Auth secret
BETTER_AUTH_URL              # Auth base URL
GOOGLE_CLIENT_ID             # Google OAuth
GOOGLE_CLIENT_SECRET
GITHUB_CLIENT_ID             # GitHub OAuth
GITHUB_CLIENT_SECRET
DISCORD_CLIENT_ID            # Discord OAuth
DISCORD_CLIENT_SECRET

# S3
S3_PUBLIC_URL                # CloudFront distribution URL
S3_BUCKET                    # S3 bucket name
S3_REGION                    # AWS region
S3_ENDPOINT                  # Custom endpoint (optional)
S3_ACCESS_KEY                # AWS access key
S3_SECRET_ACCESS_KEY         # AWS secret key

# Notifications
DISCORD_WEBHOOK              # Discord notification webhook URL
```

---

---

## 18. LINK ARCHITECTURE DETAIL

This section zooms into the **link-in-bio rendering pipeline** — the core feature: how a public profile page is fetched, rendered, styled, and how link clicks are tracked.

---

### 18.1 Folder Structure (Link System)

```
app/[username]/                   # Public profile route (SSR)
├── page.tsx                      # Server Component: generateMetadata + fetch + render
├── layout.tsx                    # Client layout: adds no-scrollbar CSS class
├── not-found.tsx                 # 404 when profile not found / unpublished
├── profile-view.tsx              # Client Component: orchestrates preview sub-components
├── profile-header-buttons.tsx    # Share button + copy link
└── tracking.ts                   # sendTrackingBeacon() utility

components/preview/               # Reusable preview components
├── index.ts                      # Re-exports
├── preview-background.tsx        # Background renderer (color/wallpaper/image + effects)
├── preview-profile.tsx           # Avatar + displayName + bio with inline text styles
├── preview-links.tsx             # Link cards with texture, click handlers
├── preview-socials.tsx           # Social media icon dock
└── view-mode-toggle.tsx          # Mobile/Desktop toggle (editor only)

server/website/profile/           # Server-side public profile queries
├── index.ts                      # Re-exports
├── queries.ts                    # getPublicProfile() with "use cache"
└── payloads.ts                   # publicProfilePayload Prisma select

server/infrastructure/tracking/  # Click tracking infrastructure
└── service.ts                    # Bot detection, rate limiting, UTM parsing

app/api/                          # API routes
├── track/route.ts                # POST /api/track — click tracking endpoint
├── og/route.tsx                  # GET /api/og — dynamic OG image generation
└── health/route.ts               # GET /api/health

lib/
├── text-style.ts                 # Style resolution, font loading, style application
├── font-catalog.ts               # Available font families + class names
└── seo/json-ld.ts                # JSON-LD structured data builders
```

**Server/Client boundary for `[username]`:**

| File | Runtime | Why |
|---|---|---|
| `page.tsx` | **Server** | Data fetching, SEO metadata, no interactivity |
| `layout.tsx` | **Client** | Adds `no-scrollbar` class to `<body>` (needs DOM access) |
| `profile-view.tsx` | **Client** | Font injection, click handler binding |
| `tracking.ts` | **Client** | Uses `navigator.sendBeacon` (browser API) |

---

### 18.2 Rendering Strategy

The public profile page uses **Server-Side Rendering (SSR)** with dynamic metadata generation:

```
Request: GET /[username]
│
├── 1. page.tsx (Server Component)
│     │
│     ├── generateMetadata()
│     │   └── getPublicProfile(username)
│     │         ├── "use cache" — cacheTag(`public-profile-${username}`)
│     │         ├── cacheLife("minutes")
│     │         └── db.profile.findUnique() with publicProfilePayload
│     │
│     ├── Profile is null → notFound()
│     ├── Profile exists but !isPublished → notFound()
│     │
│     ├── Renders JSON-LD <script> tag (ProfilePage schema)
│     │
│     └── Renders <ProfileView user={profile} />
│
└── 2. ProfileView (Client Component)
      │
      ├── useEffect → loadStyleFonts(profile)
      │     ├── Reads displayNameStyle, bioStyle, link[].titleStyle
      │     ├── Injects <link> tags for unique Google Fonts
      │     └── Returns cleanup() to remove injected links
      │
      ├── <PreviewBackground profile={profile} />
      │     ├── Renders bgColor / bgWallpaper / bgImage
      │     ├── Applies blurAmount + bgEffects (brightness, contrast, etc.)
      │     ├── Renders animated bgPattern (grid/dots/hexagon/ripple)
      │     └── Renders noise overlay texture
      │
      ├── <PreviewProfile profile={profile} mode="public" />
      │     ├── Avatar (rounded, 96px default)
      │     ├── displayName with displayNameStyle (fontFamily + color)
      │     ├── bio with bioStyle (fontFamily + color)
      │     └── Layout variants: center / left_stack / left_row
      │
      ├── <PreviewSocials profile={profile} />
      │     ├── Maps socials to platform-specific icons (X, IG, GH, etc.)
      │     └── Renders in a dock (absolute bottom overlay)
      │
      └── <PreviewLinks profile={profile} mode="public">
            ├── Maps sorted links to cards with TexturedCard
            │     ├── cardTexture variant (base/glassy/brutalist/etc.)
            │     ├── Custom buttonColor / buttonTextColor per link
            │     └── titleStyle applied to link text
            ├── Each card gets onBeforeNavigate handler
            │     └── onClick → sendTrackingBeacon(link.id)
            └── Renders link preview images / OG data (if available)
```

**Key technical details from `app/[username]/page.tsx`:**

```typescript
// File: app/[username]/page.tsx
export const dynamic = "force-dynamic";  // Always SSR, never static

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublicProfile(username);
  // ... builds dynamic OG image URL: /api/og?username=...
  // Sets OG image to dynamically generated card
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const profile = await getPublicProfile(username);
  if (!profile || !profile.isPublished) notFound();
  // Renders JSON-LD + ProfileView
}
```

**`force-dynamic`** is critical here — without it, Next.js could statically cache the page at build time, showing stale profile data for all users.

---

### 18.3 Database Access & Payload

**Public profile query** (`server/website/profile/queries.ts`):

```typescript
export async function getPublicProfile(username: string) {
  "use cache";
  cacheTag(`public-profile-${username}`);
  cacheLife("minutes");

  return await db.profile.findUnique({
    where: { username },
    select: publicProfilePayload,
  });
}
```

**`publicProfilePayload`** (`server/website/profile/payloads.ts`):

```typescript
export const publicProfilePayload = {
  id: true,
  username: true,
  displayName: true,
  bio: true,
  avatarUrl: true,
  layout: true,
  displayNameStyle: true,
  bioStyle: true,
  bgType: true,
  bgColor: true,
  bgWallpaper: true,
  bgImage: true,
  blurAmount: true,
  padding: true,
  cardTexture: true,
  bgEffects: true,
  bgPattern: true,
  isPublished: true,
  user: { select: { name: true, image: true } },
  links: { orderBy: { position: "asc" }, select: {
    id: true, title: true, url: true, position: true,
    isActive: true, buttonColor: true, buttonTextColor: true,
    titleStyle: true,
  }},
  socials: { orderBy: { position: "asc" }, select: {
    id: true, platform: true, url: true,
  }},
} as const;
```

**`use cache` behavior:**
- `cacheTag("public-profile-${username}")` — enables targeted invalidation. When `saveProfile()` runs, it calls `revalidatePath("/[username]")`, which busts this tag for the specific username.
- `cacheLife("minutes")` — sets TTL to minutes (configurable). After expiry, the profile is re-fetched from the DB on next request.
- The `"use cache"` directive means this function's result is cached by React/Next.js cache layer, not by the browser.

---

### 18.4 Data Flow: DB → Screen

```
PostgreSQL (link_click, link, profile tables)
  │
  ├── Public profile request
  │     └── Prisma: db.profile.findUnique({ where: { username }, select: publicProfilePayload })
  │           ├── Joins profile + user + links (sorted) + socials (sorted)
  │           └── Returns typed ProfilePublicData
  │
  ├── RSC renders HTML + passes props to Client Components
  │     ├── <ProfileView user={profile}>  ← serialized as JSON prop
  │     └── Server-safe serialization (no functions, no dates as objects)
  │
  ├── Client hydration (ProfileView)
  │     ├── useEffect: loadStyleFonts() reads displayNameStyle/bioStyle/link[].titleStyle
  │     │     └── Injects Google Fonts <link> tags dynamically (deduplicated by font ID)
  │     ├── PreviewBackground: reads bgType/bgColor/bgWallpaper/bgImage/bgEffects/bgPattern
  │     │     └── Renders CSS background + animated SVG canvas + CSS filters
  │     ├── PreviewProfile: reads displayName/bio/layout/displayNameStyle/bioStyle
  │     │     └── resolveStyle() converts JSON style → React.CSSProperties
  │     ├── PreviewSocials: reads socials array
  │     │     └── Maps platform strings to icon components
  │     └── PreviewLinks: reads links array
  │           └── Each link card → onBeforeNavigate → sendTrackingBeacon()
  │
  └── Link click → POST /api/track
        └── trackingService.trackClickWithRetry()
              ├── Bot detection (40+ patterns)
              ├── Rate limiting (10/min/session)
              ├── Device/OS/Browser detection (regex)
              ├── UTM parsing
              ├── Referrer classification
              └── INSERT link_click record
```

---

### 18.5 Tracking Architecture

**Client side** (`app/[username]/tracking.ts`):

```typescript
export function sendTrackingBeacon(linkId: string) {
  const payload = JSON.stringify({ linkId });
  navigator.sendBeacon("/api/track", payload);
}
```

Uses `navigator.sendBeacon` — fires a POST request that survives page navigation. The browser guarantees delivery even if the user navigates away immediately.

**API Route** (`app/api/track/route.ts`):

```typescript
export async function POST(req: Request) {
  // 1. Parse { linkId, clientId } from body
  // 2. Verify link exists + isActive
  // 3. Check DNT header (Do Not Track)
  // 4. Extract headers: referer, user-agent, x-forwarded-for, cf-ipcountry
  // 5. trackingService.trackClickWithRetry(data, maxRetries=3)
  // 6. Return { success, tracked, reason, idempotencyKey }
}
```

**Tracking Service** (`server/infrastructure/tracking/service.ts`):

| Step | Function | What it does |
|---|---|---|
| 1 | `generateSessionFingerprint()` | SHA-256(ip + ua + accept-language + accept-encoding) → 16-char hex |
| 2 | `generateIdempotencyKey()` | SHA-256(linkId + fingerprint + timestamp + clientId) → 32-char hex |
| 3 | `findUnique({ idempotencyKey })` | Dedup — reject if exact key already exists |
| 4 | `findFirst(... DUPLICATE_WINDOW_MS 24h)` | Dedup — reject if same link+fingerprint in last 24h |
| 5 | `count(... RATE_LIMIT_WINDOW_MS 60s)` | Rate limit — max 10 clicks/min per session |
| 6 | `isBot(userAgent)` | Check against 40+ known bot patterns |
| 7 | `detectDevice/OS/Browser(ua)` | Regex-based detection |
| 8 | `parseUTMParameters(url)` | Extract utm_source/medium/campaign/term/content |
| 9 | `extractReferrerDomain(referrer)` | Classify referrer into known platforms (twitter, reddit, etc.) |
| 10 | `insert link_click` | Store with all enrichment + bot flag |

**Retry strategy:** Up to 3 attempts with exponential backoff (1s, 2s, 3s). Only retries on `database_error` — non-retryable reasons (duplicate, rate_limited, bot) return immediately.

---

### 18.6 Component Hierarchy (Public Profile)

```
<ProfileView>       (app/[username]/profile-view.tsx — "use client")
│
├── <ProfileHeaderButtons>
│     └── Share button, copy link, user info
│
├── <PreviewBackground>
│     ├── bgColor CSS + bgWallpaper/bgImage <img>
│     ├── blurAmount CSS filter
│     ├── bgEffects (brightness, contrast, saturate, noise)
│     ├── bgPattern (animated canvas: retro-grid, dot-pattern, flickering-grid, etc.)
│     └── GlassEffect wrapper for glassy texture
│
├── <PreviewProfile>        (components/preview/preview-profile.tsx)
│     ├── <Avatar> image (rounded-full, 96px)
│     ├── <span> displayName with inline style from resolveStyle(displayNameStyle)
│     ├── <p> bio with inline style from resolveStyle(bioStyle)
│     └── CSS layout class: center | left_stack | left_row
│
├── <PreviewSocials>        (components/preview/preview-socials.tsx)
│     └── <div> dock container (fixed bottom)
│           └── socials.map → <a> with platform-specific icon
│                 (X/Twitter, Instagram, GitHub, YouTube, TikTok, etc.)
│
└── <PreviewLinks>          (components/preview/preview-links.tsx)
      └── links.map → <TexturedCard> (components/texture-card.tsx)
            ├── Card texture: base | glassy | brutalist | dots | grid | waves | noise
            ├── buttonColor / buttonTextColor (per-link)
            ├── titleStyle applied to link title text
            ├── onClick → sendTrackingBeacon(link.id) + window.open(link.url)
            └── link preview (OG image if available)
```

**Editor variant** (app/editor/_components.tsx/editor-preview.tsx) reuses the same components:

```
<Preview> (editor)
├── <PreviewBackground>
├── <PreviewProfile>  (mode="editor")
│     └── Text clicks → openStylePopover() for inline style editing
├── <PreviewSocials>
├── <PreviewLinks>    (mode="editor")
│     └── Each link is wrapped in dnd-kit SortableItem
│           └── Drag handle, edit button, delete button
└── <ViewModeToggle>  (mobile/desktop frame)
```

---

### 18.7 Style System

**`lib/text-style.ts`** handles the per-element text styling:

| Function | Purpose |
|---|---|
| `resolveStyle(style)` | Converts `{ color, fontFamily }` JSON → `React.CSSProperties` with CSS var fallback |
| `isStyleEmpty(style)` | Returns true if no color or fontFamily set |
| `normalizeStyle(style)` | Strips empty values, returns null if both empty |
| `styleTargetId(target)` | Generates `data-style-target` attribute for DOM querying: `"profile.displayName"` or `"link.{id}.title"` |
| `applyStyleToProfile(profile, target, style)` | Pure function: returns new profile object with updated style (immutable) |
| `getStyleFromProfile(profile, target)` | Extracts style for given target from profile JSON |
| `loadStyleFonts(profile)` | Injects Google Fonts `<link>` tags for all unique font families used in the profile. Returns cleanup function. |

**Font catalog** (`lib/font-catalog.ts`):

```typescript
export const FONT_CATALOG: FontEntry[] = [
  { name: "Inter", family: "Inter", category: "sans-serif" },
  { name: "Playfair Display", family: "Playfair Display", category: "serif" },
  { name: "JetBrains Mono", family: "JetBrains Mono", category: "mono" },
  // ... ~30 curated fonts
];

export const FONT_CATALOG_CLASSNAMES = FONT_CATALOG.map(
  (f) => `.font-${f.family.toLowerCase().replace(/\s+/g, "-")} { font-family: "${f.family}", ... }`
).join(" ");
```

Fonts are pre-loaded as CSS class names in the root layout, so switching fonts in the editor doesn't trigger a re-layout — the font is already available. `loadStyleFonts()` only injects fonts for the **specific families used** in a profile's text styles (to avoid loading all 30 fonts).

---

### 18.8 Caching Breakdown (Link System)

| Cache Layer | What | TTL / Invalidation |
|---|---|---|
| **`use cache`** | `getPublicProfile(username)` result | `cacheLife("minutes")` + busted by `revalidatePath("/[username]")` from `saveProfile()` |
| **`force-dynamic`** | Entire profile page | Never static — always SSR |
| **Browser cache** | `sendBeacon("POST /api/track")` | Not cacheable (POST) |
| **CDN (CloudFront)** | S3 images (avatars, backgrounds) | Default CDN caching |
| **OG image** | `GET /api/og?username=...` | Dynamic per request |

**Cache invalidation chain:**

```
saveProfile() → revalidatePath("/[username]")
  → Busts cacheTag("public-profile-${username}")
  → Next request to /[username] re-fetches from DB
```

---

### 18.9 Server/Client Boundary (Per Component)

| Component | File | Boundary | Why |
|---|---|---|---|
| `PublicProfilePage` | `app/[username]/page.tsx` | **Server** | Data fetching, SEO metadata, notFound check |
| `ProfileView` | `app/[username]/profile-view.tsx` | **Client** | `useEffect` for font loading, event handlers for clicks |
| `PreviewBackground` | `components/preview/preview-background.tsx` | **Client** | Canvas animations, CSS filters require DOM |
| `PreviewProfile` | `components/preview/preview-profile.tsx` | **Client** | Inline style application, avatar rendering |
| `PreviewLinks` | `components/preview/preview-links.tsx` | **Client** | Click handlers, sendBeacon calls |
| `PreviewSocials` | `components/preview/preview-socials.tsx` | **Client** | Icon rendering |
| `sendTrackingBeacon` | `app/[username]/tracking.ts` | **Client** | `navigator.sendBeacon` browser API |
| `trackingService` | `server/infrastructure/tracking/service.ts` | **Server** | Database access, crypto (SHA-256) |
| `POST /api/track` | `app/api/track/route.ts` | **Server** | Headers parsing, DB queries |

---

### 18.10 API Layer (Link System)

| Route | Method | File | Purpose | Auth |
|---|---|---|---|---|
| `/api/track` | POST | `app/api/track/route.ts` | Record link click | None (public) |
| `/api/og` | GET | `app/api/og/route.tsx` | Dynamic OG image | None (public) |
| `/api/health` | GET | `app/api/health/route.ts` | Health check | None |

**The UI intentionally has NO API routes** — all authenticated mutations use Server Actions instead.

---

### 18.11 Shared Utilities (Link System)

| File | Exports | Used By |
|---|---|---|
| `lib/text-style.ts` | `resolveStyle`, `normalizeStyle`, `loadStyleFonts`, `applyStyleToProfile`, `getStyleFromProfile`, `StyleTarget`, `TextStyle` | Preview components, editor, OG image |
| `lib/font-catalog.ts` | `FONT_CATALOG`, `FONT_CATALOG_CLASSNAMES`, font helpers | Root layout, font-picker component |
| `lib/utils.ts` | `cn()` (tailwind-merge + clsx) | All components |
| `server/website/profile/payloads.ts` | `publicProfilePayload` (Prisma select) | `getPublicProfile()` query |
| `server/website/profile/queries.ts` | `getPublicProfile`, `getPublishedProfiles`, `getPublishedProfileCount` | Profile page, admin dashboard |
| `app/[username]/tracking.ts` | `sendTrackingBeacon()` | `PreviewLinks` click handler |
| `lib/seo/json-ld.ts` | `buildProfilePageSchema`, `buildWebSiteSchema`, `buildOrganizationSchema`, `serializeJsonLd` | Root layout, profile page |

---

### 18.12 Auth Flow (Link Context)

The public profile page has **no authentication** — anyone can view `/[username]` and click links.

Auth only applies to:
- **Editor** (`/editor/[username]`) — checked via `withAuth()` in save server action
- **Admin** (`/admin/*`) — role-gated at layout level
- **Login** (`/login`) — redirects if already authenticated
- **API routes** — only tracking is public; other routes use Better Auth's session check

The public profile explicitly checks `isPublished` and returns 404 if the profile is not published, protecting unpublished drafts from public access.

---

### 18.13 Analytics Data Model

```
LinkClick table (link_click)
├── linkId → FK to Link
├── referrer              # Classified domain (twitter, reddit, google, direct)
├── country               # From cf-ipcountry or x-vercel-ip-country
├── device                # mobile / tablet / desktop
├── browser               # chrome / firefox / safari / edge / ...
├── operatingSystem       # windows / macos / android / ios / linux
├── utmSource             # UTM campaign tracking
├── utmMedium
├── utmCampaign
├── utmTerm
├── utmContent
├── ipAddress             # Stored for rate limiting (not exposed in UI)
├── userAgent             # Stored for device detection
├── sessionFingerprint    # SHA-256 hash for session dedup
├── idempotencyKey        # Unique constraint for dedup
├── isBot                 # Bot-detection flag (filtered in analytics queries)
└── clickedAt             # Timestamp, indexed
```

**Analytics queries** (`server/user/analytics/queries.ts`) use two strategies:

1. **Prisma `groupBy`** for breakdowns: country, device, browser, OS, referrer, UTM — all aggregated by PostgreSQL
2. **Raw SQL (`$queryRawUnsafe`)** for time series: `DATE_TRUNC('day', "clickedAt")` groups clicks per day, entirely DB-side, zero Node.js memory cost

Session metrics (bounce rate, avg session duration) are computed in Node from a bounded set (max 10,000 distinct sessions) because they require cross-row calculation.

**Bot filtering:** By default, `isBot=true` records are excluded. The `includeBots` parameter allows admins to see all traffic.

---

### 18.14 Link Lifecycle Summary

```
CREATION                    VIEWING                       TRACKING
┌──────────┐               ┌──────────┐                  ┌──────────┐
│ Editor   │               │ Browser  │                  │ Browser  │
│ Server   │               │ requests │                  │          │
│ Action   │               │ /[name]  │                  │ Click    │
│ creates  │               └────┬─────┘                  │ link     │
│ Link row │                    │                        └────┬─────┘
│ in DB    │                    ▼                             │
└──────────┘          ┌──────────────────┐                   │
                      │  Server Component │                  │
                      │  getPublicProfile │                  │
                      │  "use cache"      │                  │
                      └────────┬─────────┘                   │
                               │                             │
                               ▼                             ▼
                      ┌──────────────────┐          ┌──────────────────┐
                      │ ProfileView      │          │ sendBeacon       │
                      │ (Client)         │          │ POST /api/track  │
                      │ loadStyleFonts() │          └────────┬─────────┘
                      │ Render links     │                   │
                      └────────┬─────────┘                   ▼
                               │                    ┌──────────────────┐
                               ▼                    │ trackingService  │
                      ┌──────────────────┐          │ Bot detection    │
                      │ User clicks link │          │ Rate limiting    │
                      │ sendBeacon()     ├─────────>│ Dedup            │
                      │ window.open(url) │          │ INSERT LinkClick │
                      └──────────────────┘          └──────────────────┘

ANALYTICS                    ADMIN
┌──────────┐               ┌──────────┐
│ Editor   │               │ Admin    │
│ Analytics│               │ Dashboard│
│ Tab      │               │          │
└────┬─────┘               └────┬─────┘
     │                          │
     ▼                          ▼
┌──────────────────────────────────────┐
│ getLinkStats / getProfileStats       │
│ Prisma groupBy + $queryRawUnsafe     │
│ (DB-aggregated, zero RAM overhead)  │
└──────────────────────────────────────┘

| Term | Definition |
|---|---|
## 19. Glossary

| Term | Definition |
|---|---|
| **Dzenn** | Brand name of the platform |
| **Profile** | A user's link-in-bio page |
| **Link** | Individual clickable item on a profile |
| **SocialLink** | Social media link (displayed as icon) |
| **Card** | Visual card component wrapping each link |
| **Texture** | Visual effect applied to link cards (glassy, brutalist, etc.) |
| **BG Effects** | Background visual filters (blur, brightness, noise, etc.) |
| **BG Pattern** | Animated background patterns (grid, dots, hexagon, etc.) |
| **Draft** | Unsaved editor state, persisted to localStorage |
| **Style Target** | Per-element text style (displayName, bio, or link title) |
| **Session Fingerprint** | SHA-256 hash of IP + UA + headers for tracking dedup |
| **Idempotency Key** | SHA-256 key preventing duplicate click tracking |
