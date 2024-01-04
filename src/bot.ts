import TelegramBot  from 'node-telegram-bot-api';
import { getCurrentTemperature, getDayHighestTemperature, getDayLowestTemperature, getDevices } from './util';

const token = process.env.TOKEN;
const chatId = 1616216219;

const bot = new TelegramBot(token as string, {polling: true});

//matches /start
bot.onText(/\/start/, async (msg) => {
  const devices = await getDevices();
  const devices_keyboard : any[][] = devices.map(device => {
    return [{text: `device ${device.name} ${device.device_id}`}]
  });

  bot.sendMessage(msg.chat.id, "Welcome", {
    "reply_markup": {
        "keyboard": devices_keyboard
        }
    });
});

//matches /device.*
bot.onText(/device (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const device_id = match? match[1].split(" ")[1] : "";
  if(!device_id) return bot.sendMessage(chatId, "No device id provided");

  const current = await getCurrentTemperature(device_id);
  const dayLowest = await getDayLowestTemperature(device_id);
  const dayHighest = await getDayHighestTemperature(device_id);
  return bot.sendMessage(chatId, `Current Temperature is ${current}°C\nDay Lowest Temperature is ${dayLowest}°C\nDay Highest Temperature is ${dayHighest}°C`);
});

export const notifyMe = (message: string) => {
  bot.sendMessage(chatId, message);
}

export default bot;
