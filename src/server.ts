import path from 'path';
import express from 'express';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname,"public")));

app.get('/update-sensor', async (req,res) => {
  console.log(req.query);
  const temperature = req.query.temperature;
  res.send("OK");
})


app.get("/",(req, res) => {
  res.sendFile(path.join(__dirname,"public","index.html"))
});


export default app;