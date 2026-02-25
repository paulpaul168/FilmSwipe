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
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=filmswipe postgres:16-alpine
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
