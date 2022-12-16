const express = require('express');
const app = express();
var path = require('path');
const fs = require('fs').promises;
var PORT = 4000;

app.use(express.static(path.join(__dirname,"public")));


app.get('/update-sensor', async (req,res) => {
  console.log(req.query);
  const temperature = req.query.temperature;
  await fs.appendFile(path.join(__dirname,'data.json'),JSON.stringify({temperature, time: Date.now()}) + ",")
  res.send("OK");
})


app.get('/history',async (req,res) => {
  let rawData = await fs.readFile(path.join(__dirname,'data.json'), 'utf-8')
  let json = "[" + rawData.slice(0,-1) + "]";
  const measuresHistory = JSON.parse(json)

  res.json(measuresHistory);
})

app.use((req, res) => {
  res.sendFile(path.join(__dirname,"public","index.html"))
});



app.listen(PORT, function(err){
  if (err) console.log(err);
  console.log("Server listening on PORT", PORT);
});

