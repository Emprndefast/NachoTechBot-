const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.TELEGRAM_TOKEN;
const apiKey = process.env.IMEICHECK_API_KEY;

const bot = new TelegramBot(token, { polling: true });

// Menú de botones (lo reutilizamos en varios lugares)
const mainMenu = {
  reply_markup: {
    inline_keyboard: [
      [{ text: '👤 Admin & Staff', callback_data: 'admins' }],
      [{ text: '🧰 Descargar Tools', callback_data: 'tools' }],
      [{ text: '📰 Canal Noticias', url: 'https://t.me/NachoTechRd' }]
    ]
  }
};

// Botón de volver al menú
const backButton = {
  reply_markup: {
    inline_keyboard: [[{ text: '🔙 Volver al menú', callback_data: 'menu' }]]
  }
};

// /start muestra menú
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, '¡Bienvenido! Elige una opción o envía un IMEI para consultar.', mainMenu);
});

// /menu también muestra el menú
bot.onText(/\/menu/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Menú principal:', mainMenu);
});

// Respuesta a los botones
bot.on('callback_query', (callbackQuery) => {
  const msg = callbackQuery.message;
  const data = callbackQuery.data;

  if (data === 'admins') {
    bot.sendMessage(msg.chat.id, 'Equipo:\n- Admin: @lareddedios\n- Staff: @nt', backButton);
  }

  if (data === 'tools') {
    bot.sendMessage(msg.chat.id, 'Descarga nuestras herramientas aquí:\nhttps://wa.me/message/6JULVOWSKEVYM1', backButton);
  }

  if (data === 'menu') {
    bot.sendMessage(msg.chat.id, 'Menú principal:', mainMenu);
  }
});

// Manejo de mensajes para detectar IMEI
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  // Ignorar mensajes sin texto (como stickers o botones)
  if (!msg.text) return;

  const imei = msg.text.trim();

  // Verificar si es un IMEI válido
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
      bot.sendMessage(chatId, `Resultado del IMEI:\nModelo: ${data.model}\nMarca: ${data.brand}`, backButton);
    } else {
      bot.sendMessage(chatId, 'No se encontró información para este IMEI.', backButton);
    }
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, 'Error al consultar el IMEI. Intenta más tarde.', backButton);
  }
});
