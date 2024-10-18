require("dotenv").config({ path: "./.env" });

const twilio = require("twilio");
const express = require("express");
const cors = require("cors");
const { MessagingResponse } = require('twilio').twiml;
const { Server } = require("socket.io");
const multer = require("multer");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const port = process.env.PORT || 8000;

const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function (_, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
})
const upload = multer({ storage });
const client = twilio(accountSid, authToken);
const app = express();

const server = require("http").createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.use(cors());
app.use("/", express.static("./public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/api/phone-numbers", (req, res) => {
  client.incomingPhoneNumbers.list((err, items) => {
    res.json(items.map(item => item.phoneNumber));
  });
});

app.get("/api/statistics", async (req, res) => {
  const result = {};
  try {
    const balance = await client.balance.fetch();
    result.balance = {
      amount: balance.balance,
      currency: balance.currency
    };

    res.json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/api/messages", (req, res) => {
  const pageNumber = req.body.pageNumber || 0;
  client.messages.page({ pageSize: 50, pageNumber })
    .then(data => res.json(data));
});

app.post("/receive-message", (req, res) => {
  io.emit("receive-message", JSON.stringify(req.body));
  // io.emit("receive-message", JSON.stringify(response));

  const twiml = new MessagingResponse();
  res.type('text/xml').send(twiml.toString());
});

app.post("/api/send-message", upload.single('file'), async (req, res) => {
  if (true || req.body.when == "now") {
    try {
      await client.messages.create({
        body: req.body.message,
        from: req.body.from,
        to: req.body.to,
        ...(req.file && { mediaUrl: `http://20.47.120.34/uploads/${req.file?.filename}` })
      });
    } catch { }
  } else { }
  res.end();
});

server.listen(port, () => console.log(`Server started ${port}`));
