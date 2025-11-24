import { Bot, InlineKeyboard, Context } from 'grammy';
import { getCurrentTemperature, getDayHighestTemperature, getDayLowestTemperature, getDevices } from './util';

const token = process.env.TOKEN;
let chatId : number | null = process.env.CHAT_ID ? parseInt(process.env.CHAT_ID) : null;

const bot = token ? new Bot(token) : null;

// Handle /start command
if (bot) {
  bot.command('start', async (ctx: Context) => {
  const devices = await getDevices();
  const keyboard = new InlineKeyboard();
  
  devices.forEach(device => {
    keyboard.text(`device ${device.device_id}`, `device_${device.device_id}`).row();
  });

  chatId = ctx.chat?.id || null;
  console.log("setting chat Id to this new device");
  

  await ctx.reply("Welcome", {
    reply_markup: keyboard,
  });

  notifyMe("I will be sending you temperature updates in this chat");
  });
}

// Handle callback queries from device buttons
if (bot) {
  bot.callbackQuery(/device_(.+)/, async (ctx: Context) => {
  const device_id = ctx.match![1];
  
  const current = await getCurrentTemperature(device_id);
  const dayLowest = await getDayLowestTemperature(device_id);
  const dayHighest = await getDayHighestTemperature(device_id);
  
  await ctx.reply(`Current Temperature is ${current}°C\nDay Lowest Temperature is ${dayLowest}°C\nDay Highest Temperature is ${dayHighest}°C`);
  await ctx.answerCallbackQuery();
  });
}

// Handle /device command for backward compatibility
if (bot) {
  bot.command('device', async (ctx: Context) => {
  const messageText = ctx.message?.text || '';
  const parts = messageText.split(' ');
  const device_id = parts[1];
  
  if (!device_id) return ctx.reply("No device id provided");

  const current = await getCurrentTemperature(device_id);
  const dayLowest = await getDayLowestTemperature(device_id);
  const dayHighest = await getDayHighestTemperature(device_id);
  return ctx.reply(`Current Temperature is ${current}°C\nDay Lowest Temperature is ${dayLowest}°C\nDay Highest Temperature is ${dayHighest}°C`);
  });
}

// Start the bot asynchronously with error handling
if (bot) {
  bot.start().catch((error) => {
    console.error('Failed to start Telegram bot:', error);
  });
} else {
  console.log('No Telegram token provided, bot will not start');
}

export const notifyMe = (message: string) => {
  if (!chatId || !bot) {
    console.log('No chat ID or bot available, skipping Telegram notification');
    return;
  }
  try {
    bot.api.sendMessage(String(chatId), message);
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
  }
}

export default bot;
