const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.TELEGRAM_TOKEN;
const apiKey = process.env.IMEICHECK_API_KEY;

const bot = new TelegramBot(token, { polling: true });

const borrarMensaje = (chatId, messageId, delay = 60000) => {
  setTimeout(() => {
    bot.deleteMessage(chatId, messageId).catch(() => {});
  }, delay);
};

// Menú de botones
const mainMenu = {
  reply_markup: {
    inline_keyboard: [
      [{ text: '👤 Admin & Staff', callback_data: 'admins' }],
      [{ text: '🧰 Descargar Tools', callback_data: 'tools' }],
      [{ text: '📰 Canal Noticias', url: 'https://t.me/NachoTechRd' }]
    ]
  }
};

const backButton = {
  reply_markup: {
    inline_keyboard: [[{ text: '🔙 Volver al menú', callback_data: 'menu' }]]
  }
};

// /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, '¡Bienvenido! Elige una opción o envía un IMEI para consultar.', mainMenu)
    .then(m => borrarMensaje(m.chat.id, m.message_id));
});

// /menu
bot.onText(/\/menu/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Menú principal:', mainMenu)
    .then(m => borrarMensaje(m.chat.id, m.message_id));
});

// Botones
bot.on('callback_query', (callbackQuery) => {
  const msg = callbackQuery.message;
  const data = callbackQuery.data;

  if (data === 'admins') {
    bot.sendMessage(msg.chat.id, '👤 Equipo:\n- 👑 Admin: @lareddedios\n- 🛠 Staff: @nt', backButton)
      .then(m => borrarMensaje(m.chat.id, m.message_id));
  }

  if (data === 'tools') {
    bot.sendMessage(msg.chat.id, '🧰 Herramientas:\nhttps://wa.me/message/6JULVOWSKEVYM1', backButton)
      .then(m => borrarMensaje(m.chat.id, m.message_id));
  }

  if (data === 'menu') {
    bot.sendMessage(msg.chat.id, '📲 Menú principal:', mainMenu)
      .then(m => borrarMensaje(m.chat.id, m.message_id));
  }
});

// IMEI
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();

  if (!text || text.startsWith('/')) return;
  if (!/^\d{14,15}$/.test(text)) return;

  const consultMsg = await bot.sendMessage(chatId, `🔍 Consultando IMEI: ${text}...`);
  borrarMensaje(chatId, consultMsg.message_id);

  try {
    const response = await axios.get(`https://alpha.imeicheck.com/api/modelBrandName`, {
      params: { imei: text, format: 'json' },
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    const data = response.data;
    const resultText = (data && data.model && data.brand)
      ? `✅ Resultado del IMEI:\n📱 Modelo: ${data.model}\n🏷 Marca: ${data.brand}`
      : '⚠️ No se encontró información para este IMEI.';

    const resultMsg = await bot.sendMessage(chatId, resultText, backButton);
    borrarMensaje(chatId, resultMsg.message_id);
  } catch (error) {
    console.error(error);
    const errorMsg = await bot.sendMessage(chatId, '❌ Error al consultar el IMEI. Intenta más tarde.', backButton);
    borrarMensaje(chatId, errorMsg.message_id);
  }
});

// Bienvenida automática
bot.on('new_chat_members', async (msg) => {
  const chatId = msg.chat.id;
  const groupName = msg.chat.title || 'nuestro grupo';
  const fecha = new Date();

  const opcionesFecha = { timeZone: 'America/Santo_Domingo', hour12: false };
  const fechaLocal = fecha.toLocaleDateString('es-DO', opcionesFecha);
  const horaLocal = fecha.toLocaleTimeString('es-DO', opcionesFecha);

  for (const member of msg.new_chat_members) {
    const name = member.first_name || 'Usuario';
    const userId = member.id;

    const mensaje = 
`👋🏻 ¡Bienvenido/a, ${name}!
🆔 Tu ID de Telegram: ${userId}

📅 Fecha: ${fechaLocal}
🕒 Hora: ${horaLocal}

🎉 Nos alegra tenerte aquí en *${groupName}*. ¡Esperamos que disfrutes tu estancia!

📜 No olvides revisar nuestras /reglas para mantener el ambiente positivo.

📢 Canal de Noticias: @NachoTechRD
👥 Grupo Soporte: @NachoTechRDsoporte`;

    const welcomeMsg = await bot.sendMessage(chatId, mensaje, { parse_mode: 'Markdown' });
    borrarMensaje(chatId, welcomeMsg.message_id);
  }
});
