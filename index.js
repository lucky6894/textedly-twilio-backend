require("dotenv").config({ path: "./.env" });

const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

client.incomingPhoneNumbers.list((err, items) => {
  console.log(items.length);
});
