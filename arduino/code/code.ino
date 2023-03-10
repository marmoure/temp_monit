// Include the libraries we need

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>

char *ssid = "D-Link";
char *password = "allhailyounes";
String serverName = "http://192.168.8.110:4000/update-sensor";

// temptrure
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <DHT_U.h>

#define DHTPIN 2 // D4 pin 
#define DHTTYPE    DHT22     // DHT 22 (AM2302)
DHT_Unified dht(DHTPIN, DHTTYPE);
// oled

#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128 // OLED display width, in pixels
#define SCREEN_HEIGHT 32 // OLED display height, in pixels
#define OLED_RESET     -1 // Reset pin # (or -1 if sharing Arduino reset pin)
#define SCREEN_ADDRESS 0x3C ///< See datasheet for Address; 0x3D for 128x64, 0x3C for 128x32
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
// pins 
// D1 SCL
// D2 SDA

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

  // start the display
  if(!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("SSD1306 allocation failed"));
  }
    display.display();
   display.setTextColor(SSD1306_WHITE);        // Draw white text
   display.setCursor(0,0);             // Start at top-left corner
   display.setTextSize(3);             // Draw 2X-scale text
   delay(2000); // Pause for 2 seconds
  
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
}

/*
 * Main function, get and show the temperature
 */
void loop(void)
{
  String msg = "";
  
  // Send an HTTP POST request depending on timerDelay
  if ((millis() - lastTime) > timerDelay)
  {
    // call sensors.requestTemperatures() to issue a global temperature
    // request to all devices on the bus
    Serial.print("Requesting temperatures...");
    
    sensors_event_t event;
    dht.temperature().getEvent(&event);
    
    Serial.println("DONE");
    // After we got the temperatures, we can print them here.

     display.clearDisplay();
     display.setCursor(0,0);             // Start at top-left corner
     
    // Check if reading was successful
    if (isnan(event.temperature)) {
       Serial.println("Error: Could not read temperature data"); 
       msg = "Sensor";
    }else {
     msg = String(event.temperature) + "C"; 
    }
 
    // Check WiFi connection status
    if (WiFi.status() == WL_CONNECTED)
    {
      WiFiClient client;
      HTTPClient http;

      String serverPath = serverName + "?temperature=" + String(event.temperature);

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
        msg = "server" ;
      }
      // Free resources
      http.end();
    }
    else
    {
      Serial.println("WiFi Disconnected");
      msg = "wifi";
    }
    display.println(msg);
    display.display();
    lastTime = millis();
  }
  delay(10 * 1000);
}
