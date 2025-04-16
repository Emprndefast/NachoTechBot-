const TelegramBot = require('node-telegram-bot-api');

// Reemplaza con el token que te dio BotFather
const token = '7568086757:AAEydV49DBzLELpuvcGZpQ9jTlPZFPVcxRI';

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, '¡Hola! Envía un IMEI y te mostraré los datos del dispositivo.');
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text.trim();

  // Verificamos si es un IMEI válido (14 o 15 dígitos)
  if (/^\d{14,15}$/.test(text)) {
    bot.sendMessage(chatId, 'Consultando IMEI, por favor espera...');
    bot.sendMessage(chatId, 'Resultado del IMEI: \n- Modelo: iPhone 12 Pro\n- Color: Graphite\n- FMI: OFF\n- Estado: CLEAN');
  }
});
