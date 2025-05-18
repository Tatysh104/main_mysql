const TelegramBot = require('node-telegram-bot-api');
const mysql = require('mysql2');
const token = '7721082236:AAGC9XfzQUPGaBNraYh5vzvVKtpTou0cKoQ';

// Создаем экземпляр бота
const bot = new TelegramBot(token, { polling: true });

// Создаем подключение к базе данных
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ChatBotTests'
});

connection.connect(err => {
  if (err) throw err;
  console.log('Connected to the database!');
});

// Команда /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Привет, октагон!');
});

// Команда /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `
Список доступных команд:
1. /help - возвращает список команд с их описанием.
2. /site - отправляет ссылку на сайт октагона.
3. /creator - отправляет ваше ФИО.
4. /randomItem - возвращает случайный предмет из базы.
5. /deleteItem [id] - удаляет предмет по ID.
6. /getItemByID [id] - возвращает предмет по ID.
`;
  bot.sendMessage(chatId, helpMessage);
});

// Команда /site
bot.onText(/\/site/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Сайт октагона: https://octagon-students.ru/');
});

// Команда /creator
bot.onText(/\/creator/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Мое ФИО: Чокмоева Таттыгул');
});

// Команда /randomItem - возвращает случайный предмет
bot.onText(/\/randomItem/, (msg) => {
  const chatId = msg.chat.id;
  connection.query('SELECT * FROM Items ORDER BY RAND() LIMIT 1', (err, results) => {
    if (err) {
      bot.sendMessage(chatId, 'Ошибка при обращении к базе данных.');
      console.error(err);
      return;
    }
    if (results.length === 0) {
      bot.sendMessage(chatId, 'В базе данных нет предметов.');
      return;
    }
    const item = results[0];
    bot.sendMessage(chatId, `(${item.id}) - ${item.name}: ${item.desc}`);
  });
});

// Команда /deleteItem [id] - удаляет предмет по ID
bot.onText(/\/deleteItem\s+(\d+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const id = match[1];
  connection.query('DELETE FROM Items WHERE id = ?', [id], (err, results) => {
    if (err) {
      bot.sendMessage(chatId, 'Ошибка при удалении предмета.');
      console.error(err);
      return;
    }
    if (results.affectedRows === 0) {
      bot.sendMessage(chatId, `Ошибка: предмет с ID ${id} не найден.`);
    } else {
      bot.sendMessage(chatId, `Удачно: предмет с ID ${id} удалён.`);
    }
  });
});

// Команда /getItemByID [id] - возвращает предмет по ID
bot.onText(/\/getItemByID\s+(\d+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const id = match[1];
  connection.query('SELECT * FROM Items WHERE id = ?', [id], (err, results) => {
    if (err) {
      bot.sendMessage(chatId, 'Ошибка при получении предмета.');
      console.error(err);
      return;
    }
    if (results.length === 0) {
      bot.sendMessage(chatId, `Предмет с ID ${id} не найден.`);
    } else {
      const item = results[0];
      bot.sendMessage(chatId, `(${item.id}) - ${item.name}: ${item.desc}`);
    }
  });
});

// Твои другие команды (!qr, !webscr) оставил без изменений
const qrcode = require('qrcode');
const puppeteer = require('puppeteer');

// Команда !qr
bot.onText(/!qr (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const inputText = match[1];

  qrcode.toDataURL(inputText, (err, url) => {
    if (err) {
      bot.sendMessage(chatId, '❌ Ошибка при генерации QR-кода.');
    } else {
      const imageBuffer = Buffer.from(url.split(",")[1], 'base64');
      bot.sendPhoto(chatId, imageBuffer, { caption: 'Ваш QR-код:' });
    }
  });
});

// Команда !webscr
bot.onText(/!webscr (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const websiteUrl = match[1];

  if (!websiteUrl.startsWith('http')) {
    bot.sendMessage(chatId, '❌ Укажи корректный URL, начинающийся с http или https.');
    return;
  }

  try {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(websiteUrl, { waitUntil: 'networkidle2' });
    const screenshot = await page.screenshot();
    await browser.close();

    bot.sendPhoto(chatId, screenshot, { caption: 'Скриншот сайта' });
  } catch (error) {
    bot.sendMessage(chatId, '❌ Не удалось сделать скриншот. Возможно, сайт недоступен.');
  }
});

// Обработка ошибок
bot.on("polling_error", (error) => {
  console.error("Ошибка при получении обновлений:", error.message);
});

// Обновление последнего сообщения пользователя (оставил как у тебя)
function updateUserLastMessage(userId) {
  const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
  const sql = `
    INSERT INTO users (ID, lastMessage) VALUES (?, ?)
    ON DUPLICATE KEY UPDATE lastMessage = VALUES(lastMessage)
  `;
  connection.query(sql, [userId, today], (err) => {
    if (err) console.error('Ошибка при записи в БД:', err);
  });
}

bot.on('message', (msg) => {
  const userId = msg.from.id;
  updateUserLastMessage(userId);
});
