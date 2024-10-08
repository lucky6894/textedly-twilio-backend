require("dotenv").config({ path: "./.env" });

const twilio = require("twilio");
const express = require("express");
const cors = require("cors");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const port = process.env.PORT || 8000;

const client = twilio(accountSid, authToken);
const app = express();

app.use(cors());
app.listen(port, () => console.log(`Server started ${port}`));

app.get("/phone-numbers", (req, res) => {
  client.incomingPhoneNumbers.list((err, items) => {
    res.json(items.map(item => item.phoneNumber));
  });
});