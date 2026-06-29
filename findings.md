# Findings

## Dead Code Discovery

### lib/editor/ (53 lines, 0 imports)
- `types.ts`: Defines `EditorState`, `LinkItem`, `SocialLink`, `ProfileData`, `BackgroundGradient`, `BackgroundEffects` — all unused.
- `initial-state.ts`: Uses `EditorState` type, exports `initialEditorState` — unused.
- `README.md`: Claims to be "single source of truth" for editor types. Misleading.

### hooks/use-editor-state.ts (20 lines, 0 imports)
- Wraps `useState<EditorState>`. Never imported by any file.

### lib/hooks/use-profile.ts (107 lines, 0 imports)
- TanStack Query hooks calling non-existent `/api/profile`, `/api/profile/avatar` REST endpoints.
- Mutations happen via server actions, not REST.

### server/user/profile/schema.ts (39 lines, 0 imports)
- `ProfileSchema` and `ProfileInput` exported but never imported anywhere.
- `saveAllProfileChanges` has its own inline interface instead.

### server/admin/ (empty directory)
- No files. `withAdminAuth` in `lib/auth-hoc.ts` is defined but never called.

## Auth Pattern Audit

| File | Pattern | Auth lines |
|------|---------|------------|
| `links/actions.ts` | `withAuth()` HOF | ~15 lines (wrapper) |
| `profile/actions.ts` | Manual try/catch + inline getSession ×2 | ~15 lines each |
| `analytics/actions.ts` | Manual try/catch + inline auth ×4 | ~20 lines each (80 total) |
| `settings/actions.ts` | Manual try/catch + inline auth ×6 | ~15 lines each (90 total) |

## Upload Duplication

`link-card-editor.tsx:51-165` — `handleLogoUpload` and `handleMediaUpload` share the same 4-step pipeline:
1. Validate file type/size
2. Compress via `compressImage()`  
3. Get presigned URL from `getUploadUrl()`
4. PUT to S3 via `fetch()`

Differences: allowed types, max sizes, compression params, state key.

## Caching API Drift

- `server/user/profile/queries.ts`: Uses `unstable_cacheLife`, `unstable_cacheTag` (deprecated)
- `server/website/profile/queries.ts`: Uses `cacheLife`, `cacheTag` (stable/experimental)

## Proxy Middleware

- Guards `/dashboard/:path*`, `/onboarding/:path*` — these routes don't exist
- `/editor/` is NOT in the matcher
- Onboard flow uses `ensureUserHasProfile()` server-side, not dedicated pages
