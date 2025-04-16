const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.TELEGRAM_TOKEN;
const apiKey = process.env.IMEICHECK_API_KEY;

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, '¡Bienvenido! Envía un IMEI para consultar.');
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const imei = msg.text.trim();

  if (!/^\d{14,15}$/.test(imei)) {
    bot.sendMessage(chatId, 'Por favor, ingresa un IMEI válido de 14 o 15 dígitos.');
    return;
  }

  bot.sendMessage(chatId, `Consultando IMEI: ${imei}...`);

  try {
    const response = await axios.get(`https://alpha.imeicheck.com/api/modelBrandName`, {
      params: {
        imei: imei,
        format: 'json'
      },
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const data = response.data;

    if (data && data.model && data.brand) {
      bot.sendMessage(chatId, `Resultado del IMEI:\nModelo: ${data.model}\nMarca: ${data.brand}`);
    } else {
      bot.sendMessage(chatId, 'No se encontró información para este IMEI.');
    }
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, 'Error al consultar el IMEI. Intenta más tarde.');
  }
});