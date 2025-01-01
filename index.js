const { Telegraf } = require('telegraf');
const express = require('express');
const cors = require('cors');

const token = '7718761845:AAFx6eWWCgeNfAC6FoxtRLkvl3yx6IUrM2w';
const webAppUrl = 'https://tgminiappstoreapp.web.app';

const bot = new Telegraf(token);
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Обработчик команды /start
bot.start(async (ctx) => {
    const chatId = ctx.chat.id;

    // Сообщение с кнопкой для формы
    await ctx.reply('Ниже появится кнопка, заполни форму', {
        reply_markup: {
            keyboard: [
                [{ text: 'Заполнить форму', web_app: { url: `${webAppUrl}/form` } }]
            ],
        },
    });

    // Сообщение с кнопкой для интернет-магазина
    await ctx.reply('Заходи в наш интернет магазин по кнопке ниже', {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Сделать заказ', web_app: { url: webAppUrl } }],
            ],
        },
    });
});

// Обработчик данных из WebApp
bot.on('message', async (ctx) => {
    const chatId = ctx.chat.id;

    // Проверяем, есть ли данные из WebApp
    if (ctx.message?.web_app_data?.data) {
        try {
            const data = JSON.parse(ctx.message.web_app_data.data);

            console.log('Получены данные из WebApp:', data);

            // Отправляем подтверждение пользователю
            await ctx.reply('Спасибо за обратную связь!');
            await ctx.reply(`Ваша страна: ${data.country}`);
            await ctx.reply(`Ваша улица: ${data.street}`);

            setTimeout(async () => {
                await ctx.reply('Всю информацию вы получите в этом чате');
            }, 3000);
        } catch (error) {
            console.error('Ошибка обработки данных из WebApp:', error);
            await ctx.reply('Произошла ошибка при обработке данных.');
        }
    }
});

// Эндпоинт для обработки данных с WebApp
app.post('/web-data', async (req, res) => {
    const { queryId, products = [], totalPrice } = req.body;

    console.log('Получен запрос от клиента:', req.body);

    if (!queryId) {
        return res.status(400).json({ error: 'queryId отсутствует' });
    }

    try {
        // Отправляем ответ пользователю через answerWebAppQuery
        await bot.telegram.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: {
                message_text: `Поздравляю с покупкой, вы приобрели товар на сумму ${totalPrice}, ${products.map((item) => item.title).join(', ')}`,
            },
        });

        console.log('Успешный ответ отправлен через answerWebAppQuery');
        res.status(200).json({ queryId, products, totalPrice });
    } catch (error) {
        console.error('Ошибка при вызове answerWebAppQuery:', error);
        res.status(500).json({});
    }
});

// Запуск сервера Express
const PORT = 8000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));

// Запуск бота Telegraf
bot.launch().then(() => console.log('Бот успешно запущен!'));

// Обработка завершения приложения
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
