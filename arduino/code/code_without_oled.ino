// Include the libraries we need

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoOTA.h>

char *ssid = "ZTE_2.4G_cxm65S";
char *password = "Mp22NW9j";
String serverName = "http://192.168.8.110:4000/update-sensor";

// temptrure
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <DHT_U.h>

#define DHTPIN 2 // D4 pin 
#define DHTTYPE    DHT11     // DHT 22 (AM2302)
DHT_Unified dht(DHTPIN, DHTTYPE);

// the following variables are unsigned longs because the time, measured in
unsigned long lastTime = 0;
// Set timer to 60 seconds 
unsigned long timerDelay = 60 * 1000;

/*
 * The setup function. We only start the sensors here
 */
void setup(void)
{
  WiFi.begin(ssid, password);
  // start serial port
  Serial.begin(9600);

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  // Start up the library
  dht.begin();
  sensor_t sensor;
  dht.temperature().getSensor(&sensor);
  dht.humidity().getSensor(&sensor);

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
    
    sensors_event_t event;
    dht.temperature().getEvent(&event);
    
    // Check if reading was successful
    if (isnan(event.temperature)) {
       Serial.println("Error: Could not read temperature data"); 
    }

    String temp = String(event.temperature);

    dht.humidity().getEvent(&event);
    // Check if reading was successful
    if (isnan(event.relative_humidity)) {
       Serial.println("Error: Could not read relative_humidity data"); 
    }
 
    // Check WiFi connection status
    if (WiFi.status() == WL_CONNECTED)
    {
      WiFiClient client;
      HTTPClient http;

      String serverPath = serverName + "?name=wemos_dht11_1&sensor=DHT11&temperature=" + temp + "&" + "device_id=" + String(WiFi.macAddress()) + "&humidity=" + String(event.relative_humidity);

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
