# Admin Panel — Build Handoff

**Status:** v2 WORKING. Login + settings editor + image uploads, on a Node/VPS
target. Verified end to end against both the dev server and the production build.
**Last updated:** 2026-10-02

---

## What works now

- `/admin/login` — email + password, PBKDF2, httpOnly session cookie.
- `/admin` — settings editor: WhatsApp number, pre-filled message, contact
  email, phone display, hero statement (3 lines), counter-statement, both CTA
  labels + links. Live previews for the wa.me URL and hero statement.
- `/admin` — **image slots**: hero portrait, signature, social share image,
  favicon. File picker, replace, alt-text editing, remove.
- The public site renders settings AND images server-side, so there is no flash
  of defaults.

### Run it

```bash
npm run admin:seed      # prints a generated password; re-run resets it
npm run dev             # http://localhost:3000/admin
```

Production:

```bash
npm run build && npm start
```

### Verify it

```bash
npm test                # all four suites
```

`test:guard` and `test:upload` need a server running and respect `BASE_URL`
(default `http://localhost:3000`):

```
npm run test:verify    # 20 crypto/cookie assertions
npm run test:db        # 12 checks against the real database
npm run test:guard     # 11 HTTP auth checks
npm run test:upload    # 21 checks on the upload path
```

All pass against both `npm run dev` and the built `npm start`.

---

## Architecture

**Node/VPS, not Cloudflare.** Two things forced the move:

1. **Uploads are impossible on Workers.** workerd has no writable filesystem —
   `node:fs` resolves at build time but throws
   `"[unenv] fs.writeFile is not implemented yet!"`. Verified directly rather
   than assumed.
2. **D1 only exists inside Cloudflare**, so the database had to move anyway.

`vite.config.ts` no longer uses `@cloudflare/vite-plugin`; `wrangler.jsonc` is
no longer used for deployment. The old D1 database still exists but is
abandoned — its rows were copied into `data/portfolio.db` by a one-shot script
that has since been removed.

> **`admin/integration.ts` used to test that abandoned D1 file.** It shelled out
> to `wrangler d1 execute` and reported ALL PASS while asserting against a
> database nothing served from — `site_media` did not even exist in it. It now
> runs through Drizzle against the same file `resolveDatabasePath` resolves, and
> `openCheckDb()` fails loudly if `admin_user` is missing. Worth knowing if you
> ever wondered why the suite was green.

| Concern | Choice |
|---|---|
| Database | MySQL via `mysql2`. Connection string in `DATABASE_URL`; `src/db/path.ts` resolves it and `drizzle.config.ts` uses the same resolver so the CLI and runtime cannot drift |
| Schema | Drizzle migrations in `drizzle/*.sql`, applied by `npm run db:migrate`. **A deploy step — do not skip it.** The admin Overview warns when tables are missing |
| Uploads | `public/uploads/`, served by `server.mjs` |
| Entry point | `server.mjs`, adapting Node req/res to the `{ fetch }` handler `vite build` emits |
| Auth | PBKDF2-SHA256 210k; opaque 48-byte tokens stored as `sha256(token+pepper)` in an httpOnly cookie |

### Why uploads are served from the source tree

Vite copies `public/` into `dist/client/` **at build time**. An upload written
after the build would 404, which defeats the entire point. `server.mjs` serves
`/uploads/*` from `public/uploads/` directly, so a manager's upload is live
immediately with no rebuild. Verified: upload after build → serves at once.

Deploy consequence: `public/uploads/` and `data/` must survive a deploy. Don't
`rm -rf` the checkout, or point `DATABASE_FILE` / `UPLOADS_DIR` outside it.

### Image slots are a closed enum

`hero_portrait`, `signature`, `og_image`, `favicon` — each with its own max
dimensions and aspect requirement. A manager cannot upload a 6 MB phone photo
into a slot that renders at 300 px; validation rejects it with a readable
message. Uploads are magic-byte checked independently of the declared
`Content-Type`, so a file renamed `.png` cannot smuggle HTML in from the site
origin.

---

## Not done yet

1. **Password change UI** — re-run `npm run admin:seed` to reset instead.
2. **Login rate limiting** — PBKDF2 at 210k makes each attempt expensive, but
   add fail2ban or an nginx `limit_req` before this is internet-facing.
3. **Audit history** — `updated_by` records who last changed what; there is no
   change log.
4. **Never deployed to a real VPS** — see `docs/VPS-DEPLOY.md`. The production
   build and `npm start` were verified locally on port 3100, nothing beyond that.

---

## Bugs found and fixed (worth remembering)

Two were only caught because the checks test the failure path, not the happy
path.

**Expired sessions authenticated.** Expiry columns were declared
`integer({ mode: 'timestamp' })`, which Drizzle interprets as **seconds**, while
the app wrote `Date.now()` (**milliseconds**). Drizzle read every `expires_at`
back as a date in the year **58722**, so `expiresAt <= now` never fired. Fixed
with `'timestamp_ms'`, and kept honest by `admin/expiry-check.ts`. On MySQL the
column is now a `datetime`, which removes the unit ambiguity entirely rather than
relying on picking the right mode.

**The site silently ignored its own database.** `.env.local` still carried
`DATABASE_URL="dev.db"` from the starter template, which took priority over the
default path and pointed the app at a different, non-existent file than the CLI
tools used. Every read fell back to schema defaults. Removed.

**The schema in the repo did not match the schema in the database.** The
committed `drizzle/0000_admin_auth.sql` was missing the `site_media` table,
while a hand-written `CREATE TABLE IF NOT EXISTS` array in `src/db/index.ts`
created it at boot. Two sources of truth, one of them stale. There is now one:
`src/db/schema.ts`, with `drizzle/*.sql` generated from it.

**`drizzle-kit migrate` reported success while applying nothing.** A column
default was emitted as `DEFAULT (unixepoch()) * 1000` — invalid in a SQLite
DEFAULT clause, because the `*` needs enclosing parentheses. The CLI swallowed
the error, created the bookkeeping table, and printed "migrations applied
successfully". Found by running drizzle's programmatic migrator, which surfaces
the failure. Worth knowing if a migration ever appears to do nothing.

---

## The goal

Manager can log in and edit site content without a developer: change the
WhatsApp number, swap images, update the signature. No RBAC — one login.

---

## Design decisions

- `admin/` holds all admin code; `src/` keeps the public site. Route files stay
  in `src/routes/admin/` because TanStack Router requires that location.
- **One `admin_user` table, one hardcoded role.** No tenants, no permissions.
- **Settings as key-value rows**, one row per group, so a group save is a
  single upsert and concurrent edits cannot clobber each other.
- **One Zod schema per group**, TS types inferred from it.
- Schema is created on first DB access, not at boot — see above.
- `requireAdmin()` throws a Response so write paths fail closed.

### Import-protection constraint

Route files are compiled into BOTH the client and server graphs, and TanStack
denies `@tanstack/react-start/server` to the client. So `beforeLoad` **cannot**
call `getRequest()` directly — the build fails with "Import denied in client
environment". Guards are wrapped in `createServerFn` in
`admin/server/guards.ts`; route files reference the plain exported function.

Anything reaching the database has the same restriction: `admin/server/public.ts`
may only be imported from inside a server function, never from a route loader or
a component.

---

## Reference: what to copy from bookade

Lives at `../bookade-reference`, excluded from tsconfig (it maps its own `@/*`
to a `src/` that does not exist here and added ~300 phantom type errors).

**Same stack** — TanStack Start, Cloudflare, Drizzle, Zod, shadcn.

**Copied:** `server/auth/security.ts` — opaque random token stored as
`sha256(token + pepper)` in an httpOnly cookie. (Ignore its `JWT_SECRET`; dead
config, nothing reads it.)

**Deliberately NOT copied:**
- **RBAC** — `server/access/modulePolicies.ts` is 462 lines modelling
  multi-tenant SaaS. ~1,150 lines for access+auth+rbac+uploads, to answer one
  boolean: "is this person logged in."
- **Local-disk uploads** — `server/modules/uploads/storage.ts` uses `node:fs`
  → `process.cwd()/"uploads"`. That *does* work on a VPS, but it never runs
  migrations and has no path-traversal guard; ours does both.
- **Client-side route guard** — `components/app/session-guard.tsx:26-36` bounces
  from a `useEffect`, so a logged-out visitor downloads the whole admin bundle
  first.
- **Fail-open ability guard** — `crudFactory.helpers.ts:68-112` returns early
  (ALLOW) when a handler forgets to declare an ability.
- **Two settings shapes** — a loose `interface` plus a `.strict()` Zod, already
  drifted: `branding.siteName` is rejected by the write path while the admin UI
  still posts it.
- **No upload validation** — it blocks SVG and matches magic bytes, but has no
  dimension or aspect limits, so nothing stops a 20 MB image.
- **Anonymous public upload** — `routes/api/public/uploads.tsx` lets any visitor
  upload a permanently world-readable file, IP rate limit only.

**Note:** bookade's admin is **not wired to its own storefront** —
`TopAnnouncementBar.tsx:8-14` hardcodes its announcements in a TS array.

---

## Environment

- DB: `data/portfolio.db` (gitignored). Override with `DATABASE_FILE`.
- Uploads: `public/uploads/` (gitignored). Override with `UPLOADS_DIR`.
- `SESSION_TOKEN_PEPPER` has **no default in production** — the server throws
  without it, because a shared pepper would let anyone with a database dump
  forge valid sessions.
- `better-sqlite3` needed `npm rebuild` (prebuilt binary targeted a different
  Node ABI).
- Deploy steps: `docs/VPS-DEPLOY.md`.

---

## Resume

`/opencode` → pick this session. Or start fresh with:
"read docs/ADMIN-PANEL-HANDOFF.md and continue the admin panel."