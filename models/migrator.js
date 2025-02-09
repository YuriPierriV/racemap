import { join } from "node:path";
import migrationRunner from "node-pg-migrate";

import database from "infra/database";

const defaultMigrationOptions = {

    dir: join(process.cwd(), "infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
}

async function listPendingMigrations() {
    let dbClient;
    try {
        dbClient = await database.getNewClient();
        const pendingMigrations = await migrationRunner({
            ...defaultMigrationOptions,
            dbClient: dbClient,
            dryRun: true
        });
        return pendingMigrations
    } finally {
        await dbClient?.end();
    }
}

async function runPendingMigrations() {
    let dbClient;

    try {
        dbClient = await database.getNewClient();

        const migratedMigrations = await migrationRunner({
            ...defaultMigrationOptions,
            dbClient: dbClient,
            dryRun: false,
        });

        return migratedMigrations
    } finally {
        await dbClient?.end();
    }
}

const migrator = {
    listPendingMigrations,
    runPendingMigrations
}

export default migrator