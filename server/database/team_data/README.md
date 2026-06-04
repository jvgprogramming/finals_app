# Team database snapshot

This folder contains a MySQL dump of the shared development database (`nikayPastry`).

After pulling the repo, import it once (see [TEAM_SETUP.md](../../../TEAM_SETUP.md) at the project root).

To refresh the dump before pushing updates for your team:

```bash
# Windows (XAMPP MySQL on port 3307 — adjust if needed)
/c/xampp/mysql/bin/mysqldump -h 127.0.0.1 -P 3307 -u root nikayPastry > server/database/team_data/nikayPastry.sql
```

Then commit `nikayPastry.sql` and any new files under `server/storage/app/public/products/`.
