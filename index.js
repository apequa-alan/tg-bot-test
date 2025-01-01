const TelegramBot = require('node-telegram-bot-api')
const express = require('express')
const cors = require('cors')

const token = '7718761845:AAFx6eWWCgeNfAC6FoxtRLkvl3yx6IUrM2w'

const bot = new TelegramBot(token, { polling: true });
const webUrl = 'https://tgminiappstoreapp.web.app'

const app = express()
app.use(express.json())
app.use(cors())
const start =  () => {
    bot.on('message', async (message) => {
        const chatId = message.chat.id;
        const text = message.text
        if (text === '/start'){
            await bot.sendMessage(chatId, 'Ниже появится кнопка для страницы', {
                reply_markup: {
                    keyboard: [
                        [{text: 'Заполнить форму', web_app: {url: webUrl + '/form'}}]
                    ]
                }
            })

            await bot.sendMessage(chatId, 'Ниже появится кнопка для формы', {
                reply_markup: {
                    inline_keyboard: [
                        [{text: 'Сделать заказ', web_app: {url: webUrl}}]
                    ]
                }
            })
        }
        if (message.web_app_data?.data) {
            console.log(message.web_app_data.data)
            try {
                const data = JSON.parse(message.web_app_data.data)
                await bot.sendMessage(chatId, 'Ваши данные были приняты')
                await bot.sendMessage(chatId, `Страна: ${data.country} | Улица: ${data.street}`)

                setTimeout(async () => {
                    await bot.sendMessage(chatId, 'Всю информацию вы получите в чате')
                }, 1000)
            } catch (error) {
                console.log(error)
            }
        }
    });
}

start()

app.post('/web-data', async (req, res) => {
    const {queryId, products, totalPrice} = req.body
    console.log(products)
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: {message_text: `Поздравляю с сделкой, общая сумма товара ${totalPrice}`}
        })
        return res.status(200).json({})
    } catch (error) {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Ошибка при покупке',
            input_message_content: {message_text: `Не удавлось приобрести товар`}
        })
        return res.status(500).json({})
    }
})

const PORT = 8080
app.listen(port, () => {
    console.log('server was started on port: ' + PORT)
})
