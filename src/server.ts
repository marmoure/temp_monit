import path from 'path';
import express from 'express';
import prisma from './database';
import {notifyMe} from './bot';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
});

app.get("/temp", async (req, res) => {
  const { device_id, temp } = req.query;
  
  if (!device_id || temp === undefined) {
    return res.status(400).json({ error: "device_id and temp are required" });
  }

  try {
    let device = await prisma.device.findUnique({
      where: { device_id: device_id as string }
    });

    if (!device) {
      device = await prisma.device.create({
        data: { device_id: device_id as string }
      });
    }

    const tempRecord = await prisma.temperature.create({
      data: {
        value: temp as string,
        device_id: device.id
      }
    });

    const tempNum = parseFloat(temp as string);
    if(tempNum > 25 || tempNum < 20) {
      notifyMe(`WARNING Temperature is ${temp}°C`);
    }

    res.json({ 
      success: true, 
      id: tempRecord.id,
      timestamp: tempRecord.timestamp
    });
  } catch (error) {
    console.error("Error saving temperature:", error);
    res.status(500).json({ error: "Failed to save temperature data" });
  }
});

app.get("/history", async (req, res) => {

  // get the first device
  const device = await prisma.device.findFirst();
  if (!device) return res.json({error: "No device found"});
  let temperatures = await prisma.temperature.findMany({
    where: {
      device_id: device.id
    }
  });

  res.json(temperatures.map(temperature => {
    return {
      temperature: temperature.value,
      time: new Date(temperature.timestamp).getTime()
    }
  }));
})

export default app;