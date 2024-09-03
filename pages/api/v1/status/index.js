import database from "infra/database.js"

async function status(request, response) {
  const updatedAt = new Date().toISOString(); // Hora atual com ISO Z

  const sql_script = "SHOW server_version;"; //script que puxa a versão
  const sql = await database.query(sql_script); // roda a query
  const version = sql.rows[0].server_version;

  const maxConectionsResult = await database.query("SHOW max_connections;");//script para saber conexões maximas do bd
  const maxConections = maxConectionsResult.rows[0].max_connections;

  const connectionsResult = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [process.env.POSTGRES_DB]
  });
  const connections = connectionsResult.rows[0].count;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: version,
        max_connections: parseInt(maxConections),
        connections: parseInt(connections),
      }
    }
  });
}

export default status