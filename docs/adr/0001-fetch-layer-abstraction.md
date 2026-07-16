# ADR 0001: Fetch Layer Abstraction

Server Components and Server Actions currently read Prisma directly. This couples data access to the database layer, prevents granular caching, and blocks future migration to a dedicated backend. We will introduce an intermediate fetch layer with two modes: `apiServerFetch` (authenticated, forwards cookies) and `publicApiFetch` (no cookies, safe inside `'use cache'`). Pattern taken from Linky.
