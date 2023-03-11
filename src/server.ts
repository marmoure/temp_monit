import path from 'path';
import express from 'express';
import prisma from './database';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.get('/update-sensor', async (req, res) => {
  console.log(req.query);
  const { temperature, device_id } = req.query;
  if (!temperature || !device_id) return res.send("ERROR");
  let device = await prisma.device.findUnique({
    where: {
      device_id: device_id as string
    }
  });
  if (!device) {
    device = await prisma.device.create({
      data: {
        device_id: device_id as string,
        name: "TODO"
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
  if (!device || !newTemperature) return res.send("ERROR");
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

  res.json(
    temperatures.map(temperature => {
      return {
        value: temperature.value,
        timestamp: new Date(temperature.timestamp).getTime()
      }
    })
  );
})

app.get("/devices", async (req, res) => {
  const devices = await prisma.device.findMany();
  res.json(
    devices.map(device => {
      return {
        name: device.name,
        device_id: device.device_id
      }
    })
  );
})


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
});


export default app;