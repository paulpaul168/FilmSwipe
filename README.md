# Filmswipe

Group movie nights made simple. Create a group, submit movies, swipe to rate, and see what everyone wants to watch.

## Tech Stack

- Next.js (App Router) + TypeScript
- PostgreSQL + Prisma
- Auth.js / NextAuth with Google OAuth
- Tailwind CSS

## Quick Start

### Local development

1. Copy env example and configure:

```bash
cd app
cp .env.example .env
```

Edit `.env` and set:

- `DATABASE_URL` – Postgres connection string (e.g. `postgresql://postgres:postgres@localhost:5432/filmswipe`)
- `NEXTAUTH_URL` – Must match how you access the app (e.g. `http://localhost:3000`). If you use a network IP like `http://192.168.1.114:3000`, set that instead.
- `NEXTAUTH_SECRET` – random string (e.g. `openssl rand -base64 32`)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` – from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

**Google OAuth setup:** In Google Cloud Console → Credentials → your OAuth 2.0 Client:
- **Authorized JavaScript origins:** Add your app URL (e.g. `http://localhost:3000` or `http://192.168.1.114:3000`)
- **Authorized redirect URIs:** Add `{your NEXTAUTH_URL}/api/auth/callback/google`

2. Start Postgres (e.g. via Docker):

```bash
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=filmswipe postgres:18-alpine
```

3. Run migrations and seed:

```bash
npm run db:migrate:dev
npm run db:seed
```

4. Start the app:

```bash
npm run dev
```

### Docker (self-hosted)

From the `app` directory:

```bash
cd app
cp .env.example .env
# Edit .env with GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET
docker compose up --build
```

The app will run at http://localhost:3000. Migrations run automatically on startup.

### Apache2 reverse proxy (HTTPS)

Run the app (e.g. on `localhost:3000`), then proxy and terminate SSL in Apache. NextAuth is configured with `trustHost: true` so it respects `X-Forwarded-*` headers.

1. **NEXTAUTH_URL** in `.env` must be the **public** URL users use, e.g. `https://filmswipe.paulhoeller.at`.
2. In Google OAuth, set **Authorized JavaScript origins** and **Authorized redirect URIs** to that same HTTPS URL (and `/api/auth/callback/google`).
3. Apache: redirect HTTP → HTTPS on port 80; on **port 443** proxy to the app and set `X-Forwarded-Proto` and `X-Forwarded-Host` (so NextAuth sees the real URL). Do not put those headers on the port 80 vhost.

Example site config (e.g. `/etc/apache2/sites-available/filmswipe.conf`):

```apache
# Redirect HTTP to HTTPS
<VirtualHost *:80>
    ServerName filmswipe.paulhoeller.at
    Redirect permanent / https://filmswipe.paulhoeller.at/
</VirtualHost>

<VirtualHost *:443>
    ServerName filmswipe.paulhoeller.at
    SSLEngine on
    # SSLCertificateFile /path/to/fullchain.pem
    # SSLCertificateKeyFile /path/to/privkey.pem

    ProxyPreserveHost On
    RequestHeader set X-Forwarded-Proto "https"
    RequestHeader set X-Forwarded-Host "filmswipe.paulhoeller.at"

    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/
</VirtualHost>
```

Enable mods: `a2enmod ssl proxy proxy_http headers`, then `systemctl reload apache2`. Ensure the app is bound to the same port (e.g. 3000) that `ProxyPass` uses.

## Scripts

| Script | Description |
|--------|-------------|
| `dev` | Start dev server |
| `build` | Production build |
| `start` | Start production server |
| `lint` | Run ESLint |
| `typecheck` | Run TypeScript check |
| `test` | Run Vitest tests |
| `db:migrate` | Deploy migrations (production) |
| `db:migrate:dev` | Create/apply migrations (development) |
| `db:seed` | Seed demo data |

## Environment Variables

| Variable | Description |
|---------|-------------|
| `DATABASE_URL` | PostgreSQL connection URL |
| `NEXTAUTH_URL` | App URL (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Secret for session encryption |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

## License

See [LICENSE](LICENSE).
