# Admin Panel — Build Handoff

**Status:** v1 WORKING. Login + settings editor + D1-backed content, verified end to end.
**Last updated:** 2026-10-02

---

## What works now

- `/admin/login` — email + password, PBKDF2, httpOnly session cookie.
- `/admin` — server-guarded settings editor. Editable: WhatsApp number,
  pre-filled message, contact email, phone display, hero statement (3 lines),
  counter-statement, both CTA labels + links. Live previews for the wa.me URL
  and the hero statement.
- The public site renders those values from D1 **on the server**, so there is no
  flash of default content. `WhatsAppFab` and `HeroSection` take them as props.

### Run it

```
npm run admin:seed      # prints a generated password; re-run resets it
npm run dev
# open http://localhost:3000/admin   (3001 if 3000 is taken)
```

### Verify it

```
npx tsx admin/verify.ts               # 20 crypto/cookie assertions
npx tsx admin/integration.ts --write  # 12 checks against real D1
npx tsx admin/guard-check.ts          # 11 HTTP checks (needs dev server up)
```

All three pass. `tsc`, `eslint`, and `npm run build` are clean.

---

## Not done yet

1. **Image uploads** — blocked on R2 being enabled in the Cloudflare dashboard
   (`code: 10042`, "Please enable R2 through the Cloudflare Dashboard"). Planned
   slots: `hero_portrait`, `signature`, `og_image`, `favicon`. Needs an
   `r2_buckets` binding in wrangler.jsonc.
2. **Password change** — no UI; re-run `npm run admin:seed` to reset instead.
3. **Login rate limiting** — not implemented. PBKDF2 at 210k iterations makes
   each attempt expensive, but add Cloudflare WAF rules before going public.
4. **Production deploy** — never run. Needs the migration applied to remote D1
   and a pepper secret:

   ```
   npx wrangler d1 execute portfolio --file drizzle/0000_admin_auth.sql --remote
   npx wrangler secret put SESSION_TOKEN_PEPPER
   ```

---

## The goal

Manager can log in and edit site content without a developer: change the
WhatsApp number, swap images, update the signature. No RBAC — one login.

---

## Architecture decisions

- `admin/` holds all admin code; `src/` keeps the public site. Route files stay
  in `src/routes/admin/` because TanStack Router requires that location.
- **One `admin_user` table, one hardcoded role.** No tenants, no permissions
  table, no branches/departments.
- **Settings as key-value rows**, one row per group — not a single JSON blob.
  A group save is a single upsert, so concurrent edits cannot clobber.
- **One Zod schema per group**, TS types inferred from it, so the defaults and
  the validator cannot drift apart.
- Timestamps use `mode: 'timestamp_ms'` — see the bug note below.
- Sessions use sliding expiry (extended on use), 7-day TTL.

### Import-protection constraint

Route files are compiled into BOTH the client and server graphs, and TanStack
denies `@tanstack/react-start/server` to the client. So `beforeLoad` **cannot**
call `getRequest()` directly — the build fails with "Import denied in client
environment". Guards are therefore wrapped in `createServerFn` inside
`admin/server/guards.ts`, and route files reference the plain exported function.

Anything reaching D1 has the same restriction: `cloudflare:workers` is
server-only, so `admin/server/public.ts` may only be imported from inside a
server function, never from a route loader or a component.

---

## Bug found and fixed (worth remembering)

Expiry columns were declared `integer({ mode: 'timestamp' })`, which Drizzle
interprets as **seconds**, while the app writes `Date.now()` (**milliseconds**).
Drizzle read every `expires_at` back as a timestamp in the year **58722**, so
the `expiresAt <= now` check never fired and **expired sessions kept working**.

Fixed by switching to `'timestamp_ms'` throughout, with a comment on the column.
Caught by `admin/expiry-check.ts` — which is exactly why the guard is tested
against a real expired row rather than a fresh one.

---

## Reference: what to copy from bookade

Lives at `../bookade-reference` (moved out of this repo). Excluded from
tsconfig, since it maps its own `@/*` to a `src/` that does not exist here and
was adding ~300 phantom type errors.

**Same stack** — TanStack Start, Cloudflare, Drizzle, Zod, shadcn.

**Copied:**
- `server/auth/security.ts` — opaque random token, stored as
  `sha256(token + pepper)`, httpOnly cookie. (Ignore its `JWT_SECRET`; dead
  config, nothing reads it.)

**Deliberately NOT copied:**
- **RBAC** — `server/access/modulePolicies.ts` is 462 lines modelling
  multi-tenant SaaS (tenants, branches, departments, 20-operator row-level
  ABAC, 220-line contract tests). ~1,150 lines for access+auth+rbac+uploads.
  We need one boolean: "is this person logged in."
- **Local-disk uploads** — `server/modules/uploads/storage.ts` uses `node:fs`
  writing to `process.cwd()/"uploads"`. `node:fs` does not exist on workerd.
- **Client-side route guard** — `components/app/session-guard.tsx:26-36` bounces
  from a `useEffect`, so a logged-out visitor downloads the whole admin bundle
  before being redirected. Ours guards in `beforeLoad`.
- **Fail-open ability guard** — `crudFactory.helpers.ts:68-112` returns early
  (ALLOW) when a handler forgets to declare an ability. Ours throws.
- **Two settings shapes** — a loose `interface` for defaults plus a `.strict()`
  Zod for writes, already drifted: `branding.siteName` is rejected by the write
  path while the admin UI still posts it.
- **Media caching** — `getUploadContent` does a full `readFile` + DB SELECT per
  image with no `Cache-Control`/`ETag`.
- **Anonymous public upload** — `routes/api/public/uploads.tsx` lets any visitor
  upload a permanently world-readable file, IP rate limit only.

**Note:** bookade's admin is **not wired to its own storefront** —
`TopAnnouncementBar.tsx:8-14` hardcodes its announcements in a TS array. Good
reference for auth and module-policy shape, not for frontend wiring.

---

## Environment

- D1: `portfolio`, `database_id: 67c32cc5-7bad-49f0-92e5-d42a87603348`, APAC.
- `wrangler types` regenerates `worker-configuration.d.ts` after changing
  `wrangler.jsonc` (`npm run cf:types`).
- `better-sqlite3` has a native ABI mismatch with this Node build — that is why
  the integration suite shells out to `wrangler d1 execute` instead.

---

## Resume

`/opencode` → pick this session. Or start fresh with:
"read docs/ADMIN-PANEL-HANDOFF.md and continue the admin panel."