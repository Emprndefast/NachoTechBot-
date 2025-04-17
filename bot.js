const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.TELEGRAM_TOKEN;
const sickwApiKey = '3TI-MD8-GCQ-UHM-BGI-FRA-5I6-1GD';
const sickwServiceID = '3';
const format = 'json';

const bot = new TelegramBot(token, { polling: true });

const mainMenu = {
  reply_markup: {
    inline_keyboard: [
      [{ text: '👤 Admin & Staff', callback_data: 'admins' }],
      [{ text: '🧰 Descargar Tools', callback_data: 'tools' }],
      [{ text: '💰 Consultar Balance', callback_data: 'balance' }],
      [{ text: '📰 Canal Noticias', url: 'https://t.me/NachoTechRd' }],
      [{ text: '📋 Lista de Servicios', callback_data: 'services' }],
      [{ text: '⚙️ Estado del Dispositivo', callback_data: 'deviceStatus' }],
      [{ text: '🔐 Estado de Bloqueo SIM', callback_data: 'simLockStatus' }],
      [{ text: '🔧 Reparaciones Actuales', callback_data: 'currentRepairs' }],
    ]
  }
};

const backButton = {
  reply_markup: {
    inline_keyboard: [[{ text: '🔙 Volver al menú', callback_data: 'menu' }]]
  }
};

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, '¡Bienvenido! Elige una opción o envía un IMEI para consultar.', mainMenu);
});

bot.onText(/\/menu/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Menú principal:', mainMenu);
});

bot.on('callback_query', async (callbackQuery) => {
  const msg = callbackQuery.message;
  const data = callbackQuery.data;

  if (data === 'admins') {
    bot.sendMessage(msg.chat.id, '👨‍💻 Equipo:\n- Admin: @lareddedios\n- Staff: @nt', backButton);
  }

  if (data === 'tools') {
    bot.sendMessage(msg.chat.id, '🧰 Herramientas disponibles:\nhttps://wa.me/message/6JULVOWSKEVYM1', backButton);
  }

  if (data === 'menu') {
    bot.sendMessage(msg.chat.id, 'Menú principal:', mainMenu);
  }

  if (data === 'balance') {
    try {
      const response = await axios.get(`https://sickw.com/api.php?action=balance&key=${sickwApiKey}`);
      const balance = response.data;
      bot.sendMessage(msg.chat.id, `💰 *Balance actual de Sickw:*\n${balance} créditos`, { parse_mode: 'Markdown' });
    } catch (error) {
      bot.sendMessage(msg.chat.id, '⚠️ Error al consultar el balance.', backButton);
    }
  }

  if (data === 'services') {
    const services = [
      { name: 'APPLE SOLD BY & COVERAGE', price: '2.40' },
      { name: 'SAMSUNG INFO - PRO', price: '0.10' },
      { name: 'iCLOUD ON/OFF', price: '0.02' },
      { name: 'iCLOUD CLEAN/LOST', price: '0.03' },
      { name: 'WW BLACKLIST STATUS - PRO', price: '0.09' },
      { name: 'iPHONE SIM-LOCK', price: '0.025' },
      { name: 'VERIZON USA STATUS - PRO', price: '0.05' },
      { name: 'APPLE ACTIVATION STATUS - IMEI/SN', price: '0.03' },
      { name: 'IMEI ⇄ SN CONVERT', price: '0.025' },
      { name: 'MOTOROLA INFO', price: '0.08' },
      { name: 'HUAWEI INFO', price: '0.10' },
      { name: 'ALCATEL INFO', price: '0.10' },
    ];

    let servicesMessage = '🔧 *Lista de Servicios Disponibles:*\n\n';
    services.forEach(service => {
      servicesMessage += `🛠️ *${service.name}* - 💰 Precio: ${service.price} USD\n`;
    });

    bot.sendMessage(msg.chat.id, servicesMessage, { parse_mode: 'Markdown', reply_markup: backButton.reply_markup });
  }

  if (data === 'deviceStatus') {
    bot.sendMessage(msg.chat.id, '🔍 Consultando estado del dispositivo...', backButton);
    // Aquí agregaríamos el código para verificar el estado del dispositivo usando ADB o una API externa
  }

  if (data === 'simLockStatus') {
    bot.sendMessage(msg.chat.id, '🔍 Consultando estado de bloqueo SIM...', backButton);
    // Agregar código para verificar el estado del bloqueo SIM de un dispositivo
  }

  if (data === 'currentRepairs') {
    bot.sendMessage(msg.chat.id, '🔧 Mostrando reparaciones actuales...', backButton);
    // Aquí podrías agregar la lógica para mostrar las reparaciones actuales en curso
  }
});

bot.on('new_chat_members', (msg) => {
  const chatId = msg.chat.id;
  const newMembers = msg.new_chat_members;
  const groupName = msg.chat.title || 'nuestro grupo';

  newMembers.forEach((member) => {
    const name = member.first_name || 'Usuario';
    const userId = member.id;
    const fecha = new Date();
    const opcionesFecha = { timeZone: 'America/Santo_Domingo', hour12: false };
    const fechaLocal = fecha.toLocaleDateString('es-DO', opcionesFecha);
    const horaLocal = fecha.toLocaleTimeString('es-DO', opcionesFecha);

    const mensajeBienvenida = 
`👋🏻 ¡Bienvenido/a, ${name}!
👀 Tu ID de Telegram es: ${userId}

📅 Fecha: ${fechaLocal}
🕒 Hora: ${horaLocal}

🎉 Nos alegra tenerte aquí en *${groupName}*. ¡Esperamos que disfrutes tu estancia!

📜 Asegúrate de revisar nuestras /reglas para mantener el ambiente sano y respetuoso.

🚀 Este es un nuevo comienzo lleno de oportunidades. ¡Gracias por ser parte!

📢 Noticias: @NachoTechRD
👥 Soporte: @NachoTechRDsoporte`;

    bot.sendMessage(chatId, mensajeBienvenida, { parse_mode: 'Markdown' }).then(sent => {
      setTimeout(() => {
        bot.deleteMessage(chatId, sent.message_id).catch(() => {});
      }, 60 * 1000);
    });
  });
});
