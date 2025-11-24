import http from 'http';

const SERVER_HOST = 'localhost';
const SERVER_PORT = 4000;
const DEVICE_ID = 'simulator_device_001';

function generateTemperature(): number {
  return Math.random() * 5 + 20; // Random between 20-25
}

function generateOutOfRangeTemperature(): number {
  // Generate temperature outside 20-25 range
  const choice = Math.random();
  if (choice < 0.5) {
    return Math.random() * 10 + 10; // 10-20 (low)
  } else {
    return Math.random() * 10 + 25; // 25-35 (high)
  }
}

function sendTemperature(temp: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      temp: temp.toString(),
      device_id: DEVICE_ID
    });
    
    const options = {
      hostname: SERVER_HOST,
      port: SERVER_PORT,
      path: `/temp?${params.toString()}`,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`[${new Date().toISOString()}] Sent temp: ${temp}°C - Response: ${data}`);
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('Error sending temperature:', error);
      reject(error);
    });

    req.end();
  });
}

async function startSimulation() {
  console.log('Starting temperature simulation...');
  console.log(`Sending data to http://${SERVER_HOST}:${SERVER_PORT}/temp`);
  console.log(`Device ID: ${DEVICE_ID}`);
  console.log('Normal range: 20-25°C every 5 seconds');
  console.log('Out-of-range values: ~every minute');
  console.log('---');

  let counter = 0;
  
  // Send first temperature immediately
  await sendTemperature(generateTemperature());
  counter++;

  // Regular interval every 5 seconds
  setInterval(async () => {
    counter++;
    
    // Every 12 intervals (~1 minute), send an out-of-range value
    if (counter % 12 === 0) {
      const outOfRangeTemp = generateOutOfRangeTemperature();
      await sendTemperature(outOfRangeTemp);
    } else {
      const normalTemp = generateTemperature();
      await sendTemperature(normalTemp);
    }
  }, 5000);
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

startSimulation().catch(console.error);
