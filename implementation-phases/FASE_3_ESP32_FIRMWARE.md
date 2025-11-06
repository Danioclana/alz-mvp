# Fase 3: Desenvolvimento do Firmware ESP32

## Contexto

O backend está completo e recebendo dados via API `/api/locations`. Esta fase implementa o **firmware do ESP32** para coletar dados GPS e enviar ao servidor via 4G.

## Objetivo

Desenvolver firmware que:
1. Lê coordenadas GPS do módulo NEO-6M
2. Conecta à rede 4G via SIM7600G-H
3. Envia dados para API REST a cada 60 segundos
4. Monitora nível de bateria
5. Implementa power management (deep sleep)
6. Indica status via LED

## Hardware Necessário

- ESP32 DevKit (1x) - ~R$ 35
- GPS NEO-6M (1x) - ~R$ 25
- SIM7600G-H 4G Module (1x) - ~R$ 180
- Bateria Li-Po 1200mAh (1x) - ~R$ 20
- Módulo TP4056 (carregamento) (1x) - ~R$ 5
- LED 5mm (2x) - R$ 0,50
- Resistores 330Ω (2x) - R$ 0,20
- Protoboard + jumpers - R$ 30
- Chip SIM com plano de dados

**Total Hardware: ~R$ 295**

## Pinagem

```
ESP32 GPIO     Componente
───────────────────────────────────────
GPIO 16 (RX)   → TX do NEO-6M
GPIO 17 (TX)   → RX do NEO-6M
GPIO 18 (RX)   → TX do SIM7600G-H
GPIO 19 (TX)   → RX do SIM7600G-H
GPIO 34 (ADC)  → Divisor de tensão (bateria)
GPIO 5         → LED verde (GPS fix)
GPIO 2         → LED azul (status)
GND            → GND comum
5V             → VCC dos módulos
```

## Ambiente de Desenvolvimento

### Opção 1: PlatformIO (Recomendado)

```ini
; platformio.ini
[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino
monitor_speed = 115200

lib_deps =
    mikalhart/TinyGPSPlus@^1.0.3
    bblanchon/ArduinoJson@^7.0.0
    arduino-libraries/NTPClient@^3.2.1

build_flags =
    -DCORE_DEBUG_LEVEL=3
```

### Opção 2: Arduino IDE

Adicionar bibliotecas:
1. TinyGPSPlus
2. ArduinoJson
3. NTPClient

## Código Completo do Firmware

```cpp
// main.cpp - Firmware ESP32 para Alzheimer Care

#include <Arduino.h>
#include <TinyGPSPlus.h>
#include <HardwareSerial.h>
#include <HTTPClient.h>
#include <WiFi.h>
#include <ArduinoJson.h>

// ==========================================
// CONFIGURAÇÕES
// ==========================================

// API
const char* API_URL = "https://seu-app.vercel.app/api/locations";
const char* HARDWARE_ID = "ESP32_DEVICE_001"; // Único por dispositivo

// APN da operadora (ajuste conforme seu chip)
const char* APN = "claro.com.br"; // Claro
// const char* APN = "tim.br";    // TIM
// const char* APN = "zap.vivo.com.br"; // Vivo

// Pinos
#define GPS_RX_PIN 16
#define GPS_TX_PIN 17
#define SIM_RX_PIN 18
#define SIM_TX_PIN 19
#define BATTERY_PIN 34
#define LED_GPS_PIN 5
#define LED_STATUS_PIN 2

// Intervalos
#define SEND_INTERVAL_MS 60000     // Enviar a cada 60s
#define GPS_TIMEOUT_MS 300000      // Timeout GPS: 5 min
#define MAX_RETRY 3                // Tentativas de envio

// ==========================================
// OBJETOS GLOBAIS
// ==========================================

TinyGPSPlus gps;
HardwareSerial gpsSerial(1);
HardwareSerial simSerial(2);

unsigned long lastSendTime = 0;
bool gpsReady = false;
bool simReady = false;

// ==========================================
// PROTÓTIPOS
// ==========================================

void setup();
void loop();
bool initGPS();
bool initSIM7600();
bool sendATCommand(const char* cmd, const char* expected, int timeout);
bool connectTo4G();
bool sendLocationToAPI();
int readBatteryLevel();
String getISOTimestamp();
void blinkLED(int pin, int times);
void enterDeepSleep(int seconds);

// ==========================================
// SETUP
// ==========================================

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n\n=================================");
  Serial.println("  ALZHEIMER CARE - ESP32 GPS");
  Serial.println("=================================\n");

  // Configurar pinos
  pinMode(LED_GPS_PIN, OUTPUT);
  pinMode(LED_STATUS_PIN, OUTPUT);
  pinMode(BATTERY_PIN, INPUT);

  // Blink inicial
  blinkLED(LED_STATUS_PIN, 3);

  // Inicializar GPS
  Serial.println("[GPS] Inicializando...");
  if (initGPS()) {
    Serial.println("[GPS] ✓ OK");
    gpsReady = true;
    digitalWrite(LED_GPS_PIN, HIGH);
  } else {
    Serial.println("[GPS] ✗ ERRO");
  }

  // Inicializar SIM7600
  Serial.println("[4G] Inicializando...");
  if (initSIM7600()) {
    Serial.println("[4G] ✓ OK");
    simReady = true;
  } else {
    Serial.println("[4G] ✗ ERRO");
  }

  // Conectar à rede 4G
  if (simReady) {
    if (connectTo4G()) {
      Serial.println("[4G] ✓ Conectado");
      blinkLED(LED_STATUS_PIN, 2);
    } else {
      Serial.println("[4G] ✗ Falha na conexão");
    }
  }

  Serial.println("\n[Sistema] Pronto!\n");
}

// ==========================================
// LOOP PRINCIPAL
// ==========================================

void loop() {
  // Ler dados do GPS continuamente
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  // Verificar se GPS tem fix
  if (gps.location.isValid()) {
    if (!gpsReady) {
      Serial.println("[GPS] ✓ Fix obtido");
      gpsReady = true;
      digitalWrite(LED_GPS_PIN, HIGH);
    }
  } else {
    digitalWrite(LED_GPS_PIN, LOW);
  }

  // Enviar dados periodicamente
  unsigned long now = millis();
  if (now - lastSendTime >= SEND_INTERVAL_MS) {
    lastSendTime = now;

    if (gpsReady && simReady && gps.location.isValid()) {
      Serial.println("\n[API] Enviando localização...");
      blinkLED(LED_STATUS_PIN, 1);

      bool success = sendLocationToAPI();

      if (success) {
        Serial.println("[API] ✓ Sucesso");
        blinkLED(LED_STATUS_PIN, 1);
      } else {
        Serial.println("[API] ✗ Falha");
        blinkLED(LED_STATUS_PIN, 3);
      }
    } else {
      Serial.println("[WARN] GPS ou 4G não pronto");
    }
  }

  // Debug a cada 10s
  static unsigned long lastDebug = 0;
  if (now - lastDebug >= 10000) {
    lastDebug = now;

    Serial.printf("[STATUS] GPS: %s | Sats: %d | Bateria: %d%%\n",
      gps.location.isValid() ? "OK" : "Aguardando...",
      gps.satellites.value(),
      readBatteryLevel()
    );

    if (gps.location.isValid()) {
      Serial.printf("[GPS] Lat: %.6f | Lng: %.6f\n",
        gps.location.lat(),
        gps.location.lng()
      );
    }
  }

  delay(100);
}

// ==========================================
// INICIALIZAR GPS
// ==========================================

bool initGPS() {
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);

  // Aguardar fix (timeout 5 min)
  unsigned long start = millis();
  while (millis() - start < GPS_TIMEOUT_MS) {
    while (gpsSerial.available() > 0) {
      gps.encode(gpsSerial.read());
    }

    if (gps.location.isValid()) {
      return true;
    }

    delay(100);
  }

  return false;
}

// ==========================================
// INICIALIZAR SIM7600
// ==========================================

bool initSIM7600() {
  simSerial.begin(115200, SERIAL_8N1, SIM_RX_PIN, SIM_TX_PIN);
  delay(2000);

  // Testar comunicação
  if (!sendATCommand("AT", "OK", 1000)) {
    Serial.println("[SIM] Sem resposta");
    return false;
  }

  // Verificar SIM card
  if (!sendATCommand("AT+CPIN?", "READY", 2000)) {
    Serial.println("[SIM] Chip não detectado");
    return false;
  }

  // Verificar sinal
  sendATCommand("AT+CSQ", "OK", 1000);

  return true;
}

// ==========================================
// CONECTAR À REDE 4G
// ==========================================

bool connectTo4G() {
  Serial.println("[4G] Configurando APN...");

  // Configurar APN
  String apnCmd = "AT+CGDCONT=1,\"IP\",\"";
  apnCmd += APN;
  apnCmd += "\"";

  if (!sendATCommand(apnCmd.c_str(), "OK", 2000)) {
    return false;
  }

  // Ativar contexto PDP
  Serial.println("[4G] Ativando conexão...");
  if (!sendATCommand("AT+CGACT=1,1", "OK", 10000)) {
    return false;
  }

  // Aguardar conexão
  delay(5000);

  // Verificar IP
  sendATCommand("AT+CGPADDR=1", "OK", 2000);

  return true;
}

// ==========================================
// ENVIAR LOCALIZAÇÃO PARA API
// ==========================================

bool sendLocationToAPI() {
  if (!gps.location.isValid()) {
    return false;
  }

  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-ID", HARDWARE_ID);

  // Criar JSON
  StaticJsonDocument<256> doc;
  doc["latitude"] = gps.location.lat();
  doc["longitude"] = gps.location.lng();
  doc["timestamp"] = getISOTimestamp();
  doc["batteryLevel"] = readBatteryLevel();

  String json;
  serializeJson(doc, json);

  Serial.println("[HTTP] Payload:");
  Serial.println(json);

  // Enviar POST
  int httpCode = http.POST(json);

  Serial.printf("[HTTP] Status Code: %d\n", httpCode);

  if (httpCode == 200 || httpCode == 201) {
    String response = http.getString();
    Serial.println("[HTTP] Resposta:");
    Serial.println(response);
    http.end();
    return true;
  } else {
    Serial.println("[HTTP] Erro no envio");
    http.end();
    return false;
  }
}

// ==========================================
// LER NÍVEL DE BATERIA
// ==========================================

int readBatteryLevel() {
  // Ler ADC (0-4095)
  int rawValue = analogRead(BATTERY_PIN);

  // Converter para porcentagem
  // Assumindo divisor de tensão para 3.3V
  // Ajuste conforme sua configuração
  int percentage = map(rawValue, 0, 4095, 0, 100);

  // Limitar entre 0-100
  percentage = constrain(percentage, 0, 100);

  return percentage;
}

// ==========================================
// TIMESTAMP ISO 8601
// ==========================================

String getISOTimestamp() {
  // Se GPS tem data/hora válida
  if (gps.date.isValid() && gps.time.isValid()) {
    char timestamp[25];
    snprintf(timestamp, sizeof(timestamp),
      "%04d-%02d-%02dT%02d:%02d:%02dZ",
      gps.date.year(),
      gps.date.month(),
      gps.date.day(),
      gps.time.hour(),
      gps.time.minute(),
      gps.time.second()
    );
    return String(timestamp);
  }

  // Fallback: usar millis() (não é horário real)
  unsigned long seconds = millis() / 1000;
  char timestamp[25];
  snprintf(timestamp, sizeof(timestamp), "1970-01-01T00:%02lu:%02luZ",
    (seconds / 60) % 60,
    seconds % 60
  );
  return String(timestamp);
}

// ==========================================
// PISCAR LED
// ==========================================

void blinkLED(int pin, int times) {
  for (int i = 0; i < times; i++) {
    digitalWrite(pin, HIGH);
    delay(200);
    digitalWrite(pin, LOW);
    delay(200);
  }
}

// ==========================================
// DEEP SLEEP (Economia de Energia)
// ==========================================

void enterDeepSleep(int seconds) {
  Serial.printf("[SLEEP] Entrando em deep sleep por %d segundos\n", seconds);
  Serial.flush();

  esp_sleep_enable_timer_wakeup(seconds * 1000000ULL);
  esp_deep_sleep_start();
}

// ==========================================
// ENVIAR COMANDO AT
// ==========================================

bool sendATCommand(const char* cmd, const char* expected, int timeout) {
  simSerial.println(cmd);

  unsigned long start = millis();
  String response = "";

  while (millis() - start < timeout) {
    while (simSerial.available()) {
      char c = simSerial.read();
      response += c;
      Serial.write(c);
    }

    if (response.indexOf(expected) != -1) {
      return true;
    }

    delay(10);
  }

  return false;
}
```

## Melhorias Avançadas (Opcional)

### 1. Power Management

```cpp
void loop() {
  // ... código existente ...

  // Se bateria < 20%, modo economia
  int battery = readBatteryLevel();
  if (battery < 20) {
    // Enviar a cada 5 min em vez de 1 min
    if (now - lastSendTime >= 300000) {
      sendLocationToAPI();
      lastSendTime = now;
    }

    // Deep sleep entre envios
    enterDeepSleep(300); // 5 minutos
  }
}
```

### 2. Buffer Offline

```cpp
#include <Preferences.h>

Preferences prefs;
const int MAX_BUFFER = 50;

struct LocationBuffer {
  float lat;
  float lng;
  long timestamp;
  int battery;
};

void saveLocationOffline(LocationBuffer loc) {
  prefs.begin("locations", false);
  int count = prefs.getInt("count", 0);

  if (count < MAX_BUFFER) {
    String key = "loc" + String(count);
    prefs.putBytes(key.c_str(), &loc, sizeof(loc));
    prefs.putInt("count", count + 1);
  }

  prefs.end();
}

void sendBufferedLocations() {
  prefs.begin("locations", false);
  int count = prefs.getInt("count", 0);

  for (int i = 0; i < count; i++) {
    String key = "loc" + String(i);
    LocationBuffer loc;
    prefs.getBytes(key.c_str(), &loc, sizeof(loc));

    // Enviar para API
    // ...

    prefs.remove(key.c_str());
  }

  prefs.putInt("count", 0);
  prefs.end();
}
```

### 3. OTA Updates

```cpp
#include <ArduinoOTA.h>

void setupOTA() {
  ArduinoOTA.setHostname("alzheimer-device");
  ArduinoOTA.setPassword("sua-senha-segura");

  ArduinoOTA.onStart([]() {
    Serial.println("[OTA] Iniciando atualização...");
  });

  ArduinoOTA.onEnd([]() {
    Serial.println("\n[OTA] Concluído!");
  });

  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    Serial.printf("[OTA] Progresso: %u%%\r", (progress / (total / 100)));
  });

  ArduinoOTA.onError([](ota_error_t error) {
    Serial.printf("[OTA] Erro[%u]: ", error);
  });

  ArduinoOTA.begin();
}

void loop() {
  ArduinoOTA.handle();
  // ... resto do código ...
}
```

## Checklist

### Hardware
- [ ] Montar circuito no protoboard
- [ ] Testar GPS isoladamente
- [ ] Testar SIM7600 isoladamente
- [ ] Configurar divisor de tensão para bateria
- [ ] Testar LEDs

### Software
- [ ] Instalar PlatformIO ou Arduino IDE
- [ ] Instalar bibliotecas
- [ ] Configurar API_URL e HARDWARE_ID
- [ ] Configurar APN da operadora
- [ ] Compilar firmware
- [ ] Upload no ESP32

### Testes
- [ ] Verificar leitura GPS (Serial Monitor)
- [ ] Verificar conexão 4G
- [ ] Testar envio para API (localhost primeiro)
- [ ] Verificar leitura de bateria
- [ ] Testar deep sleep
- [ ] Teste de campo (outdoor)

### Calibração
- [ ] Calibrar divisor de tensão
- [ ] Ajustar intervalo de envios
- [ ] Medir consumo de energia
- [ ] Testar autonomia da bateria

## Tempo Estimado

- **Setup Hardware**: 4 horas
- **Desenvolvimento**: 12 horas
- **Testes**: 8 horas
- **Calibração**: 4 horas

**Total: ~28 horas (3-4 dias)**

## Próxima Fase

Com o firmware funcionando, o sistema está completo end-to-end. A próxima fase adiciona **PWA e Push Notifications**.

Ver: `FASE_4_PWA_PUSH.md`
