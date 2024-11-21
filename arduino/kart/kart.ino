#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <TinyGPS++.h>
#include <EEPROM.h>
#include <ESP8266WebServer.h>
#include <DNSServer.h>
#include <ArduinoJson.h>

// Configurações do Wi-Fi dinâmico
#define EEPROM_SIZE 200
#define WIFI_AP_SSID "ConfigWiFi"
#define WIFI_AP_PASSWORD ""
#define MAX_NETWORKS 2

ESP8266WebServer server(80);
DNSServer dnsServer;

struct Network {
  char ssid[32];
  char password[64];
};

Network networks[MAX_NETWORKS];
String connectedSSID = "";

// Variáveis globais para botão e modo AP
#define BUTTON_PIN D6
#define BUTTON_HOLD_TIME 3000
unsigned long apModeStartTime = 0;            // Marca o momento em que o AP foi ativado
const unsigned long apModeDuration = 120000;  // Duração do modo AP em milissegundos (2 minutos)

unsigned long buttonPressStart = 0;
bool buttonHeld = false;
bool apModeEnabled = false;
bool wifiConnected = false;  // Indica se o Wi-Fi está conectado


// Configuração do MQTT e GPS
TinyGPSPlus gps;

const int ppsPin = 14;  // GPIO14 (D5)
volatile unsigned long ppsCounter = 0;

const char* mqtt_server = "5d9db2e1dddd44ddb1f65079e8bb21e0.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;

String clientId = String(ESP.getChipId(), HEX);  // Utiliza o Chip ID diretamente
//clientId.toLowerCase(); // Garante que o ID esteja em letras minúsculas
WiFiClientSecure espClient;
PubSubClient client(espClient);
int modeKart = 1;
int availableNetworks = 0;

// Tópicos MQTT
String mqtt_topic_write = "webserver/" + clientId;
String mqtt_topic_read = "kart/" + clientId;


// Usuário e senha do MQTT
const char* mqtt_username = "kartserver";
const char* mqtt_password = "Kartserver123";

// Comandos UBX para taxa de atualização do GPS
unsigned char setRateTo20Hz[] = {0xB5, 0x62, 0x06, 0x08, 0x06, 0x00,  0x32, 0x00,  0x01, 0x00,  0x01, 0x00,  0x48, 0xE6};
unsigned char setRateTo10Hz[] = { 0xB5, 0x62, 0x06, 0x08, 0x06, 0x00, 0x64, 0x00, 0x01, 0x00, 0x01, 0x00, 0x7A, 0x12 };
unsigned char setRateTo1Hz[] = { 0xB5, 0x62, 0x06, 0x08, 0x06, 0x00, 0xE8, 0x03, 0x01, 0x00, 0x01, 0x00, 0x01, 0x39 };
unsigned long lastMQTTCheck = 0;
unsigned long mqttInterval = 1000; // Intervalo para processar MQTT (em milissegundos)


// Salvar redes na EEPROM
void saveNetworks() {
  for (int i = 0; i < MAX_NETWORKS; i++) {
    EEPROM.put(i * sizeof(Network), networks[i]);
  }
  EEPROM.commit();
  Serial.println("Redes salvas na EEPROM.");
}

// Carregar redes da EEPROM
void loadNetworks() {
  for (int i = 0; i < MAX_NETWORKS; i++) {
    EEPROM.get(i * sizeof(Network), networks[i]);
    Serial.print("SSID carregado: ");
    Serial.println(networks[i].ssid);
    Serial.print("Senha carregada: ");
    Serial.println(networks[i].password);
  }
}

// Limpar redes salvas na EEPROM
void clearNetworks() {
  for (int i = 0; i < MAX_NETWORKS; i++) {
    memset(networks[i].ssid, 0, sizeof(networks[i].ssid));
    memset(networks[i].password, 0, sizeof(networks[i].password));
  }
  saveNetworks();
  Serial.println("Redes apagadas.");
}

void scanNetworks() {
  // Suponha que você faz a varredura aqui e preenche o array `networks`
  availableNetworks = 0;  // Sempre resetar para evitar contagem incorreta

  // Exemplo de preenchimento das redes (isso depende da sua lógica):
  for (int i = 0; i < MAX_NETWORKS; i++) {  // Aqui o limite é o tamanho do array
    if (strlen(networks[i].ssid) > 0) {
      availableNetworks++;  // Incrementa quando uma rede válida é adicionada
    }
  }
}

// Verificar se existe pelo menos uma rede salva
bool isNetworkSaved() {
  for (int i = 0; i < MAX_NETWORKS; i++) {
    if (strlen(networks[i].ssid) > 0) {
      return true;
    }
  }
  return false;
}

void addNetwork(const String& ssid, const String& password) {
  for (int i = 0; i < MAX_NETWORKS; i++) {
    if (strcmp(networks[i].ssid, ssid.c_str()) == 0) {
      // Atualiza a senha da rede existente
      strncpy(networks[i].password, password.c_str(), sizeof(networks[i].password));
      saveNetworks();
      Serial.println("Rede já existente atualizada: " + ssid);
      return;
    }
  }

  // Adiciona a rede em uma posição vazia
  for (int i = 0; i < MAX_NETWORKS; i++) {
    if (strlen(networks[i].ssid) == 0) {  // Verifica se o slot está vazio
      strncpy(networks[i].ssid, ssid.c_str(), sizeof(networks[i].ssid));
      strncpy(networks[i].password, password.c_str(), sizeof(networks[i].password));
      saveNetworks();
      Serial.println("Nova rede adicionada: " + ssid);
      return;
    }
  }

  // Substitui a rede mais antiga se o limite foi atingido (FIFO)
  for (int i = 0; i < MAX_NETWORKS - 1; i++) {
    networks[i] = networks[i + 1];  // Move as redes
  }
  strncpy(networks[MAX_NETWORKS - 1].ssid, ssid.c_str(), sizeof(networks[MAX_NETWORKS - 1].ssid));
  strncpy(networks[MAX_NETWORKS - 1].password, password.c_str(), sizeof(networks[MAX_NETWORKS - 1].password));
  saveNetworks();
  Serial.println("Rede mais antiga substituída. Nova rede adicionada: " + ssid);
}

// Conectar às redes salvas
bool connectToSavedNetworks() {
  bool connectionAttempted = false;  // Marca se alguma rede foi tentada
  for (int i = 0; i < MAX_NETWORKS; i++) {
    Serial.print("Tentando conectar a: ");
    Serial.print(networks[i].ssid);
    Serial.print(" (índice: ");
    Serial.print(i);
    Serial.println(")");
    if (strlen(networks[i].ssid) > 0) {  // Verifica se a rede está configurada
      connectionAttempted = true;
      Serial.print("Tentando conectar a: ");
      Serial.println(networks[i].ssid);

      WiFi.begin(networks[i].ssid, networks[i].password);  // Tenta conectar

      unsigned long startAttemptTime = millis();
      while (WiFi.status() != WL_CONNECTED && (millis() - startAttemptTime) < 15000) {  // Espera 15 segundos
        delay(500);
        Serial.print(".");

        // Verifica se o botão foi pressionado
        if (digitalRead(BUTTON_PIN) == LOW) {
          unsigned long pressStart = millis();
          while (digitalRead(BUTTON_PIN) == LOW) {
            if (millis() - pressStart >= BUTTON_HOLD_TIME) {  // Botão pressionado por tempo suficiente
              Serial.println("\nBotão pressionado. Interrompendo tentativa de conexão e iniciando modo AP.");
              startAPMode();
              return false;  // Sai da função para ativar o modo AP
            }
          }
        }
      }

      if (WiFi.status() == WL_CONNECTED) {
        connectedSSID = networks[i].ssid;
        wifiConnected = true;
        Serial.println("\nConectado com sucesso!");
        Serial.print("Conectado à rede: ");
        Serial.println(connectedSSID);
        Serial.print("IP do dispositivo: ");
        Serial.println(WiFi.localIP());
        return true;  // Conexão bem-sucedida
      } else {
        Serial.println("\nFalha ao conectar à rede: " + String(networks[i].ssid));
      }
    }
  }

  if (!connectionAttempted) {
    Serial.println("Nenhuma rede salva.");
  } else {
    Serial.println("Falha ao conectar a todas as redes salvas.");
  }

  return false;  // Retorna falha se nenhuma rede foi bem-sucedida
}


// Iniciar modo Access Point
void startAPMode() {
  if (apModeEnabled) {
    return;  // Evita ativar o modo AP novamente
  }

  Serial.println("Desconectando de qualquer rede WiFi anterior...");
  WiFi.disconnect();
  delay(1000);  // Pequeno delay para garantir que a desconexão foi concluída

  Serial.println("Configurando o modo AP...");
  WiFi.mode(WIFI_AP_STA);  // Define o ESP como AP e STA (Cliente WiFi)
  if (WiFi.softAP(WIFI_AP_SSID, WIFI_AP_PASSWORD)) {
    dnsServer.start(53, "*", WiFi.softAPIP());  // Inicia o servidor DNS
    apModeEnabled = true;                       // Marca o modo AP como ativo
    apModeStartTime = millis();
    Serial.print("Modo AP iniciado com sucesso. SSID: ");
    Serial.println(WIFI_AP_SSID);
    Serial.print("Endereço IP: ");
    Serial.println(WiFi.softAPIP());  // Exibe o IP do AP
  } else {
    Serial.println("Falha ao iniciar o modo AP.");
  }
}

void offAPMode() {
  if (!apModeEnabled) {
    Serial.println("O modo AP já está desativado.");
    return;  // Evita tentar desativar o modo AP se ele já está desligado
  }

  Serial.println("Desativando o modo AP...");
  WiFi.softAPdisconnect(true);  // Desativa o modo AP
  dnsServer.stop();             // Para o servidor DNS, se estiver em execução
  apModeEnabled = false;        // Marca o modo AP como inativo

  // Configura o ESP para o modo padrão STA (Cliente WiFi)
  WiFi.mode(WIFI_STA);

  Serial.println("Modo AP desativado com sucesso.");
}



// Monitorar botão
void monitorButton() {
  static bool buttonPressed = false;
  static unsigned long pressStartTime = 0;

  if (digitalRead(BUTTON_PIN) == LOW) {  // Botão pressionado
    if (!buttonPressed) {
      buttonPressed = true;
      pressStartTime = millis();                                 // Marca o tempo de início da pressão
    } else if (millis() - pressStartTime >= BUTTON_HOLD_TIME) {  // Botão pressionado por mais de 3 segundos
      if (!apModeEnabled) {
        Serial.println("Botão pressionado por 3 segundos. Iniciando modo AP...");
        startAPMode();  // Ativa o modo AP
        buttonPressed = false;
      }
    }
  } else {
    buttonPressed = false;  // Botão solto
  }
}
// Configurar servidor web
void setupWebServer() {
  // Página inicial para configurar Wi-Fi
  server.on("/", HTTP_GET, []() {
    String html = R"rawliteral(
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #121212; color: #fff; margin: 0; }
          .container { width: 80vw; background-color: #1f1f1f; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); padding: 20px; text-align: center; }
          .logo { font-size: 3em; font-weight: bold; color: #ff5722; margin-bottom: 15px; }
          .subtitle { color: #b0b0b0; margin-bottom: 20px; font-size: 2.1em; }
          .status { display: flex; align-items: center; justify-content: center; margin-bottom: 20px; font-size: 2em; }
          .status-icon { width: 12px; height: 12px; background-color: #00e676; border-radius: 50%; margin-right: 8px; }
          .button, .input, .submit-button { 
            width: 100%; 
            padding: 12px; 
            margin: 10px 0; 
            background-color: #333; 
            border: none; 
            border-radius: 5px; 
            color: #fff; 
            font-size: 1.8em; 
          }
          .button:hover { background-color: #444; }
          .input option { background-color: #333; color: #fff; padding: 10px; }
          .input:focus { outline: none; box-shadow: 0 0 10px rgba(255, 87, 34, 0.5); }
          .input::placeholder { color: #aaa; }
          .submit-button { background-color: #ff5722; cursor: pointer; }
          .submit-button:hover { background-color: #ff7043; }
          .footer { margin-top: 20px; font-size: 1.8em; color: #888; }
          #error-message {
            color: red; 
            display: none; 
            margin-top: 15px; 
            font-size: 1.5em; /* Aumenta o tamanho da fonte */
            font-weight: bold; /* Torna o texto mais destacado */
          }
        </style>
      </head>
      <body onload="loadWifiList()">
        <div class="container">
          <div class="logo">RaceMap</div>
          <div class="subtitle">Configurar Wi-Fi do GPS</div>
          <div class="status" id="status">
            <div class="status-icon" id="status-icon"></div> 
            <span id="status-text">Pronto</span>
          </div>
          <button class="button" onclick="loadWifiList()">Recarregar Redes</button>
          <select class="input" id="wifi-list">
            <option disabled selected>Selecionar Wi-Fi</option>
          </select>
          <input type="password" class="input" placeholder="Senha do Wi-Fi" id="wifi-password">
          <button class="submit-button" onclick="submitWifi()">Conectar</button>
          <div id="error-message">Senha incorreta ou rede indisponível. Tente novamente.</div>
          <div class="footer">RaceMap</div>
        </div>
        <script>
          function loadWifiList() { 
            const wifiList = document.getElementById("wifi-list");
            wifiList.innerHTML = '<option disabled>Carregando redes...</option>';
            fetch('/listwifi')
              .then(response => response.json())
              .then(networks => {
                wifiList.innerHTML = '<option disabled selected>Selecionar Wi-Fi</option>';
                networks.forEach(network => {
                  const option = document.createElement('option');
                  option.value = network;
                  option.textContent = network;
                  wifiList.appendChild(option);
                });
              })
              .catch(error => {
                console.error('Erro ao carregar redes:', error);
                wifiList.innerHTML = '<option disabled>Erro ao carregar redes</option>';
              });
          }

          function submitWifi() { 
            const ssid = document.getElementById("wifi-list").value;
            const password = document.getElementById("wifi-password").value;
            document.getElementById('status-text').textContent = 'Conectando...';
            document.getElementById('status-icon').style.backgroundColor = '#FFEB3B'; // Amarelo (conectando)
            fetch(`/connectwifi?ssid=${ssid}&password=${password}`)
              .then(response => response.text())
              .then(data => {
                if (data === "success") {
                  document.getElementById('status-text').textContent = 'Conectado com sucesso!';
                  document.getElementById('status-icon').style.backgroundColor = '#4CAF50'; // Verde (conectado)
                  setTimeout(() => window.location.href = "/connected", 2000); // Redireciona após 2 segundos
                } else {
                  // Exibe a mensagem de erro
                  document.getElementById('status-text').textContent = 'Falha ao conectar';
                  document.getElementById('status-icon').style.backgroundColor = '#F44336'; // Vermelho (erro)
                  document.getElementById("error-message").style.display = "block";
                  document.getElementById("error-message").innerHTML = "Senha incorreta ou rede indisponivel. Tente novamente.";
                  setTimeout(() => {
                    document.getElementById('status-text').textContent = 'Pronto';
                    document.getElementById('status-icon').style.backgroundColor = '#00e676'; // Verde
                    document.getElementById("error-message").style.display = "none"; // Esconde a mensagem de erro
                  }, 5000); // Resetando o estado após 5 segundos
                }
              });
          }
        </script>
      </body>
      </html>
    )rawliteral";
    server.send(200, "text/html", html);
  });
  server.on("/listwifi", HTTP_GET, []() {
    int n = WiFi.scanNetworks();
    if (n == 0) {
      server.send(200, "application/json", "[]");
      Serial.println("Nenhuma rede encontrada.");
      return;
    }

    String json = "[";
    for (int i = 0; i < n; ++i) {
      if (i > 0) json += ",";
      json += "\"" + WiFi.SSID(i) + "\"";
    }
    json += "]";
    server.send(200, "application/json", json);
    Serial.println("Lista de redes enviada: " + json);
  });

  server.on("/connectwifi", HTTP_GET, []() {
    String ssid = server.arg("ssid");
    String password = server.arg("password");
    WiFi.begin(ssid.c_str(), password.c_str());
    unsigned long startAttemptTime = millis();

    while (WiFi.status() != WL_CONNECTED && (millis() - startAttemptTime) < 15000) {
      delay(500);
    }

    if (WiFi.status() == WL_CONNECTED) {
      addNetwork(ssid, password);  // Adiciona nova rede à lista
      connectedSSID = ssid;        // Salva o nome da rede conectada
      server.send(200, "text/plain", "success");
    } else {
      server.send(200, "text/plain", "failure");
    }
  });
  // Página de redes salvas
  server.on("/connected", HTTP_GET, []() {
    String chipId = String(ESP.getChipId(), HEX);  // Obter o Chip ID do ESP
    String html = R"rawliteral(
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #121212; color: #fff; margin: 0; }
          .container { width: 80vw; background-color: #1f1f1f; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); padding: 20px; text-align: center; }
          .logo { font-size: 3em; font-weight: bold; color: #ff5722; margin-bottom: 15px; }
          .subtitle { color: #b0b0b0; margin-bottom: 20px; font-size: 2.1em; }
          .status { display: flex; align-items: center; justify-content: center; margin-bottom: 20px; font-size: 2em; }
          .status-icon { width: 12px; height: 12px; background-color: #00e676; border-radius: 50%; margin-right: 8px; }
          .chip-info { font-size: 2.5em; font-weight: bold; margin-top: 20px; } /* Estilo para Chip ID */
          .button, .input, .submit-button { 
            width: 100%; 
            padding: 12px; 
            margin: 10px 0; 
            background-color: #333; 
            border: none; 
            border-radius: 5px; 
            color: #fff; 
            font-size: 1.8em; 
          }
          .button:hover { background-color: #444; }
          .input option { background-color: #333; color: #fff; padding: 10px; }
          .input:focus { outline: none; box-shadow: 0 0 10px rgba(255, 87, 34, 0.5); }
          .input::placeholder { color: #aaa; }
          .submit-button { background-color: #ff5722; cursor: pointer; }
          .submit-button:hover { background-color: #ff7043; }
          .footer { margin-top: 20px; font-size: 1.8em; color: #888; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">RaceMap</div>
          <div class="status">
            <div class="status-icon"></div> 
            <span id="status-text">Conectado a: </span><span id="connected-ssid">)rawliteral"
                  + connectedSSID + R"rawliteral(</span>
          </div>
          <div class="chip-info">
            <p>Chip ID: )rawliteral"
                  + chipId + R"rawliteral(</p>
          </div>
          <button class="button" onclick="showSavedNetworks()">Mostrar Redes Salvas</button>
          <button class="submit-button" onclick="window.location.href='/cadastro-gps'">Cadastre seu GPS</button>
          <div id="saved-networks"></div>
        </div>
        <script>
          function showSavedNetworks() {
            fetch('/saved-networks')
              .then(response => response.json())
              .then(data => {
                const container = document.getElementById('saved-networks');
                container.innerHTML = '<h3>Redes Salvas:</h3>';
                data.forEach((network, index) => {
                  container.innerHTML += `<p>${index + 1}: ${network}</p>`;
                });
              })
              .catch(error => {
                console.error('Erro ao carregar redes salvas:', error);
              });
          }
        </script>
      </body>
      </html>
    )rawliteral";
    server.send(200, "text/html", html);
  });
  // Listar redes Wi-Fi salvas
  server.on("/saved-networks", HTTP_GET, []() {
    String json = "[";
    for (int i = 0; i < MAX_NETWORKS; i++) {
      if (strlen(networks[i].ssid) > 0) {
        if (json.length() > 1) json += ",";
        json += "\"" + String(networks[i].ssid) + "\"";
      }
    }
    json += "]";
    server.send(200, "application/json", json);
  });

  // Página não encontrada
  server.onNotFound([]() {
    server.sendHeader("Location", "/", true);
    server.send(302, "text/plain", "Requer autorização. Redirecionando...");
  });

  server.on("/mqttstatus", HTTP_GET, []() {
    String status = client.connected() ? "Conectado ao MQTT" : "Desconectado do MQTT";
    server.send(200, "text/plain", status);
  });

  server.on("/gpsdata", HTTP_GET, []() {
    if (gps.location.isValid()) {
      String data = "Latitude: " + String(gps.location.lat(), 6) + ", Longitude: " + String(gps.location.lng(), 6);
      server.send(200, "text/plain", data);
    } else {
      server.send(200, "text/plain", "Dados do GPS indisponíveis.");
    }
  });


  server.begin();
}
void reconnect() {
  while (!client.connected() && wifiConnected) {
    if (WiFi.status() != WL_CONNECTED) {
      wifiConnected = false;
    }
    Serial.print("Tentando conectar ao MQTT...");
    if (client.connect(clientId.c_str(), mqtt_username, mqtt_password)) {
      Serial.println("Conectado ao MQTT!");
      client.subscribe(mqtt_topic_read.c_str());
      client.subscribe((mqtt_topic_read + "/mode").c_str());  // Tópico para /mode
      client.subscribe((mqtt_topic_read + "/sts").c_str());   // Tópico para /status

    } else {
      Serial.print("Falha ao conectar. Código de erro: ");
      Serial.println(client.state());
      delay(5000);
    }
  }
}

// Publicação de dados GPS
void publishGPSData() {
  DynamicJsonDocument doc(256);
  doc["deviceId"] = clientId.c_str();
  doc["lat"] = gps.location.lat();
  doc["long"] = gps.location.lng();

  char buffer[256];
  serializeJson(doc, buffer);

  if (client.publish(mqtt_topic_write.c_str(), buffer)) {
    Serial.println("Dados GPS enviados: " + String(buffer));
  } else {
    Serial.println("Erro ao enviar dados GPS.");
  }
}

// Função para enviar comandos UBX ao GPS
void sendUBX(unsigned char* UBXmsg, int len) {
  for (int i = 0; i < len; i++) {
    Serial.write(UBXmsg[i]);  // Envia byte por byte para o GPS via Serial
  }
  Serial.flush();  // Garante que todos os bytes foram enviados
  Serial.println("Comando UBX enviado.");
}

void callback(char* topic, byte* payload, unsigned int length) {
  // Converte o payload recebido em uma string
  String message = "";
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  // Exibe o tópico e a mensagem recebida no monitor serial
  Serial.println("Mensagem recebida no tópico [" + String(topic) + "]: " + message);

  // Verifica se o tópico é mqtt_topic_read + "/mode"
  String expectedModeTopic = mqtt_topic_read + "/mode";
  if (String(topic) == expectedModeTopic) {
    if (message == "1") {
      modeKart = 1;                                 // Define o modo como 1
      sendUBX(setRateTo1Hz, sizeof(setRateTo1Hz));  // Configura a taxa do GPS para 1Hz
      Serial.println("Modo alterado para 1Hz.");
    } else if (message == "10") {
      modeKart = 10;                                  // Define o modo como 10
      sendUBX(setRateTo10Hz, sizeof(setRateTo10Hz));  // Configura a taxa do GPS para 10Hz
      Serial.println("Modo alterado para 10Hz.");
    } else if (message == "20") {
      modeKart = 20;                                  // Define o modo como 20
      sendUBX(setRateTo20Hz, sizeof(setRateTo20Hz));  // Configura a taxa do GPS para 20Hz
      Serial.println("Modo alterado para 20Hz.");
    }else if (message == "0") {
      modeKart = 0;                                  // Define o modo como 20
      sendUBX(setRateTo1Hz, sizeof(setRateTo1Hz));  // Configura a taxa do GPS para 20Hz
      Serial.println("Modo alterado para 1Hz e pausado.");
    } else {
      Serial.println("Mensagem inválida para alterar o modo.");
    }
    return;  // Sai da função após processar o modo
  }

  // Verifica se o tópico é mqtt_topic_read + "/status"
  String expectedStatusTopic = mqtt_topic_read + "/sts";
  if (String(topic) == expectedStatusTopic) {
    DynamicJsonDocument doc(128);  // Define o tamanho do documento JSON
    doc["status"] = (WiFi.status() == WL_CONNECTED) ? "Conectado" : "Desconectado";
    doc["mode"] = modeKart;  // Adiciona o modo atual ao JSON

    // Serializa o JSON em uma string
    String jsonString;
    serializeJson(doc, jsonString);

    // Publica o JSON no tópico mqtt_topic_write/status
    String responseTopic = mqtt_topic_write + "/sts";
    if (client.publish(responseTopic.c_str(), jsonString.c_str(), false)) {
      Serial.println("Status enviado para [" + responseTopic + "]: " + jsonString);
    } else {
      Serial.println("Falha ao enviar o status para [" + responseTopic + "].");
    }
    return;  // Sai da função após processar o status
  }

  // Caso nenhum dos tópicos esperados seja correspondente
  Serial.println("Tópico não reconhecido ou sem ação definida.");
}



void setup() {
  Serial.begin(115200);
  Serial.swap();        // Troca para UART alternativo
  Serial.begin(38400);  // Configure para o baud rate do seu módulo GPS
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  EEPROM.begin(EEPROM_SIZE);
  delay(5000);
  //clearNetworks();
  loadNetworks();
  delay(500);
  // Inicializa MQTT
  espClient.setInsecure();  // Desabilita a verificação de certificado (se necessário)
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);


  // Configuração do servidor web
  setupWebServer();
}

void loop() {
  monitorButton();  // Verifica se o botão foi pressionado para ativar o modo AP



  if (!wifiConnected && !apModeEnabled) {
    scanNetworks();
    if (availableNetworks > 0) {
      if (!connectToSavedNetworks()) {
        Serial.println("Tentativa de conexão em andamento...");
      }
    }
  }



  // Caso o Wi-Fi esteja conectado

  if (WiFi.status() == WL_CONNECTED) {
    if (!wifiConnected) {
      wifiConnected = true;
      Serial.println("Conexão Wi-Fi estabelecida. Iniciando envio de dados.");
    }

    // Reconexão ao broker MQTT caso necessário
    if (!client.connected() && wifiConnected) {
      Serial.println("Tentando conectar ao MQTT...");
      reconnect();
    }

    // Processa mensagens MQTT recebidas em intervalos definidos
    if (millis() - lastMQTTCheck > mqttInterval) {
      lastMQTTCheck = millis();
      client.loop();
    }

    // Processa dados do GPS
    while (Serial.available() > 0) {
      char c = Serial.read();
      gps.encode(c);

      // Publica dados do GPS apenas se houver novas informações
      if (gps.location.isUpdated() && modeKart != 0) {
        if (millis() - lastMQTTCheck < mqttInterval) { // Intervalo mínimo para publicação
          publishGPSData();
        }
      }
    }
  } else {
    wifiConnected = false;
  }



  // Processa o modo AP, caso esteja ativado
  if (apModeEnabled) {
    dnsServer.processNextRequest();

    if (millis() - apModeStartTime > apModeDuration) {
      Serial.println("Tempo do modo AP expirou. Desativando...");
      offAPMode();  // Desativa o modo AP
    }
  }

  // Lida com requisições do servidor web
  server.handleClient();
}