#include <TinyGPS++.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>

TinyGPSPlus gps;

const int ppsPin = 14; // GPIO14 (D5)
volatile unsigned long ppsCounter = 0;


const char* ssid = "seu wifi";
const char* password = "senhawifi";
const char* mqtt_server = "http://localhost";

WiFiClient espClient;
PubSubClient client(espClient);
unsigned long lastMsg = 0;
#define MSG_BUFFER_SIZE	(50)
char msg[MSG_BUFFER_SIZE];
int value = 0;



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


void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);
    // Attempt to connect
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
      // Once connected, publish an announcement...
      client.publish("outTopic", "hello world");
      // ... and resubscribe
      client.subscribe("inTopic");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}


void setup() {
  Serial.begin(115200); // Inicializa a comunicação serial para monitoramento

  // Inicializa a comunicação serial com o GPS
  Serial.swap(); // Troca para usar o UART0 do ESP8266 nos pinos alternativos
  Serial.begin(38400); // Configure de acordo com a taxa de transmissão do GPS

  Serial.println("Iniciando comunicação com o GNSS Receiver...");

  setup_wifi();
  client.setServer(mqtt_server, 1883);

  pinMode(ppsPin, INPUT);
  attachInterrupt(digitalPinToInterrupt(ppsPin), ppsInterrupt, RISING); // Configura a interrupção para o PPS
}

void loop() {
  // Verifica se há dados disponíveis no buffer serial
  while (Serial.available() > 0) {
    char c = Serial.read(); // Lê o próximo caractere disponível
    gps.encode(c); // Envia o caractere para o TinyGPS++ para processamento
    // Verifica se a localização foi atualizada
    if (gps.location.isUpdated()) {
      if (!client.connected()) {
        reconnect();
      }
      client.loop();

      unsigned long now = millis();
      if (now - lastMsg > 2000) {
        lastMsg = now;
        ++value;
        snprintf (msg, MSG_BUFFER_SIZE, "hello world #%ld", value);
        Serial.print("Publish message: ");
        Serial.println(msg);
        client.publish("kart", msg);
      }
      Serial.print("Latitude: ");
      Serial.println(gps.location.lat(), 6);
      Serial.print("Longitude: ");
      Serial.println(gps.location.lng(), 6);
    }
  }

  delay(100); 
}
