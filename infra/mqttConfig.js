// mqttConfig.js
const mqttConfig = {
  host: process.env.NEXT_PUBLIC_HIVEMQ_HOST,
  port: process.env.NEXT_PUBLIC_HIVEMQ_PORT,
  protocol: "wss",
  topic: "kart",
  qos: 2,
  clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
  username: process.env.NEXT_PUBLIC_HIVEMQ_USERNAME,
  password: process.env.NEXT_PUBLIC_HIVEMQ_PASSWORD,
  keepAlive: 60,
};

const connectUrl = `${mqttConfig.protocol}://${mqttConfig.host}:${mqttConfig.port}/mqtt`;

const options = {
  clientId: mqttConfig.clientId,
  clean: true,
  username: mqttConfig.username,
  password: mqttConfig.password,
};

export { mqttConfig, connectUrl, options };
