# Progress Log

## Session 2025-06-29 21:26

### Phase 1: Dead Code Removal — complete
- Deleted: lib/editor/, hooks/use-editor-state.ts, lib/hooks/use-profile.ts, server/user/profile/schema.ts, server/admin/
- Tests: 24/24 passing

### Phase 2: Auth Pattern Consolidation — complete
- Created server/user/auth.ts (shared getSession + withAuth)
- Refactored: links, profile, analytics actions to use shared withAuth
- Settings actions use shared getSession (kept manual try/catch for complex error shapes)
- Fixed TS narrowing via `as const` on success fields
- Tests: 24/24 passing, 0 TS errors

### Phase 3: Upload Module Extraction — complete
- Created lib/upload.ts (uploadFile interface, 4-step pipeline implementation)
- Reduced link-card-editor.tsx by ~110 lines (duplicated handlers)
- Tests: 24/24 passing, 0 TS errors

### Phase 4: Cache API & Proxy Cleanup — complete
- Migrated profile queries from unstable_cache to stable next/cache
- Updated proxy.ts matcher from ghost routes to /editor/:path*
- Tests: 24/24 passing, 0 TS errors

### Phase 5: Verification — complete
- 24/24 tests passing
- 0 TypeScript errors (npx tsc --noEmit)
- Build succeeds (pnpm build)
- Net: -595 lines (916 deleted, 321 added)
- 15 files changed, 2 new files created

## Session 2026-06-29 (Phase 6: UX Simplification — Link Model)

### Part A: Link Model Simplification — complete
- Removed from schema: `icon`, `mediaType`, `paymentProvider`, `paymentAccountId`
- Removed enums: `MediaType`, `PaymentProvider`
- Cleaned up: Zod schema, S3 actions, payloads (3 files), editors (2 files), preview components (2 files)
- Tests: 23/23 passing (1 mediaType test removed)
- 0 TS errors, build passes, DB synced
- Net: 10 files changed, 2 enums deleted, ~200 lines removed

### Part B: Theme Removal + Per-Element Text Style — complete
- **Theme system removed**: deleted `lib/themes.ts`, `theme-selector.tsx`, `Profile.theme` field, `updateTheme` action
- **Tab renamed**: "Theme" → "Design", content = background settings only
- **Per-element style fields added**: `displayNameStyle`, `bioStyle` (Profile), `titleStyle` (Link) as JSON columns
- **Font catalog**: 12 Google Fonts via `next/font/google` mounted in layout, with `lib/font-catalog.ts` as single source of truth
- **Zod schema**: `TextStyleSchema` (color, fontFamily), `TextStyleInputSchema` coerces empty `{}` → null
- **Preview components**: `PreviewProfile`, `PreviewLinks`, `TexturedCard` now accept `mode: "editor" | "public"`, expose `data-style-target` for clickable edit
- **Editor UX**: click text element in preview → `TextStylePopover` opens anchored to click, with `ColorPicker` (8 preset + HSL gradient) + `FontPicker` (searchable, each font rendered in own typography)
- **Switch in place**: clicking another text element moves the popover without close-reopen
- **Hover affordance**: dashed outline on hover for editable text in editor mode
- **Reset indicator**: tab Design header shows "N custom styles active · Reset all" with breakdown
- **Font loading**: `loadStyleFonts` injects `<link>` for each unique fontFamily referenced, cleanup on unmount
- **Save flow**: `saveAllProfileChanges` accepts `displayNameStyle`/`bioStyle`/`links[].titleStyle`; `null` → `Prisma.JsonNull` for DB NULL
- **Tests**: 23/23 passing, 0 TS errors, build passes, DB synced (`--accept-data-loss` for theme column)
- **Files**: 9 new (lib/text-style, lib/font-catalog, components/editor/*), 11 modified, 2 deleted
- **Net**: +1,540 lines (most of it color picker + font picker + popover UI)

## Prior sessions preserved below

### Bug: Google OAuth Login P2022 Error
- **Symptom**: Login via Google redirects to `/api/auth/error?error=internal_server_error`
- **Root cause**: Kolom `role` tidak ada di tabel `user` (Prisma schema punya field `role`, Better Auth config punya `additionalFields.role`, tapi migrasi awal tidak membuat kolomnya)
- **Fix**: User ran `prisma db push`, login now works
- **Status**: resolved

### Bug: Wallpaper "No wallpapers available" (Local Only)
- **Symptom**: Tab "Wallpaper" di background options menampilkan empty state di local
- **Root cause**: Tabel `background_presets` ada (dibuat `prisma db push`), tapi kosong. Tidak ada seed script, admin API, atau mekanisme untuk mengisi data wallpaper. Di production, data di-insert manual.
- **Status**: triaged → ready-for-agent (agreed by user)
