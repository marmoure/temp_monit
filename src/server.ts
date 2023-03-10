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
  if(! device || !newTemperature) return res.send("ERROR");
  res.send("OK");
})


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
});


export default app;