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
const webpush = require("web-push");
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
app.post('/post_data',async (req,res) =>{  
  res.send(200,"send")
  push_db(req.body,posts);

})
app.post('/check', (req, res) => {
  let y = req.body;
  getAllData(users).then((users)=>{
      users.map((h)=>{
        if (y.pass == decrypt(h.password,secretKey)) {
          res.send({
            status:true
          })
        } 
        else {
          res.send({
            status:false
          })
        }
      })
  })

})

app.post("/login", async (req,res)=>{
let user = req.body;
user.password = encrypt(user.password,secretKey);

push_db(user,users)
res.send(200,"send")

})



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


function send_message() {


const VAPID = {
  publicKey:
  "BKI6Pt0oowfWlpubOmOMUMgl-YrBK6xvv08kzHcdKI8X0xYLVXI4jdkBbgYfGAZ1nO-6P1aXAA1kzmUfWEq7loE",
  privateKey: 'aLXoqFnqA_Q3KZyr0Jslt-c7QA1wkGgh2BDHou9y4Og',
};
webpush.setVapidDetails(
  "mailto:example@yourdomain.org",
  VAPID.publicKey,
  VAPID.privateKey
);

  async function sendNotification(pushSubscription) {
  try {
    return await webpush
      .sendNotification(
        pushSubscription,
        "JUST TEXT"
      );
  } catch (err) {
    console.log(err);
  }
}

getAllData(users).then((f)=>{
  f.forEach(item => {

sendNotification(item);

  })
})

}


//send_message()



server.listen(port, () => {

});
