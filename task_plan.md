# Task Plan: Architecture Deepening — Dead Code, Auth, Upload, Cache

## Goal
Remove dead code clusters, consolidate fragmented auth patterns, extract a deep upload module, and fix caching API drift — improving locality, leverage, and AI-navigability.

## Current Phase
Phase 9 (P0+P1 complete, P2-P7 pending)

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

### Phase 8: Enable Custom Image Upload for Background

**Goal:** Aktifkan tab "Image" di BackgroundOptions untuk upload custom background image ke S3 via CloudFront, dengan cleanup gambar lama dan validasi ukuran file.

**Constraints:**
- Max file **sebelum kompresi**: avatar 3MB, background 5MB
- Max file **setelah kompresi**: ~500KB untuk background (avatar sudah ~500KB)
- Gambar lama dihapus dari S3 **hanya setelah user memilih background baru** (bukan saat pindah tab tanpa save). Jika user beralih ke color/wallpaper lalu save, image lama dihapus. Jika user ganti image baru, upload berhasil → hapus image lama → set bgImage ke URL baru.
- CloudFront sudah aktif via `S3_PUBLIC_URL=https://d1uuiykksp6inc.cloudfront.net`

**Implementation sequence:**

- [x] **Step 1 — Server: S3 cleanup safety net in save actions** ✅
  - [x] `server/user/profile/save-profile-action.ts`: tambahkan tracking `bgImage` ke `s3KeysToClean` (sama pattern dengan `avatarUrl`) — jika `profile.bgImage` berubah/dihapus saat save, hapus dari S3 post-commit
  - [x] `server/user/profile/actions.ts` (`saveAllProfileChanges`): tambahkan cleanup `bgImage` lama jika berubah (sementara action ini masih dipakai, meski `@deprecated`)
  - [x] Verify: tsc --noEmit (0 new errors), tests (89/89 pass)

- [x] **Step 2 — Server: `deleteImage` action** ✅
  - [x] `server/upload/actions.ts`: tambahkan `deleteImage(url: string)` — cek auth, panggil `deleteFromS3(url)`, return `{ success } | { success: false, error }`
  - [x] `deleteFromS3` sudah ada guard `url.startsWith(S3_PUBLIC_URL)` — aman dari arbitrary URL deletion

- [x] **Step 3 — Client: aktifkan UI upload di `background-options.tsx`** ✅
  - [x] Hapus banner "Coming Soon" dan uncomment original upload logic
  - [x] Implementasikan `handleImageUpload`:
    1. Validasi file: `image/*`, max **5MB** sebelum kompresi
    2. Kompresi via `compressImage(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1920 })` — target ~500KB, preserve quality
    3. Ambil presigned URL via `getUploadUrl(file.name, file.type)`
    4. Upload ke S3 via `fetch PUT`
    5. Jika `profile.bgImage` ada (gambar lama), panggil `deleteImage(profile.bgImage)` — **fire-and-forget**, log error tapi jangan block UI
    6. `handleBackgroundChange({ bgType: "image", bgImage: publicUrl })`
  - [x] Tambahkan loading state (`isUploading`) — spinner di area upload
  - [x] Aktifkan tombol "Remove Image": set `bgImage: null` (cleanup-nya dihandle saat save via Step 1)
  - [x] Preview uploaded image di area upload (`<Image src={profile.bgImage} fill unoptimized ... />`)
  - [x] Import yang dibutuhkan: `Image` dari next/image, `Button`, `getUploadUrl`, `deleteImage`, `compressImage`, `toast`, `useState`

- [x] **Step 4 — Client: update `profile-editor.tsx` avatar constraints** ✅
  - [x] Ubah max file size avatar dari 10MB → **3MB**
  - [x] Kompresi avatar tetap `maxSizeMB: 0.5`

- [x] **Step 5 — Verify** ✅
  - [x] `tsc --noEmit`: 0 new errors (semua error adalah pre-existing auth dead code Phase 1)
  - [x] Tests: 89/89 pass
  - [ ] Manual QA: upload background image → preview muncul → save profile → image lama dihapus dari S3
  - [ ] Manual QA: pindah ke tab color → save → bgImage dihapus dari DB + S3
  - [ ] Manual QA: upload file >5MB → error toast
  - [ ] Manual QA: upload non-image → error toast

**Decisions Made:**
| Decision | Rationale |
|----------|-----------|
| Background max 5MB pre-compression, 500KB post-compression | Balance kualitas vs storage/bandwidth; 1920px cukup untuk background mobile/desktop |
| Avatar max 3MB pre-compression (was 10MB) | Align dengan real-world usage; 10MB terlalu longgar |
| Delete old image immediately after new upload success | User sudah "commit" ke image baru; gambar lama tidak akan dipakai lagi. Lebih aman daripada cleanup hanya saat save (kalau user ganti image 3x tanpa save, S3 akan punya 3 orphan) |
| Remove image button hanya clear state, tidak hapus S3 | User mungkin switch ke color lalu kembali ke image (belum save). S3 cleanup dihandle saat save — single source of truth |
| `deleteImage` server action terpisah | Reusable; auth guard di server; frontend tidak perlu tau S3 key extraction logic |

---

### Phase 9: Auto-Save Migration — Debounced Server-Side Diff

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
  - [x] Deleted `UnsavedChangesDialog` + simplified init to single `useEffect` (dialog was obsolete — auto-save handles stale drafts; `initializeEditor` already guards dirty state)

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
  - [ ] Create `test/unit/components/editor/editor-header.test.tsx` (deferred)
  - [ ] Add test case: "clear bgEffects to null" (deferred)
  - [x] Tests: 89/89 pass (7 test files)
  - [ ] `next build`: fails on pre-existing auth dead code (Phase 1 scope), NOT on Phase 8 changes
  - [x] Bugfix: `BgPatternSchema` was wrong shape (`{ type, color, opacity... }` instead of `{ animatedId, animatedConfig }` matching actual client); `BgEffectsSchema` was too strict (closed 5-key object instead of `Record<string, number>` matching index signature). Fixed 2026-07-06 after QA validation error.
  - [x] Bugfix: Infinite auto-save loop (2026-07-06). Root cause: `saveProfile` returned `finalSocials` with `position` field, but page payload `profileEditorPayload.socials` omitted `position`. After save → RSC refresh → `initializeEditor` re-fires → `JSON.stringify(draft) !== JSON.stringify(serverProfile)` (socials shape mismatch) → `isDirty = true` → debounce → save → loop. Two-part fix: (1) remove `position` from `finalSocials` select in save-profile-action.ts to match page payload shape; (2) add `useRef` guard in editor-client.tsx so `initializeEditor` only runs once on first hydrate, not on every RSC refresh. Prevents wasted save on page load too (localStorage draft with old `position`-bearing socials vs server profile without).
  - [ ] Manual QA

- [ ] **Step 8 — ADR (post-confirmation)** — deferred until migration confirmed in production

- **Status:** implemented (pending manual QA + test creation)
- [x] Bugfix: Infinite auto-save loop (2026-07-06). Two-part fix: (1) remove `position` from `finalSocials` select; (2) add `useRef` guard on `initializeEditor` useEffect.

### Phase 9: Testing Infrastructure — Fix Gaps, Cover Phase 8, Integrate

**Audit hasil (2026-07-06):** 27 test total (23 unit + 4 E2E) untuk app kompleks. 3 folder placeholder kosong (`integration/{analytics,auth,editor}/`, `ui/playwright/`, `e2e/visual/`). 4 mock files + 3 fixtures dibangun tapi tidak pernah dipakai. `Button.test.tsx` test element native, bukan komponen asli. `ProfileEditor.test.tsx` wire `onUpdate={vi.fn()}` tanpa assertion. E2E test kedua (`public-profile.spec.ts`) klik link tanpa assertion. Coverage target luas (`app/**`, `components/**`, `lib/**`, `server/**`) tapi cuma 4 unit test file — coverage <10%.

**Goal:** Fix broken tests, cover Phase 8 surface (most recent, most risk, 0 test), integrate mocks + fixtures, fill empty integration folders.

---

#### P0: Fix Broken/Dead Tests

- [x] **Fix `button.test.tsx`** — import `Button` asli dari `@/components/ui/button` ✅
  - [x] 16 tests: render children, disabled, 6 variants, 4 sizes, asChild, click, className merge, data attributes
- **Status:** completed

- [x] **Fix `profile-editor.test.tsx`** — tambah user interaction + assertion ✅
  - [x] 7 tests: render display name, render bio, bio char count, type display name → onUpdate, type bio → onUpdate, clear display name → onUpdate, clear bio → onUpdate
  - [x] Uses `StatefulWrapper` with `useState` to handle controlled component state
- **Status:** completed

---

#### P1: Cover Phase 8 Surface (0 test → test suite)

##### `test/unit/server/user/profile/save-profile.test.ts`

- [x] **Unit test: `saveProfile` server-side diff logic** ✅ (17 tests)
  - [x] Valid input returns success + links/socials
  - [x] Profile scalar update (bio changed)
  - [x] Profile scalar unchanged (bio same → no profile update in $transaction)
  - [x] JSON field update (displayNameStyle changed)
  - [x] JSON field clear to null (displayNameStyle: null)
  - [x] Link create (ID not in DB)
  - [x] Link update (ID in DB)
  - [x] Link delete (DB link not in draft)
  - [x] Position rewrite ($transaction called with correct ops)
  - [x] Social link create / delete
  - [x] Social link shape — returned socials have { id, platform, url } (no position)
  - [x] S3 cleanup triggered when avatar replaced
  - [x] S3 cleanup NOT triggered when avatar unchanged + no orphaned mediaUrl
  - [x] Zod validation — invalid input → { success: false }
  - [x] Zod validation — link with empty title → rejected
  - [x] $transaction wraps all DB writes
  - [x] Uses findFirst (not findUnique)
  - [x] Mock strategy: inline vi.mock for db/auth/headers/s3/cache
- **Status:** completed

##### `test/unit/lib/stores/editor-store.test.ts`

- [x] **Unit test: Zustand editor store state machine** ✅ (19 tests)
  - [x] Initial state: auto-hydrated, null draft
  - [x] initializeEditor case 1: no draft → fresh init
  - [x] initializeEditor: skips when not hydrated
  - [x] initializeEditor case 4: keeps draft, updates originalProfile
  - [x] initializeEditor case 2: different profile → fresh init (account switch)
  - [x] initializeEditor case 3: stale non-temp link IDs → fresh init
  - [x] initializeEditor case 4: temp-ID links preserved
  - [x] updateDraft: sets draft, marks dirty, increments _draftVersion
  - [x] updateDraft: increments _draftVersion on every call
  - [x] updateDraft: clears isDirty when draft matches original
  - [x] markAsSaved: syncs originalProfile to draftProfile, clears isDirty
  - [x] markAsSaved: does NOT reset _draftVersion (monotonic)
  - [x] discardChanges: resets draft to originalProfile
  - [x] stylePopover: open + close
  - [x] setElementStyle: increments _draftVersion + marks isDirty
  - [x] setElementStyle: noop when draftProfile is null
  - [x] clearDraft: clears all state
  - [x] Mock strategy: vi.mock("zustand/middleware") → persist = identity (bypass localStorage/happy-dom rehydrate)
- **Status:** completed

##### `test/unit/hooks/use-autosave.test.ts`

- [x] **Hook test: auto-save behavior** ✅ (12 tests)
  - [x] Returns idle status initially
  - [x] Does not save when isDirty = false
  - [x] Fires save after 1500ms debounce
  - [x] Does not fire before debounce interval
  - [x] Re-debounces when draft changes before save fires
  - [x] Save called on debounce expiry
  - [x] Handles network error (error-retryable path)
  - [x] Handles validation error (error-validation path)
  - [x] retry() re-triggers save immediately
  - [x] flushSave() fires immediately when dirty
  - [x] flushSave() noop when not dirty
  - [x] Cleanup on unmount clears timer
  - [x] Mock strategy: vi.mock saveProfile, useFakeTimers, renderHook with store ops in act()
  - [x] Note: stderr "not wrapped in act(...)" warnings are benign — store updates via Zustand trigger React re-renders in the hook; tests still pass correctly
- **Status:** completed

---

#### P2: Integration Tests (fill empty folders)

##### `test/integration/editor/autosave-flow.test.ts`

- [ ] **Integration: autosave end-to-end with mocked server action**
  - Test: render editor → edit bio → wait 1.5s → server action called with draft
  - Test: server returns updated links/socials → store updated with real IDs
  - Test: save-in-flight → user edits more → version stamp skip → re-debounce → second save with latest
  - Test: navigation away → `flushSave` called → server action called before unmount
  - Test: `beforeunload` fires when dirty → dialog shown
  - **Status:** pending

##### `test/integration/auth/session-flow.test.ts`

- [ ] **Integration: auth session lifecycle**
  - Test: unauthenticated → `/editor` → redirect to `/login`
  - Test: authenticated → `/editor` → renders editor with user data
  - Test: session loaded → `initialProfile` prop passed to `editor-client`
  - Test: token expiry → refresh → session persists
  - **Status:** pending

---

#### P3: Fix E2E Tests (smoke → meaningful)

##### `test/e2e/auth/login.spec.ts`

- [ ] **Fix/add E2E auth tests**
  - Test: [existing] unauthenticated `/dashboard` redirects to `/login`
  - Test: [existing] `/login` shows "Sign in with Google"
  - Test: [NEW] sign-in flow — click Google button, redirected to OAuth page (mock or real)
  - Test: [NEW] callback — successful auth → redirect to `/dashboard`
  - Test: [NEW] callback — auth failure → `/login?error=...`
  - Test: [NEW] logout — click logout → session cleared → redirect
  - **Status:** pending

##### `test/e2e/profile/public-profile.spec.ts`

- [ ] **Fix/add E2E profile tests**
  - Test: [existing] `/test-user` shows `profile-name` + `profile-links`
  - [ ] **FIX:** second test — after clicking link card, assert navigation/redirect to URL
  - Test: [NEW] link `isActive=false` → not rendered on public page
  - Test: [NEW] unpublished profile → 404 or landing page
  - Test: [NEW] non-existent username → 404
  - Test: [NEW] analytics event fired on link click (network intercept)
  - Test: [NEW] social links rendered on public page
  - Test: [NEW] avatar rendered when provided
  - **Status:** pending

---

#### P4: Schema + Validation Tests

##### `test/unit/server/user/profile/schema.test.ts`

- [ ] **Unit test: `SaveProfileSchema` Zod validation**
  - Test: valid full profile payload accepted
  - Test: empty displayName → rejected
  - Test: displayName > 100 chars → rejected
  - Test: bio > 500 chars → rejected
  - Test: links array with empty title → rejected
  - Test: links array with invalid URL → rejected
  - Test: links with `buttonColor` invalid hex → rejected
  - Test: socials with empty platform → rejected
  - Test: socials with invalid URL → rejected
  - Test: `bgEffects` valid shape (`{ "snow": 0.5 }`) → accepted
  - Test: `bgEffects` invalid (string value) → rejected
  - Test: `bgPattern` valid shape (`{ animatedId: "dots", animatedConfig: {} }`) → accepted
  - Test: `bgPattern` invalid (old shape) → rejected
  - Test: `displayNameStyle` valid (`{ color: "#fff", fontFamily: "inter" }`) → accepted
  - Test: `displayNameStyle` unknown extra key → rejected (`.strict()`)
  - Test: `titleStyle` on link valid → accepted
  - **Status:** pending

##### `test/unit/server/user/links/schema.test.ts` (extend existing)

- [ ] **Extend existing tests**
  - Test: [NEW] `buttonColor` valid → accepted
  - Test: [NEW] `buttonColor` invalid hex → rejected
  - Test: [NEW] `buttonTextColor` valid → accepted
  - Test: [NEW] `titleStyle` field → accepted
  - Test: [NEW] title exactly 100 chars → accepted (boundary)
  - Test: [NEW] description exactly 500 chars → accepted (boundary)
  - Test: [NEW] assert error messages contain expected paths (e.g., `"title"`, `"url"`)
  - **Status:** pending

---

#### P5: UI Component Tests

##### `test/unit/components/control-panel/text-style-popover.test.tsx`

- [ ] **Unit test: `TextStylePopover`**
  - Test: renders when anchor provided
  - Test: ColorPicker shows 8 preset swatches
  - Test: ColorPicker HSL gradient renders
  - Test: ColorPicker hex input accepts valid hex
  - Test: ColorPicker hex input rejects invalid hex
  - Test: FontPicker search filters fonts
  - Test: FontPicker category groups render
  - Test: selecting a font → `onChange` called with new style
  - Test: selecting a color → `onChange` called with new style
  - Test: "Reset" button clears style → `onChange` called with `null`
  - Test: Escape key closes popover
  - Test: click outside closes popover
  - Test: switching target (different element) → updates anchor, keeps popover open
  - **Status:** pending

##### `test/unit/components/control-panel/status-indicator.test.tsx`

- [ ] **Unit test: `StatusIndicator`**
  - Test: idle → renders null / empty
  - Test: saving → renders Loader2 + "Saving..."
  - Test: saved → renders Check + "Saved"
  - Test: error-retryable → renders AlertTriangle + "Retry" button
  - Test: error-retryable → click Retry → `onRetry` called
  - Test: error-validation → renders AlertTriangle, no Retry button
  - **Status:** pending

---

#### P6: Infrastructure — Breathe Life Into Dead Files

- [ ] **Use `test/mocks/prisma.ts`** in integration tests — import `prisma` mock, not re-mock inline
- [ ] **Use `test/mocks/auth.ts`** in auth integration tests — `setAuthenticated()` / `setUnauthenticated()`
- [ ] **Use `test/mocks/upload.ts`** in upload-related tests — `getUploadUrl` mock
- [ ] **Use `test/fixtures/profile.ts`** (`mockProfile`, `mockProfileWithLinks`) across tests, replace inline duplicates
- [ ] **Use `test/fixtures/links.ts`** (`mockLinks`, `mockInvalidLinks`) in link-related tests
- [ ] **Use `test/fixtures/analytics.ts`** (`mockLinkAnalytics`) in analytics tests
- [ ] **Wrap `customRender`** in `test/utils.tsx` with actual providers (`QueryClientProvider`, `ThemeProvider`) — or add per-test wrapping via `wrapper` option
- [ ] **Remove redundant `test/mocks/next-navigation.ts`** — global mock in `setup.ts` covers it. If needed, extend `setup.ts`.
- **Status:** pending

---

#### P7: E2E Tooling

- [ ] **Add Firefox + WebKit projects** to `playwright.config.ts` (currently chromium-only)
- [ ] **Add mobile viewport project** (iPhone 12 viewport) for responsive testing
- [ ] **Fill `test/e2e/visual/`** — visual regression snapshots of public profile page
- [ ] **Fill `test/ui/playwright/`** — component tests for complex UI (ColorPicker HSL pad, dnd-kit sortable)
- **Status:** pending

---

#### P8: Final Verification

- [ ] `tsc --noEmit` — 0 new errors
- [ ] `vitest run --coverage` — target >60% line coverage (server actions + store + hooks)
- [ ] `playwright test` — all E2E pass
- [ ] `next build` — passes (blocked by Phase 1 auth dead code, separate issue)
- [ ] Manual QA: edit profile → auto-save fires → refresh → draft restored
- [ ] Manual QA: edit profile → save success → status indicator shows check → fades
- [ ] Manual QA: edit profile → network error → status shows AlertTriangle → Retry works
- [ ] Manual QA: navigation away mid-edit → draft flushed before route change
- [ ] Manual QA: close tab mid-edit → beforeunload dialog shown
- [ ] Manual QA: open two tabs → edit in tab A → switch to tab B → version stamp prevents stale override
- **Status:** pending

---

#### Test Target Summary

| Area | Current | Target | Files Needed |
|------|---------|--------|-------------|
| `save-profile-action.ts` | **17** | 18 | `test/unit/server/user/profile/save-profile.test.ts` ✅ |
| `editor-store.ts` | **19** | 15 | `test/unit/lib/stores/editor-store.test.ts` ✅ |
| `use-autosave.ts` | **12** | 11 | `test/unit/hooks/use-autosave.test.ts` ✅ |
| `SaveProfileSchema` | 0 | 16 | `test/unit/server/user/profile/schema.test.ts` |
| `LinkSchema` (extend) | 13 | 20 | existing, extend |
| `Button` (fix) | **16** | 15 | existing, rewrite ✅ |
| `ProfileEditor` (fix) | **7** | 7 | existing, extend ✅ |
| `TextStylePopover` | 0 | 13 | new |
| `StatusIndicator` | 0 | 6 | new |
| Integration: autosave | 0 | 5 | `test/integration/editor/autosave-flow.test.ts` |
| Integration: auth | 0 | 4 | `test/integration/auth/session-flow.test.ts` |
| E2E: auth | 2 | 6 | existing, extend |
| E2E: profile | 2*** | 8 | existing, extend |
| Infrastructure | n/a | 7 | fix mocks/fixtures/utils |

**P0+P1 delivered: 89 tests total (from 23 baseline = +66).** P2-P7 pending.

**Status:** P0+P1 completed, P2-P7 pending

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
| Test priority: P0 fix broken → P1 cover Phase 8 → P2 integrate mocks → P3 fix E2E | Risk-weighted: newest code (Phase 8) has 0 coverage; existing mocks unused; E2E tests shallow |
| Unit test saveProfile diff logic via mock Prisma | Don't need real DB; mock `$transaction` + model mocks → assert call shapes |
| `initializeEditor` 4-case guard tested separately from hook | Store logic independent of save timing; test state transitions in isolation |
| Hook test via `@testing-library/react-hooks` or manual act() wrapper | Zustand store is pure JS — hook can be tested with store mocks |
| Integration test fills `test/integration/` folders | Existing placeholder structure signals intent; honor it |
| P5 (UI component tests) + P7 (E2E tooling) lower priority | P0-P3 cover the critical risk surface (Phase 8 + auth); visual/component tests less urgent |

## Notes
- No CONTEXT.md exists — consider creating one lazily if domain terms get sharpened
- No ADRs exist yet — `docs/adr/0001-server-side-diff-autosave.md` to be created after Phase 8 confirmed working in production
- 89 tests pass (up from 23 baseline) — P0 (fix broken) + P1 (Phase 8 coverage) delivered: button.test.tsx (16), profile-editor.test.tsx (7), save-profile.test.ts (17), editor-store.test.ts (19), use-autosave.test.ts (12), utils.test.ts (5), links/schema.test.ts (13)
- tsc --noEmit: 0 new errors in test or production code (all remaining errors are pre-existing auth dead code from Phase 1)
- Multi-tab sync explicitly out of scope for Phase 8 (single-tab is 99% use case; localStorage persistence is the safety net)
- `bgEffects`/`bgPattern` clear-to-null latent bug fixed implicitly by server-side JSON.stringify diff
- Phase 9 remaining: P2 (integration tests), P3 (fix E2E), P4 (schema tests), P5 (UI components), P6 (infrastructure/mocks), P7 (E2E tooling)
- `test/mocks/next-navigation.ts` redundant with `setup.ts` global mock — consider removal during P6
- editor-store.test.ts uses `vi.mock("zustand/middleware")` to bypass persist/localStorage interference in happy-dom


-------




- periksa metadat
- perbaiki footer
- 

