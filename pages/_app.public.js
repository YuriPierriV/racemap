// _app.js
import "/styles/globals.css";

import { MqttProvider } from "./mqtt/MqttContext";
import { mqttConfig } from "infra/mqttConfig";

export default function App({ Component, pageProps }) {
  return (
    <MqttProvider clientId={mqttConfig.clientId}>
      <Component {...pageProps} />
    </MqttProvider>
  );
}
