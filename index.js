require("dotenv").config({ path: "./.env" });
// require("dotenv").config({ path: "./.env.development" });

const twilio = require("twilio");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const port = process.env.PORT || 8000;

const storage = multer.memoryStorage();
const upload = multer({ storage });
const client = twilio(accountSid, authToken);
const app = express();

app.use(cors());
app.use("/", express.static("./public"));
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.listen(port, () => console.log(`Server started ${port}`));

app.get("/phone-numbers", (req, res) => {
  client.incomingPhoneNumbers.list((err, items) => {
    res.json(items.map(item => item.phoneNumber));
  });
});

app.get("/statistics", async (req, res) => {
  const result = {};
  try {
    const balance = await client.balance.fetch();
    result.balance = {
      amount: balance.balance,
      currency: balance.currency
    };

    res.json(result);
  } catch(err) {
    res.status(500).json(err);
  }
});

app.get("/messages", (req, res) => {
  const pageNumber = req.body.pageNumber || 0;
  client.messages.page({pageSize: 50, pageNumber})
    .then(data => res.json(data));
});

app.post("/send-message", upload.single("file"), async (req, res) => {
  console.log(req.file);
  console.log(req.body);

  if (req.body.when == "now") {
    await client.messages.create({
      body: req.body.message,
      from: req.body.from,
      to: req.body.to
    });
  } else {

  }
});
