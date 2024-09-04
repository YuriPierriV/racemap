#include <TinyGPS++.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

TinyGPSPlus gps;

const int ppsPin = 14; // GPIO14 (D5)
volatile unsigned long ppsCounter = 0;


const char* ssid = "Pierri-Wifi";
const char* password = "Pierricyj123";
const char* mqtt_server = "5d9db2e1dddd44ddb1f65079e8bb21e0.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;

WiFiClientSecure espClient;
PubSubClient client(espClient);
unsigned long lastMsg = 0;
#define MSG_BUFFER_SIZE	(50)
char msg[MSG_BUFFER_SIZE];
int value = 0;
const char *mqtt_topic = "kart";  // MQTT topic
const char *mqtt_username = "kartserver";  // MQTT username for authentication
const char *mqtt_password = "Kartserver123";  // MQTT password for authentication



void IRAM_ATTR ppsInterrupt() {
  ppsCounter++;
}


void setup_wifi() {

  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  randomSeed(micros());

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}




/************* Connect to MQTT Broker ***********/
void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    String clientId = "ESP8266Client-";   // Create a random client ID
    clientId += String(random(0xffff), HEX);
    // Attempt to connect
    if (client.connect(clientId.c_str(), mqtt_username, mqtt_password)) {
      Serial.println("connected");

      client.subscribe("kart");   // subscribe the topics here

    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");   // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void publishMessage(const char* topic, String payload , boolean retained){
  if (client.publish(topic, payload.c_str(), true))
      Serial.println("Message publised ["+String(topic)+"]: "+payload);
}


void setup() {
  Serial.begin(115200); // Inicializa a comunicação serial para monitoramento
  // Inicializa a comunicação serial com o GPS
  Serial.swap(); // Troca para usar o UART0 do ESP8266 nos pinos alternativos
  Serial.begin(38400); // Configure de acordo com a taxa de transmissão do GPS

  Serial.println("Iniciando comunicação com o GNSS Receiver...");

  setup_wifi();
  espClient.setInsecure();
  client.setServer(mqtt_server, 8883);

  pinMode(ppsPin, INPUT);
  attachInterrupt(digitalPinToInterrupt(ppsPin), ppsInterrupt, RISING); // Configura a interrupção para o PPS
}

void loop() {
  // Verifica se há dados disponíveis no buffer serial
  while (Serial.available() > 0) {
    char c = Serial.read(); // Lê o próximo caractere disponível
    gps.encode(c); // Envia o caractere para o TinyGPS++ para processamento
    // Verifica se a localização foi atualizada
    if (!client.connected()) reconnect();
    client.loop();
    if (gps.location.isUpdated()) {
      Serial.print("Latitude: ");
      Serial.println(gps.location.lat(), 6);
      Serial.print("Longitude: ");
      Serial.println(gps.location.lng(), 6);

      DynamicJsonDocument doc(1024);

      doc["deviceId"] = "Esp";
      doc["siteId"] = "Kart";
      doc["lat"] = gps.location.lat();
      doc["long"] = gps.location.lng();

      char mqtt_message[128];
      serializeJson(doc, mqtt_message);

      publishMessage("kart", mqtt_message, true);
    }
  }

  delay(100); 
}
