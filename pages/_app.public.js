// _app.js
import "/styles/globals.css";

import { MqttProvider } from "./mqtt/MqttContext";
import { mqttConfig } from "infra/mqttConfig";
import { ThemeProvider } from "./components/ThemeToggle";

export default function App({ Component, pageProps }) {
  return (
    <MqttProvider clientId={mqttConfig.clientId}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Component {...pageProps} cookies={pageProps.cookies} />
      </ThemeProvider>
    </MqttProvider>
  );
}
