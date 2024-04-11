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
async function send_push(title, message) {
  try {
      // Retrieve all subscriptions from MongoDB
      const subscriptions = await getAllData('push');
      
      // Form payload for push notification
      const payload = JSON.stringify({ title, message });

      // Iterate through subscriptions and send push notification to each one
      const notifications = subscriptions.map(subscription => {
          return webPush.sendNotification(subscription.subscription, payload)
              .catch(error => {
                  console.error('Error sending notification:', error);
                  return null; // Return null if there's an error in sending notification
              });
      });

      // Wait for all notifications to be sent
      await Promise.all(notifications);

      console.log('Notifications sent successfully.');
  } catch (error) {
      console.error('Error sending notifications:', error);
      throw error;
  }
}






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

  try {
    await push_db(req.body, posts);
    send_push("Do you want to see a new post?",`User ${req.body.nick} added a new post`)
    console.log('Data added to database successfully');
  } catch (error) {
    console.error('Error while adding data to database:', error);
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



app.post('/subscribe', async (req, res) => {
  // Extract subscription and ID from the request body
  const { subscription, id,nick } = req.body;
  
  try {
      // Save the subscription to MongoDB
      await push_db({ id, subscription, nick}, 'push'); // Assuming collection name is 'subscriptions'
      
      // Respond with success status
      return res.status(201).json({ data: { success: true } });
  } catch (error) {
      console.error('Error saving subscription to MongoDB:', error);
      return res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/send', async (req, res) => {
  // Extract message, title, and ID from the request body
  const { message, title, id } = req.body;

  try {
      // Retrieve subscription from MongoDB based on ID
      const subscriptions = await getAllData('push');
      const subscription = subscriptions.find(sub => sub.id === id);

      if (!subscription) {
          return res.status(404).json({ error: 'Subscription not found' });
      }

      // Form payload for push notification
      const payload = JSON.stringify({ title, message });

      // Send push notification
      webPush.sendNotification(subscription.subscription, payload)
          .then(() => {
              // If notification sent successfully, return success status
              return res.status(201).json({ data: { success: true } });
          })
          .catch(error => {
              // If there's an error in sending the notification, return error status
              console.error('Error sending notification:', error);
              return res.status(400).json({ error: 'Failed to send notification' });
          });
  } catch (error) {
      console.error('Error processing request:', error);
      return res.status(500).json({ error: 'Internal server error' });
  }
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
