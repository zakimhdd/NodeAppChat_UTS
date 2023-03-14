var express = require("express");
var bodyParser = require("body-parser");
var app = express(); //reference variable
var http = require("http").Server(app);
var io = require("socket.io")(http);
var mongoose = require("mongoose");
var Filter = require('bad-words')
var filter = new Filter;
var newBadWords = ['some', 'bad', 'word'];
filter.addWords(...newBadWords)

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
mongoose.Promise = Promise;
var dbUrl = "mongodb://localhost:27017/chat_app";

var Message = mongoose.model("Message", {
  nama: String,
  pesan: String,
}); //schema definition

var Badword = mongoose.model("Badword", {
  word: String,
});

function getBadwords() {
  return Badword.find().exec();
}

function filterMessage(message, badwords) {

  badwords.forEach((badword) => {
    // const regex = new RegExp(`\\b${badword.word}\\b`, 'gi')
    const regex = new RegExp(`\\b${badword.word}\\b|${badword.word  }`, "gi");
    
    

    message = message.replace(regex, "*".repeat(badword.word.length));
  });
  return message;
}

app.get("/pesan", async function (req, res) {
  try {
    const messages = await Message.find({});
    const badwords = await getBadwords();

    const filteredMessages = messages.map((message) => {
      const filteredMessage = filterMessage(message.pesan, badwords);
      return {
        ...message.toObject(),
        pesan: filteredMessage,
      };
    });

    res.send(filteredMessages);
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});

app.post("/pesan", async function (req, res) {
  try {
    const message = new Message(req.body);

    const savedMessage = await message.save();
    console.log("tersimpan");
    const badwords = await getBadwords();
    const filteredMessage = filterMessage(req.body.pesan, badwords);
    if (filteredMessage !== req.body.pesan) {
      console.log("kata-kata kasar ditemukan dan diblokir!");
    }
    io.emit("pesan", { ...req.body, pesan: filteredMessage });
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});

// app.get('/pesan', function (req, res) {
//     Message.find({}, function (err, pesan) {
//         res.send(pesan)
//     })
// })

// app.post('/pesan', async function (req, res) {

//     try{
//         var message = new Message(req.body)

//         var savedMessage = await message.save()
//         console.log('tersimpan')
//         var sensor = await Message.findOne({pesan:'badword'})

//         if (sensor) {
//             console.log('kata badword ditemukan!', sensor)
//             await Message.deleteMany({_id:sensor.id})
//         }else {
//             io.emit('pesan', req.body)
//         }
//         res.sendStatus(200)
//     }catch (error) {
//         res.sendStatus(500)
//         return console.log(error)
//     }finally {
//         console.log('post pesan panggil')
//     }
// })

io.on("connection", function (socket) {
  console.log("a user connected!");
});

mongoose.connect(dbUrl, function (err) {
  console.log("koneksi ke mongodb berhasil!", err);
});

var server = http.listen(3000, function () {
  console.log("port server adalah", server.address().port);
});
