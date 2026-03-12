# Filmswipe

Group movie nights made simple. Create a group, submit movies, swipe to rate, and see what everyone wants to watch.

## Features

- **Groups** -- create or join via invite link
- **Movie submissions** -- search by title with IMDb metadata auto-fill
- **Swipe to rate** -- like, super-like, or pass on each movie
- **Rankings** -- aggregated scores so the group can pick a winner

<p align="center">
  <img src="screenshots/login.png" width="24%" alt="Login" />
  <img src="screenshots/movies.png" width="24%" alt="Movies" />
  <img src="screenshots/swipe.png" width="24%" alt="Swipe" />
  <img src="screenshots/ranking.png" width="24%" alt="Ranking" />
</p>

## Tech Stack

- Next.js (App Router) + TypeScript
- PostgreSQL + Prisma
- NextAuth / Auth.js with Google OAuth
- Tailwind CSS

## Quick Start

All commands below run from the `app/` directory.

### 1. Configure environment

```bash
cd app
cp .env.example .env
```

Edit `.env`:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Postgres connection string (default works with the Docker command below) |
| `NEXTAUTH_URL` | URL you access the app at, e.g. `http://localhost:3000` |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | From [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `GOOGLE_CLIENT_SECRET` | Same as above |

**Google OAuth setup** -- in Cloud Console → Credentials → your OAuth 2.0 Client:

- **Authorized JavaScript origins:** your app URL (e.g. `http://localhost:3000`)
- **Authorized redirect URIs:** `<NEXTAUTH_URL>/api/auth/callback/google`

### 2. Local development

```bash
# Start Postgres
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=filmswipe postgres:18-alpine

# Install, migrate, seed, run
npm install
npm run db:migrate:dev
npm run db:seed
npm run dev
```

The app will be available at http://localhost:3000.

### 3. Docker (self-hosted)

```bash
cd app
cp .env.example .env
# fill in GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET
docker compose up --build
```

Migrations run automatically on startup. The app will be at http://localhost:3000.

### Changing the Postgres password

The default password is `postgres` -- fine for local development, but **change it for any real deployment**. The password appears in three places that must stay in sync:

| File | What to change |
|------|---------------|
| `.env` | The password in the `DATABASE_URL` connection string |
| `docker-compose.yml` | `POSTGRES_PASSWORD` under the `db` service |
| `docker-compose.yml` | The password in `DATABASE_URL` under the `app` service |

For example, if you pick `s3cret` as the new password:

```
# .env
DATABASE_URL="postgresql://postgres:s3cret@localhost:5432/filmswipe"

# docker-compose.yml  →  db service
POSTGRES_PASSWORD: s3cret

# docker-compose.yml  →  app service
DATABASE_URL: postgresql://postgres:s3cret@db:5432/filmswipe
```

## Reverse Proxy (HTTPS)

If you deploy behind a reverse proxy, two things must match:

1. **`NEXTAUTH_URL`** in `.env` must be the public URL (e.g. `https://filmswipe.example.com`).
2. **Google OAuth** origins and redirect URIs must use that same URL.

NextAuth is configured with `trustHost: true` so it respects `X-Forwarded-*` headers from the proxy.

### Nginx

```nginx
server {
    listen 80;
    server_name filmswipe.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name filmswipe.example.com;

    ssl_certificate     /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host  $host;
    }
}
```

### Apache

```apache
<VirtualHost *:80>
    ServerName filmswipe.example.com
    Redirect permanent / https://filmswipe.example.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName filmswipe.example.com
    SSLEngine on
    SSLCertificateFile    /path/to/fullchain.pem
    SSLCertificateKeyFile /path/to/privkey.pem

    ProxyPreserveHost On
    RequestHeader set X-Forwarded-Proto "https"
    RequestHeader set X-Forwarded-Host  "filmswipe.example.com"

    ProxyPass        / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/
</VirtualHost>
```

Enable modules: `a2enmod ssl proxy proxy_http headers`, then `systemctl reload apache2`.

## Continuous Deployment (CD)

On every push to `main`, after CI passes, the app is deployed to your server via SSH. You need **two** SSH keys: one so GitHub Actions can SSH into the server, and one (a GitHub **deploy key**) so the server can `git pull` from GitHub.

### One-time server setup

1. **GitHub deploy key (so the server can pull)** — On the server, create a key for GitHub and add it as a deploy key in the repo:

   ```bash
   # On the server
   ssh-keygen -t ed25519 -C "filmswipe-deploy" -f ~/.ssh/github_filmswipe_deploy -N ""
   cat ~/.ssh/github_filmswipe_deploy.pub
   ```

   In GitHub: repo **Settings → Deploy keys → Add deploy key**. Paste the public key; enable **Allow read access** (enough for pull). Title e.g. `FilmSwipe server`.

   Tell git on the server to use this key for GitHub:

   ```bash
   # On the server: ~/.ssh/config
   Host github.com
     IdentityFile ~/.ssh/github_filmswipe_deploy
     IdentitiesOnly yes
   ```

2. **Clone the repo** on the server (use the SSH URL so the deploy key is used):

   ```bash
   git clone git@github.com:YOUR_USERNAME/FilmSwipe.git /opt/FilmSwipe
   cd /opt/FilmSwipe/app
   ```

3. **Configure environment** and start once with Docker:

   ```bash
   cp .env.example .env
   # Edit .env: DATABASE_URL, NEXTAUTH_*, GOOGLE_*
   docker compose up -d --build
   ```

4. **SSH access for GitHub Actions**: Create a *different* SSH key pair so the workflow can log into the server. On your machine:

   ```bash
   ssh-keygen -t ed25519 -C "github-actions-deploy" -f deploy_key -N ""
   ```

   - Add the **public** key to the server so the runner can log in:

     ```bash
     # On the server, append deploy_key.pub to authorized_keys
     cat deploy_key.pub >> ~/.ssh/authorized_keys
     ```

   - You will add the **private** key as a GitHub secret in the next step.

### GitHub repository secrets

In the repo: **Settings → Secrets and variables → Actions**, add:

| Secret            | Description |
|-------------------|-------------|
| `SSH_HOST`        | Server hostname or IP (e.g. `filmswipe.example.com` or `192.168.1.10`) |
| `SSH_USER`        | SSH username on the server (e.g. `deploy` or `ubuntu`) |
| `SSH_PRIVATE_KEY` | Full contents of the **private** key file (e.g. `deploy_key`) |
| `DEPLOY_PATH`     | Path on the server where the repo is cloned (e.g. `/opt/FilmSwipe`) |
| `SSH_PORT`        | Optional. SSH port if not 22 (e.g. `2222`) |

After that, every push to `main` will run CI and then deploy: the workflow SSHs into the server, runs `git pull` in the repo, then `docker compose up -d --build` in `app/`.

## Scripts

All scripts are run from the `app/` directory with `npm run <script>`.

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

## Contributing

1. Fork the repo and create a feature branch from `main`.
2. Install dependencies and make sure everything passes before you start:

```bash
cd app
npm install
npm run lint
npm run typecheck
npm test -- --run
```

3. Make your changes, then verify lint, typecheck, and tests still pass.
4. Open a pull request against `main` with a clear description of what you changed and why.

## License

[MIT](LICENSE)
