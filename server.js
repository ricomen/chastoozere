const express = require('express');
const path = require('path');

const app = express();

// Парсим JSON и обычные формы
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Отдаём статику (подстройте путь, если нужно)
app.use(express.static(path.join(__dirname, 'chastoozere')));

// Маршрут для приёма данных формы
app.post('/api/prayer', (req, res) => {
  try {
    const {
      names = [],
      candles = [],
      donations = [],
      video = {},
      customDonation = 0,
      totalClient = 0,
    } = req.body;

    // Справочник цен (дублируем логику цен на сервере)
    const PRICE_TABLE = {
      small: 50,
      medium: 100,
      large: 200,
      wine: 1100,
      incense: 700,
      oil: 300,
      video: 1100,
    };

    // Пересчёт суммы на сервере
    let totalServer = 0;

    candles.forEach((item) => {
      const count = Number(item.count) || 0;
      const price = PRICE_TABLE[item.type] || 0;
      totalServer += count * price;
    });

    donations.forEach((item) => {
      const count = Number(item.count) || 0;
      const price = PRICE_TABLE[item.type] || 0;
      totalServer += count * price;
    });

    if (video && video.checked) {
      totalServer += PRICE_TABLE.video;
    }

    totalServer += Number(customDonation) || 0;

    // Можно логировать/отправлять дальше
    console.log('Новая записка:', {
      names,
      candles,
      donations,
      video,
      customDonation,
      totalClient,
      totalServer,
    });

    // Простой ответ клиенту
    return res.json({
      ok: true,
      message: 'Записка принята. Храни Вас Господь!',
      totalServer,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      ok: false,
      message: 'Ошибка при обработке записки',
    });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});