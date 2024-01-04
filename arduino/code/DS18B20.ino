// Include the libraries we need

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoOTA.h>

char *ssid = "ZTE_2.4G_cxm65S";
char *password = "Mp22NW9j";
String serverName = "http://192.168.8.110:4000/update-sensor";

// temptrure

#include <OneWire.h>
#include <DallasTemperature.h>


// Data wire is conntec to the wemos pin D4
#define ONE_WIRE_BUS 2

// Setup a oneWire instance to communicate with any OneWire devices
OneWire oneWire(ONE_WIRE_BUS);

// Pass our oneWire reference to Dallas Temperature sensor 
DallasTemperature sensors(&oneWire);
// tempture end

// the following variables are unsigned longs because the time, measured in
unsigned long lastTime = 0;
// Set timer to 60 seconds 
unsigned long timerDelay = 60 * 1000;

/*
 * The setup function. We only start the sensors here
 */
void setup(void)
{
  Serial.begin(9600);
  // wifi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  // temperature
  sensors.begin();

  // OTA
  ArduinoOTA.setHostname("wemos-DS18B20-1-incubation");
  ArduinoOTA.begin();
}

/*
 * Main function, get and show the temperature
 */
void loop(void)
{  
  // Send an HTTP POST request depending on timerDelay
  if ((millis() - lastTime) > timerDelay)
  {
    // call sensors.requestTemperatures() to issue a global temperature
    // request to all devices on the bus
    Serial.print("Requesting temperatures...");
    
    sensors.requestTemperatures(); 

    String temp = String(sensors.getTempCByIndex(0));
    
 
    // Check WiFi connection status
    if (WiFi.status() == WL_CONNECTED)
    {
      WiFiClient client;
      HTTPClient http;

      String serverPath = serverName + "?name=wemos_DS18B20_1_incubation&sensor=DS18B20&temperature=" + temp + "&" + "device_id=" + String(WiFi.macAddress());

      // Your Domain name with URL path or IP address with path
      http.begin(client, serverPath.c_str());

      // If you need Node-RED/server authentication, insert user and password below
      // http.setAuthorization("REPLACE_WITH_SERVER_USERNAME", "REPLACE_WITH_SERVER_PASSWORD");

      // Send HTTP GET request
      int httpResponseCode = http.GET();

      if (httpResponseCode > 0)
      {
        Serial.print("HTTP Response code: ");
        Serial.println(httpResponseCode);
        String payload = http.getString();
        Serial.println(payload);
      }
      else
      {
        Serial.print("Error code: ");
        Serial.println(httpResponseCode);
      }
      // Free resources
      http.end();
    }
    else
    {
      Serial.println("WiFi Disconnected");
    }
    lastTime = millis();
  }
  delay(10 * 1000);
  
  ArduinoOTA.handle();
}
