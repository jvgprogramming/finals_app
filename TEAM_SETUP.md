# Team setup (database + product photos)

The repo includes a **MySQL dump** and **product images** so everyone gets the same menu data after cloning.

## Prerequisites

- PHP 8.2+, Composer
- Node.js 18+
- MySQL (e.g. XAMPP) — default dump assumes **port `3307`** and database name **`nikayPastry`**

## 1. Clone and install

```bash
git clone <repo-url>
cd finals_app

cd server && composer install && cp .env.example .env
php artisan key:generate
php artisan storage:link

cd ../client && npm install
```

## 2. Configure `.env`

Edit `server/.env`:

- Set `DB_PORT`, `DB_USERNAME`, and `DB_PASSWORD` to match **your** local MySQL.
- Keep `DB_DATABASE=nikayPastry` (or create that database name).

Create the empty database in MySQL Workbench or CLI:

```sql
CREATE DATABASE IF NOT EXISTS nikayPastry CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 3. Import the shared database

**Windows (XAMPP):**

```bash
/c/xampp/mysql/bin/mysql -h 127.0.0.1 -P 3307 -u root nikayPastry < server/database/team_data/nikayPastry.sql
```

**macOS / Linux:**

```bash
mysql -h 127.0.0.1 -P 3307 -u root -p nikayPastry < server/database/team_data/nikayPastry.sql
```

Adjust host, port, and user for your machine.

## 4. Product images

Images are committed under `server/storage/app/public/products/`.

After `php artisan storage:link`, they are served at `/storage/products/...`.

You do **not** need to copy files manually if you pulled the latest repo.

## 5. Run the app

```bash
# Terminal 1 — API
cd server && php artisan serve

# Terminal 2 — frontend
cd client && npm run dev
```

Set `client/.env` (or Vite env) if needed:

```
VITE_API_URL=http://localhost:8000/api
```

## Updating data for the team

When you add products or change the DB locally:

1. Re-export: see `server/database/team_data/README.md`
2. Commit `nikayPastry.sql` and any new images in `server/storage/app/public/products/`
3. Push — teammates pull and re-import the SQL file (or use a fresh DB import)

**Note:** Re-importing replaces local DB contents for `nikayPastry`. Back up first if you have local-only changes.
