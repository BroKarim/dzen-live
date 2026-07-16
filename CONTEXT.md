# Ohmylink

Link-in-bio platform. Users create a public page with their links and social profiles.

## Language

**Profile**:
A user's public page — display name, bio, avatar, links, socials, and background.
_Avoid_: Page, landing page

**Link**:
A single clickable item on a profile — title, URL, optional button styling (color, text color, title style).
_Avoid_: Block, card, button

**Editor**:
The client-side UI for editing a profile. Data state (profile, links, socials) lives in Zustand; UI state (panel open/close, style popover, dragging) will be split into a React Context.
_Avoid_: Admin panel, dashboard

**Fetch Layer**:
The abstraction between Server Components/Server Actions and the data source. Two modes: `apiServerFetch` (authenticated, forwards cookies) and `publicApiFetch` (no cookies, safe for `'use cache'`). Currently absent — RSC calls Prisma directly.
_Avoid_: Direct Prisma access (current anti-pattern)

**Server Action**:
A `"use server"` function that runs on the server, called from client code. Currently the only write path.
_Avoid_: API route, endpoint

**Cache Tag**:
A granular cache key used with `revalidateTag()` to bust specific resources (e.g., `public-profile-${username}`, `links-${profileId}`). Currently only 1 tag per profile.
_Avoid_: `revalidatePath()` (too coarse for granular invalidation)

**Optimistic Update**:
Immediate UI mutation before server confirmation, with rollback on error. Currently absent — autosave waits for server response.
_Avoid_: Pessimistic update (current pattern)
