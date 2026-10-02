# Admin Panel — Build Handoff

**Status:** Ready to start. Awaiting two answers (see "Blocked On").
**Last updated:** 2026-10-01

---

## The goal

Manager can log in and edit site content without a developer: change the
WhatsApp number, swap images, update the signature. No RBAC — one login.

---

## Blocker answers needed

1. **R2 enabled?** (`wrangler r2 bucket list` → `code: 10042, "Please enable R2
   through the Cloudflare Dashboard"`. Needs a dashboard click + payment method,
   so I cannot do it.) Default: **skip**, ship auth + settings first, uploads in
   phase 2.
2. **Admin email + password?** Default: seed `admin@portfolio.local`, generate a
   random password, print it once in the terminal.
3. **Real WhatsApp number to seed?** Default: keep `919000000000` so the manager
   changes it in the panel (better demo).
4. **Which content is editable in v1?** Default: WhatsApp number, contact email,
   hero statement text.

---

## Already done

D1 database created (works with the current wrangler token):

```
name: portfolio   region: APAC
database_id: 67c32cc5-7bad-49f0-92e5-d42a87603348
```

**Not yet wired into `wrangler.jsonc`** — that is step 1.

---

## Build plan

| # | Step | Notes |
|---|------|-------|
| 1 | D1 binding in `wrangler.jsonc` + drizzle config | see gotchas |
| 2 | Schema: `admin_user`, `site_settings`, `media_slots`; push migration | |
| 3 | Auth: login, opaque session token, httpOnly cookie, logout | copy bookade's design |
| 4 | `/admin` route with **server-side** guard | not client-side |
| 5 | Settings read/write API with Zod | |
| 6 | Wire frontend to read from DB | `WhatsAppFab`, `SignatureMark` |
| 7 | Admin settings UI | |

---

## Critical gotchas

**`src/db/index.ts` cannot run on workerd.** It is
`drizzle-orm/better-sqlite3` with `process.env.DATABASE_URL`. Must become
`drizzle-orm/d1` bound via `wrangler.jsonc`.

`drizzle.config.ts` points at a single `todos` table in `src/db/schema.ts` —
effectively a blank slate. `db` is currently imported nowhere.

**R2 is not enabled** on account `9022f53a05941dbe8661a5f7cbe8e3d9`.

**`wrangler.jsonc` has no `d1_databases` / `r2_buckets` / `kv_namespaces`** yet.

---

## Reference: what to copy from `bookade-src`

Good — **same stack** (TanStack Start, Cloudflare, Drizzle, Zod, shadcn).

**Copy this:**
- `bookade-src/server/auth/security.ts` — opaque 48-byte random token, stored as
  `sha256(token + pepper)`, httpOnly cookie. No JWT. (Ignore its `JWT_SECRET` env
  var — dead config, nothing reads it.)

**Do NOT copy:**
- **RBAC** — `server/access/modulePolicies.ts` is 462 lines modelling multi-tenant
  SaaS (tenants, branches, departments, 20-operator row-level ABAC, 220-line
  contract tests). ~1,150 lines total for access+auth+rbac+uploads. We need one
  boolean: "is this person logged in."
- **Local-disk uploads** — `server/modules/uploads/storage.ts` uses `node:fs`
  writing to `process.cwd()/"uploads"`. `node:fs` does not exist on workerd.
- **Client-side route guard** — `components/app/session-guard.tsx:26-36` bounces
  via `useEffect` + `navigate`, so a logged-out user gets the full admin bundle
  before redirect. Guard server-side in the loader.
- **Fail-open ability guard** — `crudFactory.helpers.ts:68-112` returns early
  (ALLOW) when a handler forgets to declare an ability. Fail closed.
- **Two settings shapes** — loose `interface` for defaults plus `.strict()` Zod
  for writes, already drifted apart: `branding.siteName` is rejected by the
  write path while the admin UI still posts it. Use ONE Zod schema, infer the TS
  type from it.
- **Settings read/write split** — bookade reads settings in a server loader for
  public pages but via React Query for admin. Inconsistent; pick one.
- **Media caching** — `getUploadContent` does a full `readFile` + DB SELECT per
  image request with no `Cache-Control`/`ETag`. Add caching.
- **Anonymous public upload** — `routes/api/public/uploads.tsx` lets any visitor
  upload a permanently world-readable file, IP rate limit only.

**Worth copying:** the **policy-fingerprint cache key**
(`server/modules/access-control/abacService.ts:10`) — hashes the resolved
permissions so tightening a policy invalidates caches instead of serving stale
over-broad results.

**Note:** bookade's admin is **not wired to its own storefront** —
`TopAnnouncementBar.tsx:8-14` hardcodes its announcements. Good reference for
auth and module-policy shape; not a reference for frontend wiring.

---

## Design decisions made

- **One `admin_user` table, one hardcoded role.** No tenants, no permissions
  table.
- **Settings as a key-value table** with a Zod schema per group — *not* a generic
  block CMS.
- **Image slots as a fixed enum** (`hero_portrait`, `signature`, `og_image`,
  `favicon`) so the admin UI is finite and a manager can't upload a 4MB photo
  into a 300px slot. Requires R2.
- Site is ~10 sections of hardcoded copy in `src/components/portfolio/*`.

---

## Uncommitted work

`git status` has 21 modified files plus untracked `src/asserts/`,
`src/components/portfolio/{BooksSection,SignatureMark,WhatsAppFab}.tsx`,
`src/routes/lib/`, `public/fonts/`. `master` branch. Nothing committed yet.

Earlier work this session (all uncommitted): WhatsApp FAB, signature visibility
fix + self-hosted Anton/Bebas woff2 in `public/fonts/`, hero D+standing-figure
lockup with responsive vw/vh sizing, golden-ratio spiral opacity fix for light
mode.

Pre-existing issues, unrelated and untouched: `src/router.tsx:25` tsc error,
3 eslint errors in `src/routes/index.tsx` (lines 7, 8, 13), and `bookade-src`
(68,750 lines, 680 files) does not compile — `tsconfig.json` maps `@/*` to
`./src/*` so every `@/server/...` import is unresolved.

---

## Resume

`/opencode` → pick this session. Or start fresh with: "read
docs/ADMIN-PANEL-HANDOFF.md and start the admin panel."
