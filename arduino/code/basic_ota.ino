#include <WiFiClient.h>
#include <ArduinoOTA.h>


char *ssid = "ZTE_2.4G_cxm65S";
char *password = "Mp22NW9j";

// the setup function runs once when you press reset or power the board
void setup() {

  // start serial port
  Serial.begin(115200);


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

  // OTA
  ArduinoOTA.begin();

}

// the loop function runs over and over again forever
void loop() {
  delay(1000);                       // wait for a second
  
  // OTA
  ArduinoOTA.handle();

}