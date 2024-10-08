#include <TinyGPS++.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

TinyGPSPlus gps;

const int ppsPin = 14; // GPIO14 (D5)
volatile unsigned long ppsCounter = 0;


const char* ssid = "";
const char* password = "";
const char* mqtt_server = "5d9db2e1dddd44ddb1f65079e8bb21e0.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
String clientId = "ESP8266Client-";   // Cria um ID de cliente


WiFiClientSecure espClient;
PubSubClient client(espClient);
unsigned long lastMsg = 0;
#define MSG_BUFFER_SIZE	(50)
char msg[MSG_BUFFER_SIZE];
int value = 0;
int modeKart = 1;
const char *mqtt_topic_write = "kart";  // MQTT topic write
const char *mqtt_topic_read = "config";  // MQTT topic write
const char *mqtt_username = "kartserver";  // MQTT username for authentication
const char *mqtt_password = "Kartserver123";  // MQTT password for authentication


// Comando UBX para configurar a taxa de atualização para 10 Hz
unsigned char setRateTo10Hz[] = {
  0xB5, 0x62, 0x06, 0x08, 0x06, 0x00, 0x64, 0x00, 0x01, 0x00, 0x01, 0x00, 0x7A, 0x12
};

// Comando UBX para configurar a taxa de atualização para 1 Hz
unsigned char setRateTo1Hz[] = {
  0xB5, 0x62, 0x06, 0x08, 0x06, 0x00, 0xE8, 0x03, 0x01, 0x00, 0x01, 0x00, 0x01, 0x39
};


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


// Função para enviar comandos UBX ao GPS
void sendUBX(unsigned char *UBXmsg, int len)
{
  for (int i = 0; i < len; i++)
  {
    Serial.write(UBXmsg[i]);
  }
  Serial.flush();
}

/************* Connect to MQTT Broker ***********/
void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    
    // Attempt to connect
    if (client.connect(clientId.c_str(), mqtt_username, mqtt_password)) {
      Serial.println("connected");

      client.subscribe("kart");   // subscribe the topics here
      client.subscribe("config");   // subscribe the topics here

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

/***** Call back Method for Receiving MQTT messages and Switching LED ****/

void callback(char* topic, byte* payload, unsigned int length) {
  String incommingMessage = "";
  for (int i = 0; i < length; i++) incommingMessage+=(char)payload[i];

  

  //--- check the incoming message
  if (strcmp(topic, "config") == 0) {  // Verifica se as strings são iguais
      
      if(incommingMessage == "0"){
        modeKart = 0;
      }
      if(incommingMessage == "1"){
        modeKart = 1;
        sendUBX(setRateTo1Hz, sizeof(setRateTo1Hz));
      }
      if(incommingMessage == "10"){
        modeKart = 10;
        sendUBX(setRateTo10Hz, sizeof(setRateTo10Hz));
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
  espClient.setInsecure();
  client.setServer(mqtt_server, 8883);

  // Gera o ID de cliente com número aleatório
  clientId += String(random(0xffff), HEX);  // Concatena um número aleatório em hexadecimal
  //sendUBX(setRateTo10Hz, sizeof(setRateTo10Hz));

  pinMode(ppsPin, INPUT);
  attachInterrupt(digitalPinToInterrupt(ppsPin), ppsInterrupt, RISING); // Configura a interrupção para o PPS
  client.setCallback(callback);
}

void loop() {
  // Verifica se há dados disponíveis no buffer serial
  while (Serial.available() > 0) {
    char c = Serial.read(); // Lê o próximo caractere disponível
    gps.encode(c); // Envia o caractere para o TinyGPS++ para processamento
    // Verifica se a localização foi atualizada
    if (!client.connected()) reconnect();
    client.loop();
    if (gps.location.isUpdated() && modeKart != 0) {
      Serial.print("Latitude: ");
      Serial.println(gps.location.lat(), 6);
      Serial.print("Longitude: ");
      Serial.println(gps.location.lng(), 6);

      DynamicJsonDocument doc(1024);

      doc["deviceId"] = clientId.c_str();
      doc["lat"] = gps.location.lat();
      doc["long"] = gps.location.lng();

      char mqtt_message[128];
      serializeJson(doc, mqtt_message);

      publishMessage("kart", mqtt_message, true);
    }
  }

  delay(100); 
}
