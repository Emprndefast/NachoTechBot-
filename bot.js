const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.TELEGRAM_TOKEN;
const apiKey = process.env.IMEICHECK_API_KEY;

const bot = new TelegramBot(token, { polling: true });

// Comando /start con botones
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '👤 Admin & Staff', callback_data: 'admins' }],
        [{ text: '🧰 Descargar Tools', callback_data: 'tools' }],
        [{ text: '📰 Canal Noticias', url: 'https://t.me/TuCanalAquí' }] // Reemplaza con tu canal real
      ]
    }
  };

  bot.sendMessage(chatId, '¡Bienvenido! Elige una opción o envía un IMEI para consultar.', options);
});

// Acciones para los botones
bot.on('callback_query', (callbackQuery) => {
  const msg = callbackQuery.message;
  const data = callbackQuery.data;

  if (data === 'admins') {
    bot.sendMessage(msg.chat.id, 'Equipo:\n- Admin: @AdminUser\n- Staff: @StaffUser'); // Reemplaza con tus usuarios reales
  }

  if (data === 'tools') {
    bot.sendMessage(msg.chat.id, 'Descarga nuestras herramientas aquí:\nhttps://tusitio.com/tools.zip'); // Cambia el link por el tuyo
  }
});

// Manejo de mensajes para detectar IMEI
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const imei = msg.text.trim();

  if (!/^\d{14,15}$/.test(imei)) return;

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
