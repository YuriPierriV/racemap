import database from "infra/database.js";
import migrationRunner from "node-pg-migrate";

export default async function migrations(request, response) {
  if (request.method === 'GET') {
    const pendingMigrations = await migrationRunner({
      databaseUrl: process.env.DATABASE_URL,
      dryRun: true,
      dir: "migrations",
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations"
    });

    return response.status(200).json(pendingMigrations);
  }
  if (request.method === 'POST') {
    const migratedMigrations = await migrationRunner({
      databaseUrl: process.env.DATABASE_URL,
      dryRun: false,
      dir: "migrations",
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations"
    });

    if (migratedMigrations.length > 0) {
      return response.status(201).json(migratedMigrations);
    }

    return response.status(200).json(migratedMigrations);
  }
  return response.status(405);
}

