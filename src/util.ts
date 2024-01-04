import prisma from "./database";

export const getDevices = async () => {
  const devices = await prisma.device.findMany();
  return(
    devices.map(device => {
      return {
        name: device.name,
        device_id: device.device_id,
        sensor: device.sensor
      }
    })
  );
}


export const getCurrentTemperature = async (device_id: string) => {
  const device = await prisma.device.findUnique({
    where: {
      device_id
    }
  });
  if (!device) return null;
  const temperature = await prisma.temperature.findFirst({
    where: {
      device_id: device.id
    },
    orderBy: {
      timestamp: "desc"
    }
  });
  if (!temperature) return null;
  return temperature.value;
}

export const getDayLowestTemperature = async (device_id: string) => {
  const device = await prisma.device.findUnique({
    where: {
      device_id
    }
  });
  if (!device) return null;
  const temperature = await prisma.temperature.findFirst({
    where: {
      device_id: device.id,
      timestamp: {
        gte: new Date(new Date().setHours(0,0,0,0))
      }
    },
    orderBy: {
      value: "asc"
    }
  });
  if (!temperature) return null;
  return temperature.value;
}

export const getDayHighestTemperature = async (device_id: string) => {
  const device = await prisma.device.findUnique({
    where: {
      device_id
    }
  });
  if (!device) return null;
  const temperature = await prisma.temperature.findFirst({
    where: {
      device_id: device.id,
      timestamp: {
        gte: new Date(new Date().setHours(0,0,0,0))
      }
    },
    orderBy: {
      value: "desc"
    }
  });
  if (!temperature) return null;
  return temperature.value;
}