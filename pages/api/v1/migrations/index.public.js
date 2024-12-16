import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";

export default async function migrations(request, response) {
  const dbClient = await database.getNewClient();
  console.log("teste");
  if (request.method === "GET") {
    const pendingMigrations = await migrationRunner({
      dbClient: dbClient,
      dryRun: true,
      dir: join(process.cwd(), "infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    });
    await dbClient.end();
    return response.status(200).json(pendingMigrations);
  }
  if (request.method === "POST") {
    const migratedMigrations = await migrationRunner({
      dbClient: dbClient,
      dryRun: false,
      dir: join(process.cwd(), "infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    });

    await dbClient.end();
    if (migratedMigrations.length > 0) {
      return response.status(201).json(migratedMigrations);
    }

    return response.status(200).json(migratedMigrations);
  }
  return response.status(405);
}
