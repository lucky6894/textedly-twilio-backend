require("dotenv").config({ path: "./.env" });

const twilio = require("twilio");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const port = process.env.PORT || 8000;

const client = twilio(accountSid, authToken);
const app = express();

app.use(cors());
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
