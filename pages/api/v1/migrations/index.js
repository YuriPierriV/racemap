import database from "infra/database.js";
import migrationRunner from "node-pg-migrate";

export default async function migrations(request, response) {
  const migrations = await migrationRunner({
    databaseUrl: process.env.DATABASE_URL,
    dryRun: true,
    dir: "migrations",
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations"
  });

  response.status(200).json(migrations);
}

