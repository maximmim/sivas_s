const express = require('express');
const app = express();
const port = process.env.PORT || 8000; // Порт 3000 будет использован по умолчанию, если переменная окружения PORT не определена

const http = require('http');
const bodyParser = require('body-parser');
const server = http.createServer(app);
const getAllData = require('./db_conect');
//const TelegramBot = require('node-telegram-bot-api');
const API_KEY_BOT = '5312847705:AAE0ii_TUhEeuNPRV52iiFmB0bsEInhANt4';
const cors = require('cors')
const { MongoClient, ObjectId } = require('mongodb');
const crypto = require('crypto');
const secretKey = 'dWLO)(CGEVery'; 
function encrypt(text, secretKey) {
    const cipher = crypto.createCipher('aes-256-cbc', secretKey);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

function decrypt(encryptedText, secretKey) {
    const decipher = crypto.createDecipher('aes-256-cbc', secretKey);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}


  









//const bot = new TelegramBot(API_KEY_BOT, {


//    polling: true
    
//});
app.use(cors());

app.use(bodyParser.json());

const uri = "mongodb+srv://fwa:lozamaxim123@ida.qgq6c9a.mongodb.net/?retryWrites=true&w=majority";



const dbName = 'svid'; 
const posts = 'posts';
const users = 'users';

app.get('/get_data', (req, res) => {
    getAllData(posts).then((users)=>{
        let y = JSON.stringify(users);
        res.json(y);
    })

})
app.get('/get_datas', (req, res) => {
  getAllData(users).then((users)=>{
      let y = JSON.stringify(users);
      res.json(y);
  })

});



async function push_db(data,s) {
  const client = new MongoClient(uri);
  const database = client.db(dbName);
  const collection = database.collection(s); 
  
  await client.connect();
  await collection.insertOne(data);
}
app.post('/post_data', async (req, res) => {  
  // Отправляем ответ клиенту сразу, чтобы подтвердить получение данных
  res.status(200).send("Data received");

  // После этого добавляем данные в базу данных
  try {
    await push_db(req.body, posts);
    console.log('Data added to database successfully');
  } catch (error) {
    console.error('Error while adding data to database:', error);
    // Если произошла ошибка при добавлении данных в базу данных, вы можете отправить соответствующий ответ клиенту
    res.status(500).send("Error occurred while adding data to database");
  }
});

app.post('/check', async (req, res) => {
  let y = req.body;

    const d = await getAllData(users);
    let isPasswordCorrect = false;

    for (const user of d) {
      if (y.pass === decrypt(user.password, secretKey)) {
        isPasswordCorrect = true;
        break; // Прерываем выполнение цикла, так как пароль найден
      }
    }

    // Отправляем ответ клиенту в зависимости от результата проверки пароля
    res.json({ status: isPasswordCorrect });
  
});


app.post("/login", async (req,res)=>{
let user = req.body;
user.password = encrypt(user.password,secretKey);

push_db(user,users)
res.send(200,"send")

})

const webPush = require('web-push');
const PUBLIC_KEY = 'BASbtuZCuVdXUMLM5By1Vw5Z_gkx_llfbv9ll0jPIsdqPYpefWlBPIsk7cs1OT-YhN0baqNODw1w_7Ac8aHg-CE'
const PRIVAT_KEY = '8e4fcsAYwnj2VJBTUMIRD4Br20W1sLHiXmjs9KxKAnw'
webPush.setVapidDetails(
  'mailto:example@yourdomain.org',
  PUBLIC_KEY,
  PRIVAT_KEY
);

// Инициализация объекта для хранения подписок
let subscriptions = {}

// Роут для подписки на push-уведомления
app.get('/sub', (req, res) => {
  // Извлекаем подписку и ID из запроса
  const sub = req.body;
  return res.status(201).json({js:sub});
});
// Роут для подписки на push-уведомления 
app.post('/subscribe', (req, res) => {
    // Извлекаем подписку и ID из запроса
    const {subscription, id} = req.body;
    // Сохраняем подписку в объекте под ключом ID
    subscriptions[id] = subscription;
    // Возвращаем успешный статус
    console.log(subscriptions)
    return res.status(201).json({data: {success: true}});
});

// Роут для отправки push-уведомлений
app.post('/send', (req, res) => {
    // Извлекаем сообщение, заголовок и ID из запроса
    const {message, title, id} = req.body;
    // Находим подписку по ID
    const subscription = subscriptions[id];
    // Формируем payload для push-уведомления
    const payload = JSON.stringify({ title, message });
    
    // Отправляем push-уведомление
    webPush.sendNotification(subscription, payload)
    .catch(error => {
        // В случае ошибки возвращаем статус 400
        return res.status(400).json({data: {success: false}});
    })
    .then((value) => {
        // В случае успешной отправки возвращаем статус 201
        return res.status(201).json({data: {success: true}});
    });
});

//bot.on('text', async msg => {
//    async function send(h) {
//        await bot.sendMessage(msg.from.id,h)
//  
//    };
//   
//    switch (msg.text) {
//        case '/start':
//            await send("Привіт як справи ?");
//
//
//    }
//})





server.listen(port, () => {

});
