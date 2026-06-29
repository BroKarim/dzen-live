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
- [ ] Run full test suite
- [ ] TypeScript type check
- [ ] Lint check
- [ ] Build check
- **Status:** pending

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Remove dead code entirely | Deletion test passes — complexity already lives elsewhere |
| Consolidate auth in `server/user/auth.ts` | One seam, shared — already exists in `withAuth()`, just needs a home |
| Extract `uploadFile()` as standalone module | Two duplicate handlers already in one component = real seam |
| Migrate to stable `next/cache` API | `unstable_*` is deprecated path |

## Notes
- No CONTEXT.md exists — consider creating one lazily if domain terms get sharpened
- No ADRs exist — no conflicts to flag
- All 24 existing tests pass — baseline preserved
