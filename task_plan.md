# Task Plan: Architecture Deepening — Dead Code, Auth, Upload, Cache

---
## Notes — Database Access (dzenn_db)

### Lokasi
- **Prod:** VPS shared — container PostgreSQL `duasatuoss-postgres21oss-5trcu6.1.hzv3w5zeykvrukz11ot0ixz7c`
- **Local:** Supabase — `aws-1-ap-northeast-2.pooler.supabase.com:6543`

### Cara akses prod (via VPS)

**Masuk ke container PostgreSQL:**
```bash
# Cari container name dulu kalo lupa
sudo docker ps

# Masuk psql — bisa pake container ID atau full name
sudo docker exec -it b4c6d60fd127 psql -U postgres -d dzenn_db
```
atau:
```bash
sudo docker exec -it duasatuoss-postgres21oss-5trcu6.1.hzv3w5zeykvrukz11ot0ixz7c psql -U postgres -d dzenn_db
```

**Lihat daftar user:**
```sql
SELECT id, name, email, role FROM "user";
```

**Promote user ke ADMIN:**
```sql
UPDATE "user" SET role = 'ADMIN' WHERE email = 'user@example.com';
```
> `user` adalah reserved word — wajib pakai `"user"` (quoted).

**Promote user via Docker one-liner (langsung, tanpa masuk psql):**
```bash
sudo docker exec -it b4c6d60fd127 psql -U postgres -d dzenn_db -c "UPDATE \"user\" SET role = 'ADMIN' WHERE email = 'user@example.com';"
```

**Verifikasi:**
```sql
SELECT email, role FROM "user" WHERE role = 'ADMIN';
```

### Catatan
- Setelah role diubah, user perlu **logout → login ulang** agar session cookie reflect role baru.
- Container ini shared VPS — ada container milik teman lain. Hati-hati, jangan sampai salah container.
- Tabel Prisma pakai `@@map` — nama tabel di DB lowercase (`user`, `profile`, `asset`, dll), kolom camelCase (`isActive`, `createdAt`, `bgType`).

---

## Goal
Remove dead code clusters, consolidate fragmented auth patterns, extract a deep upload module, and fix caching API drift — improving locality, leverage, and AI-navigability.

## Current Phase
Phase 15 (planned — admin feature enhancements)

---
## Phase 15: Admin Feature Enhancements

**Goal:** Tambah fitur admin: inline role selector, user analytics sheet, search, pagination, bulk actions.

### A — Inline Role Selector (read-only → editable)

**Trigger:** Klik Select di kolom Role pada tabel user `/admin/users`.

**UX:**
- Kolom Role diganti dari `<Badge>` → `<Select>` (shadcn)
- Dua option: `USER` / `ADMIN`
- Options hanya `USER` dan `ADMIN` — tidak perlu role lain saat ini
- **Promosi** (USER → ADMIN): langsung eksekusi tanpa konfirmasi
- **Demosi** (ADMIN → USER): muncul `AlertDialog` konfirmasi
- **Self-demote** (admin demosi diri sendiri): AlertDialog kasih warning ekstra — _"You are about to remove your own admin access. Make sure at least one other admin exists."_

**Guard — Last Admin:**
- Server check: `db.user.count({ where: { role: "ADMIN" } })`
- Jika count ≤ 1 dan user tersebut mencoba demosi diri sendiri → return `{ success: false, blocked: "last_admin" }`
- Client: toast error _"Cannot demote the last admin. Promote another user first."_

**Server action — `updateUserRole(userId, role)`:**
- `requireAdmin()` guard
- Cek last admin sebelum demosi diri sendiri
- `revalidatePath("/admin")` setelah berhasil
- Return `{ success: boolean, error?: string, blocked?: "last_admin" }`

**Files:**
- `server/admin/actions.ts` — tambah `updateUserRole`
- `components/admin/user-table.tsx` — ganti Badge jadi Select + AlertDialog

**Edge cases:**
| Scenario | Behavior |
|----------|----------|
| Non-admin call action | throw `Forbidden` (already guarded) |
| Demote last admin | `blocked: "last_admin"` |
| Set role to invalid value | Zod validate di action (defense in depth) |
| Select triggered via keyboard | Native `<Select>` support keyboard |

### B — User Analytics Sheet

**Trigger:** Klik baris user di tabel `/admin/users` → Sheet terbuka.

**UI — Sheet (shadcn, side panel):**
- **Header:** User name + email, close button (Sheet primitif)
- **Ringkasan atas:** Total profiles, total links, total clicks, onboarded/pending badge, last session
- **Chart:** `recharts` LineChart — klik per hari, 30 hari terakhir. Pakai CSS variable `--chart-1` (same pattern as `OverviewChart`)
- **Per-profile breakdown:** Tabel kecil — username, linkCount, clickCount. Clickable → navigasi ke `/admin/profiles`
- **Top lists:**
  - 5 top referrer
  - 5 top country
  - 5 top device (desktop/mobile/tablet)
  - Masing-masing dengan count bar

**Server query — `getUserClickAnalytics(userId)`:**
- Click counts per day (30 hari): `db.linkClick.findMany` joined with link → profile, group by date
- Top 5 referrer: group by `referrer`, order by count desc, limit 5
- Top 5 country: group by `country`, order by count desc, limit 5
- Top 5 device: group by `device`, order by count desc, limit 5
- Per profile summary (reuse existing `getUserDetail` data)

**Optimasi — single query:**
- `db.linkClick.findMany({ where: { link: { profile: { userId } } }, select: { clickedAt, referrer, country, device } })`
- Semua data dikumpulkan dari satu query → di-group client-side (reduce DB round trips)
- Filter `isBot: false` untuk exclude bot traffic

**Files:**
- `server/admin/queries.ts` — tambah `getUserClickAnalytics(userId)`
- `components/admin/user-analytics-sheet.tsx` **(NEW)** — Sheet component dengan chart + top lists
- `components/admin/user-table.tsx` — wire row click → open sheet

### C — Search & Filter Users

**Masalah:** `getAllUsers()` load SEMUA user tanpa filter. Saat user base tumbuh, ini akan lambat dan overload tabel.

**UX:**
- Search input di atas tabel (`<Input>` component)
- Filter: search by name OR email (case-insensitive), via `where: { OR: [{ name: { contains } }, { email: { contains } }] }`
- Filter role: Select option `All | ADMIN | USER`
- Server-side (query Prisma dengan filter), bukan client-side filter

**Files:**
- `server/admin/queries.ts` — `getAllUsers()` jadi `getAllUsers({ search?, role? })`
- `app/admin/users/page.tsx` — tambah search input + role filter (ini server component, perlu bungkus dengan wrapper client atau search params)
- `components/admin/user-table.tsx` — terima props `users` (tidak perlu ubah)

**Approach — URL search params:**
- `?q=search&role=ADMIN`
- Page reads from `searchParams` → pass ke `getAllUsers()`
- Form/input submit → `router.push` update URL → page re-render
- Debounce search 300ms via client wrapper

### D — User List Pagination

**Masalah:** Sama dengan C — `findMany` tanpa limit akan saturasi saat user base ribuan.

**Solusi:** `take` + `skip` + total count.
- Default page size: 20
- `getAllUsers()` return: `{ users: AdminUserRow[], total: number, page: number, pageSize: number }`
- Tombol "Previous" / "Next" di bawah tabel
- State via URL search params: `?page=2`

**Files:**
- `server/admin/queries.ts` — tambah pagination params
- `components/admin/pagination.tsx` **(NEW)** — shared pagination component
- `app/admin/users/page.tsx` — handle page param

### E — Bulk Actions

**Trigger:** Checkbox di kiri tiap baris + master checkbox di header.

**Action:**
- Bulk unpublish (soft delete) multiple users
- Bulk hard delete multiple users

**UX:**
- Checkbox column di tabel
- Master checkbox di header: select all / deselect all visible rows
- Action bar muncul saat ≥1 row terpilih: _"N selected — [Unpublish All] [Delete All]"_
- Confirmation dialog untuk delete (AlertDialog)
- Server action: `bulkDeleteUsers(userIds[], mode)`

**Files:**
- `server/admin/actions.ts` — tambah `bulkDeleteUsers`
- `components/admin/user-table.tsx` — tambah checkbox column + action bar

### F — Implementation Order

| Step | Item | Priority | Depends on |
|------|------|----------|------------|
| 1 | Server: `updateUserRole` action | P0 | — |
| 2 | Client: Role Select + AlertDialog | P0 | Step 1 |
| 3 | Server: `getUserClickAnalytics` query | P0 | — |
| 4 | Client: User analytics Sheet | P0 | Step 3 |
| 5 | Server: search + filter `getAllUsers` | P1 | — |
| 6 | Client: Search input + role filter | P1 | Step 5 |
| 7 | Server: pagination `getAllUsers` | P1 | — |
| 8 | Client: Pagination component | P1 | Step 7 |
| 9 | Server: `bulkDeleteUsers` action | P2 | — |
| 10 | Client: Checkbox + bulk action bar | P2 | Step 9 |
| 11 | Tests + verify | P0 | All |

**P0 (core)** = role selector + analytics sheet — deliver dulu.
**P1** = search + pagination.
**P2** = bulk actions (lowest usage).

### G — Decisions Made

| Decision | Rationale |
|----------|-----------|
| Inline Select (bukan DropdownMenu) | Future-proof untuk multi-role; satu klik ubah; UX lebih clean |
| AlertDialog hanya untuk demosi | Promosi risiko rendah, tidak perlu konfirmasi |
| Last admin guard di server | Cegah admin terkunci dari panel; defense in depth |
| Row click → Sheet (bukan Dialog) | Analytics data butuh vertical space; Sheet natural scroll; tabel user tetap visible |
| Aggregate all profiles (bukan filter per profile) | Simple; filter per profile bisa ditambah nanti (tab di Sheet) |
| Single query + client-side group | Kurangi DB round trips; data LinkClick tidak besar per user |
| URL search params untuk search/filter | Server-side rendering; halaman bisa di-bookmark; shareable URL |
| Pagination 20 per page | Cukup untuk admin readability; Prev/Next simple tanpa infinite scroll |
| Checkbox di kiri baris | Standard table pattern; expected UX untuk multiselect |
| Bulk action bar muncul hanya saat selection | Prevent accidental delete; visible affordance saat ada action |
| P0/P1/P2 priority | Core UX dulu (role + analytics), scale later (search/pagination), nice-to-have last (bulk) |

---

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
- [ ] Run tests
- **Status:** pending

### Phase 4.5: proxy.ts Accidental Middleware Bug Fix

**Background:** `proxy.ts` at project root is auto-discovered as middleware by Next.js 16 — any file named `proxy.ts` with `export function proxy()` + `export const config = { matcher }` is compiled as middleware. The matcher includes `"/login"`, so every browser speculative request to `/login` (from Chrome preload/prerender) runs through the proxy. Since these requests lack auth cookies, the proxy can't redirect and the login page renders (200). This causes confusing `GET /login 200` spam in dev logs while user is on the editor page.

**Diagnosis (2026-07-08):**
- Bukti: `.next/dev/server/middleware.js` registers `proxy.ts [middleware]` as `INNER_MIDDLEWARE_MODULE`
- Alur: browser GET /login (tanpa cookie) → proxy.ts → `session?.user = null` → `NextResponse.next()` → login page render → log `GET /login 200 (proxy.ts: 6ms, render: 35ms)`
- Bukan bug kode — proxy berfungsi sesuai rancangan. Tapi middleware tersembunyi ini menimbulkan overhead + spam log + potensi perilaku tak terduga.

**Implementation options (pick one):**

- [ ] **Opsi A (Minimal):** Hapus `/login` dan `/signup` dari matcher, hanya `["/editor/:path*"]` — berhenti intercept request ke halaman publik, tapi middleware tetap berjalan
- [ ] **Opsi B (Cleanest):** Hapus `proxy.ts` sepenuhnya, ganti auth gating dengan `app/editor/layout.tsx` layout-level — zero middleware, referensi auth di satu tempat
- [ ] **Opsi C (Intentional):** Rename `proxy.ts` → `middleware.ts`, singkronkan dengan Auth Gate dari Phase 2
- [ ] Setelah dipilih, update `proxy.ts` / `middleware.ts` matcher dan/atau hapus file
- [ ] Verifikasi: `GET /login` tidak lagi muncul saat idle di editor page
- [ ] Verifikasi: `/editor/:path*` masih terproteksi untuk unauthenticated user
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

---

### Phase 10: Bug Fixes + Dynamic OG Image

**Goal:** Fix FontPicker (font tidak berubah), wire DomainView ke editor store, tambah username uniqueness check real-time, dan generate dynamic OG image per profile.

#### Background

**FontPicker root cause:** `getFontVariable()` di `lib/font-catalog.ts:121` return `fontEntry.variable` = **class name hash** dari `next/font/google` (bukan CSS variable name seperti `"--font-outfit"`). Dipakai di `PreviewProfile` sebagai `var(hash)` → invalid CSS → browser fallback ke Geist → font tidak berubah baik di editor maupun public page.

**DomainView root cause:** `settings-tab.tsx` local state terisolasi, tidak update editor store. `editor-header.tsx:21` baca `profile.username` dari prop server, tidak dari store.

**Username check:** `checkUsernameAvailability` ada di `server/user/settings/actions.ts:30` tapi tidak dipakai client-side. SettingsTab hanya validasi saat save via `updateProfileUsername`.

**OG image:** Saat ini static `/og.png` untuk semua profile. Perlu dinamis per-user menggunakan card dari `share-dialog.tsx` dengan background sesuai `Profile.bgType`.

#### Implementation sequence

- [x] **Step 1 — FontPicker: `getFontVariable` fix**
  - [x] `lib/font-catalog.ts`: tambah field `cssVar: string` ke type `FontEntry` — CSS variable name asli (e.g., `"--font-inter"`)
  - [x] Set `cssVar` di setiap entry `FONT_CATALOG` ke string yg dipass ke `next/font/google`
  - [x] `getFontVariable()` → return `fontEntry.cssVar` (bukan `variable`)
  - [x] `FONT_CATALOG_CLASSNAMES` tetap pakai `variable` (class hash — untuk mount ke `<body>`)
  - [x] Test: unit test `getFontVariable` return CSS var name (9 tests)

- [x] **Step 2 — DomainView: wire settings-tab + editor-header**
  - [x] `settings-tab.tsx`: import `useEditorStore`, panggil `updateDraft` di `handleUsernameChange` → partial update `{ ...profile, username: sanitized }`
  - [x] `settings-tab.tsx`: tambah `checkUsernameAvailability` debounce (300ms) → inline error "Username taken" + disable save button jika taken
  - [x] `editor-header.tsx`: baca username dari `useEditorStore().draftProfile?.username ?? profile.username` (prefer draft)
  - [x] `server/user/profile/save-profile-action.ts`: **NO CHANGE** — `username` tidak termasuk `scalarFields`, aman (keputusan ini di-reverse oleh Phase 11 — username sekarang auto-save)
  - [x] Test: unit test `editor-header` read from store (3 tests); unit test `settings-tab` update store + uniqueness check (5 tests)

- [x] **Step 3 — OG Image: dynamic per-profile**
  - [x] **`components/og-image-card.tsx`** (NEW): OG card 1200×630 — avatar bulat (left), name + `@username` + bio (right), background solid color / wallpaper / custom image, font dari `displayNameStyle?.fontFamily`. Tanpa texture/effects/blur (Satori limitasi).
  - [x] **`app/api/og/route.tsx`** (NEW): GET handler `?username=xxx`, query DB via `getPublicProfile`, fetch avatar + bg image ke `Uint8Array` (Satori perlu `fetch` dulu), render `<OgCard />` via `ImageResponse` dari `next/og`, `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`
  - [x] **`app/[username]/page.tsx`** — `generateMetadata`: ganti `images: "/og.png"` → `images: "/api/og?username=${username}"`; fallback ke `/og.png` jika unpublished
  - [x] Test: unit test API route return `ImageResponse` (4 tests); unit test `og-image-card` (4 tests)

- [ ] **Step 4 — Verify**
  - [x] `tsc --noEmit`: 0 new errors
  - [x] `vitest run`: 133 tests pass (was 108, +25 new: font-catalog 9, editor-header 3, settings-tab 5, og-image-card 4, og/route 4)
  - [ ] Manual QA: FontPicker → font berubah di editor + public page
  - [ ] Manual QA: SettingsTab ubah username → DomainView update real-time
  - [ ] Manual QA: Username taken → inline error muncul, save disabled
  - [ ] Manual QA: Share public profile → OG image dinamis (debug via Facebook Sharing Debugger / Twitter Card Validator)

#### Ad-hoc Fixes (Completed)
- [x] **Social media URL validation** — `social-editor.tsx`: `normalizeUrl()` prepend `https://` jika tanpa protokol, toast error untuk URL kosong/invalid. Hapus unused imports (deprecated per-entity actions, `Loader2`). Test: `social-editor.test.tsx` (13 tests). 2026-07-08.
- [x] Verify: 108 tests pass (was 95), `tsc --noEmit` 0 errors.

#### Test Target
| Area | Current | Target | File |
|------|---------|--------|------|
| `font-catalog.ts` (`getFontVariable`) | 0 | 3 | `test/unit/lib/font-catalog.test.ts` |
| `editor-header.tsx` (store read) | 0 | 3 | extend `test/unit/components/editor/editor-header.test.tsx` |
| `settings-tab.tsx` (store write + uniqueness) | 0 | 4 | `test/unit/components/control-panel/settings-tab.test.tsx` |
| `og-image-card.tsx` | 0 | 4 | `test/unit/components/og-image-card.test.tsx` |
| `og/route.tsx` (API) | 0 | 4 | `test/unit/app/api/og/route.test.ts` |
| `[username]/page.tsx` (generateMetadata) | 0 | 3 | integration test |

#### Decisions Made
| Decision | Rationale |
|----------|-----------|
| `cssVar` field di `FontEntry` instead of rename `variable` | `variable` masih dipakai di `FONT_CATALOG_CLASSNAMES` untuk mount ke `<body>` — pisahkan concern: class hash vs CSS var name |
| DomainView baca dari editor store, bukan prop server | Real-time UX; awalnya `saveProfile` skip `username` (Phase 10), tapi di-reverse Phase 11 — username sekarang auto-save + redirect |
| `checkUsernameAvailability` di-trigger debounce 300ms client-side | Hindari spam server; tetap di-validate lagi oleh `saveProfile` uniqueness check (defense in depth) |
| OG image via `next/og` (bukan `@vercel/og`) | Built-in Next.js 16, zero install, cukup untuk card simpel |
| OG card tanpa texture/effects/blur | Satori tidak support `backdrop-filter`, SVG filter, dan `backdrop-filter` untuk glassmorphism |
| OG image cache 1 jam + stale 24 jam | Balancen freshness vs server load; CloudFront CDN sudah aktif |
| `next/font/google` compile-time fonts vs `loadStyleFonts` runtime fonts | Keduanya coexist — `next/font/google` untuk default catalog (CSS var on body), `loadStyleFonts` untuk dynamic injection via raw Google Fonts CDN. Historical trade-off documented in Phase 7.5 |

### Phase 11: Username Auto-Save & Simplify Editor UX

**Goal:** Perbaiki username update flow — dari explicit-save di Settings tab menjadi auto-save via `saveProfile` agar konsisten dengan field lain. Serta sembunyikan media upload UI.

**Problem:** DomainView update real-time ketika username diubah di Settings tab (karena baca dari draft store), tapi DB tidak berubah sampai user klik "Save Settings". Ini bikin confusion: user lihat URL baru tapi 404, URL lama masih work, editor URL tidak berubah.

**Root cause:** Phase 10 Step 2 sengaja exclude `username` dari `saveProfile` scalarFields dengan alasan "aman tidak trigger auto-save." Tapi ini split save flow: semua field auto-save kecuali username (harus explicit save di Settings tab).

**Implementation sequence:**

- [x] **Step 1 — Server: add `username` to `saveProfile` scalarFields** ✅
  - `server/user/profile/save-profile-action.ts:40`: tambah `"username"` ke `scalarFields` array
  - `server/user/profile/schema.ts`: tambah `username: z.string().optional()` ke `SaveProfileSchema`
  - Note: `Profile.username` is `@unique` — Prisma throw error jika duplicate. Perlu explicit uniqueness check.

- [x] **Step 2 — Server: uniqueness validation di `saveProfile`** ✅
  - Sebelum `$transaction`, cek apakah `draft.username` berbeda dari `profile.username` di DB
  - Jika berbeda, cek `db.profile.findUnique({ where: { username: draft.username } })`
  - Jika taken oleh user lain, return `{ success: false, error: "Username is already taken" }`
  - Jika taken oleh profile sendiri (no-op — sama dengan existing), skip check

- [x] **Step 3 — Client: redirect setelah username auto-save** ✅
  - `app/editor/_components.tsx/editor-client.tsx`: setelah `status === "saved"`, cek apakah `draftProfile.username` berubah dari `initialProfile.username`
  - Jika berubah, panggil `router.replace('/editor/${newUsername}')`
  - Gunakan `useRef` untuk prevent infinite loop redirect

- [x] **Step 4 — Client: simplify Settings tab** ✅
  - `components/control-panel/tabs/settings-tab.tsx`:
    - `handleSaveSettings`: hapus `updateProfileUsername` call (auto-save handle username)
    - Button sekarang cuma handle `togglePublishStatus` — hanya aktif jika publish state berubah
    - Hapus `push('/editor/${username}')` redirect (auto-save handle redirect)
  - Keep `checkUsernameAvailability` debounce (real-time validation tetap jalan)
  - Keep `usernameError` + `isCheckingUsername` UI

- [x] **Step 5 — Media: comment out media upload UI** ✅
  - `components/control-panel/link-card-editor.tsx`:
    - Comment out block `{uiState.selectedType === "media" && (...)}` dengan `{false && null}`
    - Hapus "Media" dari `typeOptions` — hanya URL
    - Hapus unused imports: `Image` (next/image), `ImageIcon` (lucide), `uploadFile`, `handleMediaUpload`

- [x] **Step 6 — Verify** ✅
  - `tsc --noEmit`: 0 new errors
  - `vitest run`: 133/133 pass
  - `pnpm build`: pre-existing OG route error (tidak terkait)

#### Decisions Made
| Decision | Rationale |
|----------|-----------|
| `username` masuk auto-save, bukan explicit save | Konsisten dengan field profile lain; hilangkan split-brain antara DomainView (real-time update) dan DB (stuck sampai explicit save) |
| Redirect via `router.replace` di editor-client | Tidak perlu ubah `useAutosave` hook; cukup react terhadap `status === "saved"` |
| Keep `checkUsernameAvailability` debounce | Defense in depth — cegah user mengetik taken username sebelum auto-save fire |
| Comment out (bukan delete) media UI | Mudah di-revert nanti; zero dead-code overhead karena block tidak di-render |
| Uniqueness check server-side sebelum `$transaction` | Cegah Prisma unique constraint error; return user-friendly error message |

---

### Phase 12: Link Defaults, Edit Dialog Cleanup, Schema-Resilient Autosave

**Goal:** Fix default title colors per texture, modernize link editor (description/media removal), normalize + allowlist schema writes to prevent localStorage drift → failed autosave.

**Implementation (branch `texture`, 2026-07-10):**

| # | Item | Files | Status |
|---|------|-------|--------|
| A | Default title color: base=white, glassy=black | `components/texture-card.tsx` | ✅ |
| B | Hapus description + mediaUrl dari UI + server + schema | `link-edit-dialog.tsx`, `link-card-editor.tsx`, `preview-links.tsx`, `prisma/schema.prisma`, `server/user/links/schema.ts`, `server/user/profile/payloads.ts`, `server/website/profile/payloads.ts`, `server/user/links/actions.ts` | ✅ |
| C1 | Allowlist Prisma writes (toLinkWrite/toSocialWrite) | `server/user/profile/save-profile-action.ts` | ✅ |
| C2 | Draft normalizer + schema version | `lib/editor-draft.ts` **(NEW)**, `lib/stores/editor-store.ts` | ✅ |
| C3 | Error UX di autosave (lastError, tooltip) | `hooks/use-autosave.ts`, `app/editor/_components.tsx/editor-header.tsx`, `editor-client.tsx` | ✅ |
| — | Cleanup texture-card.tsx dead expand/image/description code | `components/texture-card.tsx` | ✅ |
| — | Simplify migrate() — discard draft on version mismatch | `lib/stores/editor-store.ts` | ✅ |
| — | PrismaClientKnownRequestError.code P2022 instead of string match | `server/user/profile/save-profile-action.ts` | ✅ |
| — | Tests + fixtures cleaned (description/mediaUrl removed) | `test/fixtures/*.ts`, `test/unit/server/links/schema.test.ts` | ✅ |
| — | Prisma schema drop description/mediaUrl | `prisma/schema.prisma` | ✅ |

**Verifikasi:**
- [x] `tsc --noEmit`: 0 errors ✅
- [x] `vitest run`: 132/132 pass ✅ (14 test files)
- [x] `pnpm build`: ✅ compiled successfully
- [ ] Deploy order: code dulu, baru `prisma db push` drop column

#### Decisions Made
| Decision | Rationale |
|----------|-----------|
| glassy=text-black meski transparan | User confirmed — desired aesthetic meski di atas background gelap |
| CSS default color, not titleStyle on create | Dinamis mengikuti texture switch; custom style tetap override via inline style |
| Full drop description/mediaUrl (not half-comment) | End half-migrated state yang sudah cause production save failures |
| Allowlist Prisma writes | Single choke point terhadap unknown/stale client fields |
| Draft schema version + normalizer | localStorage adalah sumber utama old-format, bukan row user |
| migrate() discard if version < current | Lebih simple daripada partial migrate; normalizer di onRehydrateStorage sebagai safety net |
| PrismaClientKnownRequestError.code P2022 | Lebih robust daripada string matching (langsung cek error code) |

---

## Release Flow (Standard Operating Procedure)

**Goal:** Setiap rilis memiliki tag yang bisa di-rollback. AI cukup ikuti instruksi ini.

**Trigger:** User bilang "release" atau "buat tag" atau "merge ke main".

**Steps:**

1. **Commit semua perubahan di branch fitur** — `git status`, pastikan clean
2. **Switch ke `main`** — `git checkout main && git pull origin main`
3. **Tag versi lama** (snapshot sebelum merge):
   ```
   git tag -a v0.1.N -m "v0.1.N — <deskripsi>"
   git push origin main
   git push origin v0.1.N
   ```
4. **Merge branch fitur ke `main`** — `git merge <branch>` (fast-forward atau no-ff)
5. **Build** — `pnpm build`
   - Jika gagal: fix error → commit → ulangi dari step 4 (merge ulang)
6. **Tag versi baru**:
   ```
   git tag -a v0.1.M -m "v0.1.M — <deskripsi>"
   git push origin main
   git push origin v0.1.M
   ```
7. **Update task_plan.md**: dokumentasikan release + versi

**Naming convention:** `v<major>.<minor>.<patch>` — increment patch per rilis.

**History:**
- `v0.1.1` (2026-07-10): baseline sebelum merge texture branch
- `v0.1.2` (2026-07-10): Phase 12 — link defaults, edit dialog cleanup, schema-resilient autosave
- `v0.1.3` (2026-07-14): snapshot pre-merge: Phase 12.1 (OG bg fix, ripple), Phase 13 partial
- `v0.2.0` (2026-07-14): **Phase 13+14** — admin redesign (shadcn collapsible sidebar, charts, data tables), asset management (Prisma Asset model, S3 key format, `/admin/assets`), animated bg color props, OG image avatar fix, wallpaper presets dead code removal

---

### Phase 12.1: OG Image Background Fix + Ripple Animation Fix

**Goal:** Fix OG image subpages (`/api/og?username=xxx`) that only rendered `bgColor` — ignored `bgWallpaper` and `bgImage`. Fix ripple animation that was broken due to missing keyframe.

#### OG Image Background Fix

**Root cause:** `OgProfile` type only had `bgType`/`bgColor`, missing `bgWallpaper`/`bgImage`. `OgImageCard` only rendered `backgroundColor`, ignoring wallpaper and image types.

**Implementation:**
- `components/og-image-card.tsx`:
  - Extended `OgProfile` with `bgWallpaper`, `bgImage`, `displayNameStyle`
  - Added `bgImageBuffer` prop for base64-inlined background image
  - Imported `getBackgroundStyle` from `lib/utils/preview-background.ts` for color-type fallback
  - Added localized dark gradient overlay (`linear-gradient(to right, rgba(0,0,0,0.45) → 0.15)`) for text readability on busy image backgrounds
  - Applied `displayNameStyle?.color` to both name and username (fallback white)

- `app/api/og/route.tsx`:
  - Added `resolveBackgroundUrl()` — replicates CloudFront wallpaper URL resolution logic from `getBackgroundStyle`
  - Fetches background image as `ArrayBuffer` server-side for `wallpaper` and `image` types
  - Converts to base64 data URL and passes as `bgImageBuffer` prop
  - Falls back to `bgColor` if fetch fails

#### Ripple Animation Fix

**Root cause:** `ripple.tsx` uses `animate-ripple` class but no keyframe was defined.

**Fix:** Added to `app/globals.css` inside `@theme inline`:
```css
--animate-ripple: ripple 3s ease-out infinite;
@keyframes ripple {
  0% { transform: translate(-50%, -50%) scale(0); opacity: var(--ripple-opacity, 0.3); }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
}
```

#### Decisions Made
| Decision | Rationale |
|----------|-----------|
| Fetch bg image server-side + inline as base64 | Avoids 403/CORS/broken renders if image host blocks serverless requests; self-contained OG image |
| Reuse `getBackgroundStyle` as fallback | Single source of truth for background style computation; any future CloudFront URL resolution changes apply automatically |
| Localized dark gradient (not full overlay) | Preserves background image's visual impact while ensuring text legibility |
| `displayNameStyle.color` applied to both name and username | User confirmed — match editor styling |
| Ripple keyframe via `@theme inline` | Matches Tailwind v4 pattern used for `--animate-skeleton` |

#### Verifikasi
- [x] `tsc --noEmit`: 0 errors ✅
- [x] `vitest run`: 132/132 pass (14 test files) ✅
- [x] `pnpm build`: compiled successfully ✅

---

### Phase 13: Animated Background Color Props + Admin Dashboard + OG Image Avatar Fix

**Status:** completed (2026-07-13)

#### A — Animated Background Color Props

**Goal:** Unify color props across all animated backgrounds — each effect gets exactly 1 line color.

| Effect | Current | Target |
|--------|---------|--------|
| **Ripple** | No color prop | Add 1 color prop |
| **Retro Grid** | 2 colors (dark + light) | Change to 1 color |
| **Stripes** | No color prop | Add 1 color prop |
| **Interactive Grid** | No color prop | Add 1 color prop |
| **Hexagon** | No color prop | Add 1 color prop |

**Files:**
- `lib/animated-backgrounds.ts` — update `configFields` for each effect
- `components/control-panel/animated-background/ripple.tsx` — add color rendering
- `components/control-panel/animated-background/retro-grid.tsx` — reduce to 1 color
- `components/control-panel/animated-background/stripped.tsx` — add color rendering
- `components/control-panel/animated-background/grid-pattern.tsx` — add color rendering
- `components/control-panel/animated-background/hexagon.tsx` — add color rendering

**Save behavior:** Already correct — debounce 1.5s, only last save fires to DB (confirmed).

#### B — Admin Dashboard

**Goal:** New admin area for viewing user data and managing inactive accounts.

**Auth:**
- Role-based access: only users with `Role.ADMIN` can access
- Guard: server-side session check + `role === "ADMIN"` before rendering page data

**Routes:**
- `/admin` — overview dashboard with stats
- `/admin/users` — list all users with detail
- `/admin/profiles` — list all profiles

**Data shown:**
- Total users, total profiles, total links, total clicks
- Per-user: display name, username, onboarded status, published status, profile created date, last login (from Session), link count, click count
- Inactive users (no recent session / no link clicks)

**Sensitive data excluded:** Session tokens, Account tokens, IP addresses, user email (unless explicitly needed for admin action)

**Delete actions:**
- Soft delete: flag (e.g., mark profile inactive)
- Hard delete: cascade delete user + profile + links + clicks + sessions + accounts

**Files to create:**
- `app/admin/page.tsx` — dashboard overview
- `app/admin/layout.tsx` — admin layout with auth guard
- `app/admin/users/page.tsx` — user list
- `app/admin/users/[id]/page.tsx` — user detail
- `app/admin/profiles/page.tsx` — profile list
- `server/admin/queries.ts` — admin DB queries
- `server/admin/actions.ts` — admin actions (delete user/profile)
- `components/admin/user-table.tsx` — user table component
- `components/admin/stats-card.tsx` — stat card component

#### C — OG Image Avatar Fix

**Goal:** Fix profile avatar not rendering in `/api/og?username=xxx` OG images.

**Root cause suspected:** `fetchImageAsBuffer(avatarUrl)` fails silently (returns null, no log) — avatar never reaches `OgImageCard`.

**Approach:**
- Add `console.error` logging inside `fetchImageAsBuffer` to identify failure reason
- Verify `avatarUrl` format in DB (OAuth provider URL vs CloudFront URL)
- If OAuth URL: ensure it's publicly fetchable from server runtime
- If CloudFront URL: ensure no auth/CORS restrictions
- Fix based on findings

**Files:**
- `app/api/og/route.tsx` — add fetch error logging
- `components/og-image-card.tsx` — verify rendering path

#### Decisions Made
| Decision | Rationale |
|----------|-----------|
| 1 color per effect, not 2 | User confirmed — simpler and consistent across all effects |
| Ripple gets color prop | Current ripple invisible on light backgrounds; color prop fixes it |
| Admin role-based (not whitelist) | Prisma `Role` enum already exists, no additional config needed |
| Soft + hard delete available | User wants flexibility to choose per account |
| OG image fix starts with logging | Diagnose before fix — fetch failure could be transient network issue |

---

### Phase 14: Asset Management — Track, List, Delete S3 Assets

**Goal:** Track all uploaded images (avatar, bgImage) in a new `Asset` model, allow admin to view/manage assets, and prevent orphaned S3 files.

**Decisions (grilled 2026-07-14):**
| Decision | Rationale |
|----------|-----------|
| `uploads/{userId}/{type}/{timestamp}-{name}` key format | Encode ownership in key — trivial cleanup per user, easier S3 listing |
| Asset model only tracks forward (no backfill) | Existing `avatarUrl`/`bgImage` still work; no need to migrate old uploads |
| `bgWallpaper` excluded | Wallpaper is a preset identifier, not user upload |
| Asset record created during `saveProfile` (not at upload time) | Upload (presigned URL generation) can succeed but save might fail; record only on successful commit |
| Only S3 URLs tracked — external OAuth avatars excluded | Guard: `url.startsWith(S3_PUBLIC_URL)` |

**Implementation sequence:**

- [x] **Step 1 — Prisma: Asset model** ✅
  - Added `Asset` model with fields: `id`, `key`, `url`, `type`, `userId`, `profileId`, `isActive`, `createdAt`
  - Relations: `User` and `Profile` (Cascade delete on both)
  - Indexes: `[profileId, type, isActive]`, `[userId]`
  - `prisma generate`: ✅ (client generated successfully)
  - Note: `prisma db push` require koneksi ke Supabase — lakukan saat deploy

- [x] **Step 2 — Server: update S3 key format + client calls** ✅
  - `server/upload/actions.ts`: tambah `assetType: "avatar" | "bgImage"` param
  - Folder: `uploads/${session.user.id}/${assetType}`
  - `profile-editor.tsx`: pass `"avatar"` ke `getUploadUrl`
  - `background-options.tsx`: pass `"bgImage"` ke `getUploadUrl`

- [x] **Step 3 — Server: Asset records di `saveProfile`** ✅
  - Saat `avatarUrl`/`bgImage` berubah → mark old `isActive: false`
  - Jika URL baru startsWith `S3_PUBLIC_URL` → create Asset baru `isActive: true`
  - Runs inside `$transaction` bersama update profile

- [x] **Step 4 — Admin: `/admin/assets` page** ✅
  - `server/admin/queries.ts`: `getAllAssets()`, `getAssetSummary()`
  - `server/admin/actions.ts`: `deleteAsset(assetId)` — `deleteFromS3(url)` + delete DB record
  - `app/admin/assets/page.tsx` — summary cards + asset table
  - `components/admin/asset-table.tsx` — table with type/status badges, delete confirmation dialog
  - `components/admin/app-sidebar.tsx` — added "Assets" nav item

- [x] **Step 5 — Cleanup on delete user/profile** ✅
  - `deleteUser`/`deleteProfile` admin actions: loop Asset records → `deleteFromS3(url)` → cascade delete

- [x] **Step 6 — Verify** ✅
  - `tsc --noEmit`: 0 errors
  - `vitest run`: 132/132 pass (14 test files)
  - `pnpm build`: skipped (timeout on macOS Turbopack — known issue, not caused by this phase)

## Notes
- No CONTEXT.md exists — consider creating one lazily if domain terms get sharpened
- No ADRs exist yet — `docs/adr/0001-server-side-diff-autosave.md` to be created after Phase 8 confirmed working in production
- 132 tests pass (up from 23 baseline) — P0 (fix broken) + P1 (Phase 8 coverage) + ad-hoc bug fixes + Phase 10 (font-catalog, editor-header, settings-tab, og-image-card, og/route): button.test.tsx (16), profile-editor.test.tsx (7), save-profile.test.ts (17), editor-store.test.ts (19), use-autosave.test.ts (12), social-editor.test.tsx (13), utils.test.ts (5), links/schema.test.ts (12, -1 description test karena field dihapus), json-ld.test.ts (6), font-catalog.test.ts (9), editor-header.test.tsx (3), settings-tab.test.tsx (5), og-image-card.test.tsx (4), og/route.test.ts (4)
- tsc --noEmit: 0 new errors in test or production code (all remaining errors are pre-existing auth dead code from Phase 1)
- Multi-tab sync explicitly out of scope for Phase 8 (single-tab is 99% use case; localStorage persistence is the safety net)
- `bgEffects`/`bgPattern` clear-to-null latent bug fixed implicitly by server-side JSON.stringify diff
- Phase 9 remaining: P2 (integration tests), P3 (fix E2E), P4 (schema tests), P5 (UI components), P6 (infrastructure/mocks), P7 (E2E tooling)
- `test/mocks/next-navigation.ts` redundant with `setup.ts` global mock — consider removal during P6
- editor-store.test.ts uses `vi.mock("zustand/middleware")` to bypass persist/localStorage interference in happy-dom


- user card, bagain name itu samakan dgn colorfont
- login card perbagus, hapus aja logo
- buat konten landing page, buat dia responsive dlu
- animated backgroudn mash ada yg pelru disesuain
- pastiin gambar g ilang pasti ganti tab

---

## Phase 13: Linky-Inspired Architecture Deepening

**Goal:** Adopt proven patterns from Linky across 5 areas: UI state separation, fetch layer, granular caching, `'use cache'` for public pages, and optimistic updates.

**Decisions:**
| Decision | Rationale |
|----------|-----------|
| Follow Linky patterns exactly for all 5 areas | User wants code mostly from Linky |
| Execution order: E → A → B → C → D | E is zero-risk client refactor; A is foundation for B+C; D depends on E |
| UI state split into React Context, not separate Zustand store | Follows Linky's `EditModeContext` pattern; UI state is small; zero new dependency |
| Fetch layer before optimizing public page caching | `'use cache'` works best when RSC calls fetch() not Prisma directly |
| Multi-tenant organizations NOT implemented | Single-user model is sufficient for current needs |

### Phase 13-E: UI State Separation — EditorUIContext

**Problem:** `stylePopover`, panel open/close, dragging state — semua di satu Zustand store `useEditorStore`. Re-render seluruh editor tiap popover dibuka/ditutup.

**Pattern:** Linky's `EditModeContext` — React Context dengan 4 state fields:
- `draggingItem`, `editLayoutMode`, `nextToAddBlock`, `currentEditingBlock`
- Exported via `useEditModeContext()` hook

**Ohmylink equivalent:**
- `EditorUIContext` with: `currentPanel`, `stylePopover`, `isDragging`, `viewMode`
- Provider wraps editor-client.tsx
- Zustand store retains: `originalProfile`, `draftProfile`, `isDirty`, `_draftVersion`

**Files:**
- NEW: `lib/contexts/editor-ui.tsx` — EditorUIContext + Provider + hook
- EDIT: `components/editor/text-style-popover.tsx` — read `stylePopover` from context
- EDIT: `app/editor/_components.tsx/editor-client.tsx` — use EditorUIContext for UI state, Zustand for data only
- EDIT: `lib/stores/editor-store.ts` — remove `stylePopover`, `openStylePopover`, `closeStylePopover`

**Status:** pending

### Phase 13-A: Fetch Layer — apiServerFetch + publicApiFetch

**Problem:** RSC calls Prisma directly. No intermediate fetch layer means:
1. Can't cache properly (`'use cache'` calls Prisma, not fetch())
2. No separation between authenticated and public data access
3. Can't migrate to dedicated backend later

**Pattern:** Linky's two fetchers:
- `apiServerFetch(path)` — marked `'server-only'`, forwards cookies via `headers()`, for authenticated reads
- `publicApiFetch(path)` — marked `'server-only'`, no cookies, safe inside `'use cache'`, for public reads

**Ohmylink implementation:**
- `server/lib/api-server.ts` — `apiServerFetch<T>(path, options?)` → fetch internal API with cookies
- `server/lib/public-read.ts` — `publicApiFetch<T>(path, options?)` → fetch internal API without cookies (safe for `'use cache'`)

**Note:** Phase 13-A creates the files but does NOT wire them into routes yet. Wiriing happens in Phase 13-B (caching) and 13-C (public page optimization). This avoids breaking existing direct-Prisma reads until the cache layer is ready.

**Files:**
- NEW: `server/lib/api-server.ts` — cookie-forwarding fetch
- NEW: `server/lib/public-read.ts` — cookie-free public fetch

**Status:** pending

### Phase 13-B: Granular Caching

**Problem:** Only 1 cache tag per profile (`public-profile-${username}`). Changing a single link busts the entire cache — profile, socials, links all re-fetched.

**Pattern:** Linky's granular cache tags:
- `page-id-{id}` — profile-level
- `page-slug-{slug}-{domain}` — for routing lookups
- `block-{blockId}` — per-link granularity

**Ohmylink equivalent:**
- `public-profile-${username}` — keep existing
- `links-${profileId}` — link list only
- `socials-${profileId}` — social list only
- `profile-meta-${profileId}` — display name, bio, avatar

**Implementation:**
- Split `getPublicProfile(username)` into 3 cached queries:
  - `getPublicProfileMeta(username)` — profile scalars + socials (cacheTag: `profile-meta-${username}`)
  - `getPublicLinks(profileId)` — links only (cacheTag: `links-${profileId}`)
- Server actions revalidate granularly: `revalidateTag("links-${profileId}")` instead of `revalidatePath("/[username]")`
- Migrate current `revalidatePath()` calls (from save-profile-action, togglePublishStatus, etc.)

**Files:**
- EDIT: `server/website/profile/queries.ts` — split into granular queries
- EDIT: `server/user/profile/save-profile-action.ts` — granular revalidation
- EDIT: `server/user/settings/actions.ts` — granular revalidation
- EDIT: `app/[username]/page.tsx` — call separate granular queries

**Status:** pending

### Phase 13-C: `force-dynamic` → `'use cache'`

**Problem:** `app/[username]/page.tsx` uses `export const dynamic = "force-dynamic"` — forces SSR every request, no CDN cache.

**Pattern:** Linky's public page layout uses `'use cache'` with `cacheLife('days')` and SWR with revalidation disabled on client.

**Ohmylink implementation:**
- Remove `force-dynamic` from `app/[username]/page.tsx`
- `getPublicProfileMeta()` already has `'use cache'` — just ensure `cacheLife("minutes")` or `cacheLife("days")` is correct
- Profile-view.tsx (client component) already rehydrates via RSC props — no client-side refetch needed
- For dynamic metadata (OG image, JSON-LD), keep those as separate uncached endpoints

**Files:**
- EDIT: `app/[username]/page.tsx` — remove `force-dynamic`, keep existing cached queries
- EDIT: `server/website/profile/queries.ts` — adjust `cacheLife` values

**Status:** pending

### Phase 13-D: Optimistic Updates

**Problem:** Autosave waits for 1.5s debounce + server round-trip before UI reflects changes. Drag-reorder links = visible delay.

**Pattern:** Linky's `EditWrapper.tsx`:
- `mutateLayout(layoutWithNewBlock, { revalidate: false })` — SWR optimistic cache
- On error: `mutateLayout(layout, { revalidate: false })` — rollback
- Pending skeleton via `setPendingAdds` — visual feedback until server confirms

**Ohmylink implementation (with Zustand + TanStack Query):**
- Before server action: `updateDraft()` immediately (already optimistic for text edits)
- For reorder: update local state + fire server action in background
- On error: `discardChanges()` — rollback to original
- Requires `_draftVersion` stamp to prevent stale overwrites (already implemented)
- Add loading skeleton for new link creation (following Linky's pendingAdds pattern)

**Files:**
- EDIT: `hooks/use-autosave.ts` — add optimistic flag, reduce debounce for reorder
- EDIT: `components/preview/preview-links.tsx` — support skeleton state
- EDIT: `lib/stores/editor-store.ts` — add `_optimisticVersion` or similar stamp

**Status:** pending

### Implementation Order

| Step | Phase | Description | Risk | Depends on |
|------|-------|-------------|------|------------|
| 1 | 13-E | EditorUIContext — UI state split | None | — |
| 2 | 13-A | Fetch layer files (apiServerFetch + publicApiFetch) | Low | — |
| 3 | 13-B | Granular caching (split queries, granular revalidation) | Medium | Phase 13-A (optional — can split queries before fetch layer) |
| 4 | 13-C | Remove `force-dynamic`, optimize cacheLife | Low | Phase 13-B |
| 5 | 13-D | Optimistic updates (reorder, add link) | Medium | Phase 13-E (clean UI state) |

---

### Phase 14.2: Architecture Consistency — Grill Session Fixes

**Goal:** Perbaiki 13 consistency deviations dari codebase audit + tuning analytics tab + low-impact remnant cleanup, berdasarkan keputusan grilling session 2026-07-17.

**Keputusan Arsitektur (settled):**
| Decision | Rationale |
|----------|-----------|
| **Remove fetch layer** — `server/lib/api-server.ts`, `server/lib/public-read.ts` dead code, tidak ada import | Direct Prisma sudah benar untuk single-process; Linky perlu fetch layer karena Fastify terpisah |
| **`cacheLife("days")`** untuk public queries (dari "minutes") | Safety net; `revalidateTag()` panggil langsung via server action = instant invalidation |
| **Tetap Zustand** — tidak migrasi ke SWR | Ohmylink = form-based profile editor, bukan canvas-based block editor seperti Linky |
| **TanStack Query tetap** untuk analytics | Use case real-time metrics cocok; butuh tuning config. Bukan inkonsistensi — beda kebutuhan. |

**Implementation sequence:**

| # | Task | Files | Detail | Effort |
|---|------|-------|--------|--------|
| A | Remove dead fetch layer | `server/lib/api-server.ts`, `server/lib/public-read.ts` | Hapus 2 file — zero import, tidak pernah dipakai | 1m |
| B | Switch `cacheLife("minutes")` → `"days"` | `server/website/profile/queries.ts` | 4x ganti string literal di `getPublicProfileMeta`, `getPublicLinks`, `getPublishedProfiles`, `getPublishedProfileCount` | 1m |
| C | Remove unnecessary `"use client"` | `components/control-panel/tabs/profile-tab.tsx:1` | Hapus directive — tidak ada hook/event/client feature | 30s |
| D | Add missing `"use client"` | `components/preview/view-mode-toggle.tsx:1` | Tambah directive — punya `onClick` handler | 30s |
| E | Fix duplicate state in settings-tab | `components/control-panel/tabs/settings-tab.tsx` | Hapus `useState` untuk `username`/`isPublished`, derive dari `draftProfile` store | 10m |
| F | Add caching to editor queries | `server/user/profile/queries.ts` + `server/user/settings/actions.ts` | Tambah `'use cache'` + `cacheLife("minutes")` + `cacheTag("editor-profile-${userId}")` di `findProfileByUserId`/`findProfileByUsername`; invalidasi di save-profile-action.ts | 15m |
| G | Fix admin `revalidatePath` → `revalidateTag` | `server/admin/actions.ts` | 5x ganti: line 47, 82, 131, 164, 186. Pakai `revalidateTag("admin-...", "minutes")` | 5m |
| H | Fix analytics-tab slow render | `components/control-panel/tabs/analytics-tab.tsx` | `staleTime: 0` → `30_000`, `refetchInterval: 10000` → `60_000`, tambah `placeholderData: keepPreviousData` dari `@tanstack/react-query` | 5m |
| I | Fix hydration race di editor-client | `app/editor/_components.tsx/editor-client.tsx` | Tambah loading skeleton saat `_hasHydrated` masih false, di atas return main | 5m |
| J | Fix Prisma enum value import | `components/control-panel/profile-layout-selector.tsx:4` | `import` → `import type` | 30s |
| K | Consistent boundary: design-tab `"use client"` | `components/control-panel/tabs/design-tab.tsx` | Tambah `"use client"` — konsisten dengan 3 tab lain (profile-tab removed directive di C, jadi ini optional) | 30s |
| L | Fix client layout inconsistency | `app/[username]/layout.tsx` | Extract `useEffect` untuk DOM class manipulation ke inner component; layout jd pure server | 10m |
| M | Migrate marketing `revalidate` → `'use cache'` | `app/(marketing)/page.tsx` | Hapus `export const revalidate = 60`, ganti dengan `'use cache'` + `cacheLife("days")` | 5m |

**Priority:**
| Tier | Items | Alasan |
|------|-------|--------|
| **P0** | E, H, I, F | Paling berdampak (data loss potential / performance) |
| **P1** | A, B, C, D, G | Bersih-bersih, konsistensi, tanpa efek samping |
| **P2** | J, K, L, M | Kosmetik / low impact, bisa skip |

**Verifikasi:**
- [ ] `tsc --noEmit` — 0 new errors
- [ ] `vitest run` — all passing (130 baseline; item E mungkin perlu update test mock)
- [ ] `pnpm build` — compiled successfully
- [ ] Manual QA: edit profile + save → no regression
- [ ] Manual QA: analytics tab render < 2s first load, instant on tab switch (placeholderData) |
