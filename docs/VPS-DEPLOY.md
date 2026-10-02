# VPS Deployment

The site runs on a plain Node server (not Cloudflare). This doc covers deploying
it to a Linux VPS with nginx in front.

---

## Why not Cloudflare

The app was originally a Cloudflare Workers project. That had to change:

- **Uploads were impossible.** The Workers runtime (workerd) has no writable
  filesystem. Verified directly — `node:fs` resolves at build time but throws
  `"[unenv] fs.writeFile is not implemented yet!"` at runtime. Manager-uploaded
  images need a real disk.
- **D1 is Cloudflare-only.** A VPS has no access to it, so the database moved to
  a SQLite file via `better-sqlite3` (already a dependency; it only needed
  `npm rebuild` for this Node ABI).

`@cloudflare/vite-plugin` was removed from `vite.config.ts` and `wrangler.jsonc`
is no longer used for deployment.

---

## Environment variables

Set these on the server. `SESSION_TOKEN_PEPPER` has **no default in production**
— the server throws on boot without it, because a shared or committed pepper
would let anyone with a database dump forge valid sessions.

| Variable | Required | Notes |
|---|---|---|
| `SESSION_TOKEN_PEPPER` | **yes** | Long random string. Generate with `openssl rand -hex 32`. Changing it logs everyone out. |
| `DATABASE_FILE` | recommended | Absolute path, e.g. `/var/lib/portfolio/portfolio.db`. Defaults to `./data/portfolio.db`. |
| `UPLOADS_DIR` | optional | Defaults to `public/uploads`. Point elsewhere if the deploy directory is read-only. |
| `UPLOADS_URL_PREFIX` | optional | Defaults to `/uploads`. Only change if the web root differs. |
| `NODE_ENV` | recommended | `production` — enables strict checks and hides dev error detail. |
| `PORT` | optional | Defaults to 3000. |

---

## Build and run

```bash
npm ci
npm run build
npm run admin:seed          # prints a generated password; save it
```

`npm run build` emits `dist/`. `server.mjs` is the Node entrypoint:

```bash
npm start                   # node server.mjs
```

**Why there is a `server.mjs`:** `vite build` emits
`dist/server/server.js`, which exports a standard `{ fetch(request): Response }`
handler. The installed TanStack Start has no built-in node-server entrypoint
(`@tanstack/react-start` ships `./server-entry`, a Worker-style export, but no
`/node-server` subpath), so `server.mjs` adapts Node's
`IncomingMessage`/`ServerResponse` to Web `Request`/`Response`. Node 18+ has
native `fetch`, so the adapter is small.

### Uploads are served from the source tree, not the build

`server.mjs` serves `/uploads/*` from `public/uploads/` rather than
`dist/client/`. This matters: Vite copies `public/` into the build **at build
time**, so an upload written after the build would 404. Reading from the source
directory means a manager's upload is live immediately, with no rebuild.

Consequence for deploys: `public/uploads/` and `data/` must survive a deploy.
Don't `rm -rf` the checkout — pull over the top, or keep them outside the deploy
directory and point `DATABASE_FILE` / `UPLOADS_DIR` at them.

---

## systemd unit

`/etc/systemd/system/portfolio.service`:

```ini
[Unit]
Description=Portfolio site
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/srv/portfolio
EnvironmentFile=/srv/portfolio/.env
ExecStart=/usr/bin/node server.mjs
Restart=always
RestartSec=5

# Hardening
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=/srv/portfolio/data /srv/portfolio/public/uploads

[Install]
WantedBy=multi-user.target
```

Then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now portfolio
sudo systemctl status portfolio
```

`ReadWritePaths` is the important line: `ProtectSystem=strict` makes the whole
filesystem read-only except those two directories, which is exactly the set the
app needs to write.

---

## nginx

nginx does **not** need to serve static files — `server.mjs` handles those and
SSR itself. A plain reverse proxy is enough, which avoids keeping two static
roots in sync (and the stale-`dist/client/uploads` trap described above).

```nginx
server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # Must exceed the 5 MB upload cap, or nginx rejects with 413 before the
    # app ever sees the request. nginx's default is 1 MB.
    client_max_body_size 6m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Backups

Two things hold state, and both need backing up:

```bash
# Database (WAL mode — use .backup so a copy is consistent)
sqlite3 /var/lib/portfolio/portfolio.db ".backup '/backup/portfolio-$(date +%F).db'"

# Uploaded images
tar czf /backup/uploads-$(date +%F).tar.gz -C /srv/portfolio/public uploads
```

The `.backup` command matters: copying the `.db` file while the server is running
can capture a torn write in WAL mode.

---

## Updating

```bash
cd /srv/portfolio
git pull
npm ci
npm run build
sudo systemctl restart portfolio
```

Schema changes apply themselves on first database access (`ensureSchemaOn` in
`src/db/index.ts`), so there is no separate migration step to forget.

---

## Local development

```bash
npm run dev                  # http://localhost:3000
npm run admin:seed           # create/reset the admin login
npm test                     # all four verification suites
```

Individual suites:

```
npm run test:verify    crypto + cookie assertions
npm run test:db        database integration (writes)
npm run test:guard     HTTP auth guards  (needs dev server running)
npm run test:upload    image upload path  (needs dev server running)
```

`test:guard` and `test:upload` expect the dev server on port 3000; set
`BASE_URL` to point elsewhere.

---

## Things that are deliberately not implemented

- **Login rate limiting.** PBKDF2 at 210k iterations makes each attempt
  expensive, but for an internet-facing admin panel add fail2ban or an nginx
  `limit_req` zone on the login route.
- **Password change UI.** Re-run `npm run admin:seed` to reset.
- **Audit log.** Only `updated_by` on settings and media rows records who
  changed what, with no history.