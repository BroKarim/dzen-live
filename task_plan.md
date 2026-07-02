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

## Notes
- No CONTEXT.md exists — consider creating one lazily if domain terms get sharpened
- No ADRs exist — no conflicts to flag
- All 24 existing tests pass — baseline preserved
