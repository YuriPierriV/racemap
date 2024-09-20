import database from "infra/database.js";
import { connectUrl, options } from 'infra/mqttConfig.js'; // Ajuste o caminho conforme necessário
import mqtt from 'mqtt';

async function status(request, response) {
  const updatedAt = new Date().toISOString(); // Hora atual com ISO Z

  // Consulta para obter a versão do banco de dados
  const sql_script = "SHOW server_version;";
  const sql = await database.query(sql_script);
  const version = sql.rows[0].server_version;

  // Consulta para obter conexões máximas
  const maxConnectionsResult = await database.query("SHOW max_connections;");
  const maxConnections = maxConnectionsResult.rows[0].max_connections;

  // Contar conexões ativas
  const connectionsResult = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [process.env.POSTGRES_DB],
  });
  const connections = connectionsResult.rows[0].count;

  // Conectar ao cliente MQTT
  const mqttClient = mqtt.connect(connectUrl, options);
  let mqttConnection = false;

  mqttClient.on('connect', () => {
    mqttConnection = true;
  });

  mqttClient.on('error', (err) => {
    mqttConnection = false;
    console.error('MQTT connection error:', err);
  });

  // Aguardar um tempo para garantir que a conexão foi estabelecida ou não
  await new Promise((resolve) => {
    mqttClient.on('connect', () => resolve());
    mqttClient.on('error', () => resolve());
  });

  // Fechar a conexão MQTT ao final do processamento
  mqttClient.end();

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: version,
        max_connections: parseInt(maxConnections),
        connections: parseInt(connections),
      },
      hive_mq: {
        connection: mqttConnection,
      },
    },
  });
}

export default status;
