import path from 'path';
import express from 'express';
import morgan from 'morgan';
import prisma from './database';
import { Humidity } from '@prisma/client';
import bot, {notifyMe} from './bot';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('tiny'));
app.use(express.static(path.join(__dirname, "public")));

app.get('/update-sensor', async (req, res) => {
  console.log(req.query);
  const { temperature, device_id, name, humidity, sensor} = req.query;
  if (!temperature || !device_id) return res.send("ERROR in provided parameters");
  let device = await prisma.device.findUnique({
    where: {
      device_id: device_id as string
    }
  });
  if (!device) {
    device = await prisma.device.create({
      data: {
        device_id: device_id as string,
        name: name as string,
        sensor: sensor as string
      }
    })
  }

  let newTemperature = await prisma.temperature.create({
    data: {
      value: temperature as string,
      device: {
        connect: {
          id: device.id
        }
      }
    }
  })

  // only create humidity if the sensor 
  let  newHumidity;
  if (humidity) {
    newHumidity = await prisma.humidity.create({
      data: {
        value: humidity as string,
        device: {
          connect: {
            id: device.id
          }
        }
      }
    })
  }

  
  if (!device || !newTemperature ) return res.send("error in one of the instances creation");

  // check if the sensor is an incubation sensor
  if(device.sensor.includes("incubation")) {
    if(+temperature > 25) notifyMe(`Temperature is ${temperature}°C, please check the incubation sensor`);
    if(+temperature < 23) notifyMe(`Temperature is ${temperature}°C, please check the incubation sensor`);
  }
  res.send("OK");
})

app.get("/history", async (req, res) => {
  const { device_id } = req.query;
  if (!device_id) return res.send("ERROR");
  const device = await prisma.device.findUnique({
    where: {
      device_id: device_id as string
    }
  });
  if (!device) return res.send("ERROR");
  let temperatures = await prisma.temperature.findMany({
    where: {
      device_id: device.id
    }
  });

  // only get humidity if the sensor is a DHT
  let  humidity : Humidity[] = [];
  if(device.sensor.includes("DHT")) {
    humidity = await prisma.humidity.findMany({
      where: {
        device_id: device.id
      }
    });
  }
  res.json({
    temperatures: temperatures.map(temperature => {
      return {
        value: temperature.value,
        timestamp: new Date(temperature.timestamp).getTime()
      }
    }),
    humidity: humidity.map(humidity => {
      return {
        value: humidity.value,
        timestamp: new Date(humidity.timestamp).getTime()
      }
    })
  });
})

app.get("/devices", async (req, res) => {
  const devices = await prisma.device.findMany();
  res.json(
    devices.map(device => {
      return {
        name: device.name,
        device_id: device.device_id,
        sensor: device.sensor
      }
    })
  );
})


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
});


export default app;