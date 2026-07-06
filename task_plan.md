# Task Plan: Architecture Deepening — Dead Code, Auth, Upload, Cache

## Goal
Remove dead code clusters, consolidate fragmented auth patterns, extract a deep upload module, and fix caching API drift — improving locality, leverage, and AI-navigability.

## Current Phase
Phase 1

## Phases

### Phase 1: Dead Code Removal
- [ ] Delete `lib/editor/` (types.ts, initial-state.ts, README.md)
- [ ] Delete `hooks/use-editor-state.ts`
- [ ] Delete `lib/hooks/use-profile.ts`
- [ ] Delete `server/user/profile/schema.ts` (unused Zod schema)
- [ ] Delete `server/admin/` (empty directory)
- [ ] Run tests to verify nothing breaks
- **Status:** in_progress

### Phase 1.5: Bug Fixes (Discovered 2026-06-29)
- [x] Google OAuth login P2022 error — kolom `role` hilang di DB, fix: `prisma db push` ✅
- [ ] Wallpaper seed data — tabel `background_presets` kosong di local, perlu seed script atau admin API
- **Status:** partially resolved

### Phase 2: Auth Pattern Consolidation
- [ ] Move `withAuth()` HOF from `server/user/links/actions.ts` to `server/user/auth.ts`
- [ ] Refactor `server/user/profile/actions.ts` to use shared `withAuth()`
- [ ] Refactor `server/user/analytics/actions.ts` to use shared `withAuth()`
- [ ] Refactor `server/user/settings/actions.ts` to use shared `withAuth()`
- [ ] Run tests
- **Status:** pending

### Phase 3: Upload Module Extraction
- [ ] Create `lib/upload.ts` — deep upload module with `uploadFile(file, options)` interface
- [ ] Refactor `link-card-editor.tsx` to use `uploadFile()` for both logo and media uploads
- [ ] Run tests
- **Status:** pending

### Phase 4: Cache API & Proxy Cleanup
- [ ] Migrate `server/user/profile/queries.ts` from unstable_cache to stable cache API
- [ ] Update `proxy.ts` matcher to guard actual routes or remove proxy
- [ ] Run tests
- **Status:** pending

### Phase 5: Verification
- [x] Run full test suite
- [x] TypeScript type check
- [x] Lint check
- [x] Build check
- **Status:** completed

### Phase 6: UX Simplification — Link Model Fields
- [x] Remove `icon`, `mediaType`, `paymentProvider`, `paymentAccountId` from `prisma/schema.prisma` + delete `MediaType`/`PaymentProvider` enums
- [x] Clean `server/user/links/schema.ts` — remove 4 fields from Zod
- [x] Clean `server/user/links/actions.ts` — remove icon S3 cleanup
- [x] Clean `server/user/profile/payloads.ts` — remove 4 fields from selects
- [x] Clean `server/website/profile/payloads.ts` — remove 4 fields from public payload
- [x] Simplify `link-card-editor.tsx` — remove icon upload, mediaType, payment handlers
- [x] Simplify `link-edit-dialog.tsx` — same removals
- [x] Simplify `preview-links.tsx` — remove icon, mediaType, isStripeEnabled props
- [x] Simplify `texture-card.tsx` — remove icon, videoUrl, isStripeEnabled props + Stripe badge
- [x] `prisma db push` + `prisma generate`
- [x] Verify: tsc --noEmit, tests (23/23), build
- **Status:** completed

### Phase 7: Theme Removal + Per-Element Text Style — complete
- [x] **Theme removal**: delete `lib/themes.ts`, `theme-selector.tsx`; remove `Profile.theme` field, `updateTheme` action, all `getThemeById` references
- [x] **Tab rename**: "Theme" → "Design", content = BackgroundOptions + BackgroundPattern + BackgroundEffect + CardTextureSelector + ResetStylesIndicator
- [x] **Schema**: add 3 JSON columns — `Profile.displayNameStyle`, `Profile.bioStyle`, `Link.titleStyle`
- [x] **Zod**: `TextStyleSchema` (color, fontFamily, .strict()) + `TextStyleInputSchema` (transform empty `{}` → null)
- [x] **Payloads**: add 3 fields to editor + public payloads (both `server/user/profile/payloads.ts` and `server/website/profile/payloads.ts`)
- [x] **Server actions**: `saveAllProfileChanges` handles `displayNameStyle`/`bioStyle` + per-link `titleStyle` updates; `null` → `Prisma.JsonNull`; `createLink`/`updateLink` handle `titleStyle`
- [x] **Font catalog**: `lib/font-catalog.ts` with 12 fonts via `next/font/google`; `lib/fonts.ts` now re-exports from catalog; mounted in `app/layout.tsx` body className
- [x] **lib/text-style.ts**: `resolveStyle`, `isStyleEmpty`, `normalizeStyle`, `applyStyleToProfile`, `getStyleFromProfile`, `styleTargetId`, `parseStyleTarget`, `loadStyleFonts`
- [x] **Editor store**: add `stylePopover: PopoverAnchor | null`, `openStylePopover`, `closeStylePopover`, `setElementStyle` actions
- [x] **Preview components**: `PreviewProfile`, `PreviewLinks`, `TexturedCard` accept `mode` prop, render `data-style-target` + `onStyleTargetClick` + hover dashed outline
- [x] **Click conflict**: in `mode="editor"`, click on `data-style-target` opens popover (stops propagation); wrapper click noop; `mode="public"` retains expand/navigate behavior
- [x] **ColorPicker**: 8 preset swatches + HSL gradient (2D pad + hue slider) + hex input; live update via `onChange`; reset button when value defined
- [x] **FontPicker**: search input with category-grouped list, each option rendered in its own font; reset-to-default when value defined
- [x] **TextStylePopover**: Radix-portal'd popover anchored to click position, contains ColorPicker + FontPicker + reset-all; click-outside / Escape closes; switch-in-place by updating `stylePopover.target`
- [x] **Editor wiring**: `editor-client.tsx` wires `onStyleTargetClick` → finds element by `data-style-target` → opens popover; mounts `<TextStylePopover />` at root
- [x] **ResetStylesIndicator**: shows "N custom styles active · Reset all" with profile/link breakdown, or "Customize per-element styles" hint when empty
- [x] **Public page**: `app/[username]/profile-view.tsx` uses `loadStyleFonts`, passes `mode="public"` to `PreviewProfile`/`PreviewLinks` (no click handlers, no dashed outline)
- [x] **Test mock**: updated `test/unit/components/control-panel/profile-editor.test.tsx` to drop `theme`, add `displayNameStyle: null`, `bioStyle: null`
- [x] **Verify**: tsc --noEmit (0 errors), tests (23/23), build (passes), `prisma db push --accept-data-loss` (theme column dropped, 3 new JSON columns added)
- **Status:** completed

### Phase 7.5: Known caveats
- `loadStyleFonts` injects fonts via raw `<link>` to Google Fonts CDN (not via `next/font/google`) because the selected font is determined at runtime — `next/font/google` requires build-time declaration. Trade-off: small FOIT, no FOUT since `display=swap`.
- DB had 2 non-null `theme` values; these were dropped. Migration is `--accept-data-loss`. For production, write a proper migration.
- `mode="editor"` makes link cards non-clickable (no expand, no navigate). This is intentional — the editor is for editing, not previewing navigation. Public page uses `mode="public"` and gets the original behavior.
- The popover is portal'd to `document.body` to escape the preview's `overflow-hidden` + `transform` ancestors. Position is computed from `getBoundingClientRect` at click time.

### Phase 8: Auto-Save Migration — Debounced Server-Side Diff

**Architecture (decided via grilling session 2026-07-06):**
- Server-side diffing: client sends entire `draftProfile`; server loads DB state, diffs per-entity, applies in single `$transaction`. Client is "dumb" — no diff logic.
- Temp-ID contract: "ID not in DB = create". Client free to use any ID scheme. Eliminates cross-reload temp-ID collision bug (current `temp-${counter}` vs `temp-${Date.now()}` inconsistency).
- DB operations inside `$transaction`; S3 cleanup (avatar/mediaUrl replacements) post-commit via `Promise.allSettled` fire-and-forget (preserves existing non-blocking pattern).
- Version stamp counter in editor store prevents lost-update when user edits during save-in-flight. `updateDraft` increments `_draftVersion`; save hook captures version at fire time; on resolve, only `markAsSaved()` if `currentVersion === versionAtSaveStart`, else skip (debounce will re-fire with latest draft).
- Position is implicit from array order — server always rewrites `position = index` for all links/socials after diff. No separate reorder detection.
- Full Zod validation on `saveProfile` input — resurrect `server/user/profile/schema.ts` with `SaveProfileSchema` (profile scalars + `LinkSchema[]` + `SocialLinkSchema[]`). Defense in depth; current profile fields have zero server-side validation.
- Return contract: `{ success, links: Link[], socials: SocialLink[] }` — real IDs via full arrays, skip profile scalar (no server-side transform). Client `updateDraft({...draft, links, socials}) → markAsSaved()`.
- No Redis needed — debounce state in React hook, version stamp in Zustand, draft persistence via existing `localStorage` (`zustand/persist`).

**Implementation sequence:**

- [x] **Step 1 — Server: Zod schema + `saveProfile` endpoint**
  - [x] Created `server/user/profile/schema.ts` — `SaveProfileSchema` with profile scalars, `links: LinkWithIdSchema[]`, `socials: SocialLinkWithIdSchema[]`, `.passthrough()`
  - [x] Added `buttonColor`, `buttonTextColor` (optional nullable) to `LinkSchema` in `server/user/links/schema.ts`
  - [x] Created `server/user/profile/save-profile-action.ts`:
    - `withAuth("profile/save", ...)` wrapper, `z.safeParse` validation
    - Server-side diff: profile scalars (direct compare), JSON fields (JSON.stringify compare), links (position = index, ID-not-in-DB = create), socials (same pattern)
    - Single `$transaction` with all profile update + link/social CRUD + position rewrites
    - Post-commit S3 cleanup: `Promise.allSettled` with avatar + mediaUrl keys
    - Returns `{ success, links, socials }` — refreshed from DB with real IDs + positions

- [x] **Step 2 — Client: editor store version stamp**
  - [x] Added `_draftVersion: number` to editor store state (init 0)
  - [x] `updateDraft` increments on every call
  - [x] `setElementStyle` increments on every call
  - [x] `markAsSaved` does NOT reset (monotonic)
  - [x] `initializeEditor` resets to 0 on fresh init / account switch / stale-link reset

- [x] **Step 3 — Client: `hooks/use-autosave.ts`**
  - [x] Manual `useEffect` + `setTimeout` debounce (1.5s)
  - [x] Watches `isDirty` + `_draftVersion` from store
  - [x] Status: `idle | saving | saved | error-retryable | error-validation`
  - [x] Version stamp: capture `versionAtSaveStart`, skip `markAsSaved()` if version changed during save
  - [x] `saved` fades to `idle` after 2s
  - [x] `retry()` re-triggers save with current draft
  - [x] `flushSave()` — cancel timer, fire immediately if dirty
  - [x] Cleanup on unmount

- [x] **Step 4 — Client: wire `editor-client.tsx`**
  - [x] Calls `useAutosave()`, passes `status` + `retry` to `EditorHeader`
  - [x] `beforeunload` listener: warns when `isDirty || status === 'saving'`
  - [x] Flush on navigation: `usePathname` watch, calls `flushSave()` on change
  - [x] Deleted `navigation-guard.tsx` (consolidated into `editor-client.tsx`)
  - [x] Kept `UnsavedChangesDialog` (persisted-draft recovery)

- [x] **Step 5 — Client: simplify `editor-header.tsx`**
  - [x] Removed imports: `saveAllProfileChanges`, all 7 per-entity link/social actions, `toast`, `useTransition`
  - [x] Removed `handleSave` block (~175 lines) and Save button
  - [x] Added `StatusIndicator` component: idle (null), saving (Loader2 + "Saving..."), saved (Check + "Saved", fades via hook), error-retryable (AlertTriangle + "Retry"), error-validation (AlertTriangle)
  - [x] Discard button: visible when `isDirty`, calls `discardChanges()`
  - [x] New props: `saveStatus`, `onRetry`

- [x] **Step 6 — Server: deprecate old per-entity actions**
  - [x] Added `@deprecated` JSDoc to all 7 exports: `createSocialLink`, `updateSocialLink`, `deleteSocialLink`, `createLink`, `updateLink`, `deleteLink`, `reorderLinks`
  - [x] File kept as rollback path
  - [x] `saveAllProfileChanges` NOT deprecated yet

- [x] **Step 7 — Verify**
  - [x] `tsc --noEmit`: 0 new errors (all remaining errors are pre-existing auth dead code from Phase 1)
  - [ ] Create `test/unit/components/editor/editor-header.test.tsx` (deferred — see Notes)
  - [ ] Add test case: "clear bgEffects to null" (deferred)
  - [x] Tests: 23/23 pass (all 4 test files)
  - [ ] `next build`: fails on pre-existing auth dead code (Phase 1 scope), NOT on Phase 8 changes
  - [ ] Manual QA

- [ ] **Step 8 — ADR (post-confirmation)** — deferred until migration confirmed in production

- **Status:** implemented (pending manual QA + test creation)

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Remove dead code entirely | Deletion test passes — complexity already lives elsewhere |
| Consolidate auth in `server/user/auth.ts` | One seam, shared — already exists in `withAuth()`, just needs a home |
| Extract `uploadFile()` as standalone module | Two duplicate handlers already in one component = real seam |
| Migrate to stable `next/cache` API | `unstable_*` is deprecated path |
| Remove theme system entirely | No user value beyond defaults; per-element override is the new customization surface |
| Per-element text style as JSON column | 2 properties (color, fontFamily), strict Zod, easy to extend; no migration per new property |
| `null` = inherit, JSON = override | Theme switch never breaks custom styles; users opt in to override |
| Popover anchored to clicked element | Figma-like WYSIWYG; switch in place between elements |
| `next/font/google` for default catalog fonts | Production-ready font loading; preview in catalog renders each in own typography |
| Server-side diffing for auto-save | Single source of truth, eliminates partial-save bugs, client becomes dumb sender |
| "ID not in DB = create" temp-ID contract | Eliminates cross-reload collision; client free to use any ID scheme |
| DB in `$transaction`, S3 post-commit `Promise.allSettled` | Atomic data writes, non-blocking asset cleanup (preserves existing pattern) |
| Version stamp counter for save-in-flight race | Prevents lost-update when user edits during save; simple integer, no deep reconcile |
| Position implicit from array order | Always rewrite `position = index`; eliminates position drift class of bugs |
| Full Zod on `saveProfile` input | Defense in depth; profile fields had zero server-side validation before |
| Return `links[]` + `socials[]` only | No server-side transform on profile scalar; smaller payload, actionable for client |
| `hooks/use-autosave.ts` + manual debounce | No new dep, full control over edge cases (version stamp, flush, retry) |
| `beforeunload` + flush on navigation, no route block | Auto-save = user doesn't think about save; draft persisted via `localStorage` as safety net |
| Status indicator replaces Save button | `saving`/`saved (fade 2s)`/`error-retryable (Retry)`/`error-validation`; Discard stays |
| `@deprecated` JSDoc on 7 per-entity actions | Marker for future contributors; file kept as instant rollback path |
| `buttonColor`/`buttonTextColor` added to `LinkSchema` + diff | Defensive — currently in payload but missing from schema; investigate dead-vs-editable in separate phase |

## Notes
- No CONTEXT.md exists — consider creating one lazily if domain terms get sharpened
- No ADRs exist yet — `docs/adr/0001-server-side-diff-autosave.md` to be created after Phase 8 confirmed working in production
- All 24 existing tests pass — baseline preserved
- Multi-tab sync explicitly out of scope for Phase 8 (single-tab is 99% use case; `localStorage` persistence + `UnsavedChangesDialog` is the current safety net)
- `bgEffects`/`bgPattern` clear-to-null latent bug (was `!= null` in `saveAllProfileChanges`) — fixed implicitly by server-side diffing; regression test added in Phase 8 verify


